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
            window.location.href = `project-control-detail.html?id=${projectId}`;
        });
    });

    // Фильтрация и сортировка проектов (надо будет поменять для других фильровъ)
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