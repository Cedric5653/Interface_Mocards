<template>
    <div class="examen-form">
        <div class="card">
            <div class="card-header bg-info text-white">
                <h5 class="mb-0">
                    <i class="fas fa-microscope me-2"></i>
                    {{ editMode ? "Modifier l'examen" : "Nouvel examen" }}
                </h5>
            </div>

            <form @submit.prevent="handleSubmit">
                <div class="card-body">
                    <div class="row g-3">
                        <!-- Type d'examen et Date -->
                        <div class="col-md-6">
                            <label class="form-label required">Type d'examen</label>
                            <select 
                                class="form-select"
                                v-model="formData.type_examen"
                                required
                                :class="{ 'is-invalid': errors.type_examen }"
                            >
                                <option value="">Sélectionner un type</option>
                                <option value="LMB">Laboratoire</option>
                                <option value="radio">Radiologie</option>
                                <option value="echo">Échographie</option>
                                <option value="autre">Autre</option>
                            </select>
                            <div class="invalid-feedback">{{ errors.type_examen }}</div>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label required">Date et heure</label>
                            <input 
                                type="datetime-local"
                                class="form-control"
                                v-model="formData.date_examen"
                                required
                                :class="{ 'is-invalid': errors.date_examen }"
                            >
                            <div class="invalid-feedback">{{ errors.date_examen }}</div>
                        </div>

                        <!-- Centre d'examen -->
                        <div class="col-12">
                            <label class="form-label required">Centre d'examen</label>
                            <input 
                                type="text"
                                class="form-control"
                                v-model="formData.centre_examen"
                                required
                                :class="{ 'is-invalid': errors.centre_examen }"
                            >
                            <div class="invalid-feedback">{{ errors.centre_examen }}</div>
                        </div>

                        <!-- Description et Instructions -->
                        <div class="col-12">
                            <label class="form-label">Description de l'examen</label>
                            <textarea 
                                class="form-control"
                                v-model="formData.description"
                                rows="3"
                                :class="{ 'is-invalid': errors.description }"
                            ></textarea>
                            <div class="invalid-feedback">{{ errors.description }}</div>
                        </div>

                        <div class="col-12">
                            <label class="form-label">Instructions spéciales</label>
                            <textarea 
                                class="form-control"
                                v-model="formData.instructions"
                                rows="2"
                            ></textarea>
                        </div>

                        <!-- Document(s) -->
                        <div class="col-12">
                            <label class="form-label">Document(s)</label>
                            <div class="custom-file-upload">
                                <input 
                                    type="file"
                                    class="form-control"
                                    @change="handleFileChange"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                >
                                <small class="text-muted">
                                    Formats acceptés: PDF, JPG, PNG. Taille max: 10MB
                                </small>
                            </div>
                        </div>

                        <!-- Documents sélectionnés -->
                        <div class="col-12" v-if="selectedFiles.length > 0">
                            <div class="selected-files">
                                <div 
                                    v-for="(file, index) in selectedFiles" 
                                    :key="index"
                                    class="selected-file"
                                >
                                    <i class="fas fa-file me-2"></i>
                                    {{ file.name }}
                                    <button 
                                        type="button"
                                        class="btn btn-link text-danger"
                                        @click="removeFile(index)"
                                    >
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- État de l'examen -->
                        <div class="col-md-6">
                            <label class="form-label">État</label>
                            <select 
                                class="form-select"
                                v-model="formData.status"
                            >
                                <option value="en_attente">En attente</option>
                                <option value="en_cours">En cours</option>
                                <option value="termine">Terminé</option>
                                <option value="annule">Annulé</option>
                            </select>
                        </div>

                        <!-- Résultats si terminé -->
                        <div class="col-12" v-if="formData.status === 'termine'">
                            <label class="form-label">Résultats</label>
                            <textarea 
                                class="form-control"
                                v-model="formData.resultat"
                                rows="3"
                            ></textarea>
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
            </form>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useExamens } from '@/composables/useExamens';

const props = defineProps({
    patientId: {
        type: [Number, String],
        required: true
    },
    examen: {
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
const errors = ref({});
const selectedFiles = ref([]);

const formData = ref({
    patient_id: props.patientId,
    type_examen: '',
    date_examen: '',
    centre_examen: '',
    description: '',
    instructions: '',
    status: 'en_attente',
    resultat: '',
});

// Composables
const { createExamen, updateExamen, uploadExamenDocument } = useExamens();

// Méthodes
const initializeForm = () => {
    if (props.examen) {
        formData.value = {
            ...formData.value,
            ...props.examen,
            date_examen: formatDateForInput(props.examen.date_examen)
        };
    }
};

const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
        return isValidSize && isValidType;
    });

    selectedFiles.value = [...selectedFiles.value, ...validFiles];
};

const removeFile = (index) => {
    selectedFiles.value.splice(index, 1);
};

const handleSubmit = async () => {
    try {
        loading.value = true;
        errors.value = {};

        let response;
        if (props.editMode) {
            response = await updateExamen(props.examen.examen_id, formData.value);
        } else {
            response = await createExamen(formData.value);
        }

        // Upload des fichiers si présents
        if (selectedFiles.value.length > 0 && response.data?.examen_id) {
            await Promise.all(selectedFiles.value.map(file => 
                uploadExamenDocument(response.data.examen_id, file)
            ));
        }

        emit('saved', response.data);
        showSuccessMessage(
            props.editMode ? 'Examen mis à jour avec succès' : 'Examen créé avec succès'
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

const validateForm = () => {
    const errors = {};
    
    if (!formData.value.type_examen) {
        errors.type_examen = "Le type d'examen est requis";
    }
    
    if (!formData.value.date_examen) {
        errors.date_examen = "La date est requise";
    }
    
    if (!formData.value.centre_examen) {
        errors.centre_examen = "Le centre d'examen est requis";
    }

    return errors;
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

// Lifecycle hooks
onMounted(() => {
    initializeForm();
});
</script>

<style scoped>
.required::after {
    content: '*';
    color: red;
    margin-left: 4px;
}

.custom-file-upload {
    position: relative;
}

.selected-files {
    margin-top: 10px;
}

.selected-file {
    display: flex;
    align-items: center;
    padding: 5px;
    background-color: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 5px;
}

.selected-file button {
    padding: 0;
    margin-left: auto;
}

.form-control:focus,
.form-select:focus {
    border-color: #0dcaf0;
    box-shadow: 0 0 0 0.2rem rgba(13, 202, 240, 0.25);
}
</style>