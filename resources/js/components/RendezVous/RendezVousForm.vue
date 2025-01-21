<template>
    <div class="rendez-vous-form">
        <div class="card">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">
                    <i class="fas fa-calendar-plus me-2"></i>
                    {{ editMode ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous' }}
                </h5>
            </div>

            <form @submit.prevent="handleSubmit">
                <div class="card-body">
                    <div class="row g-3">
                        <!-- Patient -->
                        <div class="col-md-6" v-if="!patientId">
                            <label class="form-label required">Patient</label>
                            <select 
                                class="form-select"
                                v-model="formData.patient_id"
                                required
                                :class="{ 'is-invalid': errors.patient_id }"
                            >
                                <option value="">Sélectionner un patient</option>
                                <option 
                                    v-for="patient in patients" 
                                    :key="patient.patient_id" 
                                    :value="patient.patient_id"
                                >
                                    {{ patient.nom }} {{ patient.prenom }}
                                </option>
                            </select>
                            <div class="invalid-feedback">{{ errors.patient_id }}</div>
                        </div>

                        <!-- Médecin -->
                        <div class="col-md-6">
                            <label class="form-label required">Médecin</label>
                            <select 
                                class="form-select"
                                v-model="formData.medecin_id"
                                required
                                :class="{ 'is-invalid': errors.medecin_id }"
                                @change="checkDisponibilite"
                            >
                                <option value="">Sélectionner un médecin</option>
                                <option 
                                    v-for="medecin in medecins" 
                                    :key="medecin.user_id" 
                                    :value="medecin.user_id"
                                >
                                    Dr. {{ medecin.nom }}
                                </option>
                            </select>
                            <div class="invalid-feedback">{{ errors.medecin_id }}</div>
                        </div>

                        <!-- Date et Heure -->
                        <div class="col-md-6">
                            <label class="form-label required">Date</label>
                            <input 
                                type="date"
                                class="form-control"
                                v-model="formData.date"
                                required
                                :min="minDate"
                                :class="{ 'is-invalid': errors.date }"
                                @change="checkDisponibilite"
                            >
                            <div class="invalid-feedback">{{ errors.date }}</div>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label required">Heure</label>
                            <select 
                                class="form-select"
                                v-model="formData.heure"
                                required
                                :class="{ 'is-invalid': errors.heure }"
                            >
                                <option value="">Sélectionner une heure</option>
                                <option 
                                    v-for="creneau in creneauxDisponibles"
                                    :key="creneau"
                                    :value="creneau"
                                    :disabled="!isCreneauDisponible(creneau)"
                                >
                                    {{ creneau }}
                                </option>
                            </select>
                            <div class="invalid-feedback">{{ errors.heure }}</div>
                        </div>

                        <!-- Motif -->
                        <div class="col-12">
                            <label class="form-label required">Motif du rendez-vous</label>
                            <textarea 
                                class="form-control"
                                v-model="formData.motif"
                                required
                                rows="2"
                                :class="{ 'is-invalid': errors.motif }"
                            ></textarea>
                            <div class="invalid-feedback">{{ errors.motif }}</div>
                        </div>

                        <!-- Notes supplémentaires -->
                        <div class="col-12">
                            <label class="form-label">Notes supplémentaires</label>
                            <textarea 
                                class="form-control"
                                v-model="formData.notes"
                                rows="2"
                            ></textarea>
                        </div>

                        <!-- Affichage de la disponibilité -->
                        <div class="col-12" v-if="disponibiliteChecked">
                            <div 
                                class="alert"
                                :class="disponibiliteClass"
                            >
                                <i 
                                    class="fas"
                                    :class="disponibiliteIcon"
                                    me-2
                                ></i>
                                {{ disponibiliteMessage }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-footer">
                    <div class="d-flex justify-content-end gap-2">
                        <button 
                            type="button" 
                            class="btn btn-secondary"
                            @click="$emit('cancel')"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            class="btn btn-primary"
                            :disabled="loading || !isFormValid"
                        >
                            <span 
                                class="spinner-border spinner-border-sm me-1" 
                                v-if="loading"
                            ></span>
                            {{ editMode ? 'Modifier' : 'Enregistrer' }}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRendezVous } from '@/composables/useRendezVous';
import { format, parseISO, addMinutes } from 'date-fns';

const props = defineProps({
    patientId: {
        type: [Number, String],
        default: null
    },
    rendezVous: {
        type: Object,
        default: null
    },
    editMode: {
        type: Boolean,
        default: false
    },
    patients: {
        type: Array,
        default: () => []
    },
    medecins: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['saved', 'cancel']);

// États
const loading = ref(false);
const errors = ref({});
const disponibiliteChecked = ref(false);
const creneauxDisponibles = ref([]);

const formData = ref({
    patient_id: props.patientId || '',
    medecin_id: '',
    date: '',
    heure: '',
    motif: '',
    notes: '',
    statut: 'programmé'
});

// Composables
const { createRendezVous, updateRendezVous, getCreneauxDisponibles } = useRendezVous();

// Computed
const minDate = computed(() => {
    return format(new Date(), 'yyyy-MM-dd');
});

const isFormValid = computed(() => {
    return formData.value.patient_id &&
           formData.value.medecin_id &&
           formData.value.date &&
           formData.value.heure &&
           formData.value.motif;
});

const disponibiliteClass = computed(() => {
    return {
        'alert-success': disponibiliteChecked.value && creneauxDisponibles.value.length > 0,
        'alert-warning': disponibiliteChecked.value && creneauxDisponibles.value.length === 0
    };
});

const disponibiliteIcon = computed(() => {
    return {
        'fa-check-circle': disponibiliteChecked.value && creneauxDisponibles.value.length > 0,
        'fa-exclamation-triangle': disponibiliteChecked.value && creneauxDisponibles.value.length === 0
    };
});

const disponibiliteMessage = computed(() => {
    if (!disponibiliteChecked.value) return '';
    return creneauxDisponibles.value.length > 0
        ? 'Créneaux disponibles'
        : 'Aucun créneau disponible pour cette date';
});

// Méthodes
const initializeForm = () => {
    if (props.rendezVous) {
        const rdv = props.rendezVous;
        formData.value = {
            patient_id: rdv.patient_id,
            medecin_id: rdv.medecin_id,
            date: format(parseISO(rdv.date_rdv), 'yyyy-MM-dd'),
            heure: format(parseISO(rdv.date_rdv), 'HH:mm'),
            motif: rdv.motif,
            notes: rdv.notes,
            statut: rdv.statut
        };
    }
};

const checkDisponibilite = async () => {
    if (formData.value.medecin_id && formData.value.date) {
        try {
            const response = await getCreneauxDisponibles(
                formData.value.medecin_id, 
                formData.value.date
            );
            creneauxDisponibles.value = response.data;
            disponibiliteChecked.value = true;
        } catch (error) {
            console.error("Erreur lors de la vérification de disponibilité:", error);
        }
    }
};

const isCreneauDisponible = (creneau) => {
    return creneauxDisponibles.value.includes(creneau);
};

const handleSubmit = async () => {
    try {
        loading.value = true;
        errors.value = {};

        const rdvData = {
            ...formData.value,
            date_rdv: `${formData.value.date}T${formData.value.heure}`
        };

        let response;
        if (props.editMode) {
            response = await updateRendezVous(props.rendezVous.rdv_id, rdvData);
        } else {
            response = await createRendezVous(rdvData);
        }

        emit('saved', response.data);
        showSuccessMessage(
            props.editMode ? 'Rendez-vous modifié avec succès' : 'Rendez-vous créé avec succès'
        );

    } catch (error) {
        handleError(error);
    } finally {
        loading.value = false;
    }
};

const handleError = (error) => {
    if (error.response?.data?.errors) {
        errors.value = error.response.data.errors;
    }
    showErrorMessage("Une erreur est survenue lors de l'enregistrement");
};

const showSuccessMessage = (message) => {
    // Implémenter votre système de notification
    console.log('Success:', message);
};

const showErrorMessage = (message) => {
    // Implémenter votre système de notification
    console.error('Error:', message);
};

// Watch
watch(
    () => formData.value.medecin_id,
    () => {
        formData.value.heure = '';
        checkDisponibilite();
    }
);

watch(
    () => formData.value.date,
    () => {
        formData.value.heure = '';
        checkDisponibilite();
    }
);

// Lifecycle Hooks
onMounted(() => {
    initializeForm();
    if (formData.value.medecin_id && formData.value.date) {
        checkDisponibilite();
    }
});
</script>

<style scoped>
.required::after {
    content: '*';
    color: red;
    margin-left: 4px;
}

.form-control:focus,
.form-select:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.alert {
    margin-bottom: 0;
}

.alert i {
    margin-right: 0.5rem;
}

option:disabled {
    color: #6c757d;
    font-style: italic;
}
</style>