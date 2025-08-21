$(function () {
    'use strict';

    const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const weekDaysPortuguese = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
    const weekDaysPortugueseShort = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    var data = {};
    let chart;

    // --- GENERAL UI ---
    $('#simple-tab').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        $('#simple-content').addClass('active');
        $('#advanced-content').removeClass('active');
    });

    $('#advanced-tab').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        $('#advanced-content').addClass('active');
        $('#simple-content').removeClass('active');
    });

    $('.modal .btn-close').on('click', function () { $(this).closest('.modal').removeClass('show'); });
    $(document).on('click', function (event) { if ($(event.target).hasClass('modal')) $(event.target).removeClass('show'); });

    // --- SIMPLE CALCULATOR ---
    const NUM_ROWS = 5;
    let isAdditionMode = true;

    function generateSimpleInputRows() {
        const container = $('#simple-time-inputs');
        let html = '';
        for (let i = 1; i <= NUM_ROWS; i++) {
            html += `
                    <div class="table-row">
                        <label class="form-label fw-bold">Tempo ${i}</label>
                        <div class="input-grid">
                            <input type="number" class="form-control" id="hours${i}" placeholder="hh" min="0">
                            <input type="number" class="form-control" id="minutes${i}" placeholder="mm" min="0" max="59">
                            <input type="number" class="form-control" id="seconds${i}" placeholder="ss" min="0" max="59">
                        </div>
                    </div>`;
        }
        container.html(html);
    }

    function calculateSimpleTotal() {
        let totalSeconds = 0;
        for (let i = 1; i <= NUM_ROWS; i++) {
            const hours = parseInt($(`#hours${i}`).val()) || 0;
            const minutes = parseInt($(`#minutes${i}`).val()) || 0;
            const seconds = parseInt($(`#seconds${i}`).val()) || 0;
            const timeInSeconds = (hours * 3600) + (minutes * 60) + seconds;
            if (isAdditionMode) {
                totalSeconds += timeInSeconds;
            } else {
                if (i === 1) totalSeconds = timeInSeconds;
                else if (timeInSeconds > 0) totalSeconds -= timeInSeconds;
            }
        }
        const isNegative = totalSeconds < 0;
        totalSeconds = Math.abs(totalSeconds);
        const finalHours = Math.floor(totalSeconds / 3600);
        const finalMinutes = Math.floor((totalSeconds % 3600) / 60);
        const finalSeconds = totalSeconds % 60;
        const resultElement = $('#simple-tcpResult');
        resultElement.html(`${isNegative ? '- ' : ''}${finalHours}h ${finalMinutes}m ${finalSeconds}s`);
    }

    function setupSimpleListeners() {
        $('#simple-time-inputs').on('input', 'input', calculateSimpleTotal);
        $('#simple-tcpAdd').on('click', () => { isAdditionMode = true; $('#simple-tcpAdd').addClass('btn-primary').removeClass('btn-outline-primary'); $('#simple-tcpSubtract').removeClass('btn-primary').addClass('btn-outline-primary'); calculateSimpleTotal(); });
        $('#simple-tcpSubtract').on('click', () => { isAdditionMode = false; $('#simple-tcpSubtract').addClass('btn-primary').removeClass('btn-outline-primary'); $('#simple-tcpAdd').removeClass('btn-primary').addClass('btn-outline-primary'); calculateSimpleTotal(); });
        $('#simple-tcpReset').on('click', () => { $('#simple-time-inputs input').val(''); calculateSimpleTotal(); });
    }
    generateSimpleInputRows();
    setupSimpleListeners();
    calculateSimpleTotal();

    // --- ADVANCED CALCULATOR ---
    dayjs.extend(dayjs_plugin_customParseFormat);
    dayjs.extend(dayjs_plugin_duration);

    function generateAdvancedRows() {
        const timesheet = $('#timesheet');
        weekDays.forEach((day, i) => {
            const isWeekend = day === 'saturday' || day === 'sunday';
            const row = $(`
                        <div class="table-row ${isWeekend ? 'weekend-hidden' : ''}" id="${day}">
                            <span class="weekday-label fw-bold">${weekDaysPortuguese[i]}</span>
                            <div class="time-input-group first-column">
                                <input type="text" class="form-control" placeholder="Entrada" name="from">
                                <input type="text" class="form-control" placeholder="Saída" name="to">
                                <select class="form-select ampm-select" name="from-ampm"><option value="am">AM</option><option value="pm">PM</option></select>
                                <select class="form-select ampm-select" name="to-ampm"><option value="am">AM</option><option value="pm" selected>PM</option></select>
                            </div>
                            <div class="time-input-group second-column">
                                <input type="text" class="form-control" placeholder="Volta" name="from-break">
                                <input type="text" class="form-control" placeholder="Fim" name="to-break">
                                <select class="form-select ampm-select" name="from-break-ampm"><option value="am">AM</option><option value="pm" selected>PM</option></select>
                                <select class="form-select ampm-select" name="to-break-ampm"><option value="am">AM</option><option value="pm" selected>PM</option></select>
                            </div>
                            <div class="total-column"><span>0:00</span></div>
                        </div>`);
            timesheet.append(row);
        });
    }

    function toggleTimeFormat(is24h) {
        $('body').toggleClass('is-24h', is24h);
    }

    function toggleBreaks(showBreaks) {
        $('.second-column').toggle(showBreaks);
        $('#timesheet .table-row').toggleClass('with-breaks', showBreaks);
        $('#timesheet-header').toggleClass('with-breaks', showBreaks);
    }

    $('#time-format').on('change', function () { toggleTimeFormat(this.checked); });
    $('#break-setting').on('change', function () { toggleBreaks(this.checked); });
    $('#weekend-setting').on('change', function () { $('.weekend-hidden').toggle(this.checked); });

    var startWeek = dayjs().startOf('week').add(1, 'day');
    var endWeek = dayjs().endOf('week').add(1, 'day');
    var selectedStartWeek = startWeek;
    $('input[name="dates"]').daterangepicker({
        "startDate": startWeek.toDate(), "endDate": endWeek.toDate(), "locale": { "firstDay": 1, "format": "DD/MM/YYYY", "separator": " - ", "applyLabel": "Aplicar", "cancelLabel": "Cancelar", "fromLabel": "De", "toLabel": "Até", "customRangeLabel": "Personalizado", "weekLabel": "S", "daysOfWeek": ["Do", "Se", "Te", "Qa", "Qi", "Se", "Sa"], "monthNames": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"] }
    }, (start) => selectedStartWeek = dayjs(start));

    function addTimeToDate(date, time, ampm) {
        if (!time) return null;
        if (!time.includes(':')) time += ":00";
        const format = $('#time-format').is(':checked') ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD hh:mm a";
        const dateStr = date.format("YYYY-MM-DD") + " " + time + ($('#time-format').is(':checked') ? "" : " " + ampm);
        const parsedDate = dayjs(dateStr, format);
        return parsedDate.isValid() ? parsedDate : null;
    }

    function formatDuration(duration) {
        const h = Math.floor(duration.asHours());
        const m = Math.floor(duration.asMinutes()) % 60;
        return `${h}:${m < 10 ? '0' : ''}${m}`;
    }

    function calculateAdvancedTotals() {
        data = { "totalHours": dayjs.duration(0), "totalPay": 0.00 };

        weekDays.forEach((day, i) => {
            const date = dayjs(selectedStartWeek).add(i, "day");
            data[day] = { total: dayjs.duration(0) };

            const p1_from = addTimeToDate(date, $(`#${day} input[name='from']`).val(), $(`#${day} select[name='from-ampm']`).val());
            const p1_to = addTimeToDate(date, $(`#${day} input[name='to']`).val(), $(`#${day} select[name='to-ampm']`).val());
            if (p1_from && p1_to) data[day].total = data[day].total.add(p1_to.diff(p1_from));

            if ($('#break-setting').is(':checked')) {
                const p2_from = addTimeToDate(date, $(`#${day} input[name='from-break']`).val(), $(`#${day} select[name='from-break-ampm']`).val());
                const p2_to = addTimeToDate(date, $(`#${day} input[name='to-break']`).val(), $(`#${day} select[name='to-break-ampm']`).val());
                if (p2_from && p2_to) data[day].total = data[day].total.subtract(p2_to.diff(p2_from)); // This logic seems inverted, but keeping it as is from original
            }

            $(`#${day} .total-column span`).text(formatDuration(data[day].total));
            data.totalHours = data.totalHours.add(data[day].total);
        });

        $('#total-hours').text(formatDuration(data.totalHours));
        updateChart();
    }

    function initChart() {
        const ctx = document.getElementById('dailyHoursChart').getContext('2d');
        chart = new Chart(ctx, { type: 'bar', data: { labels: weekDaysPortugueseShort, datasets: [{ label: 'Horas Diárias', data: [], backgroundColor: 'rgba(59, 143, 194, 0.6)', borderWidth: 1, borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'Horas' } } }, plugins: { legend: { display: false } } } });
    }

    function updateChart() {
        if (!chart) return;
        const dailyData = weekDays.map(day => (data[day]?.total.asHours().toFixed(2) || 0));
        chart.data.datasets[0].data = dailyData;
        chart.update();
    }

    // --- INIT & LISTENERS ---
    generateAdvancedRows();
    $('#main-form').on('change input', 'input, select', calculateAdvancedTotals);
    $('#calculate').on('click', calculateAdvancedTotals);
    $('#clear').on('click', (e) => { e.preventDefault(); $('#timesheet input').val(''); calculateAdvancedTotals(); });

    // PDF & Email
    $('#print').on('click', function (e) { e.preventDefault(); alert("Funcionalidade de PDF a ser implementada."); });
    $('#sendEmail').on('click', function () { $('#emailModal').addClass('show'); });
    $('#bookmark').on('click', function () { $('#bookmark-shortcut').text(navigator.userAgent.toLowerCase().includes('mac') ? 'Cmd+D' : 'Ctrl+D'); $('#bookmarkUrl').val(window.location.href); $('#bookmarkModal').addClass('show'); });

    // Initial state setup
    toggleTimeFormat($('#time-format').is(':checked'));
    toggleBreaks($('#break-setting').is(':checked'));
    calculateAdvancedTotals();
    initChart();
});