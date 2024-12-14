const express = require('express');
const app = express();

const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SEND_GRID_TOLKEN);

require('./db')()
const User = require('./models/User');
const UserAccount = require('./models/UserAccount');
const UserSettings = require('./models/UserSettings');

app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    },
    store: new session.MemoryStore()
}));

app.get('/', (req, res) => {
    if (req.session.email) {
        res.redirect(`/home?page=0`);
    } else {
        res.redirect('/login');
    }
});


app.get('/home', async (req, res) => {
    if (!req.session.email) {
        res.redirect('/');
    } else {
        const limit = 18;
        const page = req.query.page ?? 0;
        var user_notes = (await findUser(req.session.email)).notes;
        var search_results = ""
        const search = req.query.search
        if (search) {
            user_notes = user_notes.filter(note => note.title.toLowerCase().includes(search.toLowerCase()) || note.content.toLowerCase().includes(search.toLowerCase()));
            search_results = `<span class="search-results">
                <a href="/" class="close">&times;</a>
                <span>Resultados de "<span class="b-8">${search}</span>"</span>
            </span>`
        }
        var v_notes = '<div class="note-container">';
        for (let note of user_notes.slice(page * limit, (page * limit) + limit)) {
            v_notes += `<div class="note" id="index-${note._id}" onclick="openDialog(this)">
                <div class="title">${note.title.slice(0, 40)}</div>
                <div class="content-preview">${note.content.slice(0, 200)}</div>
            </div>`
        }
        v_notes += '</div>';

        if (user_notes.length === 0 && search) {
            v_notes = `<span class="non-notes">Sem resultados para busca...</span>`;
        } else if (user_notes.length === 0) {
            v_notes = `<span class="non-notes">Você ainda não tem notas...</span>`;
        }

        res.render('home', {
            notes: v_notes,
            userstate: req.session.email,
            search_query: search,
            search_results: search_results,
            theme: await getTheme(req.session.email),
            current_page: page,
            page_quantity: Math.ceil(user_notes.length / limit)
        });
    }
});


app.post('/sync', async (req, res) => {
    const user = req.session.email
    const { id, action, title, content, page } = req.body

    if (id == 'new' && action == 'save') {
        let new_note = {
            title: title,
            content: content
        }
        await addNote(user, new_note);
    } else if (action == 'save') {
        let new_note = {
            title: title,
            content: content
        }
        await editNote(user, id, new_note);
    } else {
        await deleteNote(user, id);
    }

    res.redirect(`/home?page=${page}`);
});


app.get('/search', (req, res) => {
    res.redirect('/home?search=' + req.query.search);
});


app.get('/login', async (req, res) => {
    if (req.session.email) {
        res.redirect('/');
    } else {
        const messages = [
            ['', ''],
            ['Usuário ou senha incorretos', ''],
            ['', 'Email já cadastrado.'],
        ]
        res.render('login', {
            error_message_login: messages[req.query.err_type ?? 0][0],
            error_message_registre: messages[req.query.err_type ?? 0][1],
            form_type: req.query.form_type ?? 'login',
            theme: 'dark'
        });
    }
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const userAccount = await getUserAccount(email, password)
    if (userAccount) {
        req.session.email = email;
        res.redirect('/home?page=0');
    } else {
        res.redirect('/login?err_type=1');
    }
});
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error(err)
    });
    res.redirect('/');
});


app.post('/registre', async (req, res) => {
    const { email, password } = req.body;
    const user = await UserAccount.findOne({ email: email });
    if (user /*&& user.verify*/) { res.redirect('/login?err_type=2&form_type=registre') }
    else {
        const verify_code = Math.floor(100000 + Math.random() * 900000)
        if (user) {
            await UserAccount.findOneAndUpdate(
                { email: email },
                {
                    $set: {
                        password: await bcrypt.hash(password, 10),
                        verify_code: verify_code,
                    }
                }
            )
        } else {
            const _user = new UserAccount({ email: email, password: await bcrypt.hash(password, 10), verify_code: verify_code, verify: false });
            await _user.save();
            setTimeout(() => {
                UserAccount.findOne({ email: email }).then(async (user) => {
                    if (user.verify !== true) {
                        await user.deleteOne();
                    }
                })
            }, 30 * 60 * 1000)
        }
        sgMail.send({
            to: email,
            from: 'ChX Note<0ericm.dev@gmail.com>',
            subject: 'Validação de E-mail',
            html: `<p>Seja Bem-Vindo ao ChX Note!</p><p style="display: grid;"><span>Valide sua conta usando o codigo: <strong>${verify_code}</strong></span><span>Não compartilhe esse codigo com ninguem!</span></p><p>Atenciosamente, ChX Note.</p>`,
        })
        res.redirect('/validation?email=' + email);
    }
});


app.get('/validation', async (req, res) => {
    const { email } = req.query;
    if (req.session.email) {
        res.redirect('/');
    } else {
        res.render('validation', {
            error_message_validation: '',
            email: email
        });
    }
})
app.post('/validation', async (req, res) => {
    const { email } = req.body
    await UserAccount.findOneAndUpdate(
        { email: email },
        {
            $set: {
                verify: true
            }
        }
    );

    await User({
        email: email,
        notes: []
    }).save();

    await UserSettings({
        email: email,
        view_settings: {
            theme_preference: 'dark'
        }
    }).save();

    req.session.email = email;
    res.redirect('/');
})


app.get('/settings', async (req, res) => {
    if (req.session.email) {
        res.render('settings', {
            current_user: req.session.email,
            theme_preference: (await UserSettings.findOne({ email: req.session.email })).view_settings.theme_preference,
            theme: await getTheme(req.session.email)
        });
    } else {
        res.redirect('/');
    }
})


app.get('/api/:type', async (req, res) => {
    const { type } = req.params;

    const _ = {
        async 'note-data'() {
            const { id } = req.query

            const note = (await findUser(req.session.email)).notes.find(note => note._id == id);
            res.json(note.toJSON());
        }
    }[type]();
})

app.post('/api/:type', async (req, res) => {
    const { type } = req.params;

    const _ = {
        async 'sync-theme'() {
            const { light_theme } = req.body

            const result = await UserSettings.findOneAndUpdate(
                { email: req.session.email },
                {
                    $set: {
                        'view_settings.theme_preference': light_theme ? "light" : "dark"
                    }
                }
            );

            res.status(200).json({ success: true });
        }
    }[type]();
})

app.get('/*', (req, res) => {
    res.redirect('/');
});


app.listen(parseInt(process.env.PORT) || 3333, () => {
    UserAccount.find({ verify: false }).then((users) => {
        users.forEach(async (user) => {
            await user.deleteOne();
        });
    })
    console.log(`App listening.`)
});

const getUserAccount = async (email, password) => {
    const user = await UserAccount.findOne({ email: email });

    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    return match ? user : null;
}
const findUser = async (email) => {
    const notes = await User.findOne({ email: email });
    return notes;
}
const addNote = async (email, data) => {
    const user = await findUser(email);
    user.notes.push(data);
    await user.save();
}
const editNote = async (email, id, new_data) => {
    await User.findOneAndUpdate(
        { email: email, "notes._id": id },
        {
            $set: {
                "notes.$.title": new_data.title,
                "notes.$.content": new_data.content
            }
        }
    );
}
const deleteNote = async (email, id) => {
    await User.findByIdAndUpdate(
        (await findUser(email))._id,
        {
            $pull: { notes: { _id: id } }
        }
    );
}

const getTheme = async (email) => {
    const user = await UserSettings.findOne({ email: email });
    return user.view_settings.theme_preference;
}

const normalize = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}