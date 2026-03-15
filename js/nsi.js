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

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Раскрытие/скрытие формул (клик по заголовку, игнорируя кнопки)
    const formulaHeaders = document.querySelectorAll('.formula-header');
    formulaHeaders.forEach(header => {
        header.addEventListener('click', function (e) {
            // Если клик по кнопке внутри заголовка – не раскрываем
            if (e.target.closest('.item-actions')) return;

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

    // Раскрытие/скрытие описания в подвкладках (клик по заголовку, игнорируя кнопки)
    const itemHeaders = document.querySelectorAll('.item-header');
    itemHeaders.forEach(header => {
        header.addEventListener('click', function (e) {
            // Если клик по кнопке внутри заголовка – не раскрываем
            if (e.target.closest('.item-actions')) return;

            const content = this.nextElementSibling;
            const isVisible = content.style.display === 'block';

            // Закрываем все открытые элементы
            document.querySelectorAll('.item-description').forEach(item => {
                item.style.display = 'none';
            });

            // Открываем/закрываем текущий элемент
            content.style.display = isVisible ? 'none' : 'block';
        });
    });

    // По умолчанию открываем первое описание
    const firstItem = document.querySelector('.item-description');
    if (firstItem) {
        firstItem.style.display = 'block';
    }

    // Функция показа уведомлений
    function showNotification(message, type) {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) existingNotification.remove();

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
            background-color: ${type === 'error' ? 'var(--accent-color)' : type === 'success' ? 'var(--success-color)' : 'var(--secondary-color)'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Модальное окно для добавления/редактирования
    function showItemModal(type, itemData = null) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';

        // Генерация полей в зависимости от типа (сокращённо, для примера)
        let fieldsHtml = '';
        if (type === 'formula') {
            fieldsHtml = `
                <div class="form-group">
                    <label for="itemName">Название формулы</label>
                    <input type="text" id="itemName" value="${itemData?.name || ''}" placeholder="Введите название">
                </div>
                <div class="form-group">
                    <label for="formulaExpression">Формула</label>
                    <textarea id="formulaExpression" rows="3" placeholder="Введите выражение">${itemData?.expression || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="itemDescription">Описание</label>
                    <textarea id="itemDescription" rows="3" placeholder="Опишите формулу">${itemData?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="formulaCategory">Категория</label>
                    <select id="formulaCategory">
                        <option value="finance" ${itemData?.category === 'finance' ? 'selected' : ''}>Финансы</option>
                        <option value="production" ${itemData?.category === 'production' ? 'selected' : ''}>Производство</option>
                    </select>
                </div>
            `;
        } else if (type === 'direction' || type === 'status' || type === 'division') {
            fieldsHtml = `
                <div class="form-group">
                    <label for="itemName">Название</label>
                    <input type="text" id="itemName" value="${itemData?.name || ''}" placeholder="Введите название">
                </div>
                <div class="form-group">
                    <label for="itemDescription">Описание</label>
                    <textarea id="itemDescription" rows="3" placeholder="Введите описание">${itemData?.description || ''}</textarea>
                </div>
            `;
        } else if (type === 'range') {
            fieldsHtml = `
                <div class="form-group">
                    <label for="itemName">Название характеристики</label>
                    <input type="text" id="itemName" value="${itemData?.name || ''}" placeholder="Например: Ранг проекта">
                </div>
                <div class="form-group">
                    <label for="rangeMin">Минимальное значение</label>
                    <input type="number" id="rangeMin" value="${itemData?.min || ''}" step="any">
                </div>
                <div class="form-group">
                    <label for="rangeMax">Максимальное значение</label>
                    <input type="number" id="rangeMax" value="${itemData?.max || ''}" step="any">
                </div>
                <div class="form-group">
                    <label for="itemDescription">Описание</label>
                    <textarea id="itemDescription" rows="3" placeholder="Описание диапазона">${itemData?.description || ''}</textarea>
                </div>
            `;
        } else if (type === 'user') {
            fieldsHtml = `
                <div class="form-group">
                    <label for="userLogin">Логин</label>
                    <input type="text" id="userLogin" value="${itemData?.login || ''}" placeholder="Логин">
                </div>
                <div class="form-group">
                    <label for="userPassword">Пароль</label>
                    <input type="password" id="userPassword" value="${itemData?.password || ''}" placeholder="Пароль">
                </div>
                <div class="form-group">
                    <label for="userFullName">ФИО</label>
                    <input type="text" id="userFullName" value="${itemData?.fullName || ''}" placeholder="Иванов Иван Иванович">
                </div>
                <div class="form-group">
                    <label for="userDepartment">Подразделение</label>
                    <input type="text" id="userDepartment" value="${itemData?.department || ''}" placeholder="Отдел разработки">
                </div>
                <div class="form-group">
                    <label for="userRole">Роль</label>
                    <select id="userRole">
                        <option value="applicant" ${itemData?.role === 'applicant' ? 'selected' : ''}>Заявитель</option>
                        <option value="investor" ${itemData?.role === 'investor' ? 'selected' : ''}>Инвестор</option>
                        <option value="admin" ${itemData?.role === 'admin' ? 'selected' : ''}>Администратор</option>
                    </select>
                </div>
            `;
        }

        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${itemData ? 'Редактирование' : 'Добавление'} ${getTypeName(type)}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${fieldsHtml}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary cancel-btn">Отмена</button>
                    <button class="btn-primary save-btn">Сохранить</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const saveBtn = modal.querySelector('.save-btn');

        function closeModal() {
            modal.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => modal.remove(), 300);
        }

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        saveBtn.addEventListener('click', function () {
            // Здесь должна быть логика сохранения (отправка на сервер или обновление DOM)
            // Для демонстрации просто показываем уведомление
            showNotification(`${itemData ? 'Обновлено' : 'Добавлено'}`, 'success');
            closeModal();
        });
    }

    function getTypeName(type) {
        const names = {
            formula: 'формулы',
            direction: 'направления',
            status: 'статуса',
            range: 'диапазона',
            division: 'подразделения',
            user: 'пользователя'
        };
        return names[type] || 'элемента';
    }

    // Обработчики для кнопок добавления (с data-type)
    document.querySelectorAll('.add-item-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const type = this.getAttribute('data-type');
            showItemModal(type);
        });
    });

    // Делегирование событий для кнопок редактирования и удаления
    document.addEventListener('click', function (e) {
        // Редактирование
        if (e.target.closest('.btn-edit-item')) {
            const btn = e.target.closest('.btn-edit-item');
            const item = btn.closest('[data-id]');
            if (!item) return;

            // Определяем тип по активной вкладке
            const activePane = document.querySelector('.tab-pane.active');
            const type = mapTabIdToType(activePane?.id);

            // Здесь можно получить данные элемента из DOM
            // Для примера вызываем модалку с заглушкой
            showItemModal(type, { name: 'Пример' });
        }

        // Удаление
        if (e.target.closest('.btn-delete-item')) {
            const btn = e.target.closest('.btn-delete-item');
            const item = btn.closest('[data-id]');
            if (!item) return;

            const name = item.querySelector('h4')?.textContent || 'элемент';
            if (confirm(`Удалить "${name}"?`)) {
                item.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => item.remove(), 300);
                showNotification(`Элемент удалён`, 'success');
            }
        }
    });

    function mapTabIdToType(tabId) {
        const map = {
            'formuls': 'formula',
            'directions': 'direction',
            'statuses': 'status',
            'ranges': 'range',
            'divisions': 'division',
            'users': 'user'
        };
        return map[tabId] || 'formula';
    }

    // Добавляем стили для анимаций, если их нет
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
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
        document.head.appendChild(style);
    }
});