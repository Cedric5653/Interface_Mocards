
<template>
    <div class="patient-search card">
      <div class="card-body">
        <form @submit.prevent="handleSearch" class="row g-3">
          <!-- Champ de recherche principal -->
          <div class="col-md-12">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control form-control-lg"
                v-model="searchQuery"
                placeholder="Rechercher un patient..."
                @input="handleInput"
              >
              <button 
                type="button" 
                class="btn btn-outline-secondary"
                @click="toggleAdvancedSearch"
              >
                <i class="fas fa-sliders-h"></i> Filtres avancés
              </button>
            </div>
          </div>
  
          <!-- Recherche avancée -->
          <div class="col-12" v-if="showAdvancedSearch">
            <div class="card">
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Groupe sanguin</label>
                    <select class="form-select" v-model="filters.groupe_sanguin">
                      <option value="">Tous</option>
                      <option v-for="groupe in groupesSanguins" :key="groupe" :value="groupe">
                        {{ groupe }}
                      </option>
                    </select>
                  </div>
  
                  <div class="col-md-4">
                    <label class="form-label">Localisation</label>
                    <select class="form-select" v-model="filters.localisation_id">
                      <option value="">Toutes</option>
                      <option 
                        v-for="loc in localisations" 
                        :key="loc.id" 
                        :value="loc.id"
                      >
                        {{ loc.region }} - {{ loc.district_sanitaire }}
                      </option>
                    </select>
                  </div>
  
                  <div class="col-md-4">
                    <label class="form-label">Tranche d'âge</label>
                    <select class="form-select" v-model="filters.age_range">
                      <option value="">Toutes</option>
                      <option value="0-18">0-18 ans</option>
                      <option value="19-30">19-30 ans</option>
                      <option value="31-50">31-50 ans</option>
                      <option value="51+">51 ans et plus</option>
                    </select>
                  </div>
  
                  <div class="col-12">
                    <div class="form-check form-check-inline">
                      <input 
                        type="checkbox" 
                        class="form-check-input"
                        v-model="filters.donneur_organes"
                        id="donneurOrganes"
                      >
                      <label class="form-check-label" for="donneurOrganes">
                        Donneurs d'organes uniquement
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
  
        <!-- Résultats de recherche -->
        <div class="search-results mt-4" v-if="hasSearched">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Recherche en cours...</span>
            </div>
          </div>
  
          <div v-else-if="results.length === 0" class="text-center py-4">
            <i class="fas fa-user-slash fa-3x text-muted mb-3"></i>
            <p class="text-muted">Aucun patient trouvé</p>
          </div>
  
          <div v-else class="list-group">
            <a 
              v-for="patient in results" 
              :key="patient.patient_id"
              href="#"
              class="list-group-item list-group-item-action"
              @click.prevent="selectPatient(patient)"
            >
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">{{ patient.nom }} {{ patient.prenom }}</h5>
                <small>{{ formatDate(patient.date_naissance) }}</small>
              </div>
              <p class="mb-1">
                {{ patient.telephone }} - {{ patient.email }}
              </p>
              <small class="text-muted">
                {{ getLocationString(patient.localisation) }}
              </small>
            </a>
          </div>
        </div>
      </div>
    </div>
  </template>


// Script de PatientSearch.vue
<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import debounce from 'lodash/debounce';
import { usePatients } from '@/composables/usePatients';

// Router
const router = useRouter();

// États
const searchQuery = ref('');
const showAdvancedSearch = ref(false);
const hasSearched = ref(false);
const loading = ref(false);
const results = ref([]);
const localisations = ref([]);

const filters = ref({
 groupe_sanguin: '',
 localisation_id: '',
 age_range: '',
 donneur_organes: false
});

// Constantes
const groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Composables
const { searchPatients } = usePatients();

// Méthodes
const handleSearch = async () => {
 try {
   loading.value = true;
   hasSearched.value = true;

   const searchParams = {
     query: searchQuery.value,
     ...filters.value
   };

   const response = await searchPatients(searchParams);
   results.value = response.data;

 } catch (error) {
   console.error('Erreur lors de la recherche:', error);
   showErrorMessage('Erreur lors de la recherche des patients');
   results.value = [];
 } finally {
   loading.value = false;
 }
};

// Debounce la recherche pour éviter trop de requêtes
const debouncedSearch = debounce(handleSearch, 300);

const handleInput = () => {
 if (searchQuery.value.length >= 2) {
   debouncedSearch();
 } else if (searchQuery.value.length === 0) {
   results.value = [];
   hasSearched.value = false;
 }
};

const toggleAdvancedSearch = () => {
 showAdvancedSearch.value = !showAdvancedSearch.value;
};

const selectPatient = (patient) => {
 router.push(`/patients/${patient.patient_id}`);
};

const resetFilters = () => {
 filters.value = {
   groupe_sanguin: '',
   localisation_id: '',
   age_range: '',
   donneur_organes: false
 };
 handleSearch();
};

// Fetch localisations
const fetchLocalisations = async () => {
 try {
   const response = await api.get('/v1/localisations');
   localisations.value = response.data.data;
 } catch (error) {
   console.error('Erreur lors de la récupération des localisations:', error);
 }
};

// Helpers
const formatDate = (date) => {
 if (!date) return '';
 return new Date(date).toLocaleDateString('fr-FR');
};

const getLocationString = (localisation) => {
 if (!localisation) return 'Non spécifié';
 return `${localisation.region} - ${localisation.district_sanitaire}`;
};

const showErrorMessage = (message) => {
 // Implémenter votre système de notification
 console.error(message);
};

// Watch pour les filtres
watch(filters, () => {
 if (hasSearched.value) {
   handleSearch();
 }
}, { deep: true });

// Lifecycle hooks
onMounted(async () => {
 await fetchLocalisations();
});

// Nettoyage
onUnmounted(() => {
 debouncedSearch.cancel();
});

// Exports pour le template
defineExpose({
 searchQuery,
 results,
 loading,
 hasSearched
});
</script>

<style scoped>
.patient-search {
 margin-bottom: 20px;
}

.search-results {
 max-height: 500px;
 overflow-y: auto;
}

.list-group-item {
 transition: background-color 0.2s ease;
}

.list-group-item:hover {
 background-color: #f8f9fa;
}

.spinner-border {
 width: 3rem;
 height: 3rem;
}

/* Animation pour le toggle des filtres avancés */
.card-body {
 transition: all 0.3s ease-in-out;
}

.form-control-lg {
 height: calc(1.5em + 1rem + 2px);
}

.input-group .btn-outline-secondary {
 border-color: #ced4da;
}

.input-group .btn-outline-secondary:hover {
 background-color: #f8f9fa;
}

/* Responsive design */
@media (max-width: 768px) {
 .input-group {
   flex-direction: column;
 }
 
 .input-group > * {
   margin-bottom: 0.5rem;
   width: 100%;
 }
 
 .input-group > :last-child {
   margin-bottom: 0;
 }
}
</style>