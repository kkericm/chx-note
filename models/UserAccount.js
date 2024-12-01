const mongoose = require('mongoose');

const UserAccount = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    verify: {
        type: Boolean,
        required: true,
        default: false
    },
    verify_code: {
        type: Number,
        required: true
    }
});

// UserAccount.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.senha = await bcrypt.hash(this.senha, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

module.exports = mongoose.model('UserAccount', UserAccount, 'users_account');