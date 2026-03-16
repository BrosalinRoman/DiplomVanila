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

            if (tabId === 'visual') {
                updateProgressChart();
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

    // Кнопка "Сохранить изменения" (заглушка)
    document.getElementById('saveProjectBtn').addEventListener('click', function() {
        alert('Изменения сохранены (демонстрация)');
    });

    // ------------------- Данные для инвестиций -------------------
    const BUDGET = 35000; // бюджет проекта

    let investmentData = [
        { plan: 10000, fact: 8000, planDate: '2024-01-15', factDate: '2024-01-20', isPlan: true },
        { plan: 15000, fact: 12000, planDate: '2024-03-20', factDate: '2024-03-25', isPlan: true },
        { plan: 10000, fact: 5000, planDate: '2024-06-10', factDate: '', isPlan: true }
    ];

    // Вычисление общей суммы фактических инвестиций
    function getTotalFact() {
        return investmentData.reduce((sum, d) => sum + (d.fact || 0), 0);
    }

    // Проверка хронологии дат инвестиций
    function isDateOrderValid(newDateStr, editIndex) {
        const newDate = new Date(newDateStr);
        let recordsWithDates = investmentData
            .map((item, idx) => ({ idx, date: item.factDate ? new Date(item.factDate) : null, fact: item.fact }))
            .filter(r => r.date && r.fact && r.fact > 0);

        if (editIndex !== undefined) {
            recordsWithDates = recordsWithDates.filter(r => r.idx !== editIndex);
        }

        if (recordsWithDates.length === 0) return true;

        recordsWithDates.sort((a, b) => a.date - b.date);

        if (newDate < recordsWithDates[0].date) {
            alert(`Дата не может быть раньше самой ранней существующей даты (${recordsWithDates[0].date.toLocaleDateString('ru-RU')})`);
            return false;
        }
        if (newDate > recordsWithDates[recordsWithDates.length - 1].date) {
            return true;
        }

        for (let i = 0; i < recordsWithDates.length - 1; i++) {
            if (newDate >= recordsWithDates[i].date && newDate <= recordsWithDates[i+1].date) {
                return true;
            }
        }
        alert('Дата нарушает хронологический порядок существующих записей');
        return false;
    }

    // Проверка суммы инвестиций (не больше плана строки и общего бюджета)
    function isAmountValid(newFact, editIndex) {
        let totalFactWithoutCurrent = 0;
        for (let i = 0; i < investmentData.length; i++) {
            if (i === editIndex) continue;
            totalFactWithoutCurrent += investmentData[i].fact || 0;
        }

        if (totalFactWithoutCurrent + newFact > BUDGET) {
            alert(`Общая сумма фактических инвестиций (${totalFactWithoutCurrent + newFact} BYN) превышает бюджет (${BUDGET} BYN)`);
            return false;
        }

        if (editIndex !== undefined) {
            const item = investmentData[editIndex];
            if (item.plan && newFact > item.plan) {
                alert(`Фактическая сумма (${newFact} BYN) не может превышать план (${item.plan} BYN) для данной строки`);
                return false;
            }
        }
        return true;
    }

    function renderInvestments() {
        const tbody = document.getElementById('investmentsBody');
        tbody.innerHTML = '';
        investmentData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.dataset.index = index;
            const planDisplay = item.plan ? item.plan : '-';
            const planDateDisplay = item.planDate ? item.planDate : '-';
            const factDisplay = item.fact !== '' ? item.fact : '';
            const factDateDisplay = item.factDate || '';

            let actionsHtml = '';
            if (item.isPlan) {
                actionsHtml = `<button class="btn-icon btn-edit" onclick="editInvest(${index})">✎</button>`;
            } else {
                actionsHtml = `
                    <button class="btn-icon btn-edit" onclick="editInvest(${index})">✎</button>
                    <button class="btn-icon btn-delete" onclick="deleteInvest(${index})">🗑</button>
                `;
            }

            row.innerHTML = `
                <td>${planDisplay}</td>
                <td>${factDisplay}</td>
                <td>${planDateDisplay}</td>
                <td>${factDateDisplay}</td>
                <td class="action-buttons">${actionsHtml}</td>
            `;
            tbody.appendChild(row);
        });
        updateInvestmentTotals();
    }

    function updateInvestmentTotals() {
        let totalPlan = 0;
        let totalFact = 0;
        let planDates = investmentData.filter(d => d.planDate).map(d => d.planDate);
        let factDates = investmentData.filter(d => d.factDate).map(d => d.factDate);
        
        totalPlan = investmentData.reduce((sum, d) => sum + (d.plan || 0), 0);
        totalFact = investmentData.reduce((sum, d) => sum + (d.fact || 0), 0);
        
        const maxPlanDate = planDates.length ? new Date(Math.max(...planDates.map(d => new Date(d)))).toISOString().split('T')[0] : '-';
        const maxFactDate = factDates.length ? new Date(Math.max(...factDates.map(d => new Date(d)))).toISOString().split('T')[0] : '-';

        document.getElementById('totalPlan').innerText = totalPlan;
        document.getElementById('totalFact').innerText = totalFact;
        document.getElementById('maxPlanDate').innerText = maxPlanDate;
        document.getElementById('maxFactDate').innerText = maxFactDate;

        document.getElementById('investedTotal').innerText = totalFact;
        document.getElementById('leftTotal').innerText = totalPlan - totalFact;
    }

    // Глобальные функции для кнопок инвестиций
    window.editInvest = function(index) {
        const item = investmentData[index];
        document.getElementById('investFact').value = item.fact || '';
        document.getElementById('investFactDate').value = item.factDate || '';
        document.getElementById('investModalTitle').innerText = 'Редактировать инвестицию';
        document.getElementById('investModal').dataset.editIndex = index;
        openModal('investModal');
    };

    window.deleteInvest = function(index) {
        if (confirm('Удалить дополнительную инвестицию?')) {
            investmentData.splice(index, 1);
            renderInvestments();
        }
    };

    // Модальное окно для инвестиций
    const investModal = document.getElementById('investModal');
    const cancelInvest = document.getElementById('cancelInvestModal');
    const saveInvest = document.getElementById('saveInvestBtn');

    cancelInvest.addEventListener('click', () => closeModal('investModal'));
    window.addEventListener('click', (e) => {
        if (e.target === investModal) closeModal('investModal');
    });

    saveInvest.addEventListener('click', () => {
        const fact = parseFloat(document.getElementById('investFact').value);
        const factDate = document.getElementById('investFactDate').value;

        if (isNaN(fact) || fact <= 0 || !factDate) {
            alert('Заполните факт (положительное число) и фактическую дату');
            return;
        }

        const editIndex = investModal.dataset.editIndex;
        const idx = editIndex === undefined ? undefined : parseInt(editIndex);

        if (!isAmountValid(fact, idx)) return;
        if (!isDateOrderValid(factDate, idx)) return;

        if (idx !== undefined) {
            investmentData[idx].fact = fact;
            investmentData[idx].factDate = factDate;
            delete investModal.dataset.editIndex;
        } else {
            investmentData.push({
                plan: null,
                planDate: null,
                fact: fact,
                factDate: factDate,
                isPlan: false
            });
        }

        renderInvestments();
        closeModal('investModal');
        document.getElementById('investFact').value = '';
        document.getElementById('investFactDate').value = '';
    });

    document.getElementById('addInvestBtn').addEventListener('click', () => {
        document.getElementById('investModalTitle').innerText = 'Добавить инвестицию';
        delete investModal.dataset.editIndex;
        openModal('investModal');
    });

    // ------------------- Затраты -------------------
    let costsData = [
        { amount: 5000, description: 'Закупка серверов', responsible: 'Петров П.П.', date: '2024-02-10' },
        { amount: 2000, description: 'Лицензии ПО', responsible: 'Сидоров С.С.', date: '2024-02-15' }
    ];

    // Проверка, что общая сумма затрат не превышает фактически проинвестированную сумму
    function isCostTotalValid(newAmount, editIndex) {
        const totalFact = getTotalFact();
        let totalCostsWithoutCurrent = 0;
        for (let i = 0; i < costsData.length; i++) {
            if (i === editIndex) continue;
            totalCostsWithoutCurrent += costsData[i].amount;
        }
        if (totalCostsWithoutCurrent + newAmount > totalFact) {
            alert(`Общая сумма затрат (${totalCostsWithoutCurrent + newAmount} BYN) превышает фактически проинвестированные средства (${totalFact} BYN)`);
            return false;
        }
        return true;
    }

    function renderCosts() {
        // Сортируем затраты по дате (по возрастанию)
        const sorted = [...costsData].sort((a, b) => new Date(a.date) - new Date(b.date));
        const tbody = document.getElementById('costsBody');
        tbody.innerHTML = '';
        let total = 0;
        sorted.forEach((item, index) => {
            total += item.amount;
            const row = document.createElement('tr');
            // Важно: для кнопок нам нужен исходный индекс? Используем сортированный массив, но функции editCost/deleteCost ожидают индекс в исходном массиве.
            // Поэтому мы не можем просто использовать index из сортированного. Нужно найти исходный индекс или переделать функции на работу с id.
            // Проще хранить в строках data-index как исходный индекс, а для сортировки использовать порядок, но тогда кнопки будут работать неправильно.
            // Решение: добавить каждой записи уникальный id (например, timestamp) и использовать его для идентификации.
            // Но для простоты можно не менять логику кнопок, а сортировать только для отображения, но оставить исходный порядок данных.
            // Однако требование — "автоматическая сортировка по дате", значит таблица должна показываться отсортированной.
            // Придётся переделать редактирование/удаление на работу с id, либо использовать индекс в отсортированном массиве, но тогда при редактировании нужно найти элемент в исходном массиве.
            // Добавим каждой записи уникальный id при создании (Date.now() + счётчик). Для начальных данных тоже добавим id.
            // Это надёжнее.
        });
    }

    // Переделаем costsData с id
    // Для простоты добавим id вручную
    costsData = [
        { id: 'c1', amount: 5000, description: 'Закупка серверов', responsible: 'Петров П.П.', date: '2024-02-10' },
        { id: 'c2', amount: 2000, description: 'Лицензии ПО', responsible: 'Сидоров С.С.', date: '2024-02-15' }
    ];

    let nextCostId = 100;

    function renderCosts() {
        // Сортируем по дате
        const sorted = [...costsData].sort((a, b) => new Date(a.date) - new Date(b.date));
        const tbody = document.getElementById('costsBody');
        tbody.innerHTML = '';
        let total = 0;
        sorted.forEach(item => {
            total += item.amount;
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            row.innerHTML = `
                <td>${item.amount}</td>
                <td>${item.description}</td>
                <td>${item.responsible}</td>
                <td>${item.date}</td>
                <td class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editCost('${item.id}')">✎</button>
                    <button class="btn-icon btn-delete" onclick="deleteCost('${item.id}')">🗑</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        document.getElementById('totalCosts').innerText = total;
        document.getElementById('spentTotal').innerText = total;
    }

    window.deleteCost = function(id) {
        if (confirm('Удалить запись?')) {
            costsData = costsData.filter(item => item.id !== id);
            renderCosts();
        }
    };

    window.editCost = function(id) {
        const item = costsData.find(item => item.id === id);
        if (!item) return;
        document.getElementById('costAmount').value = item.amount;
        document.getElementById('costDescription').value = item.description;
        document.getElementById('costResponsible').value = item.responsible;
        document.getElementById('costDate').value = item.date;
        document.getElementById('costModalTitle').innerText = 'Редактировать затраты';
        document.getElementById('costModal').dataset.editId = id;
        openModal('costModal');
    };

    const costModal = document.getElementById('costModal');
    const cancelCost = document.getElementById('cancelCostModal');
    const saveCost = document.getElementById('saveCostBtn');

    cancelCost.addEventListener('click', () => closeModal('costModal'));
    window.addEventListener('click', (e) => {
        if (e.target === costModal) closeModal('costModal');
    });

    saveCost.addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('costAmount').value);
        const description = document.getElementById('costDescription').value.trim();
        const responsible = document.getElementById('costResponsible').value.trim();
        const date = document.getElementById('costDate').value;

        if (!amount || amount <= 0 || !description || !responsible || !date) {
            alert('Заполните все поля корректно');
            return;
        }

        const editId = costModal.dataset.editId;
        let editIndex = -1;
        if (editId) {
            editIndex = costsData.findIndex(item => item.id === editId);
        }

        // Проверка суммы затрат относительно проинвестированного
        if (!isCostTotalValid(amount, editIndex)) return;

        if (editId) {
            // Редактирование
            const index = costsData.findIndex(item => item.id === editId);
            if (index !== -1) {
                costsData[index] = { ...costsData[index], amount, description, responsible, date };
            }
            delete costModal.dataset.editId;
        } else {
            // Добавление
            const newId = 'c' + nextCostId++;
            costsData.push({ id: newId, amount, description, responsible, date });
        }

        renderCosts();
        closeModal('costModal');
        document.getElementById('costAmount').value = '';
        document.getElementById('costDescription').value = '';
        document.getElementById('costResponsible').value = '';
        document.getElementById('costDate').value = '';
    });

    document.getElementById('addCostBtn').addEventListener('click', () => {
        document.getElementById('costModalTitle').innerText = 'Добавить затраты';
        delete costModal.dataset.editId;
        openModal('costModal');
    });

    // ------------------- Отчет о проделанной работе -------------------
    // Добавим id для отчётов
    let workData = [
        { id: 'w1', description: 'Установка серверов', progress: 20, dateTime: '2024-02-12 14:30' },
        { id: 'w2', description: 'Настройка ПО', progress: 30, dateTime: '2024-02-18 11:15' }
    ];
    let nextWorkId = 100;

    // Сортируем отчёты по дате для хронологического порядка
    workData.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    function renderWork() {
        // Уже отсортированы
        const tbody = document.getElementById('workDoneBody');
        tbody.innerHTML = '';
        workData.forEach(item => {
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            row.innerHTML = `
                <td>${item.description}</td>
                <td>${item.progress}</td>
                <td>${item.dateTime}</td>
                <td class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editWork('${item.id}')">✎</button>
                    <button class="btn-icon btn-delete" onclick="deleteWork('${item.id}')">🗑</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        if (workData.length > 0) {
            const maxProgress = Math.max(...workData.map(w => w.progress));
            document.getElementById('progressPercent').innerText = maxProgress;
        } else {
            document.getElementById('progressPercent').innerText = '0';
        }
    }

    // Проверка прогресса при редактировании (неубывание)
    function isWorkProgressValidAtEdit(editId, newProgress) {
        const index = workData.findIndex(item => item.id === editId);
        if (index === -1) return true; // не найдено

        // Проверка с предыдущим
        if (index > 0) {
            if (newProgress < workData[index-1].progress) {
                alert(`Прогресс не может быть меньше предыдущего значения (${workData[index-1].progress}%)`);
                return false;
            }
        }
        // Проверка со следующим
        if (index < workData.length - 1) {
            if (newProgress > workData[index+1].progress) {
                alert(`Прогресс не может быть больше следующего значения (${workData[index+1].progress}%)`);
                return false;
            }
        }
        return true;
    }

    window.deleteWork = function(id) {
        if (confirm('Удалить запись?')) {
            workData = workData.filter(item => item.id !== id);
            renderWork();
        }
    };

    window.editWork = function(id) {
        const item = workData.find(item => item.id === id);
        if (!item) return;
        document.getElementById('workDescription').value = item.description;
        document.getElementById('workProgress').value = item.progress;
        document.getElementById('workModalTitle').innerText = 'Редактировать запись';
        document.getElementById('workModal').dataset.editId = id;
        openModal('workModal');
    };

    const workModal = document.getElementById('workModal');
    const cancelWork = document.getElementById('cancelWorkModal');
    const saveWork = document.getElementById('saveWorkBtn');

    cancelWork.addEventListener('click', () => closeModal('workModal'));
    window.addEventListener('click', (e) => {
        if (e.target === workModal) closeModal('workModal');
    });

    saveWork.addEventListener('click', () => {
        const description = document.getElementById('workDescription').value.trim();
        const progress = parseInt(document.getElementById('workProgress').value);

        if (!description || isNaN(progress) || progress < 0 || progress > 100) {
            alert('Введите описание и прогресс (0-100)');
            return;
        }

        const editId = workModal.dataset.editId;

        if (editId) {
            // Редактирование
            if (!isWorkProgressValidAtEdit(editId, progress)) return;
            const index = workData.findIndex(item => item.id === editId);
            if (index !== -1) {
                workData[index] = { ...workData[index], description, progress };
            }
            delete workModal.dataset.editId;
        } else {
            // Добавление новой записи (всегда в конец с текущей датой)
            const maxExisting = workData.length > 0 ? Math.max(...workData.map(w => w.progress)) : -1;
            if (progress < maxExisting) {
                alert(`Прогресс не может быть меньше последнего достигнутого (${maxExisting}%)`);
                return;
            }
            const now = new Date();
            const dateTime = now.toISOString().slice(0,10) + ' ' + now.toTimeString().slice(0,5);
            const newId = 'w' + nextWorkId++;
            workData.push({ id: newId, description, progress, dateTime });
        }

        renderWork();
        closeModal('workModal');
        document.getElementById('workDescription').value = '';
        document.getElementById('workProgress').value = '';
    });

    document.getElementById('addWorkBtn').addEventListener('click', () => {
        document.getElementById('workModalTitle').innerText = 'Добавить запись';
        delete workModal.dataset.editId;
        openModal('workModal');
    });

    // ------------------- Функции открытия/закрытия модалок -------------------
    function openModal(id) {
        document.getElementById(id).classList.add('active');
    }
    function closeModal(id) {
        document.getElementById(id).classList.remove('active');
    }

    // ------------------- График (инвестиции в %, прогресс работы) с исправленной сортировкой и тултипами -------------------
    let progressChart = null;
    function updateProgressChart() {
        const ctx = document.getElementById('progressChart').getContext('2d');
        if (progressChart) progressChart.destroy();

        const projectStartDate = new Date('2024-01-01');

        // Инвестиции: точки с датой и суммой (прирост)
        let investPoints = investmentData
            .filter(d => d.factDate && d.fact && d.fact > 0)
            .map(d => ({ date: new Date(d.factDate), amount: d.fact }))
            .sort((a, b) => a.date - b.date);

        // Добавляем начальную точку (дата начала проекта, сумма 0)
        investPoints.unshift({ date: projectStartDate, amount: 0 });

        // Массивы для графика
        const investLabels = investPoints.map(p => p.date.toLocaleDateString('ru-RU'));
        const investAmounts = investPoints.map(p => p.amount); // приросты
        let cumulative = 0;
        const investPercentages = investPoints.map((p, idx) => {
            if (idx > 0) cumulative += p.amount;
            return (cumulative / BUDGET) * 100;
        });

        // Прогресс работы
        let workPoints = workData
            .map(d => ({ date: new Date(d.dateTime.split(' ')[0]), progress: d.progress }))
            .sort((a, b) => a.date - b.date);
        workPoints.unshift({ date: projectStartDate, progress: 0 });

        const workLabels = workPoints.map(p => p.date.toLocaleDateString('ru-RU'));
        const workPercentages = workPoints.map(p => p.progress);

        // Собираем все уникальные даты и сортируем их хронологически
        const allPoints = [
            ...investPoints.map(p => ({ date: p.date, label: p.date.toLocaleDateString('ru-RU') })),
            ...workPoints.map(p => ({ date: p.date, label: p.date.toLocaleDateString('ru-RU') }))
        ];
        const uniqueDates = new Map();
        allPoints.forEach(p => uniqueDates.set(p.date.getTime(), p.label));
        const sortedLabels = Array.from(uniqueDates.entries())
            .sort((a, b) => a[0] - b[0])
            .map(entry => entry[1]);

        progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedLabels,
                datasets: [
                    {
                        label: 'Инвестиции (% от бюджета)',
                        data: sortedLabels.map(label => {
                            const idx = investLabels.indexOf(label);
                            return idx !== -1 ? investPercentages[idx] : null;
                        }),
                        amounts: sortedLabels.map(label => {
                            const idx = investLabels.indexOf(label);
                            return idx !== -1 ? investAmounts[idx] : null;
                        }),
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        tension: 0.1,
                        pointStyle: 'circle',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        spanGaps: true
                    },
                    {
                        label: 'Прогресс работы (%)',
                        data: sortedLabels.map(label => {
                            const idx = workLabels.indexOf(label);
                            return idx !== -1 ? workPercentages[idx] : null;
                        }),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        tension: 0.1,
                        pointStyle: 'circle',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        spanGaps: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Процент выполнения' }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.dataset.amounts) {
                                    // Датасет инвестиций
                                    const amount = context.dataset.amounts[context.dataIndex];
                                    label += amount + ' BYN';
                                } else {
                                    // Датасет прогресса
                                    label += context.raw + '%';
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    // Инициализация всех таблиц
    renderInvestments();
    renderCosts();
    renderWork();
});