document.addEventListener('DOMContentLoaded', function () {
    // ------------------------------ ДАННЫЕ ------------------------------
    const projects = [
        { id: 1, name: 'Развитие IT-инфраструктуры', rank: 1, direction: 'IT', department: 'Департамент развития', status: 'Активен', category: 'IT', npv: 15800000, irr: 18.5, payback: 2.5 },
        { id: 2, name: 'Строительство цеха №2', rank: 2, direction: 'Производство', department: 'Филиал Восток', status: 'Активен', category: 'Производство', npv: 12500000, irr: 15.2, payback: 3.2 },
        { id: 3, name: 'Закупка оборудования', rank: 3, direction: 'Производство', department: 'Центральный офис', status: 'На паузе', category: 'Производство', npv: 9200000, irr: 12.8, payback: 4.0 },
        { id: 4, name: 'Внедрение CRM', rank: 4, direction: 'IT', department: 'Департамент развития', status: 'Активен', category: 'IT', npv: 7300000, irr: 11.2, payback: 3.8 },
        { id: 5, name: 'Логистический центр', rank: 5, direction: 'Логистика', department: 'Филиал Восток', status: 'Завершен', category: 'Логистика', npv: 18200000, irr: 21.0, payback: 2.0 },
        { id: 6, name: 'Автоматизация склада', rank: 6, direction: 'Логистика', department: 'Центральный офис', status: 'На паузе', category: 'Логистика', npv: 6700000, irr: 9.5, payback: 5.2 },
    ];

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

    const thresholds = {
        npv: [
            { max: 10000000, className: 'cell-low' },
            { max: 12000000, className: 'cell-medium' },
            { max: Infinity, className: 'cell-high' }
        ],
        irr: [
            { max: 12, className: 'cell-low' },
            { max: 16, className: 'cell-medium' },
            { max: Infinity, className: 'cell-high' }
        ],
        payback: [
            { max: 3, className: 'cell-high' },
            { max: 5, className: 'cell-medium' },
            { max: Infinity, className: 'cell-low' }
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
    const categorySelect = document.getElementById('categorySelect');

    // Дропдауны анализа
    const directionDropdown = document.getElementById('directionDropdown');
    const departmentDropdown = document.getElementById('departmentDropdown');
    const statusDropdown = document.getElementById('statusDropdown');
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');

    // ------------------------------ ВСПОМОГАТЕЛЬНЫЕ ------------------------------
    function showNotification(message, type) {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
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
        notification.style.backgroundColor = type === 'error' ? 'var(--accent-color)' :
                                            type === 'success' ? 'var(--success-color)' : 'var(--secondary-color)';
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ------------------------------ ОБРАБОТЧИКИ (анализ) ------------------------------
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите выйти?')) window.location.href = 'index.html';
        });
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });

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
            if (tabName === 'chart') updateChart();
        });
    });

    applyFiltersBtn.addEventListener('click', applyFilters);
    selectedCountDiv.addEventListener('click', openProjectModal);
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    saveProjectSelectionBtn.addEventListener('click', saveProjectSelection);
    projectSearch.addEventListener('input', renderProjectList);
    categorySelect.addEventListener('change', function() {
        currentCategory = this.value;
        renderDataFields();
        applyFilters();
    });

    // Работа дропдаунов (общая для всех)
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

    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => showNotification('Экспорт в Excel будет реализован в следующей версии', 'info'));
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
        document.querySelectorAll('.dropdown-checkbox').forEach(dropdown => updateDropdownButton(dropdown));
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
                    <span class="checkmark"></span>${label}
                </label>`;
        });
        dataFieldsContainer.innerHTML = html;
        document.querySelectorAll('input[name="dataField"]').forEach(cb => cb.addEventListener('change', updateTable));
    }

    // ------------------------------ ФИЛЬТРАЦИЯ (анализ) ------------------------------
    function applyFilters(showNotify = true) {
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
        if (showNotify) {
            showNotification(`Применены фильтры. Найдено проектов: ${filteredProjects.length}`, 'success');
        }
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
                    <label class="checkbox-label">
                        <input type="checkbox" class="project-checkbox" value="${p.id}" ${checked}>
                        <span class="checkmark"></span><strong>${p.name}</strong>
                    </label>
                    <div class="project-info">
                        <span>Ранг: ${p.rank}</span>
                        <span>Направление: ${p.direction}</span>
                        <span>Подразделение: ${p.department}</span>
                        <span>Статус: ${p.status}</span>
                    </div>
                </div>`;
        });
        projectListDiv.innerHTML = html || '<p>Нет проектов</p>';
    }

    function saveProjectSelection() {
        const checkboxes = document.querySelectorAll('#projectList .project-checkbox');
        selectedProjectIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => Number(cb.value));
        updateProjectsCount();
        updateTable();
        modal.style.display = 'none';
    }

    // ------------------------------ ТАБЛИЦА (анализ) ------------------------------
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
        numericFields.forEach(field => { maxValues[field] = Math.max(...selectedProjects.map(p => p[field])); });
        const datasets = selectedProjects.map((p, index) => ({
            label: p.name,
            data: numericFields.map(field => (p[field] / maxValues[field]) * 100),
            borderColor: `hsl(${index * 60}, 70%, 50%)`,
            backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.2)`,
            borderWidth: 2,
        }));
        reportChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: numericFields.map(f => indicatorLabels[f] || f),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20, callback: v => v + '%' } } },
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

    // ------------------------------ ИНИЦИАЛИЗАЦИЯ (анализ) ------------------------------
    function init() {
        renderDataFields();
        updateDropdownButtons();
        applyFilters(false);
    }
    init();

    // ==================== СВОДКА ПО ПОДРАЗДЕЛЕНИЯМ ====================
    const summaryDepartmentDropdown = document.getElementById('summaryDepartmentDropdown');
    const summaryStatusDropdown = document.getElementById('summaryStatusDropdown');
    const summaryDirectionDropdown = document.getElementById('summaryDirectionDropdown');
    const summaryCategoryDropdown = document.getElementById('summaryCategoryDropdown');
    const summaryDateFrom = document.getElementById('summaryDateFrom');
    const summaryDateTo = document.getElementById('summaryDateTo');
    const applySummaryFiltersBtn = document.getElementById('applySummaryFilters');
    const summaryTableBody = document.querySelector('#summaryTable tbody');
    const totalProjectsSpan = document.getElementById('totalProjects');
    const totalBudgetSpan = document.getElementById('totalBudget');
    const summaryChartCanvas = document.getElementById('summaryChart');
    let summaryChart = null;

    if (summaryDepartmentDropdown) { // Если вкладка существует
        const projectsWithDates = projects.map(p => ({
            ...p,
            date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
        }));

        function updateSummaryDropdownButtons() {
            if (summaryDepartmentDropdown) updateDropdownButton(summaryDepartmentDropdown);
            if (summaryStatusDropdown) updateDropdownButton(summaryStatusDropdown);
            if (summaryDirectionDropdown) updateDropdownButton(summaryDirectionDropdown);
            if (summaryCategoryDropdown) updateDropdownButton(summaryCategoryDropdown);
        }

        function getFilteredProjectsForSummary() {
            const selectedDepartments = Array.from(summaryDepartmentDropdown.querySelectorAll('.dropdown-menu input:checked')).map(cb => cb.value);
            const selectedStatuses = Array.from(summaryStatusDropdown.querySelectorAll('.dropdown-menu input:checked')).map(cb => cb.value);
            const selectedDirections = Array.from(summaryDirectionDropdown.querySelectorAll('.dropdown-menu input:checked')).map(cb => cb.value);
            const selectedCategories = Array.from(summaryCategoryDropdown.querySelectorAll('.dropdown-menu input:checked')).map(cb => cb.value);
            const dateFrom = summaryDateFrom.value;
            const dateTo = summaryDateTo.value;

            return projectsWithDates.filter(p => {
                if (selectedDepartments.length && !selectedDepartments.includes(p.department)) return false;
                if (selectedStatuses.length && !selectedStatuses.includes(p.status)) return false;
                if (selectedDirections.length && !selectedDirections.includes(p.direction)) return false;
                if (selectedCategories.length && !selectedCategories.includes(p.category)) return false;
                if (dateFrom && p.date < dateFrom) return false;
                if (dateTo && p.date > dateTo) return false;
                return true;
            });
        }

        function aggregateByDepartment(projectsList) {
            const deptMap = new Map();
            projectsList.forEach(p => {
                const dept = p.department;
                if (!deptMap.has(dept)) deptMap.set(dept, { count: 0, totalNPV: 0 });
                const entry = deptMap.get(dept);
                entry.count += 1;
                entry.totalNPV += p.npv;
            });
            return Array.from(deptMap.entries())
                .map(([dept, data]) => ({ department: dept, count: data.count, totalNPV: data.totalNPV }))
                .sort((a, b) => a.department.localeCompare(b.department));
        }

        function updateSummaryTable() {
            const filtered = getFilteredProjectsForSummary();
            const aggregated = aggregateByDepartment(filtered);
            let tbodyHtml = '';
            let totalProjects = 0;
            let totalBudget = 0;
            aggregated.forEach(item => {
                totalProjects += item.count;
                totalBudget += item.totalNPV;
                tbodyHtml += `<tr>
                    <td>${item.department}</td>
                    <td>${item.count}</td>
                    <td>${new Intl.NumberFormat('ru-RU').format(item.totalNPV)}</td>
                </tr>`;
            });
            summaryTableBody.innerHTML = tbodyHtml || '<tr><td colspan="3">Нет данных</td></tr>';
            totalProjectsSpan.textContent = totalProjects;
            totalBudgetSpan.textContent = new Intl.NumberFormat('ru-RU').format(totalBudget);
        }

        function updateSummaryChart() {
            const filtered = getFilteredProjectsForSummary();
            const aggregated = aggregateByDepartment(filtered);
            if (aggregated.length === 0) {
                if (summaryChart) summaryChart.destroy();
                return;
            }
            const ctx = summaryChartCanvas.getContext('2d');
            if (summaryChart) summaryChart.destroy();
            summaryChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: aggregated.map(item => item.department),
                    datasets: [{
                        data: aggregated.map(item => item.count),
                        backgroundColor: ['#3498DB', '#27AE60', '#F39C12', '#E74C3C', '#9B59B6'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const dept = context.label;
                                    const item = aggregated.find(i => i.department === dept);
                                    return `${dept}: ${item.count} проектов, сумма: ${new Intl.NumberFormat('ru-RU').format(item.totalNPV)}`;
                                }
                            }
                        }
                    }
                }
            });
        }

        function applySummaryFilters(showNotify = true) {
            updateSummaryTable();
            updateSummaryChart();
            if (showNotify) {
                showNotification(`Применены фильтры`, 'success');
            }
        }

        if (applySummaryFiltersBtn) {
            applySummaryFiltersBtn.addEventListener('click', applySummaryFilters);
        }


        function initSummary() {
            updateSummaryDropdownButtons();
            applySummaryFilters(false);
        }

        // Инициализация дропдаунов сводки (обработчики уже есть, просто обновим текст)
        updateSummaryDropdownButtons();

        // При переключении на вкладку
        const summaryTabButton = document.querySelector('.tab-button[data-tab="summary"]');
        if (summaryTabButton) {
            summaryTabButton.addEventListener('click', function() {
                setTimeout(initSummary, 50);
            });
        }

        if (document.getElementById('summary').classList.contains('active')) {
            initSummary();
        }

        document.getElementById('exportSummaryExcel')?.addEventListener('click', () => {
            showNotification('Экспорт в Excel будет реализован в следующей версии', 'info');
        });
    }

        // ==================== ШАБЛОНЫ ====================
    let templates = []; // массив шаблонов: { id, name, date, settings }

    // Элементы
    const templateSearch = document.getElementById('templateSearch');
    const templatesList = document.getElementById('templatesList');
    const saveTemplateBtn = document.getElementById('saveAsTemplateBtn');
    const editTemplateBtn = document.getElementById('editTemplateBtn');

    // Вспомогательная функция для сбора текущих настроек
    function getCurrentSettings() {
        const category = categorySelect.value;
        const directions = Array.from(directionDropdown.querySelectorAll('.dropdown-menu input:checked')).map(cb => cb.value);
        const departments = Array.from(departmentDropdown.querySelectorAll('.dropdown-menu input:checked')).map(cb => cb.value);
        const statuses = Array.from(statusDropdown.querySelectorAll('.dropdown-menu input:checked')).map(cb => cb.value);
        const rankMin = document.getElementById('filterRankMin').value;
        const rankMax = document.getElementById('filterRankMax').value;
        const selectedFields = Array.from(document.querySelectorAll('input[name="dataField"]:checked')).map(cb => cb.value);

        return {
            category,
            directions,
            departments,
            statuses,
            rankMin,
            rankMax,
            selectedFields
        };
    }

    // Применить настройки шаблона к элементам
    function applyTemplateSettings(settings) {
        // Категория
        categorySelect.value = settings.category;
        currentCategory = settings.category;
        renderDataFields(); // обновить доступные поля

        // Направления
        directionDropdown.querySelectorAll('.dropdown-menu input').forEach(cb => {
            cb.checked = settings.directions.includes(cb.value);
        });
        updateDropdownButton(directionDropdown);

        // Подразделения
        departmentDropdown.querySelectorAll('.dropdown-menu input').forEach(cb => {
            cb.checked = settings.departments.includes(cb.value);
        });
        updateDropdownButton(departmentDropdown);

        // Статусы
        statusDropdown.querySelectorAll('.dropdown-menu input').forEach(cb => {
            cb.checked = settings.statuses.includes(cb.value);
        });
        updateDropdownButton(statusDropdown);

        // Ранги
        document.getElementById('filterRankMin').value = settings.rankMin || '';
        document.getElementById('filterRankMax').value = settings.rankMax || '';

        // Показатели
        document.querySelectorAll('input[name="dataField"]').forEach(cb => {
            cb.checked = settings.selectedFields.includes(cb.value);
        });

        // Применить фильтры и обновить таблицу
        applyFilters();
    }

    // Сохранить шаблон
    function saveTemplate() {
        const name = prompt('Введите название шаблона:');
        if (!name) return;

        const settings = getCurrentSettings();
        const newTemplate = {
            id: Date.now(),
            name: name,
            date: new Date().toLocaleDateString('ru-RU'),
            settings: settings
        };
        templates.push(newTemplate);
        renderTemplates();
        showNotification(`Шаблон "${name}" сохранён`, 'success');
    }

    // Удалить шаблон
    function deleteTemplate(id, event) {
        event.stopPropagation(); // чтобы не сработал клик на элементе
        if (confirm('Удалить шаблон?')) {
            templates = templates.filter(t => t.id !== id);
            renderTemplates();
            showNotification('Шаблон удалён', 'info');
        }
    }

    // Применить шаблон (переключить вкладку и установить фильтры)
    function applyTemplate(template) {
        // Переключиться на вкладку анализа
        document.querySelector('.tab-button[data-tab="analysis"]').click();
        // Применить настройки
        applyTemplateSettings(template.settings);
        showNotification(`Применён шаблон "${template.name}"`, 'success');
    }

    // Отрисовать список шаблонов
    function renderTemplates() {
        const searchTerm = templateSearch.value.toLowerCase();
        const filtered = templates.filter(t => t.name.toLowerCase().includes(searchTerm));

        if (filtered.length === 0) {
            templatesList.innerHTML = '<p class="text-center">Нет сохранённых шаблонов</p>';
            return;
        }

        let html = '';
        filtered.forEach(t => {
            html += `
                <div class="template-item" data-id="${t.id}">
                    <div class="template-info">
                        <span class="template-name">${t.name}</span>
                        <span class="template-date">${t.date}</span>
                    </div>
                    <button class="delete-template-btn" title="Удалить шаблон">🗑️ Удалить</button>
                </div>
            `;
        });
        templatesList.innerHTML = html;

        // Обработчики на элементах
        document.querySelectorAll('.template-item').forEach(item => {
            const id = Number(item.dataset.id);
            // Клик по элементу (кроме кнопки удаления)
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-template-btn')) return;
                const template = templates.find(t => t.id === id);
                if (template) applyTemplate(template);
            });

            // Кнопка удаления
            const deleteBtn = item.querySelector('.delete-template-btn');
            deleteBtn.addEventListener('click', (e) => deleteTemplate(id, e));
        });
    }

    // Поиск по шаблонам
    templateSearch.addEventListener('input', renderTemplates);

    // Кнопки сохранения и изменения
    if (saveTemplateBtn) {
        saveTemplateBtn.addEventListener('click', saveTemplate);
    }

    if (editTemplateBtn) {
        editTemplateBtn.addEventListener('click', () => {
            // Для упрощения пока просто сохраняем как новый
            saveTemplate();
        });
    }

    // Инициализация (можно добавить пару демо-шаблонов для теста)
    function initTemplates() {
        // Примеры
        templates = [
            {
                id: 1,
                name: 'IT проекты',
                date: '15.03.2026',
                settings: {
                    category: 'IT',
                    directions: ['IT'],
                    departments: ['Департамент развития'],
                    statuses: ['Активен'],
                    rankMin: '',
                    rankMax: '',
                    selectedFields: ['name', 'npv', 'irr', 'payback']
                }
            },
            {
                id: 2,
                name: 'Производство',
                date: '14.03.2026',
                settings: {
                    category: 'Производство',
                    directions: ['Производство'],
                    departments: ['Филиал Восток', 'Центральный офис'],
                    statuses: ['Активен', 'На паузе'],
                    rankMin: '1',
                    rankMax: '5',
                    selectedFields: ['name', 'npv', 'irr', 'rank']
                }
            }
        ];
        renderTemplates();
    }

    // Вызовем инициализацию
    initTemplates();
});