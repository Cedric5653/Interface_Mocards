<template>
    <div class="carte-urgence">
        <div class="card">
            <div class="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-ambulance me-2"></i>
                    Carte d'Urgence
                </h5>
                <div class="btn-group">
                    <button 
                        class="btn btn-light btn-sm"
                        @click="$emit('edit')"
                        v-if="canEdit"
                    >
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button 
                        class="btn btn-light btn-sm"
                        @click="printCard"
                    >
                        <i class="fas fa-print"></i> Imprimer
                    </button>
                </div>
            </div>

            <div class="card-body">
                <!-- Loading state -->
                <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border text-danger" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                </div>

                <template v-else>
                    <div class="row g-4">
                        <!-- Informations d'urgence critique -->
                        <div class="col-12">
                            <div class="alert alert-danger">
                                <div class="d-flex align-items-center mb-2">
                                    <i class="fas fa-exclamation-triangle fa-2x me-2"></i>
                                    <h6 class="mb-0">Informations Critiques</h6>
                                </div>
                                <div class="mt-2">
                                    <strong>Groupe sanguin:</strong> 
                                    {{ carteUrgence.groupe_sanguin || 'Non spécifié' }}
                                </div>
                                <div v-if="carteUrgence.allergies" class="mt-2">
                                    <strong>Allergies:</strong> {{ carteUrgence.allergies }}
                                </div>
                            </div>
                        </div>

                        <!-- Conditions médicales -->
                        <div class="col-md-6">
                            <div class="info-section">
                                <h6 class="section-title">Conditions Médicales</h6>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="label">Maladies chroniques:</span>
                                        <span>{{ carteUrgence.maladies_chroniques || 'Aucune' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Maladies héréditaires:</span>
                                        <span>{{ carteUrgence.maladies_hereditaires || 'Aucune' }}</span>
                                    </div>
                                    <div class="info-item" v-if="carteUrgence.handicap">
                                        <span class="label">Handicap:</span>
                                        <span>{{ carteUrgence.handicap }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Contact d'urgence -->
                        <div class="col-md-6">
                            <div class="info-section">
                                <h6 class="section-title">Contact d'Urgence</h6>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="label">Numéro à contacter:</span>
                                        <span>{{ carteUrgence.numero_proches }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Informations supplémentaires -->
                        <div class="col-12">
                            <div class="info-section">
                                <h6 class="section-title">Informations Supplémentaires</h6>
                                <div class="info-grid">
                                    <div class="info-item" v-if="carteUrgence.electrophorese">
                                        <span class="label">Électrophorèse:</span>
                                        <span>{{ carteUrgence.electrophorese }}</span>
                                    </div>
                                    <div class="info-item" v-if="carteUrgence.acute_visuelle">
                                        <span class="label">Acuité visuelle:</span>
                                        <span>{{ carteUrgence.acute_visuelle }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Dialyse:</span>
                                        <span>{{ carteUrgence.dialyse ? 'Oui' : 'Non' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<!-- 
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCarteUrgence } from '@/composables/useCarteUrgence';
import { useAuth } from '@/composables/useAuth';

const props = defineProps({
    patientId: {
        type: [Number, String],
        required: true
    }
});

const emit = defineEmits(['edit']);

// Composables
const { carteUrgence, loading, getCarteUrgence } = useCarteUrgence();
const { user } = useAuth();

// Computed
const canEdit = computed(() => {
    return user.value?.role?.permissions?.some(p => 
        p.permission_name === 'Modifier_Carte_Urgence'
    );
});

// Méthodes
const printCard = () => {
    window.print();
};

// Initialisation
onMounted(async () => {
    try {
        await getCarteUrgence(props.patientId);
    } catch (error) {
        console.error("Erreur lors du chargement de la carte d'urgence:", error);
    }
});
</script> -->

<style scoped>
.carte-urgence {
    max-width: 900px;
    margin: 0 auto;
}

.info-section {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
    height: 100%;
}

.section-title {
    color: #dc3545;
    border-bottom: 2px solid #dc3545;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
}

.info-grid {
    display: grid;
    gap: 1rem;
}

.info-item {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 0.5rem;
}

.label {
    font-weight: 600;
    color: #495057;
}

@media print {
    .btn-group {
        display: none;
    }
    
    .card {
        border: none;
        box-shadow: none;
    }
}

@media (max-width: 768px) {
    .info-item {
        grid-template-columns: 1fr;
    }
}
</style>