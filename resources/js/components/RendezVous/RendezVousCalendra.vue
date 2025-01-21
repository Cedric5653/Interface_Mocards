<template>
    <div class="rendez-vous-calendar">
        <div class="card">
            <div class="card-header bg-primary text-white">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="calendar-navigation">
                        <button 
                            class="btn btn-light btn-sm"
                            @click="previousMonth"
                        >
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h5 class="mb-0 mx-3">
                            {{ formatMonthYear(currentMonth) }}
                        </h5>
                        <button 
                            class="btn btn-light btn-sm"
                            @click="nextMonth"
                        >
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <div class="calendar-actions">
                        <button 
                            class="btn btn-light btn-sm me-2"
                            @click="today"
                        >
                            Aujourd'hui
                        </button>
                        <div class="btn-group">
                            <button 
                                v-for="view in views"
                                :key="view.value"
                                class="btn btn-light btn-sm"
                                :class="{ active: currentView === view.value }"
                                @click="currentView = view.value"
                            >
                                {{ view.label }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card-body p-0">
                <!-- Vue Mois -->
                <div v-if="currentView === 'month'" class="calendar-month-view">
                    <!-- En-tête des jours -->
                    <div class="calendar-header">
                        <div 
                            v-for="day in weekDays" 
                            :key="day"
                            class="calendar-header-cell"
                        >
                            {{ day }}
                        </div>
                    </div>

                    <!-- Grille des jours -->
                    <div class="calendar-grid">
                        <div 
                            v-for="(day, index) in calendarDays"
                            :key="index"
                            class="calendar-day"
                            :class="{
                                'other-month': !day.isCurrentMonth,
                                'today': isToday(day.date),
                                'has-events': hasEvents(day.date)
                            }"
                            @click="selectDay(day)"
                        >
                            <div class="day-header">
                                {{ day.dayNumber }}
                                <span v-if="getEventCount(day.date)" class="event-count">
                                    {{ getEventCount(day.date) }}
                                </span>
                            </div>
                            <div class="day-events">
                                <div 
                                    v-for="event in getDayEvents(day.date)"
                                    :key="event.rdv_id"
                                    class="event-pill"
                                    :class="getEventClass(event)"
                                    @click.stop="viewEvent(event)"
                                >
                                    {{ formatTime(event.date_rdv) }}
                                    {{ truncateText(event.patient.nom, 12) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Vue Semaine -->
                <div v-else-if="currentView === 'week'" class="calendar-week-view">
                    <!-- Implémentation de la vue semaine -->
                </div>

                <!-- Vue Jour -->
                <div v-else class="calendar-day-view">
                    <!-- Implémentation de la vue jour -->
                </div>
            </div>
        </div>

        <!-- Modal pour voir les détails d'un événement -->
        <div class="modal fade" id="eventModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content" v-if="selectedEvent">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails du rendez-vous</h5>
                        <button 
                            type="button" 
                            class="btn-close" 
                            data-bs-dismiss="modal"
                        ></button>
                    </div>
                    <div class="modal-body">
                        <div class="event-details">
                            <div class="mb-3">
                                <strong>Date :</strong> 
                                {{ formatDate(selectedEvent.date_rdv) }}
                            </div>
                            <div class="mb-3">
                                <strong>Heure :</strong> 
                                {{ formatTime(selectedEvent.date_rdv) }}
                            </div>
                            <div class="mb-3">
                                <strong>Patient :</strong> 
                                {{ selectedEvent.patient.nom }} {{ selectedEvent.patient.prenom }}
                            </div>
                            <div class="mb-3">
                                <strong>Médecin :</strong> 
                                Dr. {{ selectedEvent.medecin.nom }}
                            </div>
                            <div class="mb-3">
                                <strong>Motif :</strong> 
                                {{ selectedEvent.motif }}
                            </div>
                            <div class="mb-3">
                                <strong>Statut :</strong>
                                <span :class="getStatusClass(selectedEvent.statut)">
                                    {{ selectedEvent.statut }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button 
                            type="button" 
                            class="btn btn-primary"
                            @click="editEvent(selectedEvent)"
                        >
                            Modifier
                        </button>
                        <button 
                            type="button" 
                            class="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Modal } from 'bootstrap';
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
    subMonths,
    isSameDay,
    parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';

const props = defineProps({
    rendezVous: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['day-selected', 'edit-event']);

// États
const currentMonth = ref(new Date());
const currentView = ref('month');
const selectedEvent = ref(null);
let eventModal = null;

// Vues disponibles
const views = [
    { value: 'month', label: 'Mois' },
    { value: 'week', label: 'Semaine' },
    { value: 'day', label: 'Jour' }
];

// Jours de la semaine
const weekDays = [
    'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'
];

// Computed
const calendarDays = computed(() => {
    const start = startOfWeek(startOfMonth(currentMonth.value), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth.value), { weekStartsOn: 1 });

    return eachDayOfInterval({ start, end }).map(date => ({
        date,
        dayNumber: format(date, 'd'),
        isCurrentMonth: isSameMonth(date, currentMonth.value)
    }));
});

// Méthodes de navigation
const previousMonth = () => {
    currentMonth.value = subMonths(currentMonth.value, 1);
};

const nextMonth = () => {
    currentMonth.value = addMonths(currentMonth.value, 1);
};

const today = () => {
    currentMonth.value = new Date();
};

// Méthodes d'événements
const hasEvents = (date) => {
    return props.rendezVous.some(rdv => 
        isSameDay(parseISO(rdv.date_rdv), date)
    );
};

const getEventCount = (date) => {
    return props.rendezVous.filter(rdv => 
        isSameDay(parseISO(rdv.date_rdv), date)
    ).length;
};

const getDayEvents = (date) => {
    return props.rendezVous
        .filter(rdv => isSameDay(parseISO(rdv.date_rdv), date))
        .sort((a, b) => new Date(a.date_rdv) - new Date(b.date_rdv));
};

const selectDay = (day) => {
    emit('day-selected', day.date);
};

const viewEvent = (event) => {
    selectedEvent.value = event;
    eventModal.show();
};

const editEvent = (event) => {
    eventModal.hide();
    emit('edit-event', event);
};

// Helpers
const formatMonthYear = (date) => {
    return format(date, 'MMMM yyyy', { locale: fr });
};

const formatDate = (date) => {
    return format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr });
};

const formatTime = (date) => {
    return format(new Date(date), 'HH:mm');
};

const isToday = (date) => {
    return isTodayFn(date);
};

const truncateText = (text, length) => {
    return text.length > length ? text.slice(0, length) + '...' : text;
};

const getEventClass = (event) => {
    const classes = {
        'programmé': 'bg-primary',
        'confirmé': 'bg-success',
        'annulé': 'bg-danger',
        'terminé': 'bg-secondary'
    };
    return classes[event.statut];
};

const getStatusClass = (status) => {
    return `badge ${getEventClass(status)}`;
};

// Lifecycle Hooks
onMounted(() => {
    eventModal = new Modal(document.getElementById('eventModal'));
});

onUnmounted(() => {
    if (eventModal) {
        eventModal.dispose();
    }
});
</script>

<style scoped>
.calendar-navigation {
    display: flex;
    align-items: center;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background-color: #dee2e6;
}

.calendar-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.calendar-header-cell {
    padding: 0.5rem;
    text-align: center;
    font-weight: 500;
}

.calendar-day {
    background-color: white;
    min-height: 100px;
    padding: 0.5rem;
    cursor: pointer;
}

.calendar-day:hover {
    background-color: #f8f9fa;
}

.day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.event-count {
    background-color: #0d6efd;
    color: white;
    border-radius: 50%;
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
}

.day-events {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.event-pill {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: white;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.other-month {
    background-color: #f8f9fa;
    color: #6c757d;
}

.today {
    background-color: #e8f4fe;
}

.today .day-header {
    color: #0d6efd;
    font-weight: bold;
}

@media (max-width: 768px) {
    .calendar-day {
        min-height: 80px;
    }

    .event-pill {
        font-size: 0.7rem;
    }

    .calendar-header-cell {
        font-size: 0.8rem;
    }
}
</style>