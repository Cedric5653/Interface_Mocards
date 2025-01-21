
<template>
    <div class="login-container">
        <div class="card login-card">
            <div class="card-header bg-primary text-white text-center">
                <h4 class="mb-0">
                    <i class="fas fa-hospital-user me-2"></i>
                    Connexion au Système de Santé
                </h4>
            </div>

            <div class="card-body">
                <!-- Message d'erreur -->
                <div 
                    v-if="errorMessage"
                    class="alert alert-danger alert-dismissible fade show"
                >
                    <i class="fas fa-exclamation-circle me-2"></i>
                    {{ errorMessage }}
                    <button 
                        type="button" 
                        class="btn-close"
                        @click="errorMessage = ''"
                    ></button>
                </div>

                <form @submit.prevent="handleLogin">
                    <!-- Email -->
                    <div class="mb-3">
                        <label class="form-label required">Email</label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="fas fa-envelope"></i>
                            </span>
                            <input 
                                type="email"
                                class="form-control"
                                v-model="formData.email"
                                required
                                :class="{ 'is-invalid': errors.email }"
                                placeholder="votre@email.com"
                                autofocus
                            >
                            <div class="invalid-feedback">{{ errors.email }}</div>
                        </div>
                    </div>

                    <!-- Mot de passe -->
                    <div class="mb-4">
                        <label class="form-label required">Mot de passe</label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="fas fa-lock"></i>
                            </span>
                            <input 
                                :type="showPassword ? 'text' : 'password'"
                                class="form-control"
                                v-model="formData.password"
                                required
                                :class="{ 'is-invalid': errors.password }"
                                placeholder="Votre mot de passe"
                            >
                            <button 
                                class="btn btn-outline-secondary" 
                                type="button"
                                @click="showPassword = !showPassword"
                            >
                                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                            <div class="invalid-feedback">{{ errors.password }}</div>
                        </div>
                    </div>

                    <!-- Se souvenir de moi -->
                    <div class="mb-4">
                        <div class="form-check">
                            <input 
                                type="checkbox"
                                class="form-check-input"
                                id="remember"
                                v-model="formData.remember"
                            >
                            <label class="form-check-label" for="remember">
                                Se souvenir de moi
                            </label>
                        </div>
                    </div>

                    <!-- Bouton de connexion -->
                    <button 
                        type="submit" 
                        class="btn btn-primary w-100"
                        :disabled="loading"
                    >
                        <span 
                            class="spinner-border spinner-border-sm me-2" 
                            v-if="loading"
                        ></span>
                        Se connecter
                    </button>
                </form>
            </div>

            

            <div class="card-footer text-center">
                <a href="#" class="text-decoration-none" @click.prevent="forgotPassword">
                    Mot de passe oublié ?
                </a>
                <router-link to="/register" class="text-decoration-none">
                Créer un compte
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref , onMounted} from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useToast } from 'vue-toastification';


const router = useRouter();
const { login, loading } = useAuth();

// États
const formData = ref({
    email: '',
    password: '',
    remember: false
});
const errors = ref({});
const errorMessage = ref('');
const showPassword = ref(false);

const toast = useToast();

const showSuccessMessage = (message) => {
    toast.success(message, {
        timeout: 2000,
        position: "top-right"
    });
};

const showErrorMessage = (message) => {
    toast.error(message, {
        timeout: 4000,
        position: "top-right"
    });
};


const handleLogin = async () => {
    try {
        errors.value = {};
        errorMessage.value = '';

        const response = await login(formData.value);
        
        if (response.status === 'success') {
            showSuccessMessage('Connexion réussie');
            router.push('/dashboard');
        } else {
            errorMessage.value = response.message || "Erreur de connexion";
        }
    } catch (error) {
        console.error('Erreur:', error);
        if (error.response?.status === 401) {
            showErrorMessage.value = "Email ou mot de passe incorrect";
        } else if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
        } else {
            errorMessage.value = error.response?.data?.message || "Erreur lors de la connexion";
        }
    }
};

const forgotPassword = () => {
    router.push('/forgot-password');
};

// cycle de vie
onMounted(() => {
    // Vérifier si l'utilisateur vient de s'inscrire
    const route = useRouter(); 
    const registered = route?.query?.registered;
    const email = route?.query?.email;
    
    if (registered === 'success') {
        showSuccessMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        if (email) {
            formData.value.email = email;
        }
    }
});

</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    padding: 1rem;
}

.login-card {
    width: 100%;
    max-width: 400px;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.required::after {
    content: '*';
    color: red;
    margin-left: 4px;
}

.input-group-text {
    background-color: #f8f9fa;
}

.input-group-text i {
    width: 16px;
}

@media (max-width: 576px) {
    .login-card {
        margin: 1rem;
    }
}
</style>