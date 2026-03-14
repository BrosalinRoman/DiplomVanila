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

    // Обработка клика по строке проекта
    const projectRows = document.querySelectorAll('.project-row');
    projectRows.forEach(row => {
        row.addEventListener('click', function () {
            const projectId = this.getAttribute('data-project-id');
            window.location.href = `project-detail.html?id=${projectId}`;
        });
    });

    // Фильтрация и сортировка проектов
    const directionFilter = document.getElementById('directionFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const sortSelect = document.getElementById('sortSelect');
    const projectSearch = document.getElementById('projectSearch');

    function applyFiltersAndSort() {
        const searchTerm = projectSearch.value.toLowerCase();
        const directionValue = directionFilter.value;
        const departmentValue = departmentFilter.value;
        const sortValue = sortSelect.value;

        const rows = document.querySelectorAll('.project-row');
        let visibleRows = 0;

        rows.forEach(row => {
            const name = row.querySelector('.project-name').textContent.toLowerCase();
            const direction = row.querySelector('.project-direction').textContent;
            const department = row.querySelector('.project-department').textContent;
            const rank = parseInt(row.querySelector('.project-rank').textContent);

            // Применяем фильтры
            const matchesSearch = name.includes(searchTerm);
            const matchesDirection = !directionValue || direction === directionValue;
            const matchesDepartment = !departmentValue || department === departmentValue;

            if (matchesSearch && matchesDirection && matchesDepartment) {
                row.style.display = '';
                visibleRows++;
            } else {
                row.style.display = 'none';
            }
        });

        // Обновляем счетчик видимых проектов
        document.getElementById('projectsCount').textContent = visibleRows;

        // Сортировка
        sortProjects(sortValue);
    }

    function sortProjects(sortValue) {
        const table = document.querySelector('.projects-table tbody');
        const rows = Array.from(table.querySelectorAll('.project-row'));

        rows.sort((a, b) => {
            switch (sortValue) {
                case 'rank-desc':
                    return parseInt(b.querySelector('.project-rank').textContent) -
                        parseInt(a.querySelector('.project-rank').textContent);
                case 'rank-asc':
                    return parseInt(a.querySelector('.project-rank').textContent) -
                        parseInt(b.querySelector('.project-rank').textContent);
                case 'name':
                    return a.querySelector('.project-name').textContent.localeCompare(
                        b.querySelector('.project-name').textContent
                    );
                case 'date':
                    return new Date(b.querySelector('.project-date').textContent) -
                        new Date(a.querySelector('.project-date').textContent);
                default:
                    return 0;
            }
        });

        // Перезаписываем строки в отсортированном порядке
        rows.forEach(row => table.appendChild(row));
    }

    // Слушатели событий для фильтров и сортировки
    if (directionFilter) directionFilter.addEventListener('change', applyFiltersAndSort);
    if (departmentFilter) departmentFilter.addEventListener('change', applyFiltersAndSort);
    if (sortSelect) sortSelect.addEventListener('change', applyFiltersAndSort);
    if (projectSearch) projectSearch.addEventListener('input', applyFiltersAndSort);

    // Инициализация счетчика проектов
    //const initialCount = document.querySelectorAll('.project-row').length;
    //document.getElementById('projectsCount').textContent = initialCount;

    // Обработка создания проекта
    const createProjectBtn = document.getElementById('createProjectBtn');
    if (createProjectBtn) {
        createProjectBtn.addEventListener('click', function () {
            showCreateProjectModal();
        });
    }

    function showCreateProjectModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Создание нового проекта</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="newProjectName">Название проекта</label>
                        <input type="text" id="newProjectName" placeholder="Введите название проекта">
                    </div>
                    <div class="form-group">
                        <label for="newProjectDirection">Направление</label>
                        <select id="newProjectDirection">
                            <option value="">Выберите направление</option>
                            <option value="IT">IT</option>
                            <option value="Производство">Производство</option>
                            <option value="Логистика">Логистика</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="newProjectDepartment">Подразделение</label>
                        <select id="newProjectDepartment">
                            <option value="">Выберите подразделение</option>
                            <option value="Департамент развития">Департамент развития</option>
                            <option value="Филиал Восток">Филиал Восток</option>
                            <option value="Центральный офис">Центральный офис</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="newProjectDescription">Описание проекта</label>
                        <textarea id="newProjectDescription" rows="3" placeholder="Краткое описание проекта"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary cancel-btn">Отмена</button>
                    <button class="btn-primary save-btn">Создать проект</button>
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

        // Обработка создания проекта
        const saveBtn = modal.querySelector('.save-btn');
        saveBtn.addEventListener('click', function () {
            const name = document.getElementById('newProjectName').value;
            const direction = document.getElementById('newProjectDirection').value;
            const department = document.getElementById('newProjectDepartment').value;

            if (!name || !direction || !department) {
                showNotification('Заполните все обязательные поля', 'error');
                return;
            }

            showNotification(`Проект "${name}" создан`, 'success');
            closeModal();

            // В реальном приложении здесь был бы редирект на страницу нового проекта
            setTimeout(() => {
                window.location.href = 'project-detail.html?id=new';
            }, 1000);
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
});

