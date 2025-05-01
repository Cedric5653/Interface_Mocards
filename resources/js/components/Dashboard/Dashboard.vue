<!-- components/Dashboard/Dashboard.vue -->
<template>
    <div class="dashboard">
       
        <div class="welcome-header">
            <div class="header-content">
                <div class="user-welcome">
                    <div class="user-avatar" @click="goToProfile">
                        <img :src="userAvatar" :alt="user?.nom || user?.username" v-if="userAvatar">
                        <div class="avatar-placeholder" v-else>
                            {{ getUserInitials() }}
                        </div>
                    </div>
                    <div class="welcome-text">
                        <h4>
                            Bienvenue, 
                            <span>{{ getUserTitle() }} {{ user?.nom || user?.username }}</span>
                        </h4>
                        <p>{{ getCurrentDateTime() }}</p>
                    </div>
                </div>
                <div class="quick-actions">
                    <button 
                        v-if="authorizedActions.canAddPatient"
                        class="action-btn primary" 
                        @click="showNewPatient"
                    >
                        <i class="fas fa-user-plus"></i>
                        Nouveau Patient
                    </button>
                    <button 
                        v-if="authorizedActions.canAddAppointment"
                        class="action-btn secondary" 
                        @click="showNewAppointment"
                    >
                        <i class="fas fa-calendar-plus"></i>
                        Nouveau RDV
                    </button>
                    <button class="action-btn refresh" @click="refreshDashboard">
                        <i class="fas fa-sync-alt"></i>
                        Actualiser
                    </button>
                </div>
            </div>

            <div class="stats-grid">
                <div 
                    v-for="(stat, key) in filteredStats" 
                    :key="key"
                    class="stat-card" 
                    :class="stat.type"
                    @click="handleStatClick(key)"
                >
                    <div class="stat-icon">
                        <i :class="stat.icon"></i>
                    </div>
                    <div class="stat-info">
                        <h3 class="counter">{{ stat.value }}</h3>
                        <p>{{ stat.label }}</p>
                    </div>
                    <div 
                        v-if="stat.change !== undefined"
                        class="stat-change" 
                        :class="getChangeClass(stat.change)"
                    >
                        <i class="fas" :class="getChangeIcon(stat.change)"></i>
                        {{ stat.change }}%
                    </div>
                    <div 
                        v-if="stat.detail"
                        class="stat-details"
                    >
                        <small>{{ stat.detail }}</small>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Section principale du dashboard -->
        <div class="dashboard-main">
            <div class="dashboard-grid">
                <!-- Calendrier interactif -->
                <div class="dashboard-item calendar-section">
                    <DashboardCalendar 
                        :appointments="upcomingAppointments"
                        @day-selected="handleDaySelected"
                        @appointment-click="handleAppointmentClick"
                    />
                </div>

                <!-- Activités récentes avec timeline -->
                <div class="dashboard-item recent-activities">
                    <h5>Activités Récentes</h5>
                    <div class="activity-timeline">
                        <div 
                            v-for="activity in recentActivities" 
                            :key="activity.id"
                            class="activity-item"
                            :class="activity.type"
                        >
                            <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
                            <div class="activity-content">
                                <div class="activity-icon">
                                    <i :class="getActivityIcon(activity.type)"></i>
                                </div>
                                <div class="activity-details">
                                    <strong>{{ activity.title }}</strong>
                                    <p>{{ activity.description }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Notifications et Alertes -->
                <div class="dashboard-item notifications-panel">
                    <div class="notifications-header">
                        <h5>Notifications</h5>
                        <span class="notification-badge" v-if="unreadNotifications">
                            {{ unreadNotifications }}
                        </span>
                    </div>
                    <div class="notifications-list">
                        <DashboardNotification 
                            v-for="notif in notifications"
                            :key="notif.id"
                            :notification="notif"
                            @action-click="handleNotificationAction"
                        />
                    </div>
                </div>

                <!-- Tâches en cours -->
                <div class="dashboard-item tasks-panel">
                    <div class="tasks-header">
                        <h5>Tâches à faire</h5>
                        <button class="btn-add-task" @click="showNewTask">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="tasks-list">
                        <DashboardTask 
                            v-for="task in tasks"
                            :key="task.id"
                            :task="task"
                            @status-change="handleTaskStatusChange"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


// Script de Dashboard.vue
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useDashboard } from '@/composables/useDashboard';
import DashboardCalendar from './DashboardCalendar.vue';
import DashboardNotification from './DashboardNotification.vue';
import DashboardTask from './DashboardTask.vue';

