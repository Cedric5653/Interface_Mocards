<template>
    <form @submit.prevent="handleSubmit" class="consultation-form">
        <div class="card">
            <div class="card-body">
                <div class="row g-3">
                    <!-- select patient -->
                    <div class="col-md-6">
                        <label class="form-label required">Patient</label>
                        <select class="form-select" v-model="formData.patient_id" required>
                            <option value="">Sélectionner un patient</option>
                            <option v-for="pat in patientsList" :key="pat.patient_id" :value="pat.patient_id">
                            {{ pat.nom }} {{ pat.prenom }}
                            </option>
                        </select>
                    </div>


                    <!-- Type de consultation -->
                    <div class="col-md-6">
                        <label class="form-label required">Type de consultation</label>
                        <select 
                            class="form-select"
                            v-model="formData.type_consultation"
                            required
                        >
                            <option value="">Sélectionner un type</option>
                            <option value="routine">Consultation de routine</option>
                            <option value="urgence">Consultation d'urgence</option>
                            <option value="suivi">Consultation de suivi</option>
                            <option value="specialiste">Consultation spécialiste</option>
                        </select>
                    </div>

                    <!-- Date et heure -->
                    <div class="col-md-6">
                        <label class="form-label required">Date et heure</label>
                        <input 
                            type="datetime-local"
                            class="form-control"
                            v-model="formData.date_consultation"
                            required
                        >
                    </div>

                    <!-- Centre de santé -->
                    <div class="col-12">
                        <label class="form-label required">Centre de santé</label>
                        <input 
                            type="text"
                            class="form-control"
                            v-model="formData.centre_sante"
                            required
                        >
                    </div>

                    <!-- Motif -->
                    <div class="col-12">
                        <label class="form-label">Motif de consultation</label>
                        <textarea 
                            class="form-control"
                            v-model="formData.motif"
                            rows="2"
                        ></textarea>
                    </div>

                    <!-- Symptômes -->
                    <div class="col-12">
                        <label class="form-label">Symptômes</label>
                        <textarea 
                            class="form-control"
                            v-model="formData.symptomes"
                            rows="3"
                        ></textarea>
                    </div>

                    <!-- Diagnostic -->
                    <div class="col-12">
                        <label class="form-label required">Diagnostic</label>
                        <textarea 
                            class="form-control"
                            v-model="formData.diagnostic"
                            rows="3"
                            required
                        ></textarea>
                    </div>

                    <!-- Prescriptions -->
                    <div class="col-12">
                        <label class="form-label">Prescriptions</label>
                        <textarea 
                            class="form-control"
                            v-model="formData.prescriptions"
                            rows="3"
                        ></textarea>
                    </div>

                    <!-- Hospitalisation -->
                    <div class="col-12">
                        <div class="form-check">
                            <input 
                                type="checkbox"
                                class="form-check-input"
                                v-model="formData.hospitalisation"
                                id="hospitalisationCheck"
                            >
                            <label class="form-check-label" for="hospitalisationCheck">
                                Hospitalisation requise
                            </label>
                        </div>
                    </div>

                    <!-- Durée hospitalisation si nécessaire -->
                    <div class="col-md-6" v-if="formData.hospitalisation">
                        <label class="form-label">Durée d'hospitalisation (jours)</label>
                        <input 
                            type="number"
                            class="form-control"
                            v-model="formData.duree_hospitalisation"
                            min="1"
                        >
                    </div>
                </div>
            </div>

            <div class="card-footer">
                <div class="d-flex justify-content-end gap-2">
                    <!-- <button 
                        type="button" 
                        class="btn btn-secondary"
                        @click="$emit('cancel')"
                    >
                        Annuler
                    </button> -->
                    <router-link to="/dashboard" class="btn btn-secondary text-decoration-none">
                            Annuler
                    </router-link>
                    <button 
                        type="submit" 
                        class="btn btn-primary"
                        :disabled="loading"
                    >
                        <span 
                            class="spinner-border spinner-border-sm me-1" 
                            v-if="loading"
                        ></span>
                        {{ editMode ? 'Modifier' : 'Enregistrer' }}
                    </button>
                </div>
            </div>
        </div>
    </form>
</template>


// Script de ConsultationForm.vue
<script setup>
import { ref, onMounted } from 'vue';
import { useConsultations } from '@/composables/useConsultations';

import { usePatients } from '@/composables/usePatients';
import { useRouter } from 'vue-router';




const { fetchPatients, patients } = usePatients();
const patientsList = ref([]);

const props = defineProps({
    patientId: {
        type: [Number, String],
        required: true
    },
    consultation: {
        type: Object,
        default: null
    },
    editMode: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['cancel', 'saved']);

// États
const loading = ref(false);
const formData = ref({
    patient_id: props.patientId,
    type_consultation: '',
    date_consultation: '',
    centre_sante: '',
    motif: '',
    symptomes: '',
    diagnostic: '',
    prescriptions: '',
    hospitalisation: false,
    duree_hospitalisation: null,
    medecin_id: null // Sera rempli automatiquement côté serveur
});


// Composables
const { createConsultation, updateConsultation } = useConsultations();

// Méthodes
const initializeForm = () => {
    if (props.consultation) {
        formData.value = {
            ...formData.value,
            ...props.consultation,
            date_consultation: formatDateForInput(props.consultation.date_consultation)
        };
    }
};

const handleSubmit = async () => {
    
    try {
        // Conversion du format de date si nécessaire
        if (formData.value.date_consultation) {
            formData.value.date_consultation = new Date(formData.value.date_consultation)
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
        }
        // Mapper le champ motif sur observations si nécessaire
        if (formData.value.motif) {
            formData.value.observations = formData.value.motif;
        }

        console.log('Données envoyées:', formData.value);

        loading.value = true;
        let response;

        if (props.editMode) {
            response = await updateConsultation(props.consultation.consultation_id, formData.value);
        } else {
            response = await createConsultation(formData.value);
        }

        emit('saved', response.data);
        showSuccessMessage(
            props.editMode ? 
            'Consultation modifiée avec succès' : 
            'Consultation créée avec succès'
        );

    } catch (error) {
        handleError(error);
    } finally {
        loading.value = false;
    }
};

// Helpers
const formatDateForInput = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
};

const showSuccessMessage = (message) => {
    // Implementer votre système de notification
    console.log(message);
};

const handleError = (error) => {
    let errorMessage = "Une erreur est survenue lors de l'enregistrement";
    
    if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
    }
    
    // Implementer votre système de notification
    console.error(errorMessage);
};

// Lifecycle hooks
onMounted(() => {
    initializeForm();
    const res = fetchPatients();
    // Ici, nous supposons que fetchPatients retourne un objet paginé ; on extrait l'array
    patientsList.value = res.data.data.data || res.data.data;
});

</script>

<style scoped>
.required::after {
    content: '*';
    color: red;
    margin-left: 4px;
}

.consultation-form textarea {
    resize: vertical;
}
</style>