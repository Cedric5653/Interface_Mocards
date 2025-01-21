<template>
    <div class="carte-urgence-form">
        <form @submit.prevent="handleSubmit" class="card">
            <div class="card-header bg-danger text-white">
                <h5 class="mb-0">
                    <i class="fas fa-ambulance me-2"></i>
                    {{ editMode ? 'Modifier la carte d\'urgence' : 'Créer une carte d\'urgence' }}
                </h5>
            </div>

            <div class="card-body">
                <div class="row g-3">
                    <!-- Groupe sanguin et Électrophorèse -->
                    <div class="col-md-6">
                        <label class="form-label required">Groupe sanguin</label>
                        <select 
                            class="form-select"
                            v-model="formData.groupe_sanguin"
                            required
                        >
                            <option value="">Sélectionner</option>
                            <option v-for="groupe in groupesSanguins" :key="groupe" :value="groupe">
                                {{ groupe }}
                            </option>
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">Électrophorèse</label>
                        <input 
                            type="text"
                            class="form-control"
                            v-model="formData.electrophorese"
                        >
                    </div>

                    <!-- Allergies -->
                    <div class="col-12">
                        <label class="form-label">Allergies</label>
                        <textarea 
                            class="form-control"
                            v-model="formData.allergies"
                            rows="2"
                        ></textarea>
                    </div>

                    <!-- Maladies -->
                    <div class="col-md-6">
                        <label class="form-label">Maladies chroniques</label>
                        <textarea 
                            class="form-control"
                            v-model="formData.maladies_chroniques"
                            rows="2"
                        ></textarea>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">Maladies héréditaires</label>
                        <textarea 
                            class="form-control"
                            v-model="formData.maladies_hereditaires"
                            rows="2"
                        ></textarea>
                    </div>

                    <!-- Handicap et Acuité visuelle -->
                    <div class="col-md-6">
                        <label class="form-label">Handicap</label>
                        <input 
                            type="text"
                            class="form-control"
                            v-model="formData.handicap"
                        >
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">Acuité visuelle</label>
                        <input 
                            type="text"
                            class="form-control"
                            v-model="formData.acute_visuelle"
                        >
                    </div>

                    <!-- Contact d'urgence -->
                    <div class="col-12">
                        <label class="form-label required">Numéro des proches à contacter</label>
                        <input 
                            type="tel"
                            class="form-control"
                            v-model="formData.numero_proches"
                            required
                        >
                    </div>

                    <!-- Options supplémentaires -->
                    <div class="col-12">
                        <div class="form-check">
                            <input 
                                type="checkbox"
                                class="form-check-input"
                                v-model="formData.dialyse"
                                id="dialyseCheck"
                            >
                            <label class="form-check-label" for="dialyseCheck">
                                Patient sous dialyse
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card-footer d-flex justify-content-end gap-2">
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
                    :disabled="loading"
                >
                    <span 
                        class="spinner-border spinner-border-sm me-1" 
                        v-if="loading"
                    ></span>
                    {{ editMode ? 'Modifier' : 'Enregistrer' }}
                </button>
            </div>
        </form>
    </div>
</template>


// Script de CarteUrgenceForm.vue
<script setup>
import { ref, onMounted } from 'vue';
import { useCarteUrgence } from '@/composables/useCarteUrgence';

const props = defineProps({
    patientId: {
        type: [Number, String],
        required: true
    },
    carteUrgence: {
        type: Object,
        default: null
    },
    editMode: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['saved', 'cancel']);

// États
const loading = ref(false);
const formData = ref({
    patient_id: props.patientId,
    groupe_sanguin: '',
    electrophorese: '',
    allergies: '',
    maladies_chroniques: '',
    maladies_hereditaires: '',
    handicap: '',
    acute_visuelle: '',
    numero_proches: '',
    dialyse: false,
    constantes_stables: ''
});

// Constantes
const groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Composables
const { createCarteUrgence, updateCarteUrgence } = useCarteUrgence();

// Méthodes
const initializeForm = () => {
    if (props.carteUrgence) {
        formData.value = {
            ...formData.value,
            ...props.carteUrgence
        };
    }
};

const handleSubmit = async () => {
    try {
        loading.value = true;
        let response;

        if (props.editMode) {
            response = await updateCarteUrgence(props.carteUrgence.carte_id, formData.value);
        } else {
            response = await createCarteUrgence(formData.value);
        }

        showSuccessMessage(
            props.editMode ? 
                'Carte d\'urgence mise à jour avec succès' : 
                'Carte d\'urgence créée avec succès'
        );
        emit('saved', response.data);

    } catch (error) {
        handleError(error);
    } finally {
        loading.value = false;
    }
};

const validateForm = () => {
    let isValid = true;
    const errors = {};

    // Validation du groupe sanguin
    if (!formData.value.groupe_sanguin) {
        errors.groupe_sanguin = 'Le groupe sanguin est requis';
        isValid = false;
    }

    // Validation du numéro des proches
    if (!formData.value.numero_proches) {
        errors.numero_proches = 'Un numéro de contact d\'urgence est requis';
        isValid = false;
    } else if (!/^\d{8,}$/.test(formData.value.numero_proches)) {
        errors.numero_proches = 'Numéro de téléphone invalide';
        isValid = false;
    }

    return { isValid, errors };
};

const resetForm = () => {
    formData.value = {
        patient_id: props.patientId,
        groupe_sanguin: '',
        electrophorese: '',
        allergies: '',
        maladies_chroniques: '',
        maladies_hereditaires: '',
        handicap: '',
        acute_visuelle: '',
        numero_proches: '',
        dialyse: false,
        constantes_stables: ''
    };
};

const handleError = (error) => {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
    }

    if (error.response?.data?.errors) {
        // Traiter les erreurs de validation spécifiques
        Object.keys(error.response.data.errors).forEach(key => {
            showErrorMessage(`${key}: ${error.response.data.errors[key].join(', ')}`);
        });
    } else {
        showErrorMessage(errorMessage);
    }
};

const showSuccessMessage = (message) => {
    // Implémenter votre système de notification
    console.log('Success:', message);
};

const showErrorMessage = (message) => {
    // Implémenter votre système de notification
    console.error('Error:', message);
};

// Lifecycle hooks
onMounted(() => {
    initializeForm();
});
</script>

<style scoped>
.carte-urgence-form {
    max-width: 900px;
    margin: 0 auto;
}

.required::after {
    content: '*';
    color: red;
    margin-left: 4px;
}

.form-control:focus,
.form-select:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.form-check-input:checked {
    background-color: #dc3545;
    border-color: #dc3545;
}

.form-check-input:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}
</style>