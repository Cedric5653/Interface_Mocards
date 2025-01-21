<!-- components/Dashboard/DashboardCalendar.vue -->
<template>
    <div class="dashboard-calendar">
        <div class="calendar-header">
            <div class="calendar-nav">
                <button class="btn-nav" @click="previousMonth">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h5 class="current-month">{{ currentMonthLabel }}</h5>
                <button class="btn-nav" @click="nextMonth">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="view-options">
                <button 
                    v-for="view in views" 
                    :key="view.value"
                    class="btn-view"
                    :class="{ active: currentView === view.value }"
                    @click="currentView = view.value"
                >
                    <i :class="view.icon"></i>
                    {{ view.label }}
                </button>
            </div>
        </div>

        <!-- Vue Mois -->
        <div v-if="currentView === 'month'" class="calendar-grid">
            <!-- Jours de la semaine -->
            <div class="calendar-weekdays">
                <div 
                    v-for="day in weekDays" 
                    :key="day"
                    class="weekday"
                >
                    {{ day }}
                </div>
            </div>
            
            <!-- Grille des jours -->
            <div class="calendar-days">
                <div 
                    v-for="(date, index) in calendarDays"
                    :key="index"
                    class="calendar-cell"
                    :class="getCellClasses(date)"
                    @click="selectDate(date)"
                >
                    <div class="date-number">{{ date.dayNumber }}</div>
                    <!-- Indicateurs d'événements -->
                    <div class="event-indicators" v-if="getDateEvents(date).length">
                        <div 
                            v-for="event in getDateEvents(date)"
                            :key="event.id"
                            class="event-dot"
                            :class="getEventTypeClass(event.type)"
                            :title="event.title"
                        ></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Vue Semaine -->
        <div v-else-if="currentView === 'week'" class="week-view">
            <div class="time-grid">
                <div class="time-slots">
                    <div 
                        v-for="hour in timeSlots" 
                        :key="hour"
                        class="time-slot"
                    >
                        {{ formatHour(hour) }}
                    </div>
                </div>
                <div class="week-days">
                    <div 
                        v-for="day in currentWeekDays" 
                        :key="day.date"
                        class="week-day"
                        :class="{ today: isToday(day.date) }"
                    >
                        <div class="week-day-header">
                            {{ formatWeekDay(day.date) }}
                        </div>
                        <div class="week-day-events">
                            <div 
                                v-for="event in getDayEvents(day.date)"
                                :key="event.id"
                                class="week-event"
                                :class="getEventTypeClass(event.type)"
                                :style="getEventStyle(event)"
                                @click="handleEventClick(event)"
                            >
                                {{ event.title }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Vue Jour -->
        <div v-else class="day-view">
            <div class="day-timeline">
                <div 
                    v-for="hour in timeSlots" 
                    :key="hour"
                    class="timeline-hour"
                >
                    <div class="hour-label">{{ formatHour(hour) }}</div>
                    <div class="hour-events">
                        <div 
                            v-for="event in getHourEvents(hour)"
                            :key="event.id"
                            class="day-event"
                            :class="getEventTypeClass(event.type)"
                            @click="handleEventClick(event)"
                        >
                            <div class="event-time">
                                {{ formatEventTime(event) }}
                            </div>
                            <div class="event-title">{{ event.title }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
    startOfMonth, 
    endOfMonth, 
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isToday as isTodayFn,
    isSameMonth,
    addMonths,
    subMonths
} from 'date-fns';
import { fr } from 'date-fns/locale';

// Props & Emits
const props = defineProps({
    appointments: {
        type: Array,
        default: () => []
    },
    initialDate: {
        type: Date,
        default: () => new Date()
    }
});

const emit = defineEmits(['date-selected', 'event-click']);

// États
const currentDate = ref(props.initialDate);
const currentView = ref('month');

// Constantes
const views = [
    { value: 'month', label: 'Mois', icon: 'fas fa-calendar-alt' },
    { value: 'week', label: 'Semaine', icon: 'fas fa-calendar-week' },
    { value: 'day', label: 'Jour', icon: 'fas fa-calendar-day' }
];

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const timeSlots = Array.from({ length: 24 }, (_, i) => i);


// Computed Properties
const currentMonthLabel = computed(() => {
    return format(currentDate.value, 'MMMM yyyy', { locale: fr });
});

const calendarDays = computed(() => {
    const start = startOfWeek(startOfMonth(currentDate.value), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate.value), { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start, end }).map(date => ({
        date,
        dayNumber: format(date, 'd'),
        isCurrentMonth: isSameMonth(date, currentDate.value),
        isToday: isTodayFn(date)
    }));
});

