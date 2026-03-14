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

        });
    });

    // Раскрытие/скрытие формул
    const formulaHeaders = document.querySelectorAll('.formula-header');
    formulaHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const content = this.nextElementSibling;
            const isVisible = content.style.display === 'block';

            // Закрываем все открытые формулы
            document.querySelectorAll('.formula-content').forEach(item => {
                item.style.display = 'none';
            });

            // Открываем/закрываем текущую формулу
            content.style.display = isVisible ? 'none' : 'block';
        });
    });

    // По умолчанию открываем первую формулу
    const firstFormula = document.querySelector('.formula-content');
    if (firstFormula) {
        firstFormula.style.display = 'block';
    }

    // Обработка добавления нового расчета
    const addCalculationBtn = document.getElementById('addCalculationBtn');
    if (addCalculationBtn) {
        addCalculationBtn.addEventListener('click', function () {
            showCalculationModal();
        });
    }

    // Обработка действий с расчетами
    const calculationItems = document.querySelectorAll('.calculation-item');
    calculationItems.forEach(item => {
        const editBtn = item.querySelector('.btn-edit');
        const deleteBtn = item.querySelector('.btn-delete');
        const copyBtn = item.querySelector('.btn-copy');

        if (editBtn) {
            editBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                const calculationName = item.querySelector('h3').textContent;
                showCalculationModal(calculationName);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                const calculationName = item.querySelector('h3').textContent;
                if (confirm(`Удалить расчет "${calculationName}"?`)) {
                    item.style.animation = 'slideOut 0.3s ease forwards';
                    setTimeout(() => {
                        item.remove();
                    }, 300);
                }
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                const calculationName = item.querySelector('h3').textContent;
                showNotification(`Расчет "${calculationName}" скопирован`, 'success');
            });
        }
    });

    function showCalculationModal(existingName = '') {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${existingName ? 'Редактирование расчета' : 'Новый расчет'}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="calculationName">Название расчета</label>
                        <input type="text" id="calculationName" value="${existingName}" placeholder="Введите название расчета">
                    </div>
                    <div class="form-group">
                        <label for="calculationFormula">Формула</label>
                        <textarea id="calculationFormula" rows="4" placeholder="Введите формулу расчета"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="calculationDescription">Описание</label>
                        <textarea id="calculationDescription" rows="3" placeholder="Опишите назначение расчета"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary cancel-btn">Отмена</button>
                    <button class="btn-primary save-btn">Сохранить</button>
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
            const name = document.getElementById('calculationName').value;
            const formula = document.getElementById('calculationFormula').value;

            if (!name || !formula) {
                showNotification('Заполните все обязательные поля', 'error');
                return;
            }

            if (existingName) {
                // Обновление существующего расчета
                showNotification(`Расчет "${name}" обновлен`, 'success');
            } else {
                // Добавление нового расчета
                showNotification(`Расчет "${name}" создан`, 'success');
            }

            closeModal();
        });

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
    }

    function showNotification(message, type) {
        // Та же функция, что и в auth.js
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
});