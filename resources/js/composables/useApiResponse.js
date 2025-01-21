
import { ref, computed } from 'vue';

//const loadingState = ref({ loadingCounter: 0 });
const defaultMessage = { success: null, error: null };
const loading = ref(false);

export function useApiResponse() {
  const success = ref(null);
  const code = ref(null);
  const error = ref(null);
  const data = ref(null);
  const message = ref({ ...defaultMessage });
  const loadingState = ref({ loadingCounter: 0 });

  function setApiResponse(response) {
    success.value = response.success;
    code.value = response.code;
    // error.value = response.body.error_message || null;
    // data.value = response.body.response_data || null;
    error.value = response.body ? response.body.error_message || null : null;
    data.value = response.body ? response.body.response_data || null : null;

    loadingState.value.loadingCounter = Math.max(0, loadingState.value.loadingCounter - 1);

    // Set the success or error message
    if (success.value !== null) {
      message.value = { success: 'Operation successful!', error: null };
    } else {
      message.value = { success: null, error: 'Operation failed. Please try again.' };
    }

    // Update the loading value based on the counter
    loading.value = loadingState.value.loadingCounter > 0;
  }

  return { success, code, error, data, loading, message, setApiResponse, loadingState };
}
