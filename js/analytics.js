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
    
    // Инициализация Chart.js
    let reportChart = null;
    
    // Переключение вкладок в просмотре отчета
    const viewerTabs = document.querySelectorAll('.viewer-tab');
    const viewerPanes = document.querySelectorAll('.viewer-pane');
    
    viewerTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Убираем активный класс у всех кнопок и панелей
            viewerTabs.forEach(t => t.classList.remove('active'));
            viewerPanes.forEach(p => p.classList.remove('active'));
            
            // Добавляем активный класс к текущей кнопке и панели
            this.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            // Если переключились на вкладку графика, обновляем его
            if (tabName === 'chart') {
                updateChart();
            }
        });
    });
    
    // Применение фильтров
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            applyFilters();
        });
    }
    
    // Экспорт в Excel
    const exportExcelBtn = document.getElementById('exportExcel');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', function() {
            exportToExcel();
        });
    }
    
    // Сохранение отчета
    const saveReportBtn = document.getElementById('saveReport');
    if (saveReportBtn) {
        saveReportBtn.addEventListener('click', function() {
            saveReport();
        });
    }
    
    // Обновление данных при изменении настроек
    const chartSettings = document.querySelectorAll('#chartType, #xAxis, #yAxis, #groupBy');
    chartSettings.forEach(setting => {
        setting.addEventListener('change', function() {
            if (document.querySelector('.viewer-tab.active').getAttribute('data-tab') === 'chart') {
                updateChart();
            }
        });
    });
    
    // Обновление таблицы при изменении выбранных полей
    const dataFields = document.querySelectorAll('input[name="dataField"]');
    dataFields.forEach(field => {
        field.addEventListener('change', function() {
            updateTable();
        });
    });
    
    function applyFilters() {
        // В реальном приложении здесь была бы фильтрация данных
        const selectedCount = Math.floor(Math.random() * 10) + 1; // Демо-данные
        document.getElementById('projectsCount').textContent = selectedCount;
        
        updateTable();
        showNotification(`Применены фильтры. Найдено проектов: ${selectedCount}`, 'success');
    }
    
    function updateTable() {
        const table = document.getElementById('reportTable');
        const selectedFields = Array.from(document.querySelectorAll('input[name="dataField"]:checked'))
            .map(field => field.value);
        
        // В реальном приложении здесь обновлялись бы данные таблицы
        // Сейчас просто показываем уведомление
        console.log('Обновление таблицы с полями:', selectedFields);
    }
    
    function updateChart() {
        const ctx = document.getElementById('reportChart');
        if (!ctx) return;
        
        const chartType = document.getElementById('chartType').value;
        const xAxis = document.getElementById('xAxis').value;
        const yAxis = document.getElementById('yAxis').value;
        const groupBy = document.getElementById('groupBy').value;
        
        // Удаляем существующий график, если он есть
        if (reportChart) {
            reportChart.destroy();
        }
        
        // Подготавливаем данные в зависимости от типа графика
        let data, options;
        
        switch (chartType) {
            case 'bar':
                data = getBarChartData(xAxis, yAxis, groupBy);
                options = getBarChartOptions();
                break;
            case 'line':
                data = getLineChartData(xAxis, yAxis);
                options = getLineChartOptions();
                break;
            case 'pie':
                data = getPieChartData(xAxis, yAxis);
                options = getPieChartOptions();
                break;
            case 'scatter':
                data = getScatterChartData(xAxis, yAxis);
                options = getScatterChartOptions();
                break;
            default:
                data = getBarChartData(xAxis, yAxis, groupBy);
                options = getBarChartOptions();
        }
        
        // Создаем новый график
        reportChart = new Chart(ctx, {
            type: chartType,
            data: data,
            options: options
        });
    }
    
    // Функции для подготовки данных графиков
    function getBarChartData(xAxis, yAxis, groupBy) {
        // Демо-данные для столбчатой диаграммы
        return {
            labels: ['Развитие IT-инфраструктуры', 'Строительство цеха №2', 'Закупка оборудования'],
            datasets: [{
                label: getYAxisLabel(yAxis),
                data: [15800000, 12500000, 9200000],
                backgroundColor: '#3498DB',
                borderColor: '#2980B9',
                borderWidth: 1
            }]
        };
    }
    
    function getLineChartData(xAxis, yAxis) {
        // Демо-данные для линейной диаграммы
        return {
            labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
            datasets: [{
                label: getYAxisLabel(yAxis),
                data: [12000000, 13500000, 14200000, 15800000, 14500000, 16200000],
                borderColor: '#27AE60',
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        };
    }
    
    function getPieChartData(xAxis, yAxis) {
        // Демо-данные для круговой диаграммы
        return {
            labels: ['IT', 'Производство', 'Логистика'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: ['#3498DB', '#27AE60', '#F39C12'],
                borderWidth: 2
            }]
        };
    }
    
    function getScatterChartData(xAxis, yAxis) {
        // Демо-данные для точечной диаграммы
        return {
            datasets: [{
                label: 'Проекты',
                data: [
                    { x: 12, y: 15 },
                    { x: 15, y: 18 },
                    { x: 18, y: 22 },
                    { x: 10, y: 12 },
                    { x: 20, y: 25 }
                ],
                backgroundColor: '#E74C3C'
            }]
        };
    }
    
    function getYAxisLabel(yAxis) {
        const labels = {
            'npv': 'NPV (руб.)',
            'irr': 'IRR (%)',
            'rank': 'Ранг',
            'payback': 'Срок окупаемости (лет)'
        };
        return labels[yAxis] || yAxis;
    }
    
    // Функции для настройки опций графиков
    function getBarChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('ru-RU').format(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${new Intl.NumberFormat('ru-RU').format(context.raw)}`;
                        }
                    }
                }
            }
        };
    }
    
    function getLineChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('ru-RU').format(value);
                        }
                    }
                }
            }
        };
    }
    
    function getPieChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        };
    }
    
    function getScatterChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Срок окупаемости (лет)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'IRR (%)'
                    }
                }
            }
        };
    }
    
    function exportToExcel() {
        showNotification('Функция экспорта в Excel будет реализована в следующей версии', 'info');
    }
    
    function saveReport() {
        const reportName = prompt('Введите название отчета:');
        if (reportName) {
            showNotification(`Отчет "${reportName}" сохранен`, 'success');
        }
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
    
    // Инициализация графика при загрузке страницы
    updateChart();
});