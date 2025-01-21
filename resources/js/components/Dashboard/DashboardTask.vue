<!-- components/Dashboard/DashboardTask.vue -->
<template>
    <div 
        class="task-card"
        :class="{
            'completed': task.status === 'completed',
            'high-priority': task.priority === 'high',
            'dragging': isDragging
        }"
        draggable="true"
        @dragstart="startDrag"
        @dragend="endDrag"
    >
        <div class="task-header">
            <div class="task-checkbox">
                <input 
                    type="checkbox"
                    :checked="task.status === 'completed'"
                    @change="toggleStatus"
                    :id="'task-' + task.id"
                >
                <label :for="'task-' + task.id" class="checkbox-label"></label>
            </div>

            <div class="task-title">
                <h6 :class="{ 'completed': task.status === 'completed' }">
                    {{ task.title }}
                </h6>
                <div class="task-meta">
                    <span class="task-date">
                        <i class="far fa-calendar"></i>
                        {{ formatDueDate(task.dueDate) }}
                    </span>
                    <span 
                        class="priority-badge"
                        :class="'priority-' + task.priority"
                    >
                        {{ getPriorityLabel(task.priority) }}
                    </span>
                </div>
            </div>

            <div class="task-actions">
                <button 
                    class="btn-icon"
                    @click="showDetails = !showDetails"
                    :title="showDetails ? 'Masquer les détails' : 'Voir les détails'"
                >
                    <i :class="showDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                </button>
                <button 
                    class="btn-icon"
                    @click="showTaskMenu = !showTaskMenu"
                    ref="menuButton"
                >
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>

            <!-- Menu contextuel -->
            <div 
                v-if="showTaskMenu" 
                class="task-menu"
                :style="menuPosition"
                v-click-outside="closeMenu"
            >
                <button @click="editTask">
                    <i class="fas fa-edit"></i>
                    Modifier
                </button>
                <button @click="setReminder">
                    <i class="fas fa-bell"></i>
                    Définir un rappel
                </button>
                <button 
                    class="delete"
                    @click="confirmDelete"
                >
                    <i class="fas fa-trash"></i>
                    Supprimer
                </button>
            </div>
        </div>

        <!-- Détails de la tâche -->
        <div 
            v-if="showDetails"
            class="task-details"
        >
            <p v-if="task.description">{{ task.description }}</p>
            
            <!-- Sous-tâches -->
            <div v-if="task.subtasks && task.subtasks.length" class="subtasks">
                <h6>Sous-tâches</h6>
                <ul class="subtask-list">
                    <li 
                        v-for="subtask in task.subtasks"
                        :key="subtask.id"
                        :class="{ 'completed': subtask.completed }"
                    >
                        <input 
                            type="checkbox"
                            :checked="subtask.completed"
                            @change="toggleSubtask(subtask)"
                        >
                        <span>{{ subtask.title }}</span>
                    </li>
                </ul>
            </div>

            <!-- Documents associés -->
            <div v-if="task.attachments && task.attachments.length" class="attachments">
                <h6>Documents associés</h6>
                <div class="attachment-list">
                    <div 
                        v-for="file in task.attachments"
                        :key="file.id"
                        class="attachment-item"
                    >
                        <i :class="getFileIcon(file.type)"></i>
                        <span>{{ file.name }}</span>
                        <button class="btn-download" @click="downloadFile(file)">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Personnes assignées -->
            <div v-if="task.assignees && task.assignees.length" class="assignees">
                <h6>Assigné à</h6>
                <div class="assignee-list">
                    <div 
                        v-for="assignee in task.assignees"
                        :key="assignee.id"
                        class="assignee-item"
                    >
                        <div class="assignee-avatar">
                            <img 
                                v-if="assignee.avatar"
                                :src="assignee.avatar"
                                :alt="assignee.name"
                            >
                            <div v-else class="avatar-placeholder">
                                {{ getInitials(assignee.name) }}
                            </div>
                        </div>
                        <span>{{ assignee.name }}</span>
                    </div>
                </div>
            </div>

            <!-- Barre de progression -->
            <div v-if="task.progress !== undefined" class="progress-section">
                <div class="progress-header">
                    <span>Progression</span>
                    <span>{{ task.progress }}%</span>
                </div>
                <div class="progress-bar">
                    <div 
                        class="progress-fill"
                        :style="{ width: task.progress + '%' }"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

