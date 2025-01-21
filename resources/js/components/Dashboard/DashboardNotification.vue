<!-- components/Dashboard/DashboardNotification.vue -->
<template>
    <div 
        class="notification-card"
        :class="[notification.type, { 'unread': !notification.read }]"
    >
        <div class="notification-icon">
            <i :class="getNotificationIcon()"></i>
        </div>
        
        <div class="notification-content">
            <div class="notification-header">
                <h6 class="notification-title">{{ notification.title }}</h6>
                <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
            </div>
            
            <p class="notification-message">{{ notification.message }}</p>
            
            <!-- Actions conditionnelles -->
            <div class="notification-actions" v-if="notification.actions">
                <button 
                    v-for="action in notification.actions"
                    :key="action.id"
                    class="btn-action"
                    :class="action.type"
                    @click="handleAction(action)"
                >
                    <i :class="action.icon"></i>
                    {{ action.label }}
                </button>
            </div>

            <!-- Lien associé -->
            <a 
                v-if="notification.link"
                :href="notification.link"
                class="notification-link"
            >
                En savoir plus
                <i class="fas fa-chevron-right"></i>
            </a>
        </div>

        <!-- Menu d'options -->
        <div class="notification-menu">
            <button class="btn-menu" @click="toggleMenu">
                <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="menu-options" v-if="showMenu">
                <button @click="markAsRead">
                    <i class="fas fa-check"></i>
                    Marquer comme lu
                </button>
                <button @click="dismissNotification">
                    <i class="fas fa-times"></i>
                    Ignorer
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const props = defineProps({
    notification: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['action', 'read', 'dismiss']);

const showMenu = ref(false);

const getNotificationIcon = () => {
    const icons = {
        'urgent': 'fas fa-exclamation-circle',
        'info': 'fas fa-info-circle',
        'success': 'fas fa-check-circle',
        'warning': 'fas fa-exclamation-triangle',
        'appointment': 'fas fa-calendar-check',
        'patient': 'fas fa-user-injured',
        'prescription': 'fas fa-prescription'
    };
    return icons[props.notification.type] || 'fas fa-bell';
};

const formatTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true,
        locale: fr 
    });
};

const handleAction = (action) => {
    emit('action', { 
        notificationId: props.notification.id, 
        actionId: action.id 
    });
};

const markAsRead = () => {
    emit('read', props.notification.id);
    showMenu.value = false;
};

const dismissNotification = () => {
    emit('dismiss', props.notification.id);
    showMenu.value = false;
};

const toggleMenu = () => {
    showMenu.value = !showMenu.value;
};
</script>

<style scoped>
.notification-card {
    display: flex;
    align-items: flex-start;
    padding: 1rem;
    background: white;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
    position: relative;
}

.notification-card:hover {
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-card.unread {
    background: #f8f9fa;
    border-left: 4px solid #0d6efd;
}

.notification-icon {
    font-size: 1.2rem;
    padding: 0.5rem;
    border-radius: 50%;
    margin-right: 1rem;
}

.notification-content {
    flex: 1;
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.notification-title {
    margin: 0;
    font-weight: 600;
}

.notification-time {
    font-size: 0.8rem;
    color: #6c757d;
}

.notification-message {
    margin: 0;
    color: #495057;
}

.notification-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.btn-action {
    padding: 0.25rem 0.75rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.notification-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    color: #0d6efd;
    text-decoration: none;
    font-size: 0.875rem;
}

.notification-menu {
    position: relative;
}

.btn-menu {
    background: none;
    border: none;
    padding: 0.5rem;
    color: #6c757d;
    cursor: pointer;
}

.menu-options {
    position: absolute;
    right: 0;
    top: 100%;
    background: white;
    border-radius: 0.25rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
}

.menu-options button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    white-space: nowrap;
}

.menu-options button:hover {
    background: #f8f9fa;
}

/* Types de notifications */
.urgent .notification-icon { color: #dc3545; }
.info .notification-icon { color: #0dcaf0; }
.success .notification-icon { color: #198754; }
.warning .notification-icon { color: #ffc107; }
.appointment .notification-icon { color: #6f42c1; }

/* Animation d'entrée */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-10px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.notification-card {
    animation: slideIn 0.3s ease-out;
}
</style>