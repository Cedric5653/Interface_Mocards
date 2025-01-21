<template>
    <div class="dossier-list container-fluid py-4">
      <!-- En-tête -->
      <div class="header-section mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h4 class="text-primary mb-1">
              <i class="fas fa-folder-medical me-2"></i>
              Dossiers Médicaux
            </h4>
            <p class="text-muted mb-0">Gestion centralisée des dossiers patients</p>
          </div>
        </div>
      </div>
  
      <!-- Recherche avancée -->
      <div class="search-section card mb-4 border-0 shadow-sm">
        <div class="card-body">
          <div class="row g-4">
            <div class="col-lg-4">
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0">
                  <i class="fas fa-search text-muted"></i>
                </span>
                <input 
                  type="text"
                  v-model="search"
                  class="form-control border-start-0"
                  placeholder="Rechercher un patient..."
                >
              </div>
            </div>
            <div class="col-lg-3">
              <select v-model="filterType" class="form-select">
                <option value="">Tous les dossiers</option>
                <option value="recent">Consultations récentes</option>
                <option value="urgent">Cas urgents</option>
                <option value="suivi">En suivi</option>
              </select>
            </div>
            <div class="col-lg-3">
              <select v-model="sortBy" class="form-select">
                <option value="name">Trier par nom</option>
                <option value="date">Date de dernière consultation</option>
                <option value="priority">Priorité</option>
              </select>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Liste des dossiers -->
      <div class="row g-4">
        <div v-for="dossier in filteredDossiers" 
             :key="dossier.patient_id" 
             class="col-xl-3 col-lg-4 col-md-6">
          <div class="card h-100 border-0 shadow-sm hover-card">
            <div class="card-status-bar" :class="getStatusClass(dossier.status)"></div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="card-title mb-0">
                  {{ dossier.nom }} {{ dossier.prenom }}
                </h5>
                <span :class="getPriorityBadge(dossier.priority)">
                  {{ getPriorityLabel(dossier.priority) }}
                </span>
              </div>
              <div class="patient-info mb-3">
                <div class="info-item">
                  <i class="fas fa-birthday-cake text-muted me-2"></i>
                  {{ formatDate(dossier.date_naissance) }}
                </div>
                <div class="info-item">
                  <i class="fas fa-tint text-danger me-2"></i>
                  {{ dossier.groupe_sanguin || 'Non spécifié' }}
                </div>
                <div class="info-item">
                  <i class="fas fa-stethoscope text-muted me-2"></i>
                  Dernière visite: {{ formatDate(dossier.derniere_consultation) }}
                </div>
              </div>
  
              <div class="quick-stats d-flex justify-content-around mb-3">
                <div class="stat-item text-center">
                  <div class="stat-value">{{ dossier.nb_consultations }}</div>
                  <small class="text-muted">Consultations</small>
                </div>
                <div class="stat-item text-center">
                  <div class="stat-value">{{ dossier.nb_examens }}</div>
                  <small class="text-muted">Examens</small>
                </div>
              </div>
  
              <router-link 
                :to="`/dossier-medical/${dossier.patient_id}`"
                class="btn btn-primary w-100"
              >
                <i class="fas fa-folder-open me-2"></i>
                Accéder au dossier
              </router-link>
            </div>
          </div>
        </div>
  
        <!-- Message si aucun résultat -->
        <div v-if="filteredDossiers.length === 0" 
             class="col-12 text-center py-5">
          <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
          <p class="text-muted">Aucun dossier trouvé</p>
        </div>
      </div>
    </div>
  </template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDossierMedical } from '@/composables/useDossierMedical';

// États
const search = ref('');
const filterType = ref('');
const sortBy = ref('name');
const dossiers = ref([]);
const loading = ref(false);

// Composable
const { fetchDossiersList } = useDossierMedical();

// Computed
const filteredDossiers = computed(() => {
 let result = [...dossiers.value];

 // Recherche
 if (search.value) {
   const searchTerm = search.value.toLowerCase();
   result = result.filter(d => 
     d.nom.toLowerCase().includes(searchTerm) ||
     d.prenom.toLowerCase().includes(searchTerm)
   );
 }

 // Filtres
 switch(filterType.value) {
   case 'recent':
     result = result.filter(d => {
       const lastVisit = new Date(d.derniere_consultation);
       const oneMonthAgo = new Date();
       oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
       return lastVisit >= oneMonthAgo;
     });
     break;
   case 'urgent':
     result = result.filter(d => d.priority === 'high');
     break;
   case 'suivi':
     result = result.filter(d => d.status === 'suivi');
     break;
 }

 // Tri
 switch(sortBy.value) {
   case 'name':
     result.sort((a, b) => a.nom.localeCompare(b.nom));
     break;
   case 'date':
     result.sort((a, b) => 
       new Date(b.derniere_consultation) - new Date(a.derniere_consultation)
     );
     break;
   case 'priority':
     const priorityOrder = { high: 3, medium: 2, low: 1 };
     result.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
     break;
 }

 return result;
});

// Méthodes
const loadDossiers = async () => {
 try {
   loading.value = true;
   const response = await fetchDossiersList();
   dossiers.value = response.data;
 } catch (error) {
   console.error('Erreur chargement dossiers:', error);
 } finally {
   loading.value = false;
 }
};

const getStatusClass = (status) => ({
 'bg-success': status === 'actif',
 'bg-warning': status === 'suivi',
 'bg-danger': status === 'urgent'
});

const getPriorityBadge = (priority) => ({
 'badge bg-danger': priority === 'high',
 'badge bg-warning': priority === 'medium',
 'badge bg-success': priority === 'low'
});

const getPriorityLabel = (priority) => ({
 high: 'Urgent',
 medium: 'Normal',
 low: 'Stable'
}[priority]);

const formatDate = (date) => {
 return new Date(date).toLocaleDateString('fr-FR', {
   day: 'numeric',
   month: 'long',
   year: 'numeric'
 });
};

// Lifecycle
onMounted(() => {
 loadDossiers();
});
</script>

<style scoped>
.hover-card {
 transition: transform 0.2s;
}

.hover-card:hover {
 transform: translateY(-5px);
}

.card-status-bar {
 height: 4px;
 width: 100%;
 border-radius: 4px 4px 0 0;
}

.info-item {
 margin-bottom: 0.5rem;
 font-size: 0.9rem;
}

.stat-value {
 font-size: 1.5rem;
 font-weight: 600;
 color: #0d6efd;
}
</style>