const props = defineProps({
    task: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['status-change', 'update', 'delete', 'set-reminder']);

// États locaux
const showDetails = ref(false);
const showTaskMenu = ref(false);
const isDragging = ref(false);
const menuButton = ref(null);

// Position du menu contextuel
const menuPosition = computed(() => {
    if (!menuButton.value) return {};
    const rect = menuButton.value.getBoundingClientRect();
    return {
        top: rect.bottom + 'px',
        right: window.innerWidth - rect.right + 'px'
    };
});

// Méthodes
const toggleStatus = () => {
    const newStatus = props.task.status === 'completed' ? 'active' : 'completed';
    emit('status-change', {
        taskId: props.task.id,
        status: newStatus
    });
};

const toggleSubtask = (subtask) => {
    emit('update', {
        taskId: props.task.id,
        subtaskId: subtask.id,
        completed: !subtask.completed
    });
};

const editTask = () => {
    emit('update', {
        type: 'edit',
        taskId: props.task.id
    });
    showTaskMenu.value = false;
};

const setReminder = () => {
    emit('set-reminder', props.task.id);
    showTaskMenu.value = false;
};

const confirmDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        emit('delete', props.task.id);
    }
    showTaskMenu.value = false;
};

const startDrag = (event) => {
    isDragging.value = true;
    event.dataTransfer.setData('taskId', props.task.id);
};

const endDrag = () => {
    isDragging.value = false;
};

const closeMenu = () => {
    showTaskMenu.value = false;
};

const downloadFile = async (file) => {
    try {
        // Logique de téléchargement du fichier
        const response = await fetch(file.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
    }
};

// Helpers
const formatDueDate = (date) => {
    const dueDate = new Date(date);
    if (isToday(dueDate)) return 'Aujourd\'hui';
    if (isTomorrow(dueDate)) return 'Demain';
    if (isPast(dueDate)) return 'En retard - ' + format(dueDate, 'dd/MM/yyyy');
    return format(dueDate, 'dd MMMM yyyy', { locale: fr });
};

const getPriorityLabel = (priority) => {
    const labels = {
        'low': 'Basse',
        'medium': 'Moyenne',
        'high': 'Haute'
    };
    return labels[priority] || priority;
};

const getFileIcon = (type) => {
    const icons = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'image': 'fas fa-file-image',
        'default': 'fas fa-file'
    };
    return icons[type] || icons.default;
};

const getInitials = (name) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
};

// Directive pour détecter les clics en dehors du menu
const clickOutside = {
    mounted(el, { value }) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                value(event);
            }
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
    }
};
</script>

<style scoped>
.task-card {
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border: 1px solid #e9ecef;
}

.task-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.task-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    position: relative;
}

.task-checkbox {
    position: relative;
}

.checkbox-label {
    cursor: pointer;
    position: relative;
    display: block;
    width: 20px;
    height: 20px;
    border: 2px solid #dee2e6;
    border-radius: 4px;
    transition: all 0.2s;
}

.task-title {
    flex: 1;
}

.task-title h6 {
    margin: 0;
    font-weight: 500;
}

.task-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #6c757d;
}

.priority-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
}

.priority-high { background: #dc3545; color: white; }
.priority-medium { background: #ffc107; color: black; }
.priority-low { background: #198754; color: white; }

.task-details {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e9ecef;
}

/* Et d'autres styles... */
</style>

