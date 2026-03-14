document.addEventListener('DOMContentLoaded', function() {
    // Обработка выхода из системы
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите выйти из системы?')) {
                window.location.href = 'index.html';
            }
        });
    }
    
});