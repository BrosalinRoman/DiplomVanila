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
            window.location.href = 'projects.html';
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

    // Добавление нового показателя в ТЭО
    const addIndicatorBtn = document.getElementById('addIndicatorBtn');
    if (addIndicatorBtn) {
        addIndicatorBtn.addEventListener('click', function () {
            showAddIndicatorModal();
        });
    }

    function collectTEOData() {
        return {
            npv: document.getElementById('npv').value,
            irr: document.getElementById('irr').value,
            paybackPeriod: document.getElementById('paybackPeriod').value,
            discountRate: document.getElementById('discountRate').value,
            targetMarket: document.getElementById('targetMarket').value,
            marketShare: document.getElementById('marketShare').value,
            productionCapacity: document.getElementById('productionCapacity').value,
            utilizationRate: document.getElementById('utilizationRate').value
        };
    }

    function collectCardData() {
        return {
            description: document.getElementById('projectDescription').value,
            manager: document.getElementById('projectManager').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            budget: document.getElementById('projectBudget').value
        };
    }

    function collectRankingData() {
        // В реальном приложении здесь собирались бы данные из таблицы ранжирования
        return {};
    }

    function updateImportedData() {
        // Обновляем данные в карточке проекта на основе ТЭО
        const npv = document.getElementById('npv').value;
        const irr = document.getElementById('irr').value;
        const payback = document.getElementById('paybackPeriod').value;

        document.getElementById('importedNPV').value = `${formatNumber(npv)} руб.`;
        document.getElementById('importedIRR').value = `${irr}%`;
        document.getElementById('importedPayback').value = `${payback} лет`;
    }

    function formatNumber(num) {
        return new Intl.NumberFormat('ru-RU').format(num);
    }

    function showAddIndicatorModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Добавление нового показателя</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="indicatorSection">Раздел</label>
                        <select id="indicatorSection">
                            <option value="financial">Финансовые показатели</option>
                            <option value="marketing">Маркетинговые показатели</option>
                            <option value="production">Производственные показатели</option>
                            <option value="other">Другие показатели</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="indicatorName">Название показателя</label>
                        <input type="text" id="indicatorName" placeholder="Введите название показателя">
                    </div>
                    <div class="form-group">
                        <label for="indicatorValue">Значение</label>
                        <input type="text" id="indicatorValue" placeholder="Введите значение">
                    </div>
                    <div class="form-group">
                        <label for="indicatorUnit">Единица измерения</label>
                        <input type="text" id="indicatorUnit" placeholder="руб., %, лет и т.д.">
                    </div>
                    <div class="form-group">
                        <label for="indicatorDescription">Описание</label>
                        <textarea id="indicatorDescription" rows="3" placeholder="Описание показателя"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary cancel-btn">Отмена</button>
                    <button class="btn-primary save-btn">Добавить показатель</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Обработка закрытия модального окна
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');

        function closeModal() {
            modal.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Обработка сохранения
        const saveBtn = modal.querySelector('.save-btn');
        saveBtn.addEventListener('click', function () {
            const name = document.getElementById('indicatorName').value;
            const value = document.getElementById('indicatorValue').value;
            const section = document.getElementById('indicatorSection').value;

            if (!name || !value) {
                showNotification('Заполните все обязательные поля', 'error');
                return;
            }

            showNotification(`Показатель "${name}" добавлен`, 'success');
            closeModal();
        });
    }

    // Добавляем стили для модального окна
    if (!document.querySelector('#modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                .modal {
                    background: white;
                    border-radius: var(--border-radius);
                    box-shadow: var(--box-shadow);
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow: auto;
                    animation: slideUp 0.3s ease;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                }
                .modal-header h3 {
                    margin: 0;
                    color: var(--primary-color);
                }
                .close-modal {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--dark-gray);
                }
                .modal-body {
                    padding: 1.5rem;
                }
                .modal-footer {
                    padding: 1.5rem;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
        document.head.appendChild(styles);
    }

    function updateRankingChart() {
        const ctx = document.getElementById('rankingChart');
        if (!ctx) return;

        // Удаляем существующий график, если он есть
        if (window.rankingChartInstance) {
            window.rankingChartInstance.destroy();
        }

        // Создаем новый график
        window.rankingChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['NPV', 'IRR', 'Срок окупаемости', 'Риск проекта'],
                datasets: [{
                    data: [3, 3, 2, 2],
                    backgroundColor: [
                        '#3498DB',
                        '#27AE60',
                        '#F39C12',
                        '#E74C3C'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.label}: ${context.raw} балла`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    // Инициализация графика при загрузке страницы, если активна вкладка ранжирования
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab && activeTab.getAttribute('data-tab') === 'ranking') {
        updateRankingChart();
    }

    function showNotification(message, type) {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'error') {
            notification.style.backgroundColor = 'var(--accent-color)';
        } else if (type === 'success') {
            notification.style.backgroundColor = 'var(--success-color)';
        } else {
            notification.style.backgroundColor = 'var(--secondary-color)';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Автоматическое обновление импортированных данных при изменении ТЭО
    const teoInputs = document.querySelectorAll('#teo input');
    teoInputs.forEach(input => {
        input.addEventListener('change', updateImportedData);
    });
});