
function toggleTo(who) {
    if (who === "login") {
        document.querySelector('.login').classList.add('active');
        document.querySelector('.registre').classList.remove('active');

        const lim = document.querySelector('.forms-limits > .forms-container')
        lim.style.transform = 'translateX(0px)';

        const indi = document.querySelector('.indication')
        indi.style.transform = 'translateX(0%)'
    } else if (who === "registre") {
        document.querySelector('.registre').classList.add('active');
        document.querySelector('.login').classList.remove('active');
        
        const lim = document.querySelector('.forms-limits > .forms-container')
        lim.style.transform = 'translateX(calc(-50% - 1rem))';

        const indi = document.querySelector('.indication')
        indi.style.transform = 'translateX(calc(100% + .5rem))'

    }
}

function toggleVisibility(element) {
    const vil = element.querySelector('span')
    if (vil.textContent === 'visibility') {
        vil.textContent = 'visibility_off';
        element.parentElement.querySelector('input').setAttribute('type', 'text');
    } else {
        vil.textContent = 'visibility';
        element.parentElement.querySelector('input').setAttribute('type', 'password');
    }
}