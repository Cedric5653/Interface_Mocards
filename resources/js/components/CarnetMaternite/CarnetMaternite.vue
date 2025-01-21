<!-- CarnetMaternite.vue -->
<template>
    <div class="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-md">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-indigo-600">Carnet de Maternité</h1>
        <p class="text-gray-600">Suivi de grossesse et consultations prénatales</p>
      </header>
  
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
  
      <div v-else-if="carnet" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Informations générales -->
          <div class="bg-gray-50 p-6 rounded-lg">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Informations Générales</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Date de début:</span>
                <span class="font-medium">{{ formatDate(carnet.date_debut_grossesse) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Nombre de grossesses:</span>
                <span class="font-medium">{{ carnet.nombre_grossesses }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Groupe sanguin:</span>
                <span class="font-medium">{{ carnet.groupage_sanguin }}</span>
              </div>
            </div>
          </div>
  
          <!-- Statut et actions -->
          <div class="bg-gray-50 p-6 rounded-lg">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Statut du Suivi</h2>
            <div class="space-y-4">
              <div class="flex items-center">
                <span class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="{
                    'bg-green-100 text-green-800': carnet.statut === 'termine',
                    'bg-yellow-100 text-yellow-800': carnet.statut === 'en_cours',
                    'bg-gray-100 text-gray-800': carnet.statut === 'vierge'
                  }">
                  {{ formatStatus(carnet.statut) }}
                </span>
              </div>
              <div class="flex space-x-4">
                <button @click="openEditModal" 
                  class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                  Modifier
                </button>
                <button v-if="carnet.statut === 'en_cours'" @click="terminerSuivi"
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                  Terminer le suivi
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Navigation des sections -->
        <nav class="border-b border-gray-200">
          <div class="flex space-x-8">
            <button @click="activeTab = 'suivi'"
              :class="['px-3 py-2 font-medium text-sm', 
                activeTab === 'suivi' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700']">
              Suivi de Grossesse
            </button>
            <button @click="activeTab = 'consultations'"
              :class="['px-3 py-2 font-medium text-sm',
                activeTab === 'consultations' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700']">
              Consultations Prénatales
            </button>
          </div>
        </nav>
  
        <!-- Contenu dynamique -->
        <div class="mt-6">
          <SuiviGrossesse v-if="activeTab === 'suivi'" :carnetId="carnet.id" />
          <ConsultationsPrenatales v-else :carnetId="carnet.id" />
        </div>
      </div>
  
      <div v-else class="text-center py-12">
        <p class="text-gray-600">Aucun carnet de maternité trouvé.</p>
        <button @click="openCreateModal"
          class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
          Créer un nouveau carnet
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useCarnetMaternite } from '../composables/useCarnetMaternite';
  import SuiviGrossesse from './SuiviGrossesse.vue';
  import ConsultationsPrenatales from './ConsultationsPrenatales.vue';
  
  const { carnet, loading, fetchCarnetMaternite, updateCarnetMaternite } = useCarnetMaternite();
  const activeTab = ref('suivi');
  
  const props = defineProps({
    patientId: {
      type: Number,
      required: true
    }
  });
  
  onMounted(async () => {
    await fetchCarnetMaternite(props.patientId);
  });
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };
  
  const formatStatus = (status) => {
    const statusMap = {
      vierge: 'Non démarré',
      en_cours: 'En cours',
      termine: 'Terminé'
    };
    return statusMap[status] || status;
  };
  
  const terminerSuivi = async () => {
    try {
      await updateCarnetMaternite(carnet.value.id, { statut: 'termine' });
    } catch (error) {
      console.error('Erreur lors de la finalisation du suivi:', error);
    }
  };
  </script>
