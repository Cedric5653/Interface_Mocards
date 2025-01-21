
<template>
    <div class="user-profile">
        <div class="card">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-user-circle me-2"></i>
                    Profil Utilisateur
                </h5>
                <button 
                    class="btn btn-light btn-sm"
                    @click="editMode = !editMode"
                    v-if="!editMode"
                >
                    <i class="fas fa-edit me-1"></i>
                    Modifier
                </button>
            </div>

            <div class="card-body">
                <form @submit.prevent="handleSubmit" v-if="editMode">
                    <div class="row g-3">
                        <!-- Informations personnelles -->
                        <div class="col-md-6">
                            <label class="form-label required">Nom d'utilisateur</label>
                            <input 
                                type="text"
                                class="form-control"
                                v-model="formData.nom"
                                :class="{ 'is-invalid': errors.nom }"
                                required
                            >
                            <div class="invalid-feedback">{{ errors.nom }}</div>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label required">Email</label>
                            <input 
                                type="email"
                                class="form-control"
                                v-model="formData.email"
                                :class="{ 'is-invalid': errors.email }"
                                required
                            >
                            <div class="invalid-feedback">{{ errors.email }}</div>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">Nom</label>
                            <input 
                                type="text"
                                class="form-control"
                                v-model="formData.nom"
                            >
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">Prénom</label>
                            <input 
                                type="text"
                                class="form-control"
                                v-model="formData.prenom"
                            >
                        </div>

                        <!-- Boutons d'action -->
                        <div class="col-12 d-flex justify-content-end gap-2">
                            <button 
                                type="button" 
                                class="btn btn-secondary"
                                @click="cancelEdit"
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
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </form>

                <!-- Vue en lecture seule -->
                <div v-else>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="profile-info">
                                <h6 class="info-title">Informations du compte</h6>
                                <div class="info-item">
                                    <span class="label">Nom d'utilisateur:</span>
                                    <span>{{ user.nom }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Email:</span>
                                    <span>{{ user.email }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Rôle:</span>
                                    <span class="badge bg-info">{{ user.role?.role_name }}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="profile-info">
                                <h6 class="info-title">Informations personnelles</h6>
                                <div class="info-item">
                                    <span class="label">Nom:</span>
                                    <span>{{ user.nom || 'Non spécifié' }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Prénom:</span>
                                    <span>{{ user.prenom || 'Non spécifié' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Lien pour changer le mot de passe -->
                    <div class="mt-4 text-center">
                        <router-link 
                            to="/change-password"
                            class="btn btn-outline-primary"
                        >
                            <i class="fas fa-key me-2"></i>
                            Changer le mot de passe
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';

// États
const user = ref({});
const editMode = ref(false);
const errors = ref({});
const formData = ref({
    email: '',
    nom: '',
    prenom: ''
});

// Composables
const { loading, getUserProfile, updateProfile } = useAuth();

// Méthodes
const initializeForm = () => {
    formData.value = {
        // nom: user.value?.nom || '',
        email: user.value?.email || '',
        nom: user.value?.nom || '',
        prenom: user.value?.prenom || ''
    };
};

const handleSubmit = async () => {
    try {
        errors.value = {};
        const response = await updateProfile(formData.value);
        editMode.value = false;
        showSuccessMessage('Profil mis à jour avec succès');
    } catch (error) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
        }
        showErrorMessage("Erreur lors de la mise à jour du profil");
    }
};

const cancelEdit = () => {
    editMode.value = false;
    initializeForm();
    errors.value = {};
};

const showSuccessMessage = (message) => {
    // Implémenter votre système de notification
    console.log('Success:', message);
};

const showErrorMessage = (message) => {
    // Implémenter votre système de notification
    console.error('Error:', message);
};

// Lifecycle Hooks

onMounted(async () => {
    try {
        const profile = await getUserProfile();
        console.log('Profil utilisateur récupéré:', profile); // Vérifiez ici
        user.value = profile; 
        initializeForm();
    } catch (error) {
        console.error('Erreur lors de la récupération du profil utilisateur:', error);
    }
});


</script>

<style scoped>
.user-profile {
    max-width: 800px;
    margin: 0 auto;
}

.profile-info {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
}

.info-title {
    color: #0d6efd;
    border-bottom: 2px solid #0d6efd;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
}

.info-item {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.label {
    font-weight: 600;
    color: #6c757d;
}

.required::after {
    content: '*';
    color: red;
    margin-left: 4px;
}

@media (max-width: 768px) {
    .info-item {
        grid-template-columns: 1fr;
        gap: 0.25rem;
    }
}
</style>