<template>
    <div>
        <span>{{ message.success }}</span>
        <div
            v-if="loading"
            class="progress rounded-0"
            role="progressbar"
            aria-label="Animated striped example"
            aria-valuenow="100"
            aria-valuemin="0"
            aria-valuemax="100"
            style="height: 5px"
        >
            <div
                style="width: 100%"
                class="progress-bar bg-primary progress-bar-striped progress-bar-animated"
            ></div>
        </div>

        <div
            v-if="message.success"
            class="toast align-items-center text-bg-success"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <div class="d-flex">
                <div class="toast-body">
                    Hello, world! This is a toast message.
                </div>
                <button
                    type="button"
                    class="btn-close btn-close-white me-2 m-auto"
                    data-bs-dismiss="toast"
                    aria-label="Close"
                ></button>
            </div>
        </div>

        <div
            v-if="message.error"
            class="toast align-items-center text-bg-danger"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <div class="d-flex">
                <div class="toast-body">
                    Hello, world! This is a toast message.
                </div>
                <button
                    type="button"
                    class="btn-close btn-close-white me-2 m-auto"
                    data-bs-dismiss="toast"
                    aria-label="Close"
                ></button>
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue';
import { useApiResponse } from "../composables/useApiResponse";

export default {
    setup() {
        const { loading, message } = useApiResponse();

        // Clear messages after a short delay
        const clearMessages = () => {
            setTimeout(() => {
                //message.success = null;
                message.error = null;
            }, 3000);
        };

        return {
            loading,
            message,
            clearMessages,
        };
    },
};
</script>
