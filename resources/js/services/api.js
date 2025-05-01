
import axios from 'axios';
import { ref } from 'vue';
import { useApiResponse } from '../composables/useApiResponse';

// Utilisation de useApiResponse
const { loading, setApiResponse, loadingState, message } = useApiResponse();
const apiKey ="o5d2i9bp-g9q4-4n8l-8p02-q4j5b9opbf5u";

// Création de l'instance Axios pour l'API
const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",// Votre URL d'API Laravel 
  withCredentials: true, // Utilisation des credentials
  headers: {
    'X-API-KEY': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});


// Interceptor pour inclure le jeton d'authentification dans toutes les requêtes
// apiClient.interceptors.request.use(
//   (config) => {
//     loadingState.value.loadingCounter++;
//     loading.value = loadingState.value.loadingCounter > 0;
//     return config;
//   },
//   (error) => {
//     loadingState.value.loadingCounter--;
//     return Promise.reject(error);
//   }
// );

apiClient.interceptors.request.use(
  (config) => {
    loadingState.value.loadingCounter++;
    loading.value = loadingState.value.loadingCounter > 0;
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    loadingState.value.loadingCounter--;
    return Promise.reject(error);
  }
);

// Interceptor pour gérer la réponse de l'API
apiClient.interceptors.response.use(
  (response) => {
    loadingState.value.loadingCounter--;
    loading.value = loadingState.value.loadingCounter > 0;
    return response;
  },
  (error) => {
    loadingState.value.loadingCounter--;
    loading.value = loadingState.value.loadingCounter > 0;
    return Promise.reject(error);
  }
);



export default apiClient;


