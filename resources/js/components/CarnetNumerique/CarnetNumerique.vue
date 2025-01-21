<template>
    <div class="carnet-numerique">
        <!-- En-tête du carnet -->
        <div class="card mb-4">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h4 class="mb-0">
                    <i class="fas fa-book-medical me-2"></i>
                    Carnet de Santé Numérique
                </h4>
                <!-- Boutons d'action -->
                <div class="btn-group">
                    <button 
                        class="btn btn-light btn-sm"
                        @click="exportCarnet"
                    >
                        <i class="fas fa-download me-1"></i>
                        Exporter
                    </button>
                    <button 
                        class="btn btn-light btn-sm"
                        @click="printCarnet"
                    >
                        <i class="fas fa-print me-1"></i>
                        Imprimer
                    </button>
                </div>
            </div>

            <!-- Informations du patient -->
            <div class="card-body" v-if="carnetNumerique">
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="d-flex align-items-center">
                            <div class="patient-avatar me-3">
                                {{ getInitials(carnetNumerique.patient) }}
                            </div>
                            <div>
                                <h5 class="mb-1">
                                    {{ carnetNumerique.patient.nom }} 
                                    {{ carnetNumerique.patient.prenom }}
                                </h5>
                                <p class="mb-0 text-muted">
                                    <i class="fas fa-calendar-alt me-2"></i>
                                    {{ formatDate(carnetNumerique.patient.date_naissance) }}
                                    ({{ getAge(carnetNumerique.patient.date_naissance) }} ans)
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex justify-content-end">
                            <!-- Informations importantes -->
                            <div class="me-3">
                                <span class="badge bg-info">
                                    <i class="fas fa-tint me-1"></i>
                                    {{ carnetNumerique.patient.groupe_sanguin || 'Non spécifié' }}
                                </span>
                            </div>
                            <!-- Autres informations importantes -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Navigation du carnet -->
        <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
                <a 
                    class="nav-link"
                    :class="{ active: activeTab === 'historique' }"
                    href="#"
                    @click.prevent="activeTab = 'historique'"
                >
                    <i class="fas fa-history me-2"></i>
                    Historique Médical
                </a>
            </li>
            <li class="nav-item">
                <a 
                    class="nav-link"
                    :class="{ active: activeTab === 'traitements' }"
                    href="#"
                    @click.prevent="activeTab = 'traitements'"
                >
                    <i class="fas fa-pills me-2"></i>
                    Traitements
                </a>
            </li>
            <li class="nav-item">
                <a 
                    class="nav-link"
                    :class="{ active: activeTab === 'prescriptions' }"
                    href="#"
                    @click.prevent="activeTab = 'prescriptions'"
                >
                    <i class="fas fa-prescription me-2"></i>
                    Prescriptions
                </a>
            </li>
        </ul>

        <!-- Contenu dynamique -->
        <div class="tab-content">
            <HistoriqueMedical 
                v-if="activeTab === 'historique'"
                :historique="historiqueMedical"
                @refresh="refreshHistorique"
            />
            <Traitements 
                v-if="activeTab === 'traitements'"
                :traitements="traitements"
                @refresh="refreshTraitements"
            />
            <Prescriptions 
                v-if="activeTab === 'prescriptions'"
                :prescriptions="prescriptions"
                @refresh="refreshPrescriptions"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCarnetNumerique } from '@/composables/useCarnetNumerique';
import HistoriqueMedical from './HistoriqueMedical.vue';
import Traitements from './Traitements.vue';
import Prescriptions from './Prescriptions.vue';

// Composables
const route = useRoute();
const {
    carnetNumerique,
    historiqueMedical,
    traitements,
    prescriptions,
    loading,
    fetchCarnetNumerique,
    getHistoriqueMedical,
    getTraitements,
    getPrescriptions
} = useCarnetNumerique();

// États
const activeTab = ref('historique');
const patientId = ref(route.params.id);

// Méthodes de rafraîchissement
const refreshHistorique = async () => {
    try {
        await getHistoriqueMedical(patientId.value);
    } catch (error) {
        showErrorMessage("Erreur lors de la mise à jour de l'historique médical");
    }
};

const refreshTraitements = async () => {
    try {
        await getTraitements(patientId.value);
    } catch (error) {
        showErrorMessage("Erreur lors de la mise à jour des traitements");
    }
};

const refreshPrescriptions = async () => {
    try {
        await getPrescriptions(patientId.value);
    } catch (error) {
        showErrorMessage("Erreur lors de la mise à jour des prescriptions");
    }
};

// Helpers
const getInitials = (patient) => {
    if (!patient) return '';
    return `${patient.nom.charAt(0)}${patient.prenom.charAt(0)}`.toUpperCase();
};

const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
};

const getAge = (dateNaissance) => {
    if (!dateNaissance) return '';
    const aujourdhui = new Date();
    const naissance = new Date(dateNaissance);
    let age = aujourdhui.getFullYear() - naissance.getFullYear();
    const mois = aujourdhui.getMonth() - naissance.getMonth();
    if (mois < 0 || (mois === 0 && aujourdhui.getDate() < naissance.getDate())) {
        age--;
    }
    return age;
};

// Exportation et impression
const exportCarnet = async () => {
    try {
        // Logique d'export à implémenter
        const response = await api.get(`/v1/medical/records/${patientId.value}/export`);
        // Télécharger le fichier
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `carnet_${patientId.value}.pdf`);
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        showErrorMessage("Erreur lors de l'export du carnet");
    }
};

const printCarnet = () => {
    window.print();
};

const showErrorMessage = (message) => {
    // Implémenter votre système de notification
    console.error(message);
};

// Watchers
watch(activeTab, async (newTab) => {
    try {
        switch (newTab) {
            case 'historique':
                await refreshHistorique();
                break;
            case 'traitements':
                await refreshTraitements();
                break;
            case 'prescriptions':
                await refreshPrescriptions();
                break;
        }
    } catch (error) {
        console.error(`Erreur lors du changement d'onglet: ${error}`);
    }
});

// Lifecycle Hooks
onMounted(async () => {
    try {
        // Chargement initial des données
        await Promise.all([
            fetchCarnetNumerique(patientId.value),
            refreshHistorique(),
            refreshTraitements(),
            refreshPrescriptions()
        ]);
    } catch (error) {
        showErrorMessage("Erreur lors du chargement du carnet numérique");
    }
});
</script>

<style scoped>
.carnet-numerique {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
}

.patient-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    color: #495057;
}

.nav-tabs .nav-link {
    color: #495057;
    border: none;
    padding: 0.5rem 1rem;
    transition: color 0.2s;
}

.nav-tabs .nav-link:hover {
    color: #0d6efd;
}

.nav-tabs .nav-link.active {
    color: #0d6efd;
    border-bottom: 2px solid #0d6efd;
    font-weight: 500;
}

@media print {
    .btn-group,
    .nav-tabs {
        display: none;
    }

    .card {
        border: none;
        box-shadow: none;
    }
}

@media (max-width: 768px) {
    .btn-group {
        width: 100%;
        margin-top: 1rem;
    }

    .btn-group .btn {
        flex: 1;
    }

    .patient-avatar {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
    }
}
</style>