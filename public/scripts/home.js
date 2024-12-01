
function closeDialog() {
    document.querySelector('.dialog-container').classList.toggle('hidden');
    document.querySelector('.dialog').name = '';
}
async function openDialog(el) {
    document.querySelector('.dialog-container').classList.toggle('hidden');
    document.querySelector('.loading').classList.remove('hidden');
    
    document.querySelector('.dialog input.id').value = el.id.replace('index-', '');
    
    document.querySelector('.delete-confirm input.id').value = el.id.replace('index-', '');
    document.querySelector('.dialog .delete').classList.remove('hidden');
    
    const note_data = await (await fetch(`/api/note-data?id=${el.id.replace('index-', '')}`)).json();
    
    document.querySelector('.dialog input.title').value = note_data.title;
    document.querySelector('.dialog textarea').value = note_data.content;
    
    document.querySelector('.dialog').classList.remove('hidden');
    document.querySelector('.loading').classList.add('hidden');
}

function toggleDeleteConfirm() {
    document.querySelector('.delete-confirm-container').classList.toggle('hidden');
}

function createNote() {
    document.querySelector('.loading').classList.remove('hidden');

    document.querySelector('.dialog input.title').value = "New Note"
    document.querySelector('.dialog-container').classList.toggle('hidden');
    document.querySelector('.dialog input.id').value = 'new';
    document.querySelector('.dialog .delete').classList.add('hidden');

    document.querySelector('.dialog').classList.remove('hidden');
    document.querySelector('.loading').classList.add('hidden');
}

function toggleQuitDialog() {
    document.querySelector('.logout-container').classList.toggle('hidden');
}

const page_quantity = parseInt(document.querySelector('.pages').textContent);
const page_current = parseInt(document.querySelector('.page').textContent);
const pagination = document.querySelector('.pagination');

if (page_quantity <= 1) {
    pagination.style.display = 'none';
} else if (page_quantity <= 4) {
    pagination.style.display = 'flex';
    for (let i = 2; i <= page_quantity; i++) {
        pagination.querySelector(`:nth-child(${i})`).insertAdjacentHTML(
            'afterend', 
            `<a id="page-${i-1}" href="/home?page=${i - 1}">${i}</a>`
        );
    }
} else {
    pagination.style.display = 'flex';
    
    if (page_current < 3) {
        pagination.querySelector(':nth-child(2)').insertAdjacentHTML(
            'afterend', 
            `<a id="page-1" href="/home?page=1">2</a>
            <a id="page-2" href="/home?page=2">3</a>
            <span class="x-hatch">. . .</span>
            <a href="/home?page=${page_quantity - 1}">${page_quantity}</a>`
        );
    } else if (page_current >= page_quantity - 3) {
        pagination.querySelector(':nth-child(2)').insertAdjacentHTML(
            'afterend', 
            `<span class="x-hatch">. . .</span>
            <a id="page-${page_quantity - 3}" href="/home?page=${page_quantity - 3}">${page_quantity - 2}</a>
            <a id="page-${page_quantity - 2}" href="/home?page=${page_quantity - 2}">${page_quantity - 1}</a>
            <a id="page-${page_quantity - 1}" href="/home?page=${page_quantity - 1}">${page_quantity}</a>`
        );
    } else {
        pagination.querySelector(':nth-child(2)').insertAdjacentHTML(
            'afterend', 
            `<span class="x-hatch">. . .</span>
            <a id="page-${page_current - 1}" href="/home?page=${page_current - 1}">${page_current}</a>
            <a id="page-${page_current}" href="/home?page=${page_current}">${page_current + 1}</a>
            <a id="page-${page_current - 1}" href="/home?page=${page_current + 1}">${page_current + 2}</a>
            <span class="x-hatch">. . .</span>
            <a href="/home?page=${page_quantity - 1}">${page_quantity}</a>`
        );
    }
}

pagination.querySelector(`.arrow_back`).href = '/home?page=' + (page_current === 0 ? 0 : page_current - 1);
pagination.querySelector(`.arrow_next`).href = '/home?page=' + (page_current === page_quantity - 1 ? page_current : page_current + 1);

pagination.querySelector(`#page-${page_current}`).className = 'active';
document.querySelector('.pages').remove();
document.querySelector('.page').remove();