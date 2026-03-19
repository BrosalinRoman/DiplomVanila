document.addEventListener('DOMContentLoaded', function () {
    // ========== Данные проектов для контроля ==========
    const projects = [
        {
            id: 1,
            name: 'Развитие IT-инфраструктуры',
            category: 'Ориентированные на социальный эффект',
            direction: 'IT',
            department: 'Департамент развития',
            budget: 35000,
            invested: 25000,
            progress: 70,
            date: '2024-01-20'
        },
        {
            id: 2,
            name: 'Строительство цеха №2',
            category: 'Приносящие прибыль',
            direction: 'Производство',
            department: 'Филиал Восток',
            budget: 35000,
            invested: 25000,
            progress: 70,
            date: '2024-01-18'
        },
        {
            id: 3,
            name: 'Закупка оборудования',
            category: 'Снижающие затраты',
            direction: 'Логистика',
            department: 'Центральный офис',
            budget: 35000,
            invested: 25000,
            progress: 70,
            date: '2024-01-15'
        }
    ];

    // ========== Вспомогательные функции для дропдаунов ==========
    function updateDropdownTrigger(dropdown) {
        const checkboxes = dropdown.querySelectorAll('.dropdown-menu input[type="checkbox"]');
        const checked = Array.from(checkboxes).filter(cb => cb.checked);
        const total = checkboxes.length;
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const filterName = dropdown.closest('.filter-group')?.querySelector('span')?.innerText || 'Фильтр';
        if (checked.length === 0) {
            trigger.textContent = `Ничего не выбрано`;
        } else if (checked.length === total) {
            trigger.textContent = `Все ${filterName.toLowerCase()}`;
        } else {
            trigger.textContent = `Выбрано: ${checked.length}`;
        }
    }

    function initDropdowns() {
        document.querySelectorAll('.dropdown-checkbox').forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const menu = dropdown.querySelector('.dropdown-menu');

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.dropdown-checkbox.open').forEach(d => {
                    if (d !== dropdown) d.classList.remove('open');
                });
                dropdown.classList.toggle('open');
            });

            menu.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox') {
                    e.stopPropagation();
                    updateDropdownTrigger(dropdown);
                    applyFiltersAndSort();
                }
            });

            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('open');
                }
            });

            updateDropdownTrigger(dropdown);
        });
    }

    function getSelectedFromDropdown(filterType) {
        const dropdown = document.querySelector(`.dropdown-checkbox[data-filter="${filterType}"][data-tab="control"]`);
        if (!dropdown) return [];
        const checkboxes = dropdown.querySelectorAll('.dropdown-menu input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    // ========== Отрисовка таблицы ==========
    function renderProjects(projectsToRender) {
        const tbody = document.getElementById('control-table-body');
        tbody.innerHTML = '';
        projectsToRender.forEach(proj => {
            const row = document.createElement('tr');
            row.className = 'project-row';
            row.setAttribute('data-project-id', proj.id);
            row.innerHTML = `
                <td class="project-name">${proj.name}</td>
                <td class="project-category">${proj.category}</td>
                <td class="project-direction">${proj.direction}</td>
                <td class="project-department">${proj.department}</td>
                <td class="project-budget">${proj.budget.toLocaleString()}</td>
                <td class="project-invested">${proj.invested.toLocaleString()}</td>
                <td class="project-progress">${proj.progress}</td>
                <td class="project-date">${proj.date}</td>
            `;
            row.addEventListener('click', function (e) {
                if (e.target.tagName !== 'INPUT' && !e.target.closest('.dropdown-trigger')) {
                    window.location.href = `project-control-detail.html?id=${proj.id}`;
                }
            });
            tbody.appendChild(row);
        });
    }

    // ========== Фильтрация и сортировка ==========
    function applyFiltersAndSort() {
        let filteredProjects = [...projects];

        // Поиск по названию
        const searchInput = document.querySelector('.project-search[data-tab="control"]');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        if (searchTerm) {
            filteredProjects = filteredProjects.filter(p => p.name.toLowerCase().includes(searchTerm));
        }

        // Фильтр по направлению
        const selectedDirections = getSelectedFromDropdown('direction');
        if (selectedDirections.length > 0) {
            filteredProjects = filteredProjects.filter(p => selectedDirections.includes(p.direction));
        }

        // Фильтр по подразделению
        const selectedDepartments = getSelectedFromDropdown('department');
        if (selectedDepartments.length > 0) {
            filteredProjects = filteredProjects.filter(p => selectedDepartments.includes(p.department));
        }

        // Фильтр по категории
        const selectedCategories = getSelectedFromDropdown('category');
        if (selectedCategories.length > 0) {
            filteredProjects = filteredProjects.filter(p => selectedCategories.includes(p.category));
        }

        // Сортировка
        const sortSelect = document.querySelector('.filter-select[data-tab="control"]');
        const sortValue = sortSelect ? sortSelect.value : 'date';

        filteredProjects.sort((a, b) => {
            switch (sortValue) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                case 'progress-desc':
                    return b.progress - a.progress;
                case 'progress-asc':
                    return a.progress - b.progress;
                default:
                    return 0;
            }
        });

        renderProjects(filteredProjects);
    }

    // ========== Инициализация ==========
    initDropdowns();
    renderProjects(projects); // начальная отрисовка

    // Слушатели для поиска и сортировки
    document.querySelector('.project-search[data-tab="control"]').addEventListener('input', applyFiltersAndSort);
    document.querySelector('.filter-select[data-tab="control"]').addEventListener('change', applyFiltersAndSort);

    // Обработка выхода
    document.querySelector('.logout-btn').addEventListener('click', function () {
        if (confirm('Вы уверены, что хотите выйти из системы?')) {
            window.location.href = 'index.html';
        }
    });
});