<template>
    <div class="consultation-details">
        <div class="card">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-stethoscope me-2"></i>
                    Détails de la Consultation
                </h5>
                <div class="btn-group">
                    <button 
                        class="btn btn-light btn-sm"
                        @click="$emit('edit', consultation)"
                        v-if="canEdit"
                    >
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button 
                        class="btn btn-light btn-sm"
                        @click="$emit('close')"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <div class="card-body">
                <div class="row g-4">
                    <!-- Informations générales -->
                    <div class="col-md-6">
                        <div class="detail-section">
                            <h6 class="section-title">Informations générales</h6>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <span class="label">Date:</span>
                                    <span>{{ formatDate(consultation.date_consultation) }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Type:</span>
                                    <span class="badge" :class="getTypeClass(consultation.type_consultation)">
                                        {{ consultation.type_consultation }}
                                    </span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Médecin:</span>
                                    <span>Dr. {{ consultation.medecin.nom }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Centre:</span>
                                    <span>{{ consultation.centre_sante }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Motif et Symptômes -->
                    <div class="col-12">
                        <div class="detail-section">
                            <h6 class="section-title">Motif et Symptômes</h6>
                            <div class="detail-grid">
                                <div class="detail-item full-width">
                                    <span class="label">Motif de consultation:</span>
                                    <p class="mb-3">{{ consultation.motif || 'Non spécifié' }}</p>
                                </div>
                                <div class="detail-item full-width">
                                    <span class="label">Symptômes:</span>
                                    <p>{{ consultation.symptomes || 'Non spécifié' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Diagnostic et Prescriptions -->
                    <div class="col-12">
                        <div class="detail-section">
                            <h6 class="section-title">Diagnostic et Traitement</h6>
                            <div class="detail-grid">
                                <div class="detail-item full-width">
                                    <span class="label">Diagnostic:</span>
                                    <p class="mb-3">{{ consultation.diagnostic }}</p>
                                </div>
                                <div class="detail-item full-width">
                                    <span class="label">Prescriptions:</span>
                                    <p>{{ consultation.prescriptions || 'Aucune prescription' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Hospitalisation -->
                    <div class="col-12" v-if="consultation.hospitalisation">
                        <div class="detail-section">
                            <h6 class="section-title">Informations d'hospitalisation</h6>
                            <div class="alert alert-warning">
                                <i class="fas fa-hospital me-2"></i>
                                Patient hospitalisé pour une durée de 
                                {{ consultation.duree_hospitalisation }} jour(s)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

// Script de ConsultationDetails.vue
<script setup>
import { computed } from 'vue';
import { useConsultations } from '@/composables/useConsultations';
import { useAuth } from '@/composables/useAuth'; // Pour la gestion des permissions

const props = defineProps({
    consultation: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['edit', 'close']);

// Composables
const { user } = useAuth();

// Computed
const canEdit = computed(() => {
    // Vérification si l'utilisateur peut modifier la consultation
    // Par exemple: être le médecin qui a créé la consultation ou avoir les droits admin
    return user.value?.role_id === 1 || // Admin
           consultation.value?.medecin_id === user.value?.user_id; // Médecin créateur
});

// Helpers
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getTypeClass = (type) => {
    const classes = {
        'routine': 'bg-success',
        'urgence': 'bg-danger',
        'suivi': 'bg-info',
        'specialiste': 'bg-warning'
    };
    return classes[type] || 'bg-secondary';
};

// Méthodes pour exporter les données
const exportToPDF = async () => {
    try {
        // Implémentation de l'export PDF
        // Utiliser une bibliothèque comme jsPDF ou appeler une API backend
        console.log('Export PDF non implémenté');
    } catch (error) {
        console.error('Erreur lors de l\'export PDF:', error);
    }
};

const printConsultation = () => {
    window.print();
};
</script>

<style scoped>
.consultation-details {
    max-width: 900px;
    margin: 0 auto;
}

.detail-section {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
}

.section-title {
    color: #495057;
    border-bottom: 2px solid #dee2e6;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
}

.detail-grid {
    display: grid;
    gap: 1rem;
}

.detail-item {
    display: grid;
    gap: 0.5rem;
}

.detail-item.full-width {
    grid-column: 1 / -1;
}

.label {
    font-weight: 600;
    color: #6c757d;
}

.badge {
    display: inline-block;
    padding: 0.5em 1em;
    font-size: 0.875em;
    font-weight: 600;
    border-radius: 0.25rem;
}

/* Styles pour l'impression */
@media print {
    .btn-group {
        display: none;
    }

    .card {
        border: none;
        box-shadow: none;
    }

    .detail-section {
        break-inside: avoid;
        page-break-inside: avoid;
    }
}

/* Responsive design */
@media (max-width: 768px) {
    .detail-grid {
        grid-template-columns: 1fr;
    }

    .detail-section {
        padding: 1rem;
    }
}
</style>