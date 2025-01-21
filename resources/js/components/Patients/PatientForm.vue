<!-- PatientForm.vue -->
<template>
    <div class="patient-form">
      <form @submit.prevent="handleSubmit" class="row g-3">
        <!-- Section Informations Personnelles -->
        <div class="col-12">
          <div class="card mb-4">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-user me-2"></i>
                Informations Personnelles
              </h5>
            </div>
            <div class="card-body row g-3">
              <div class="col-md-6">
                <label class="form-label required">Nom</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="formData.nom"
                  required
                  :class="{ 'is-invalid': errors.nom }"
                >
                <div class="invalid-feedback">{{ errors.nom }}</div>
              </div>
  
              <div class="col-md-6">
                <label class="form-label required">Prénom</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="formData.prenom"
                  required
                  :class="{ 'is-invalid': errors.prenom }"
                >
                <div class="invalid-feedback">{{ errors.prenom }}</div>
              </div>
  
              <div class="col-md-4">
                <label class="form-label required">Date de naissance</label>
                <input 
                  type="date" 
                  class="form-control"
                  v-model="formData.date_naissance"
                  required
                  :class="{ 'is-invalid': errors.date_naissance }"
                >
                <div class="invalid-feedback">{{ errors.date_naissance }}</div>
              </div>
  
              <div class="col-md-4">
                <label class="form-label">Sexe</label>
                <select class="form-select" v-model="formData.sexe">
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
  
              <div class="col-md-4">
                <label class="form-label">Groupe sanguin</label>
                <select 
                  class="form-select"
                  v-model="formData.groupe_sanguin"
                >
                  <option value="">Sélectionner</option>
                  <option v-for="groupe in groupesSanguins" :key="groupe" :value="groupe">
                    {{ groupe }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Section Contact -->
        <div class="col-12">
          <div class="card mb-4">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-address-card me-2"></i>
                Informations de Contact
              </h5>
            </div>
            <div class="card-body row g-3">
              <div class="col-md-6">
                <label class="form-label">Téléphone</label>
                <input 
                  type="tel" 
                  class="form-control"
                  v-model="formData.telephone"
                  :class="{ 'is-invalid': errors.telephone }"
                >
                <div class="invalid-feedback">{{ errors.telephone }}</div>
              </div>
  
              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control"
                  v-model="formData.email"
                  :class="{ 'is-invalid': errors.email }"
                >
                <div class="invalid-feedback">{{ errors.email }}</div>
              </div>
  
              <div class="col-12">
                <label class="form-label">Adresse</label>
                <textarea 
                  class="form-control"
                  v-model="formData.adresse"
                  rows="2"
                ></textarea>
              </div>
  
              <div class="col-md-6">
                <label class="form-label">Contact d'urgence</label>
                <input 
                  type="tel" 
                  class="form-control"
                  v-model="formData.contact_urgence"
                >
              </div>
  
              <div class="col-md-6">
                <label class="form-label">Relation avec le contact</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="formData.relation_contact"
                >
              </div>
            </div>
          </div>
        </div>
  
        <!-- Section Informations Médicales -->
        <div class="col-12">
          <div class="card mb-4">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-heartbeat me-2"></i>
                Informations Médicales
              </h5>
            </div>
            <div class="card-body row g-3">
              <div class="col-md-12">
                <label class="form-label">Allergies connues</label>
                <textarea 
                  class="form-control"
                  v-model="formData.allergies"
                  rows="2"
                ></textarea>
              </div>
  
              <div class="col-md-12">
                <label class="form-label">Maladies chroniques</label>
                <textarea 
                  class="form-control"
                  v-model="formData.maladies_chroniques"
                  rows="2"
                ></textarea>
              </div>
  
              <div class="col-12">
                <div class="form-check">
                  <input 
                    type="checkbox" 
                    class="form-check-input"
                    v-model="formData.donneur_organes"
                    id="donneurOrganes"
                  >
                  <label class="form-check-label" for="donneurOrganes">
                    Donneur d'organes
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Boutons de soumission -->
        <div class="col-12">
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
  </template>
  
  <script setup>
    
    import { ref, computed, onMounted, watch } from 'vue';
    import { usePatients } from '@/composables/usePatients';

    const props = defineProps({
    patient: {
        type: Object,
        default: null
    },
    editMode: {
        type: Boolean,
        default: false
    }
    });

    const emit = defineEmits(['cancel', 'saved', 'update:patient']);

    // États
    const loading = ref(false);
    const errors = ref({});
    const formData = ref({
    nom: '',
    prenom: '',
    date_naissance: '',
    sexe: '',
    groupe_sanguin: '',
    telephone: '',
    email: '',
    adresse: '',
    contact_urgence: '',
    relation_contact: '',
    allergies: '',
    maladies_chroniques: '',
    donneur_organes: false,
    localisation_id: '',
    profession: ''
    });

    // Constantes
    const groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Composables
    const { createPatient, updatePatient } = usePatients();

    // Computed
    const isFormValid = computed(() => {
    return formData.value.nom &&
            formData.value.prenom &&
            formData.value.date_naissance;
    });

    // Watch pour synchroniser les données du patient
    watch(() => props.patient, (newPatient) => {
    if (newPatient) {
        initializeForm(newPatient);
    }
    }, { immediate: true });

    // Méthodes
    const initializeForm = (patient) => {
    if (patient) {
        formData.value = {
        ...formData.value,
        ...patient
        };
    } else {
        resetForm();
    }
    };

    const resetForm = () => {
    formData.value = {
        nom: '',
        prenom: '',
        date_naissance: '',
        sexe: '',
        groupe_sanguin: '',
        telephone: '',
        email: '',
        adresse: '',
        contact_urgence: '',
        relation_contact: '',
        allergies: '',
        maladies_chroniques: '',
        donneur_organes: false,
        localisation_id: '',
        profession: ''
    };
    errors.value = {};
    };

    const validateForm = () => {
    errors.value = {};
    let isValid = true;

    // Validation du nom
    if (!formData.value.nom.trim()) {
        errors.value.nom = 'Le nom est requis';
        isValid = false;
    }

    // Validation du prénom
    if (!formData.value.prenom.trim()) {
        errors.value.prenom = 'Le prénom est requis';
        isValid = false;
    }

    // Validation de la date de naissance
    if (!formData.value.date_naissance) {
        errors.value.date_naissance = 'La date de naissance est requise';
        isValid = false;
    }

    // Validation du téléphone
    if (formData.value.telephone && !/^\d{8,}$/.test(formData.value.telephone)) {
        errors.value.telephone = 'Numéro de téléphone invalide';
        isValid = false;
    }

    // Validation de l'email
    if (formData.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        errors.value.email = 'Adresse email invalide';
        isValid = false;
    }

    return isValid;
    };

    const handleSubmit = async () => {
    try {
        if (!validateForm()) {
        return;
        }

        loading.value = true;
        let response;

        if (props.editMode) {
        response = await updatePatient(props.patient.patient_id, formData.value);
        } else {
        response = await createPatient(formData.value);
        }

        emit('saved', response.data);
        showSuccessMessage(props.editMode ? 'Patient modifié avec succès' : 'Patient créé avec succès');
        
        if (!props.editMode) {
        resetForm();
        }

    } catch (error) {
        handleError(error);
    } finally {
        loading.value = false;
    }
    };

    const handleError = (error) => {
    if (error.response?.data?.errors) {
        errors.value = error.response.data.errors;
    } else {
        showErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    }
    console.error('Erreur lors de la soumission:', error);
    };

    const showSuccessMessage = (message) => {
    // Implementer votre système de notification
    console.log('Success:', message);
    };

    const showErrorMessage = (message) => {
    // Implementer votre système de notification
    console.error('Error:', message);
    };

    // Hooks
    onMounted(() => {
    if (props.patient) {
        initializeForm(props.patient);
    }
    });

  </script>
  
  <style scoped>
  .required::after {
    content: '*';
    color: red;
    margin-left: 4px;
  }
  
  .card {
    transition: box-shadow 0.3s ease-in-out;
  }
  
  .card:hover {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
  
  .form-control:focus, .form-select:focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  </style>