const router = useRouter();
const { user,getUserProfile } = useAuth();
const {
    stats,
    recentActivities,
    upcomingAppointments,
    alerts,
    loading,
    // authorizedActions, // Ajout de authorizedActions
    fetchDashboardStats,
    fetchRecentActivities,
    fetchUpcomingAppointments,
    fetchAlerts
} = useDashboard();

// États réactifs
const refreshInterval = ref(null);
const unreadNotifications = ref(0);
const tasks = ref([{
    id: 1,
    title: 'Consultation de suivi',
    description: 'Suivi post-opératoire patient #123',
    status: 'pending',
    priority: 'high',
    dueDate: new Date()
}]);
const notifications = ref([]);

// Computed properties
const userAvatar = computed(() => user.value?.avatar || null);

const goToProfile = () => {
      router.push("/dashboard-userprofile");
      return { goToProfile };
    };


const filteredStats = computed(() => {
    // if (!stats.value) return {};
    // Ajoutez un fallback pour les données manquantes
    const baseStats = {
        patients: 0,
        consultations: 0,
        rendezVous: 0,
        consultationsToday: 0,
        weeklyAppointments: 0
    };
    return {
        // patients: {
        //     value: stats.value.patients || 0,
        //     label: 'Patients Total',
        //     icon: 'fas fa-users',
        //     type: 'patients',
        //     change: stats.value.patientsChange
        // },
        patients: {
            value: stats.value?.patients || baseStats.patients,
            label: 'Patients Total',
            icon: 'fas fa-users',
            type: 'patients',
            change: stats.value?.patientsChange || 0
        },
        consultations: {
            value: stats.value.consultations || baseStats.consultations,
            label: 'Consultations',
            icon: 'fas fa-stethoscope',
            type: 'consultations',
            detail: `Aujourd'hui: ${stats.value.consultationsToday || 0}`
        },
        appointments: {
            value: stats.value.rendezVous || baseStats.rendezVous,
            label: 'RDV à venir',
            icon: 'fas fa-calendar-check',
            type: 'appointments',
            detail: `Cette semaine: ${stats.value.weeklyAppointments || 0}`
        }
    };
});

// Méthodes


// Modifiez la fonction getUserTitle
const getUserTitle = () => {
    const roleName = user.value?.role?.role_name?.toLowerCase() || '';
    const titles = {
        'médecin': 'Dr.',
        'infirmier': 'Inf.',
        'admin': 'Admin.',
        'secouriste': 'Sec.'
    };
    return titles[roleName] || '';
};

// Mettez à jour les authorizedActions
const authorizedActions = computed(() => {
    const roleName = user.value?.role?.role_name?.toLowerCase() || '';
    
    return {
        canAddPatient: ['admin', 'médecin'].includes(roleName),
        canAddAppointment: ['admin', 'médecin', 'infirmier'].includes(roleName),
        canViewUrgent: true, // Tous les rôles
        canManageDocuments: ['admin', 'médecin'].includes(roleName)
    };
});



const getUserInitials = () => {
    if (!user.value?.nom) return '';
    return `${user.value.nom[0] || ''}${user.value.prenom?.[0] || ''}`.toUpperCase();
};

