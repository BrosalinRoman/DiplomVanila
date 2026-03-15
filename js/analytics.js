document.addEventListener('DOMContentLoaded', function() {
    // ------------------------------ ДАННЫЕ ------------------------------
    const projects = [
        { id: 1, name: 'Развитие IT-инфраструктуры', rank: 1, direction: 'IT', department: 'Департамент развития', status: 'Активен', category: 'IT', npv: 15800000, irr: 18.5, payback: 2.5 },
        { id: 2, name: 'Строительство цеха №2', rank: 2, direction: 'Производство', department: 'Филиал Восток', status: 'Активен', category: 'Производство', npv: 12500000, irr: 15.2, payback: 3.2 },
        { id: 3, name: 'Закупка оборудования', rank: 3, direction: 'Производство', department: 'Центральный офис', status: 'На паузе', category: 'Производство', npv: 9200000, irr: 12.8, payback: 4.0 },
        { id: 4, name: 'Внедрение CRM', rank: 4, direction: 'IT', department: 'Департамент развития', status: 'Активен', category: 'IT', npv: 7300000, irr: 11.2, payback: 3.8 },
        { id: 5, name: 'Логистический центр', rank: 5, direction: 'Логистика', department: 'Филиал Восток', status: 'Завершен', category: 'Логистика', npv: 18200000, irr: 21.0, payback: 2.0 },
        { id: 6, name: 'Автоматизация склада', rank: 6, direction: 'Логистика', department: 'Центральный офис', status: 'На паузе', category: 'Логистика', npv: 6700000, irr: 9.5, payback: 5.2 },
    ];

    // Соответствие показателей категориям
    const categoryIndicators = {
        'IT': ['name', 'npv', 'irr', 'payback', 'direction', 'rank'],
        'Производство': ['name', 'npv', 'irr', 'payback', 'direction', 'rank'],
        'Логистика': ['name', 'npv', 'irr', 'rank']
    };

    const indicatorLabels = {
        'name': 'Название проекта',
        'npv': 'NPV',
        'irr': 'IRR',
        'payback': 'Срок окупаемости',
        'direction': 'Направление',
        'rank': 'Ранг'
    };

    // Цветовые диапазоны
    const thresholds = {
        npv: [
            { max: 10000000, className: 'cell-low' },      // до 10 млн
            { max: 12000000, className: 'cell-medium' },   // 10-12 млн
            { max: Infinity, className: 'cell-high' }      // выше 12 млн
        ],
        irr: [
            { max: 12, className: 'cell-low' },
            { max: 16, className: 'cell-medium' },
            { max: Infinity, className: 'cell-high' }
        ],
        payback: [
            { max: 3, className: 'cell-high' },    // до 3 лет - зелёный
            { max: 5, className: 'cell-medium' },  // 3-5 лет - жёлтый
            { max: Infinity, className: 'cell-low' } // более 5 лет - красный
        ],
        rank: [
            { max: 2, className: 'cell-high' },
            { max: 4, className: 'cell-medium' },
            { max: Infinity, className: 'cell-low' }
        ]
    };

    // ------------------------------ СОСТОЯНИЕ ------------------------------
    let filteredProjects = projects;
    let selectedProjectIds = projects.map(p => p.id);
    let currentCategory = 'IT';

    // ------------------------------ ЭЛЕМЕНТЫ ------------------------------
    const logoutBtn = document.querySelector('.logout-btn');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const viewerTabs = document.querySelectorAll('.viewer-tab');
    const viewerPanes = document.querySelectorAll('.viewer-pane');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const projectsCountSpan = document.getElementById('projectsCount');
    const selectedCountDiv = document.getElementById('selectedCount');
    const modal = document.getElementById('projectSelectionModal');
    const closeModal = document.querySelector('.close');
    const saveProjectSelectionBtn = document.getElementById('saveProjectSelection');
    const projectSearch = document.getElementById('projectSearch');
    const projectListDiv = document.getElementById('projectList');
    const dataFieldsContainer = document.getElementById('dataFieldsContainer');
    const exportExcelBtn = document.getElementById('exportExcel');
    const categorySelect = document.getElementById('categorySelect'); // новый select

    // Дропдауны
    const directionDropdown = document.getElementById('directionDropdown');
    const departmentDropdown = document.getElementById('departmentDropdown');
    const statusDropdown = document.getElementById('statusDropdown');
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');

    // ------------------------------ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ------------------------------
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
        `;

        if (type === 'error') notification.style.backgroundColor = 'var(--accent-color)';
        else if (type === 'success') notification.style.backgroundColor = 'var(--success-color)';
        else notification.style.backgroundColor = 'var(--secondary-color)';

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ------------------------------ ОБРАБОТЧИКИ ------------------------------
    // Выход из системы
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите выйти из системы?')) {
                window.location.href = 'index.html';
            }
        });
    }

    // Переключение основных вкладок
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });

    // Переключение вкладок таблица/график с проверкой
    viewerTabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            const tabName = this.dataset.tab;
            if (tabName === 'chart') {
                const selectedFields = Array.from(document.querySelectorAll('input[name="dataField"]:checked')).map(cb => cb.value);
                const numericFields = selectedFields.filter(f => f !== 'name');
                if (selectedProjectIds.length > 5) {
                    alert('Ошибка: для графика можно выбрать не более 5 проектов.');
                    e.preventDefault();
                    return;
                }
                if (numericFields.length > 7) {
                    alert('Ошибка: для графика можно выбрать не более 7 показателей.');
                    e.preventDefault();
                    return;
                }
            }
            viewerTabs.forEach(t => t.classList.remove('active'));
            viewerPanes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
            if (tabName === 'chart') {
                updateChart();
            }
        });
    });

    // Применение фильтров
    applyFiltersBtn.addEventListener('click', applyFilters);

    // Клик по счётчику проектов открывает модалку
    selectedCountDiv.addEventListener('click', openProjectModal);

    // Закрытие модалки
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Сохранение выбора проектов в модалке
    saveProjectSelectionBtn.addEventListener('click', saveProjectSelection);

    // Поиск в модалке
    projectSearch.addEventListener('input', renderProjectList);

    // Изменение категории (select)
    categorySelect.addEventListener('change', function() {
        currentCategory = this.value;
        renderDataFields();
        applyFilters();
    });

    // Работа дропдаунов
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            const parent = this.closest('.dropdown-checkbox');
            const isOpen = parent.classList.contains('open');
            document.querySelectorAll('.dropdown-checkbox').forEach(d => d.classList.remove('open'));
            if (!isOpen) parent.classList.add('open');
        });
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.dropdown-checkbox')) {
            document.querySelectorAll('.dropdown-checkbox').forEach(d => d.classList.remove('open'));
        }
    });

    document.querySelectorAll('.dropdown-menu input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function () {
            updateDropdownButton(this.closest('.dropdown-checkbox'));
        });
    });

    // Экспорт в Excel
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => {
            showNotification('Функция экспорта в Excel будет реализована в следующей версии', 'info');
        });
    }

    // ------------------------------ ФУНКЦИИ РАБОТЫ С ДРОПДАУНАМИ ------------------------------
    function updateDropdownButton(dropdown) {
        const checkboxes = dropdown.querySelectorAll('.dropdown-menu input[type="checkbox"]');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;
        const button = dropdown.querySelector('.dropdown-trigger');
        if (checkedCount === total) button.textContent = 'Все';
        else if (checkedCount === 0) button.textContent = 'Ничего не выбрано';
        else button.textContent = `Выбрано: ${checkedCount}`;
    }

    function updateDropdownButtons() {
        document.querySelectorAll('.dropdown-checkbox').forEach(dropdown => {
            updateDropdownButton(dropdown);
        });
    }

    // ------------------------------ ПОКАЗАТЕЛИ ------------------------------
    function renderDataFields() {
        const allowed = categoryIndicators[currentCategory] || [];
        const currentCheckboxes = document.querySelectorAll('input[name="dataField"]');
        const checkedValues = Array.from(currentCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

        let html = '';
        allowed.forEach(field => {
            const label = indicatorLabels[field] || field;
            const checked = checkedValues.includes(field) ? 'checked' : '';
            html += `
                <label class="checkbox-label">
                    <input type="checkbox" name="dataField" value="${field}" ${checked}>
                    <span class="checkmark"></span>
                    ${label}
                </label>
            `;
        });
        dataFieldsContainer.innerHTML = html;

        document.querySelectorAll('input[name="dataField"]').forEach(cb => {
            cb.addEventListener('change', updateTable);
        });
    }

    // ------------------------------ ФИЛЬТРАЦИЯ ------------------------------
    function applyFilters() {
        // Категория берётся из select (всегда есть значение)
        currentCategory = categorySelect.value;

        const selectedDirections = Array.from(directionDropdown.querySelectorAll('.dropdown-menu input:checked')).map(cb => cb.value);
        const selectedDepartments = Array.from(departmentDropdown.querySelectorAll('.dropdown-menu input:checked')).map(cb => cb.value);
        const selectedStatuses = Array.from(statusDropdown.querySelectorAll('.dropdown-menu input:checked')).map(cb => cb.value);
        const rankMin = document.getElementById('filterRankMin').value;
        const rankMax = document.getElementById('filterRankMax').value;

        filteredProjects = projects.filter(p => {
            if (p.category !== currentCategory) return false;
            if (selectedDirections.length && !selectedDirections.includes(p.direction)) return false;
            if (selectedDepartments.length && !selectedDepartments.includes(p.department)) return false;
            if (selectedStatuses.length && !selectedStatuses.includes(p.status)) return false;
            if (rankMin !== '' && p.rank < Number(rankMin)) return false;
            if (rankMax !== '' && p.rank > Number(rankMax)) return false;
            return true;
        });

        selectedProjectIds = filteredProjects.map(p => p.id);
        updateProjectsCount();
        updateTable();
        showNotification(`Применены фильтры. Найдено проектов: ${filteredProjects.length}`, 'success');
    }

    function updateProjectsCount() {
        projectsCountSpan.textContent = selectedProjectIds.length;
    }

    // ------------------------------ МОДАЛЬНОЕ ОКНО ------------------------------
    function openProjectModal() {
        renderProjectList();
        modal.style.display = 'block';
    }

    function renderProjectList() {
        const searchTerm = projectSearch.value.toLowerCase();
        const filtered = filteredProjects.filter(p => p.name.toLowerCase().includes(searchTerm));

        let html = '';
        filtered.forEach(p => {
            const checked = selectedProjectIds.includes(p.id) ? 'checked' : '';
            html += `
                <div class="project-item">
                    <label>
                        <input type="checkbox" class="project-checkbox" value="${p.id}" ${checked}>
                        <strong>${p.name}</strong>
                    </label>
                    <div class="project-info">
                        <span>Ранг: ${p.rank}</span>
                        <span>Направление: ${p.direction}</span>
                        <span>Подразделение: ${p.department}</span>
                        <span>Статус: ${p.status}</span>
                    </div>
                </div>
            `;
        });
        projectListDiv.innerHTML = html || '<p>Нет проектов</p>';
    }

    function saveProjectSelection() {
        const checkboxes = document.querySelectorAll('#projectList .project-checkbox');
        selectedProjectIds = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => Number(cb.value));
        updateProjectsCount();
        updateTable();
        modal.style.display = 'none';
    }

    // ------------------------------ ТАБЛИЦА ------------------------------
    function updateTable() {
        const selectedFields = Array.from(document.querySelectorAll('input[name="dataField"]:checked')).map(cb => cb.value);
        if (selectedFields.length === 0) {
            document.querySelector('#reportTable tbody').innerHTML = '<tr><td colspan="10">Нет выбранных полей</td></tr>';
            return;
        }

        const thead = document.querySelector('#reportTable thead tr');
        thead.innerHTML = selectedFields.map(f => `<th>${indicatorLabels[f] || f}</th>`).join('');

        const selectedProjects = projects.filter(p => selectedProjectIds.includes(p.id));
        let tbodyHtml = '';
        selectedProjects.forEach(p => {
            let row = '<tr>';
            selectedFields.forEach(field => {
                let value = p[field];
                if (field === 'npv') value = new Intl.NumberFormat('ru-RU').format(value);
                else if (field === 'irr') value = value + '%';
                else if (field === 'payback') value = value + ' лет';

                let cellClass = '';
                if (thresholds[field]) {
                    const th = thresholds[field].find(t => p[field] <= t.max);
                    if (th) cellClass = th.className;
                }
                row += `<td class="${cellClass}">${value}</td>`;
            });
            row += '</tr>';
            tbodyHtml += row;
        });
        document.querySelector('#reportTable tbody').innerHTML = tbodyHtml || '<tr><td colspan="10">Нет проектов</td></tr>';
    }

    // ------------------------------ ГРАФИК (РОЗА ПОКАЗАТЕЛЕЙ) ------------------------------
    let reportChart = null;
    function updateChart() {
        const selectedFields = Array.from(document.querySelectorAll('input[name="dataField"]:checked')).map(cb => cb.value);
        const numericFields = selectedFields.filter(f => f !== 'name');
        const selectedProjects = projects.filter(p => selectedProjectIds.includes(p.id));

        if (selectedProjects.length === 0 || numericFields.length === 0) {
            alert('Нет данных для построения графика');
            return;
        }

        const ctx = document.getElementById('reportChart').getContext('2d');
        if (reportChart) reportChart.destroy();

        const maxValues = {};
        numericFields.forEach(field => {
            maxValues[field] = Math.max(...selectedProjects.map(p => p[field]));
        });

        const datasets = selectedProjects.map((p, index) => {
            const data = numericFields.map(field => (p[field] / maxValues[field]) * 100);
            return {
                label: p.name,
                data: data,
                borderColor: `hsl(${index * 60}, 70%, 50%)`,
                backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.2)`,
                borderWidth: 2,
            };
        });

        reportChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: numericFields.map(f => indicatorLabels[f] || f),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { stepSize: 20, callback: v => v + '%' }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const field = numericFields[context.dataIndex];
                                const originalValue = selectedProjects[context.datasetIndex][field];
                                return `${context.dataset.label}: ${originalValue} (${Math.round(context.raw)}% от макс.)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ------------------------------ ИНИЦИАЛИЗАЦИЯ ------------------------------
    function init() {
        renderDataFields();
        updateDropdownButtons();
        applyFilters(); // первичное применение фильтров
    }

    init();
});