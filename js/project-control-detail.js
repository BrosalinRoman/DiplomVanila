document.addEventListener('DOMContentLoaded', function () {
    // Обработка выхода из системы
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('Вы уверены, что хотите выйти из системы?')) {
                window.location.href = 'index.html';
            }
        });
    }

    // Переключение вкладок
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            // Убираем активный класс у всех кнопок и панелей
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Добавляем активный класс к текущей кнопке и панели
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            // Если переключились на вкладку ранжирования, обновляем график
            if (tabId === 'ranking') {
                updateRankingChart();
            }
        });
    });

    // Кнопка "Назад к списку"
    const backToListBtn = document.getElementById('backToListBtn');
    if (backToListBtn) {
        backToListBtn.addEventListener('click', function () {
            window.location.href = 'control.html';
        });
    }

    // Сохранение изменений проекта
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    if (saveProjectBtn) {
        saveProjectBtn.addEventListener('click', function () {
            // Собираем данные из всех вкладок
            const projectData = {
                teo: collectTEOData(),
                card: collectCardData(),
                ranking: collectRankingData()
            };

            // В реальном приложении здесь был бы запрос к серверу
            console.log('Сохраненные данные:', projectData);
            showNotification('Изменения сохранены успешно', 'success');

            // Обновляем импортированные данные в карточке проекта
            updateImportedData();
        });
    }
});