const getCurrentDateTime = () => {
    return new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Actions handlers
const showNewPatient = () => {
    router.push('/patients/new');
};

const showNewAppointment = () => {
    router.push('/appointments/new');
};

const showNewTask = () => {
    // Implémenter la logique pour nouvelle tâche
    console.log('Nouvelle tâche');
};

const handleTaskStatusChange = async (updatedTask) => {
    try {
        // Mettre à jour localement
        const taskIndex = tasks.value.findIndex(t => t.id === updatedTask.id);
        if (taskIndex !== -1) {
            tasks.value[taskIndex] = updatedTask;
        }

        // Appel API
        await api.patch(`/v1/tasks/${updatedTask.id}`, {
            status: updatedTask.status
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche:', error);
    }
};

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
};



// Navigation
const handleStatClick = (statKey) => {
    const routeMap = {
        patients: '/patients',
        consultations: '/consultations',
        appointments: '/appointments',
        urgents: '/urgent-cases'
    };
    
    if (routeMap[statKey]) {
        router.push(routeMap[statKey]);
    }
};

// Style utilities
const getChangeClass = (change) => {
    if (!change) return 'neutral';
    return change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
};

const getChangeIcon = (change) => {
    if (!change) return 'fa-minus';
    return change > 0 ? 'fa-arrow-up' : change < 0 ? 'fa-arrow-down' : 'fa-minus';
};

const getActivityIcon = (type) => {
    const icons = {
        'consultation': 'fas fa-stethoscope',
        'appointment': 'fas fa-calendar-check',
        'prescription': 'fas fa-prescription',
        'emergency': 'fas fa-ambulance'
    };
    return icons[type] || 'fas fa-circle';
};

// Dashboard refresh
const refreshDashboard = async () => {
    try {
        await Promise.all([
            fetchDashboardStats(),
            fetchRecentActivities(),
            fetchUpcomingAppointments(),
            fetchAlerts()
        ]);
    } catch (error) {
        console.error('Erreur lors du rafraîchissement du dashboard:', error);
    }
};

// Calendar handlers
const handleDaySelected = (date) => {
    console.log('Jour sélectionné:', date);
};

const handleAppointmentClick = (appointment) => {
    router.push(`/appointments/${appointment.id}`);
};

const handleNotificationAction = (notification) => {
    console.log('Action de notification:', notification);
};

// Lifecycle hooks
onMounted(() => {
    if (!user.value) {
        getUserProfile();
    }
    fetchDashboardStats();
    refreshDashboard();
    refreshInterval.value = setInterval(refreshDashboard, 300000);
});


onUnmounted(() => {
    if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
    }
});
</script>

<style scoped>
.dashboard {
    min-height: 100vh;
    background: #f8f9fa;
    padding: 1.5rem;
}

/* En-tête du Dashboard */
.welcome-header {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.user-welcome {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    background: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    color: #495057;
}

/* Cartes statistiques */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
}

.stat-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}


/* Assurez la cohérence des données manquantes */
.stat-card .counter:empty::after {
    content: "0";
    opacity: 0.5;
}

/* Améliorez l'affichage des rôles */
.badge.bg-info {
    text-transform: capitalize;
}


.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    opacity: 0.8;
}

.stat-info h3 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

/* Animation pour les compteurs */
.counter {
    animation: countUp 2s ease-out;
}

/* Grid principale du dashboard */
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
}

.dashboard-item {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* Timeline des activités */
.activity-timeline {
    position: relative;
    padding-left: 2rem;
}

.activity-item {
    position: relative;
    padding-bottom: 1.5rem;
    padding-left: 1.5rem;
    border-left: 2px solid #e9ecef;
}

.activity-item::before {
    content: '';
    position: absolute;
    left: -0.5rem;
    top: 0;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: #0d6efd;
    border: 2px solid white;
}

/* Animations */
@keyframes countUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive design */
@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 1rem;
    }

    .quick-actions {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }
}

/* Thèmes de couleur pour les différentes cartes */
.patients { border-left: 4px solid #0d6efd; }
.consultations { border-left: 4px solid #198754; }
.appointments { border-left: 4px solid #ffc107; }
.urgents { border-left: 4px solid #dc3545; }

/* États et transitions */
.dashboard-item {
    transition: all 0.3s ease;
}

.dashboard-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

/* Loading states */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

/* Notifications */
.notification-badge {
    background: #dc3545;
    color: white;
    border-radius: 50%;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
}


/* Les styles existants restent les mêmes, ajout des styles pour les boutons */
.action-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
    cursor: pointer;
}

.action-btn.primary {
    background-color: #0d6efd;
    color: white;
}

.action-btn.secondary {
    background-color: #6c757d;
    color: white;
}

.action-btn.refresh {
    background-color: #f8f9fa;
    color: #212529;
    border: 1px solid #dee2e6;
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Rest of the styles remain the same */
</style>
