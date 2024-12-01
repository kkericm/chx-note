toggle = async (el) => {
    const body = document.querySelector('body');

    if (el.classList.contains('check')) {
        el.classList.add('inactive');
        const result = (await fetch('/api/sync-theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ light_theme: false })
        }))
        if (result.ok) {
            el.classList.remove('check');
            body.classList.remove('light');
            body.classList.add('dark');
        }
        el.classList.remove('inactive');
    } else {
        el.classList.add('inactive');
        
        const result = (await fetch('/api/sync-theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ light_theme: true })
        }))
        
        if (result.ok) {
            el.classList.add('check');
            body.classList.remove('dark');
            body.classList.add('light');
        }
        el.classList.remove('inactive');
    }
}