const currentWeekDays = computed(() => {
    const start = startOfWeek(currentDate.value, { weekStartsOn: 1 });
    return eachDayOfInterval({
        start,
        end: endOfWeek(currentDate.value, { weekStartsOn: 1 })
    });
});

// Méthodes
const previousMonth = () => {
    currentDate.value = subMonths(currentDate.value, 1);
};

const nextMonth = () => {
    currentDate.value = addMonths(currentDate.value, 1);
};

const getDateEvents = (dateInfo) => {
    return props.appointments.filter(event => {
        const eventDate = new Date(event.date);
        return isSameDay(eventDate, dateInfo.date);
    });
};

const getDayEvents = (date) => {
    return props.appointments.filter(event => 
        isSameDay(new Date(event.date), date)
    );
};

const getHourEvents = (hour) => {
    return props.appointments.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getHours() === hour;
    });
};

const getEventTypeClass = (type) => {
    const classes = {
        'consultation': 'event-consultation',
        'urgence': 'event-urgent',
        'routine': 'event-routine',
        'suivi': 'event-followup'
    };
    return classes[type] || 'event-default';
};

const getEventStyle = (event) => {
    const startHour = new Date(event.date).getHours();
    const duration = event.duration || 1; // durée en heures
    
    return {
        top: `${startHour * 60}px`,
        height: `${duration * 60}px`
    };
};

const getCellClasses = (date) => ({
    'other-month': !date.isCurrentMonth,
    'today': date.isToday,
    'has-events': getDateEvents(date).length > 0
});

const formatHour = (hour) => {
    return `${String(hour).padStart(2, '0')}:00`;
};

const formatWeekDay = (date) => {
    return format(date, 'EEE d', { locale: fr });
};

const formatEventTime = (event) => {
    return format(new Date(event.date), 'HH:mm');
};

const handleEventClick = (event) => {
    emit('event-click', event);
};

const selectDate = (dateInfo) => {
    emit('date-selected', dateInfo.date);
};
</script>

<style scoped>
.dashboard-calendar {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.calendar-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-nav {
    border: none;
    background: none;
    padding: 0.5rem;
    font-size: 1.2rem;
    cursor: pointer;
    color: #6c757d;
    transition: color 0.2s;
}

.btn-nav:hover {
    color: #0d6efd;
}

.calendar-grid {
    display: grid;
    gap: 1px;
    background: #e9ecef;
    border-radius: 0.5rem;
    overflow: hidden;
}

.calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: #f8f9fa;
}

.weekday {
    padding: 0.75rem;
    text-align: center;
    font-weight: 600;
    color: #495057;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: white;
}

.calendar-cell {
    aspect-ratio: 1;
    padding: 0.5rem;
    background: white;
    border: 1px solid #f8f9fa;
    cursor: pointer;
    transition: all 0.2s;
}

.calendar-cell:hover {
    background: #f8f9fa;
}

.date-number {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.event-indicators {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
}

.event-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 2px;
}

/* Classes d'événements */
.event-consultation { background: #0d6efd; }
.event-urgent { background: #dc3545; }
.event-routine { background: #198754; }
.event-followup { background: #ffc107; }

/* Vue semaine/jour */
.time-grid {
    display: grid;
    grid-template-columns: 60px 1fr;
    gap: 1px;
    height: 600px;
    overflow-y: auto;
}

.week-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
}

.week-day {
    position: relative;
    min-height: 1440px; /* 24h * 60px */
}

.time-slots {
    display: grid;
    grid-template-rows: repeat(24, 60px);
}

/* États et modificateurs */
.today {
    background: #e8f4fe !important;
}

.other-month .date-number {
    opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
    .view-options {
        display: none;
    }
    
    .calendar-cell {
        padding: 0.25rem;
    }
    
    .date-number {
        font-size: 0.8rem;
    }
}
</style>