
  <!-- ConsultationsPrenatales.vue -->
  <template>
    <div class="space-y-6">
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
  
      <div v-else class="bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-800">Consultations Prénatales</h3>
            <button @click="openNewConsultation"
              class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
              Nouvelle consultation
            </button>
          </div>
        </div>
  
        <div class="p-6">
          <div class="space-y-6">
            <div v-for="consultation in consultations" :key="consultation.id"
              class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-medium">{{ formatDate(consultation.date) }}</span>
                    <span class="text-sm text-gray-500">
                      {{ consultation.semaine_grossesse }} semaines
                    </span>
                  </div>
                  <p class="text-gray-600 mt-2">{{ consultation.observations }}</p>
                </div>
                <div class="flex space-x-2">
                  <button @click="viewDetails(consultation)"
                    class="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 rounded-md">
                    Détails
                  </button>
                  <button @click="editConsultation(consultation)"
                    class="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md">
                    Modifier
                  </button>
                </div>
              </div>
  
              <!-- Paramètres vitaux -->
              <div class="mt-4 grid grid-cols-4 gap-4">
                <div class="bg-white p-3 rounded-md">
                  <span class="text-sm text-gray-500">Poids</span>
                  <p class="font-medium">{{ consultation.poids }} kg</p>
                </div>
                <div class="bg-white p-3 rounded-md">
                  <span class="text-sm text-gray-500">Tension</span>
                  <p class="font-medium">{{ consultation.tension }}</p>
                </div>
                <div class="bg-white p-3 rounded-md">
                  <span class="text-sm text-gray-500">HU</span>
                  <p class="font-medium">{{ consultation.hauteur_uterine }} cm</p>
                </div>
                <div class="bg-white p-3 rounded-md">
                  <span class="text-sm text-gray-500">BCF</span>
                  <p class="font-medium">{{ consultation.bcf }} bpm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal Nouvelle Consultation -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white rounded-lg w-full max-w-2xl mx-4">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800">
              {{ editingConsultation ? 'Modifier la consultation' : 'Nouvelle consultation' }}
            </h3>
          </div>
  
          <form @submit.prevent="saveConsultation" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" v-model="consultationForm.date" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Semaine de grossesse</label>
                <input type="number" v-model="consultationForm.semaine_grossesse" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
            </div>
  
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Poids (kg)</label>
                <input type="number" step="0.1" v-model="consultationForm.poids"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tension artérielle</label>
                <input type="text" v-model="consultationForm.tension"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
            </div>
  
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Hauteur utérine (cm)</label>
                <input type="number" v-model="consultationForm.hauteur_uterine"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">BCF (bpm)</label>
                <input type="number" v-model="consultationForm.bcf"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
            </div>
  
            <div>
              <label class="block text-sm font-medium text-gray-700">Observations</label>
              <textarea v-model="consultationForm.observations" rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
            </div>
  
            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" @click="closeModal"
                class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded">
                Annuler
              </button>
              <button type="submit"
                class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                {{ editingConsultation ? 'Mettre à jour' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useCarnetMaternite } from '../composables/useCarnetMaternite';
  
  const props = defineProps({
    carnetId: {
      type: Number,
      required: true
    }
  });
  
  const { consultations, loading, getConsultationsPrenatales } = useCarnetMaternite();
  const showModal = ref(false);
  const editingConsultation = ref(null);
  const consultationForm = ref({
    date: '',
    semaine_grossesse: '',
    poids: '',
    tension: '',
    hauteur_uterine: '',
    bcf: '',
    observations: ''
  });
  
  onMounted(async () => {
    await getConsultationsPrenatales(props.carnetId);
  });
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };
  
  const openNewConsultation = () => {
    editingConsultation.value = null;
    consultationForm.value = {
      date: new Date().toISOString().split('T')[0],
      semaine_grossesse: '',
      poids: '',
      tension: '',
      hauteur_uterine: '',
      bcf: '',
      observations: ''
    };
    showModal.value = true;
  };
  
  const editConsultation = (consultation) => {
    editingConsultation.value = consultation;
    consultationForm.value = { ...consultation };
    showModal.value = true;
  };
  
  const closeModal = () => {
    showModal.value = false;
    editingConsultation.value = null;
    consultationForm.value = {};
  };
  
  const saveConsultation = async () => {
    try {
      if (editingConsultation.value) {
        // Mettre à jour consultation existante
        await updateConsultation(editingConsultation.value.id, consultationForm.value);
      } else {
        // Créer nouvelle consultation
        await createConsultation({
          ...consultationForm.value,
          carnet_id: props.carnetId
        });
      }
      await getConsultationsPrenatales(props.carnetId);
      closeModal();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la consultation:', error);
    }
  };
  
  const viewDetails = (consultation) => {
    // Implémenter l'affichage détaillé si nécessaire
    console.log('Voir détails:', consultation);
  };
  </script>