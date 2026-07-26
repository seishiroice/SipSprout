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

// ========== FAQ ACCORDION ==========
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        const isActive = item.classList.contains('active');

        // Закрываем все вопросы
        document.querySelectorAll('.faq-item').forEach(i => {
            i.classList.remove('active');
            i.querySelector('.faq-icon').textContent = '+';
        });

        // Открываем текущий, только если он был закрыт
        if (!isActive) {
            item.classList.add('active');
            item.querySelector('.faq-icon').textContent = '×';
        }
    });
});

// ========== AUTH FORMS (демо, без бэкенда) ==========
document.querySelectorAll('.auth-form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('✅ В реальном приложении это отправилось бы на сервер.\nСпасибо, что пользуетесь SipSprout!');
    });
});