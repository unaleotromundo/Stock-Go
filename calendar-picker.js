// Calendario interactivo para seleccionar días pintando con el mouse o el dedo
// Este script crea un calendario mensual donde el usuario puede seleccionar múltiples días arrastrando

class VanguardCalendar {
    constructor(containerId, onSelect) {
        this.container = document.getElementById(containerId);
        this.onSelect = onSelect;
        this.selectedDates = new Set();
        this.isMouseDown = false;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        const calendar = document.createElement('div');
        calendar.className = 'vanguard-calendar';
        // Header con mes y año
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = `
            <button class="cal-btn" id="prevMonth">◀️</button>
            <span class="cal-title">${this.getMonthName(this.currentMonth)} ${this.currentYear}</span>
            <button class="cal-btn" id="nextMonth">▶️</button>
        `;
        calendar.appendChild(header);
        // Días de la semana
        const daysRow = document.createElement('div');
        daysRow.className = 'calendar-days-row';
        ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].forEach(d => {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day-cell calendar-day-header';
            dayCell.textContent = d;
            daysRow.appendChild(dayCell);
        });
        calendar.appendChild(daysRow);
        // Celdas de días
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth+1, 0).getDate();
        // Espacios vacíos antes del primer día
        for(let i=0;i<firstDay;i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day-cell empty';
            grid.appendChild(emptyCell);
        }
        // Días del mes
        for(let d=1;d<=daysInMonth;d++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const cell = document.createElement('div');
            cell.className = 'calendar-day-cell';
            cell.textContent = d;
            cell.dataset.date = dateStr;
            cell.addEventListener('mousedown', e => this.startSelect(dateStr));
            cell.addEventListener('mouseover', e => this.hoverSelect(dateStr));
            cell.addEventListener('touchstart', e => this.startSelect(dateStr));
            cell.addEventListener('touchmove', e => this.hoverSelect(dateStr));
            if(this.selectedDates.has(dateStr)) {
                cell.classList.add('selected');
            }
            grid.appendChild(cell);
        }
        calendar.appendChild(grid);
        this.container.appendChild(calendar);
        // Eventos globales
        document.getElementById('prevMonth').onclick = () => { this.changeMonth(-1); };
        document.getElementById('nextMonth').onclick = () => { this.changeMonth(1); };
        document.addEventListener('mouseup', () => this.isMouseDown = false);
        document.addEventListener('touchend', () => this.isMouseDown = false);
    }

    getMonthName(m) {
        return ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][m];
    }

    startSelect(dateStr) {
        this.isMouseDown = true;
        this.toggleDate(dateStr);
    }
    hoverSelect(dateStr) {
        if(this.isMouseDown) {
            this.toggleDate(dateStr);
        }
    }
    toggleDate(dateStr) {
        if(this.selectedDates.has(dateStr)) {
            this.selectedDates.delete(dateStr);
        } else {
            this.selectedDates.add(dateStr);
        }
        this.render();
        if(this.onSelect) this.onSelect(Array.from(this.selectedDates).sort());
    }
    changeMonth(delta) {
        this.currentMonth += delta;
        if(this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        if(this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.render();
    }
}

// Para usar: new VanguardCalendar('idDelContenedor', callbackDiasSeleccionados)
