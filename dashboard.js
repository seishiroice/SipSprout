// ========== DASHBOARD: HYDRATION TRACKER ==========
(() => {
    const plant = document.getElementById('plant');
    if (!plant) return;

    const DAILY_GOAL_ML = 2000;
    const waterKey = (date) => `sipsprout-water-${date.toISOString().slice(0, 10)}`;
    const historyKey = (date) => `sipsprout-history-${date.toISOString().slice(0, 10)}`;
    const todayKey = () => waterKey(new Date());
    const todayHistoryKey = () => historyKey(new Date());

    const pot = document.getElementById('pot');
    const appShell = document.getElementById('appShell');
    const glow = document.getElementById('plantGlow');
    const caption = document.getElementById('plantCaption');
    const amountEl = document.getElementById('currentAmount');
    const fillEl = document.getElementById('progressFill');
    const hintEl = document.getElementById('progressHint');

    // История: [{ id, drink, emoji, ml, time }]
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(todayHistoryKey())) || [];
    } catch { history = []; }

    let totalMl = history.reduce((sum, h) => sum + h.ml, 0);
    // Синхронизируем total с историей
    localStorage.setItem(todayKey(), String(totalMl));

    // ---------- Растение / прогресс ----------
    function stageFor(ratio) {
        if (ratio >= 1) return 4;
        if (ratio >= 0.66) return 3;
        if (ratio >= 0.33) return 2;
        if (ratio > 0) return 1;
        return 0;
    }

    function hintFor(ratio) {
        if (ratio <= 0) return '0% дневной нормы — сделайте первый глоток!';
        if (ratio < 0.33) return `${Math.round(ratio * 100)}% дневной нормы — хорошее начало`;
        if (ratio < 0.66) return `${Math.round(ratio * 100)}% дневной нормы — продолжайте в том же духе`;
        if (ratio < 1) return `${Math.round(ratio * 100)}% дневной нормы — почти у цели!`;
        return 'Дневная норма выполнена! 🎉';
    }

    function captionFor(stage) {
        switch (stage) {
            case 0: return 'Сделайте первый глоток, чтобы разбудить росток 🌱';
            case 1: return 'Росток проснулся и тянется к свету';
            case 2: return 'Листья наливаются силой';
            case 3: return 'Ваш сад почти расцвёл — ещё немного!';
            default: return 'Растение полностью расцвело сегодня 🌸';
        }
    }

    function renderPlant() {
        const ratio = Math.min(totalMl / DAILY_GOAL_ML, 1);
        const stage = stageFor(ratio);
        const displayLiters = (totalMl / 1000).toFixed(totalMl % 1000 === 0 ? 0 : 1);

        amountEl.textContent = displayLiters;
        fillEl.style.width = `${ratio * 100}%`;
        fillEl.classList.toggle('is-complete', ratio >= 1);
        hintEl.textContent = hintFor(ratio);
        caption.textContent = captionFor(stage);

        const plantTheme = plant.dataset.theme ? ` theme-${plant.dataset.theme}` : '';
        plant.className = 'plant' + (stage > 0 ? ` stage-${stage}` : '') + plantTheme;
        plant.style.setProperty('--p-scale', (0.65 + ratio * 0.55).toFixed(2));
        plant.style.setProperty('--p-sat', (0.6 + ratio * 0.6).toFixed(2));
        if (glow) glow.style.setProperty('--p-glow', (0.15 + ratio * 0.35).toFixed(2));
    }

    function saveHistory() {
        localStorage.setItem(todayHistoryKey(), JSON.stringify(history));
        totalMl = history.reduce((sum, h) => sum + h.ml, 0);
        localStorage.setItem(todayKey(), String(totalMl));
        renderPlant();
        renderHistory();
        renderCalendar();
    }

    function addDrink(ml, drinkName = 'Напиток', emoji = '💧') {
        if (!ml || ml <= 0) return;
        history.unshift({
            id: Date.now() + Math.random().toString(36).slice(2, 7),
            drink: drinkName,
            emoji,
            ml,
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        });
        saveHistory();
    }

    function deleteDrink(id) {
        history = history.filter(h => h.id !== id);
        saveHistory();
    }

    // ---------- История ----------
    const historyOverlay = document.getElementById('historyOverlay');
    const historySheet = document.getElementById('historySheet');
    const historyList = document.getElementById('historyList');
    const historyEmpty = document.getElementById('historyEmpty');
    const progressCard = document.getElementById('progressCard');
    const closeHistoryBtn = document.getElementById('closeHistory');

    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyEmpty.classList.add('show');
            return;
        }
        historyEmpty.classList.remove('show');

        history.forEach(item => {
            const row = document.createElement('div');
            row.className = 'history-item';
            row.innerHTML = `
                <span class="history-emoji">${item.emoji}</span>
                <div class="history-info">
                    <div class="history-name">${item.drink}</div>
                    <div class="history-meta">${item.ml} мл · ${item.time}</div>
                </div>
                <button class="history-delete" data-id="${item.id}" aria-label="Удалить">🗑️</button>
            `;
            historyList.appendChild(row);
        });

        historyList.querySelectorAll('.history-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteDrink(btn.dataset.id);
            });
        });
    }

    function openHistory() {
        renderHistory();
        historyOverlay.classList.add('show');
        historySheet.classList.add('show');
    }
    function closeHistory() {
        historyOverlay.classList.remove('show');
        historySheet.classList.remove('show');
    }

    if (progressCard) {
        progressCard.addEventListener('click', openHistory);
        progressCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openHistory();
            }
        });
    }
    if (closeHistoryBtn) closeHistoryBtn.addEventListener('click', closeHistory);
    if (historyOverlay) historyOverlay.addEventListener('click', closeHistory);

    // ---------- Гардероб ----------
    const THEME_KEY = 'sipsprout-theme';

    function loadTheme() {
        try { return JSON.parse(localStorage.getItem(THEME_KEY)) || {}; }
        catch { return {}; }
    }
    function saveTheme(theme) {
        localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    }
    function applyTheme(theme) {
        plant.dataset.theme = theme.plant || 'mint';
        if (pot) pot.className = 'pot' + (theme.pot && theme.pot !== 'terracotta' ? ` theme-${theme.pot}` : '');
        if (appShell) appShell.className = 'app-shell' + (theme.bg && theme.bg !== 'sky' ? ` theme-${theme.bg}` : '');
        renderPlant();
    }

    const currentTheme = loadTheme();
    applyTheme(currentTheme);

    const wardrobePopover = document.getElementById('wardrobePopover');
    const openWardrobeBtn = document.getElementById('openWardrobe');
    const closeWardrobeBtn = document.getElementById('closeWardrobe');

    if (wardrobePopover) {
        wardrobePopover.querySelectorAll('.wardrobe-panel').forEach(panel => {
            const key = panel.dataset.panel;
            const savedValue = currentTheme[key] || panel.querySelector('.swatch')?.dataset.theme;
            panel.querySelectorAll('.swatch').forEach(sw => {
                sw.classList.toggle('active', sw.dataset.theme === savedValue);
            });
        });

        wardrobePopover.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                wardrobePopover.querySelectorAll('.tab-btn').forEach(t => t.classList.toggle('active', t === tab));
                wardrobePopover.querySelectorAll('.wardrobe-panel').forEach(p => {
                    p.hidden = p.dataset.panel !== tab.dataset.tab;
                });
            });
        });

        wardrobePopover.querySelectorAll('.swatch').forEach(sw => {
            sw.addEventListener('click', () => {
                const panel = sw.closest('.wardrobe-panel');
                const key = panel.dataset.panel;
                panel.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                sw.classList.add('active');
                const theme = loadTheme();
                theme[key] = sw.dataset.theme;
                saveTheme(theme);
                applyTheme(theme);
            });
        });
    }

    // ---------- Попапы календарь / гардероб ----------
    const calendarPopover = document.getElementById('calendarPopover');
    const openCalendarBtn = document.getElementById('openCalendar');

    function closePopovers() {
        if (calendarPopover) calendarPopover.hidden = true;
        if (wardrobePopover) wardrobePopover.hidden = true;
    }

    if (openCalendarBtn) {
        openCalendarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = calendarPopover.hidden;
            closePopovers();
            calendarPopover.hidden = !willOpen;
            if (!calendarPopover.hidden) renderCalendar();
        });
    }
    if (openWardrobeBtn) {
        openWardrobeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = wardrobePopover.hidden;
            closePopovers();
            wardrobePopover.hidden = !willOpen;
        });
    }
    if (closeWardrobeBtn) closeWardrobeBtn.addEventListener('click', closePopovers);

    document.addEventListener('click', (e) => {
        if (calendarPopover && !calendarPopover.hidden && !calendarPopover.contains(e.target) && e.target !== openCalendarBtn) {
            calendarPopover.hidden = true;
        }
        if (wardrobePopover && !wardrobePopover.hidden && !wardrobePopover.contains(e.target) && e.target !== openWardrobeBtn) {
            wardrobePopover.hidden = true;
        }
    });

    // ---------- Календарь ----------
    const calendarTitle = document.getElementById('calendarTitle');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    const today = new Date();
    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();

    function renderCalendar() {
        if (!calendarGrid) return;
        calendarTitle.textContent = `${MONTHS_RU[viewMonth]} ${viewYear}`;
        calendarGrid.innerHTML = '';
        const firstDay = new Date(viewYear, viewMonth, 1);
        const leadingBlanks = (firstDay.getDay() + 6) % 7;
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

        for (let i = 0; i < leadingBlanks; i++) {
            const blank = document.createElement('span');
            blank.className = 'calendar-day empty';
            calendarGrid.appendChild(blank);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(viewYear, viewMonth, day);
            const cell = document.createElement('span');
            cell.className = 'calendar-day';
            cell.textContent = String(day);
            const isFuture = cellDate > today && cellDate.toDateString() !== today.toDateString();
            const ml = Number(localStorage.getItem(waterKey(cellDate))) || 0;
            if (cellDate.toDateString() === today.toDateString()) cell.classList.add('today');
            if (isFuture) cell.classList.add('future');
            else if (ml >= DAILY_GOAL_ML) cell.classList.add('goal-met');
            else if (ml > 0) cell.classList.add('partial');
            calendarGrid.appendChild(cell);
        }
    }

    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => {
        viewMonth -= 1;
        if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
        renderCalendar();
    });
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => {
        viewMonth += 1;
        if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
        renderCalendar();
    });

    // ---------- Шторка напитков ----------
    const sheetOverlay = document.getElementById('sheetOverlay');
    const drinkSheet = document.getElementById('drinkSheet');
    const openSheetBtn = document.getElementById('openDrinkSheet');
    const closeSheetBtn = document.getElementById('closeSheet');
    const volumeStep = document.getElementById('volumeStep');
    const drinkGrid = document.querySelector('.drink-grid');
    const selectedDrinkEmoji = document.getElementById('selectedDrinkEmoji');
    const volumeBackBtn = document.getElementById('volumeBack');
    const customMlInput = document.getElementById('customMl');
    const confirmCustomBtn = document.getElementById('confirmCustom');

    let pendingDrink = { name: 'Напиток', emoji: '💧' };

    function showDrinkGrid() {
        volumeStep.hidden = true;
        drinkGrid.hidden = false;
        if (customMlInput) customMlInput.value = '';
    }
    function showVolumeStep(emoji, name) {
        drinkGrid.hidden = true;
        volumeStep.hidden = false;
        pendingDrink = { name, emoji };
        if (selectedDrinkEmoji) selectedDrinkEmoji.textContent = emoji;
    }
    function openSheet() {
        showDrinkGrid();
        sheetOverlay.classList.add('show');
        drinkSheet.classList.add('show');
    }
    function closeSheet() {
        sheetOverlay.classList.remove('show');
        drinkSheet.classList.remove('show');
    }

    if (openSheetBtn) openSheetBtn.addEventListener('click', openSheet);
    if (closeSheetBtn) closeSheetBtn.addEventListener('click', closeSheet);
    if (sheetOverlay) sheetOverlay.addEventListener('click', closeSheet);
    if (volumeBackBtn) volumeBackBtn.addEventListener('click', showDrinkGrid);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (drinkSheet.classList.contains('show')) closeSheet();
            if (historySheet.classList.contains('show')) closeHistory();
            closePopovers();
        }
    });

    document.querySelectorAll('.drink-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.querySelector('.drink-emoji').textContent;
            const name = btn.querySelector('span:last-child').textContent;
            showVolumeStep(emoji, name);
        });
    });

    document.querySelectorAll('.volume-chips button').forEach(btn => {
        btn.addEventListener('click', () => {
            addDrink(Number(btn.dataset.ml), pendingDrink.name, pendingDrink.emoji);
            closeSheet();
        });
    });

    if (confirmCustomBtn) {
        confirmCustomBtn.addEventListener('click', () => {
            const ml = Number(customMlInput.value);
            if (!ml || ml <= 0) {
                customMlInput.focus();
                return;
            }
            addDrink(ml, pendingDrink.name, pendingDrink.emoji);
            closeSheet();
        });
    }

    renderPlant();
    renderCalendar();
    renderHistory();
})();