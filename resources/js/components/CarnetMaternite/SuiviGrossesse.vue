 <!-- SuiviGrossesse.vue -->
 <template>
    <div class="space-y-6">
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
  
      <div v-else-if="suiviGrossesse" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Paramètres vitaux -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Paramètres Vitaux</h3>
          <LineChart :data="vitalsData" class="h-64" />
        </div>
  
        <!-- Échographies -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Échographies</h3>
          <div class="space-y-4">
            <div v-for="echo in suiviGrossesse.echographies" :key="echo.date" 
              class="p-4 bg-gray-50 rounded">
              <div class="flex justify-between items-center">
                <span class="font-medium">{{ formatDate(echo.date) }}</span>
                <span class="text-gray-600">{{ echo.semaine_grossesse }} SA</span>
              </div>
              <p class="mt-2 text-gray-600">{{ echo.observations }}</p>
            </div>
          </div>
        </div>
  
        <!-- Analyses biologiques -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Analyses Biologiques</h3>
          <table class="min-w-full">
            <thead>
              <tr>
                <th class="text-left text-gray-600">Date</th>
                <th class="text-left text-gray-600">Type</th>
                <th class="text-left text-gray-600">Résultat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="analyse in suiviGrossesse.analyses" :key="analyse.date">
                <td class="py-2">{{ formatDate(analyse.date) }}</td>
                <td class="py-2">{{ analyse.type }}</td>
                <td class="py-2">{{ analyse.resultat }}</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Recommandations -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Recommandations</h3>
          <div class="space-y-3">
            <div v-for="(reco, index) in suiviGrossesse.recommandations" :key="index"
              class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <span class="inline-block w-2 h-2 rounded-full bg-indigo-500 mt-2"></span>
              </div>
              <p class="text-gray-600">{{ reco }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import { useCarnetMaternite } from '../composables/useCarnetMaternite';
  import { LineChart } from 'recharts';
  
  const props = defineProps({
    carnetId: {
      type: Number,
      required: true
    }
  });
  
  const { suiviGrossesse, loading, getSuiviGrossesse } = useCarnetMaternite();
  
  onMounted(async () => {
    await getSuiviGrossesse(props.carnetId);
  });
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };
  </script>
