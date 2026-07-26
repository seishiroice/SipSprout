// ========== SCROLL HEADER ==========
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
        header.style.backgroundColor = window.scrollY > 50
            ? 'rgba(248, 250, 252, 0.98)'
            : 'rgba(248, 250, 252, 0.95)';
    }
});

console.log('%c🌱 SipSprout ready!', 'color:#4ade80; font-family:monospace');

// ========== AUTH FORMS (демо, без бэкенда) ==========
document.querySelectorAll('.auth-form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('✅ В реальном приложении это отправилось бы на сервер.\nСпасибо, что пользуетесь SipSprout!');
    });
});

