<!-- PatientsList.vue -->
<template>
    <div class="patients-list">
      <!-- En-tête avec recherche et filtres -->
    <div class="card mb-4">
    <div class="card-header bg-primary text-white">
        <div class="d-flex justify-content-between align-items-center">
        <h4 class="mb-0">
            <i class="fas fa-users"></i> Liste des Patients
        </h4>
        <div class="d-flex gap-3">
            <div class="search-box d-flex">
            <div class="input-group">
                <span class="input-group-text">
                <i class="fas fa-search"></i>
                </span>
                <input 
                type="text"
                class="form-control"
                v-model="searchQuery"
                placeholder="Rechercher un patient..."
                @input="handleSearch"
                >
            </div>
            </div>
            <button 
            class="btn btn-success"
            @click="showAddPatientForm"
            >
            <i class="fas fa-plus"></i> Nouveau Patient
            </button>
        </div>
        </div>
    </div>

    <!-- Filtres avancés -->
    <div class="card-body border-bottom">
        <div class="row g-3">
        <div class="col-md-3">
            <label class="form-label">Localisation</label>
            <select class="form-select" v-model="filters.localisation">
            <option value="">Toutes les localisations</option>
            <option 
                v-for="loc in localisations" 
                :key="loc.localisation_id" 
                :value="loc.localisation_id"
            >
                {{ loc.region }} - {{ loc.district_sanitaire }}
            </option>
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label">Groupe Sanguin</label>
            <select class="form-select" v-model="filters.groupeSanguin">
            <option value="">Tous les groupes</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label">Statut</label>
            <select class="form-select" v-model="filters.statut">
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            </select>
        </div>
        <div class="col-md-3 d-flex align-items-end">
            <button 
            class="btn btn-outline-secondary w-100"
            @click="resetFilters"
            >
            <i class="fas fa-undo"></i> Réinitialiser
            </button>
        </div>
        </div>
    </div>

    <!-- Liste des patients -->
    <div class="card-body p-0">
        <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead class="table-light">
            <tr>
                <th>ID</th>
                <th>Nom & Prénom</th>
                <th>
                <i class="fas fa-calendar"></i> Date de naissance
                </th>
                <th>
                <i class="fas fa-tint"></i> Groupe Sanguin
                </th>
                <th>
                <i class="fas fa-phone"></i> Contact
                </th>
                <th>
                <i class="fas fa-map-marker-alt"></i> Localisation
                </th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="loading" class="text-center">
                <td colspan="7">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
                </td>
            </tr>
            <tr v-else-if="filteredPatients.length === 0">
                <td colspan="7" class="text-center py-4">
                <div class="text-muted">
                    <i class="fas fa-user-slash fa-2x mb-2"></i>
                    <p>Aucun patient trouvé</p>
                </div>
                </td>
            </tr>
            <tr 
                v-else
                v-for="patient in paginatedPatients" 
                :key="patient.patient_id"
                @click="viewPatientDetails(patient)"
                class="cursor-pointer"
            >
                <td>{{ patient.patient_id }}</td>
                <td>
                <div class="d-flex align-items-center">
                    <div class="patient-avatar me-2">
                    {{ getInitials(patient.nom, patient.prenom) }}
                    </div>
                    <div>
                    <strong>{{ patient.nom }} {{ patient.prenom }}</strong>
                    <br>
                    <small class="text-muted">
                        {{ getAge(patient.date_naissance) }} ans
                    </small>
                    </div>
                </div>
                </td>
                <td>{{ formatDate(patient.date_naissance) }}</td>
                <td>
                <span class="badge bg-info">
                    {{ patient.groupe_sanguin || 'Non spécifié' }}
                </span>
                </td>
                <td>
                <div>{{ patient.telephone }}</div>
                <small class="text-muted">{{ patient.email }}</small>
                </td>
                <td>{{ getLocationString(patient.localisation) }}</td>
                <td>
                <div class="btn-group">
                    <button 
                    class="btn btn-sm btn-outline-primary"
                    @click.stop="editPatient(patient)"
                    title="Modifier"
                    >
                    <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-info"
                      @click.stop="viewPatientDetails(patient)"
                      title="Voir les détails"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <!-- <router-link 
                      :to="`/patients/${patient.patient_id}`" 
                      class="btn btn-sm btn-outline-info" 
                      title="Voir les détails"
                    >
                      <i class="fas fa-eye"></i>
                    </router-link> -->
                    <button 
                    class="btn btn-sm btn-outline-danger"
                    @click.stop="confirmDelete(patient)"
                    title="Supprimer"
                    >
                    <i class="fas fa-trash"></i>
                    </button>
                </div>
                </td>
            </tr>
            </tbody>
        </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center p-3 border-top">
        <div>
            Affichage {{ startIndex + 1 }} à {{ endIndex }} sur {{ filteredPatients.length }} patients
        </div>
        <router-link to="/dashboard" class="btn btn-outline-primary text-decoration-none">
              <i class="fas fa-arrow-left me-2"></i>
              Retour
        </router-link>
        <nav v-if="totalPages > 1">
            <ul class="pagination mb-0">
            <li 
                class="page-item"
                :class="{ disabled: currentPage === 1 }"
            >
                <a 
                class="page-link" 
                href="#"
                @click.prevent="changePage(currentPage - 1)"
                >
                Précédent
                </a>
            </li>
            <li 
                v-for="page in pageNumbers" 
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
            >
                <a 
                class="page-link" 
                href="#"
                @click.prevent="changePage(page)"
                >
                {{ page }}
                </a>
            </li>
            <li 
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
            >
                <a 
                class="page-link" 
                href="#"
                @click.prevent="changePage(currentPage + 1)"
                >
                Suivant
                </a>
            </li>
            </ul>
        </nav>
        </div>
    </div>
    </div>

      <!-- Modals pour ajout/modification et suppression -->

          <!-- Modal Ajout/Modification Patient -->
    <div class="modal fade" id="patientModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editMode ? 'Modifier le patient' : 'Nouveau patient' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePatient" class="row g-3">
              <!-- Informations personnelles -->
              <div class="col-md-6">
                <label class="form-label">Nom <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="formData.nom"
                  required
                  :class="{ 'is-invalid': errors.nom }"
                >
                <div class="invalid-feedback">{{ errors.nom }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Prénom <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="formData.prenom"
                  required
                  :class="{ 'is-invalid': errors.prenom }"
                >
                <div class="invalid-feedback">{{ errors.prenom }}</div>
              </div>
  
              <div class="col-md-6">
                <label class="form-label">Date de naissance <span class="text-danger">*</span></label>
                <input 
                  type="date" 
                  class="form-control"
                  v-model="formData.date_naissance"
                  required
                  :class="{ 'is-invalid': errors.date_naissance }"
                >
                <div class="invalid-feedback">{{ errors.date_naissance }}</div>
              </div>
  
              <div class="col-md-6">
                <label class="form-label">Groupe sanguin</label>
                <select class="form-select" v-model="formData.groupe_sanguin">
                  <option value="">Sélectionner</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
  
              <!-- Contact -->
              <div class="col-md-6">
                <label class="form-label">Téléphone</label>
                <input 
                  type="tel" 
                  class="form-control"
                  v-model="formData.telephone"
                  :class="{ 'is-invalid': errors.telephone }"
                >
                <div class="invalid-feedback">{{ errors.telephone }}</div>
              </div>
  
              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control"
                  v-model="formData.email"
                  :class="{ 'is-invalid': errors.email }"
                >
                <div class="invalid-feedback">{{ errors.email }}</div>
              </div>
  
              <!-- Localisation -->
              <div class="col-12">
                <label class="form-label">Adresse</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="formData.adresse"
                >
              </div>
  
              <div class="col-md-6">
                <label class="form-label">Localisation <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  v-model="formData.localisation_id"
                  
                  :class="{ 'is-invalid': errors.localisation_id }"
                >
                  <option value="">Sélectionner</option>
                  <option 
                    v-for="loc in localisations" 
                    :key="loc.localisation_id" 
                    :value="loc.localisation_id"
                  >
                    {{ loc.region }} - {{ loc.district_sanitaire }}
                  </option>
                </select>
                <div class="invalid-feedback">{{ errors.localisation_id }}</div>
              </div>
  
              <!-- Autres informations -->
              <div class="col-md-6">
                <label class="form-label">Profession</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="formData.profession"
                >
              </div>
  
              <div class="col-12">
                <div class="form-check">
                  <input 
                    type="checkbox" 
                    class="form-check-input"
                    v-model="formData.donneur_organes"
                    id="donneur_organes"
                  >
                  <label class="form-check-label" for="donneur_organes">
                    Donneur d'organes
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Annuler
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="saving"
              @click="savePatient"
            >
              <span 
                class="spinner-border spinner-border-sm me-1" 
                v-if="saving"
              ></span>
              {{ editMode ? 'Modifier' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Modal de confirmation de suppression -->
    <div class="modal fade" id="deleteModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            Êtes-vous sûr de vouloir supprimer ce patient ?
            <p class="text-danger mt-2 mb-0">
              <i class="fas fa-exclamation-triangle"></i>
              Cette action est irréversible.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Annuler
            </button>
            <button 
              type="button" 
              class="btn btn-danger"
              :disabled="deleting"
              @click="deletePatient"
            >
              <span 
                class="spinner-border spinner-border-sm me-1" 
                v-if="deleting"
              ></span>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>  
</div>
</template>
  


<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { Modal } from 'bootstrap';
  import { usePatients } from '@/composables/usePatients';
  import { useRouter } from 'vue-router';
  import { useLocalisations } from '@/composables/useLocalisations';



// Importer le composable pour localisations
const { localisations, fetchLocalisations } = useLocalisations();

  
  // États
  const searchQuery = ref('');
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const editMode = ref(false);
  const saving = ref(false);
  const deleting = ref(false);
  const errors = ref({});
  
  const formData = ref({
    nom: '',
    prenom: '',
    date_naissance: '',
    groupe_sanguin: '',
    telephone: '',
    email: '',
    adresse: '',
    localisation_id: '',
    profession: '',
    donneur_organes: false
  });
  
  const filters = ref({
    localisation: '',
    groupeSanguin: '',
    statut: ''
  });
  
  // Modals
  let patientModal = null;
  let deleteModal = null;
  let selectedPatient = null;
  
  // Composables
  const { 
    patients, 
    loading, 
    fetchPatients, 
    createPatient, 
    updatePatient, 
    deletePatient: removePatient 
  } = usePatients();
  
  const router = useRouter();
  
  // Computed
  const filteredPatients = computed(() => {
    let filtered = [...patients.value];
  
    // Filtre par recherche
    if (searchQuery.value) {
      const search = searchQuery.value.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.nom.toLowerCase().includes(search) ||
        patient.prenom.toLowerCase().includes(search) ||
        patient.telephone?.includes(search)
      );
    }
  
    // Autres filtres
    if (filters.value.localisation) {
      filtered = filtered.filter(p => p.localisation_id === filters.value.localisation);
    }
    if (filters.value.groupeSanguin) {
      filtered = filtered.filter(p => p.groupe_sanguin === filters.value.groupeSanguin);
    }
    if (filters.value.statut) {
      filtered = filtered.filter(p => p.statut === filters.value.statut);
    }
  
    return filtered;
  });
    

    // Computed pour la pagination
    const paginatedPatients = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        return filteredPatients.value.slice(start, end);
    });

    const totalPages = computed(() => {
        return Math.ceil(filteredPatients.value.length / itemsPerPage.value);
    });

    const pageNumbers = computed(() => {
        const pages = [];
        for (let i = 1; i <= totalPages.value; i++) {
            pages.push(i);
        }
        return pages;
    });

    const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
    const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredPatients.value.length));

    // Méthodes
    const handleSearch = () => {
        currentPage.value = 1;
    };

    const resetFilters = () => {
        filters.value = {
            localisation: '',
            groupeSanguin: '',
            statut: ''
        };
        searchQuery.value = '';
        currentPage.value = 1;
    };

    const showAddPatientForm = () => {
        editMode.value = false;
        resetForm();
        patientModal.show();
    };

    const editPatient = (patient) => {
        editMode.value = true;
        selectedPatient = patient;
        formData.value = { ...patient };
        patientModal.show();
    };

    const savePatient = async () => {
        try {
            saving.value = true;
            errors.value = {};

            if (editMode.value) {
                await updatePatient(selectedPatient.patient_id, formData.value);
            } else {
                await createPatient(formData.value);
            }

            patientModal.hide();
            resetForm();
            await fetchPatients();
            showToast(
                editMode.value ? 'Patient modifié avec succès' : 'Patient créé avec succès',
                'success'
            );
        } catch (error) {
            if (error.response?.data?.errors) {
                errors.value = error.response.data.errors;
            }
            showToast(
                'Une erreur est survenue. Veuillez réessayer.',
                'error'
            );
        } finally {
            saving.value = false;
        }
    };

    const confirmDelete = (patient) => {
        selectedPatient = patient;
        deleteModal.show();
    };

    const deletePatient = async () => {
        try {
            deleting.value = true;
            await removePatient(selectedPatient.patient_id);
            deleteModal.hide();
            await fetchPatients();
            showToast('Patient supprimé avec succès', 'success');
        } catch (error) {
            showToast(
                'Une erreur est survenue lors de la suppression',
                'error'
            );
        } finally {
            deleting.value = false;
        }
    };

    const viewPatientDetails = () => {
        router.push(`/patients/${patients.patient_id}`);
    };
    // const viewPatientDetails = (patient) => {
    //   router.push({ name: 'PatientDetails', params: { id: patient.patient_id } });
    // };


    const changePage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
        }
    };

    // Helpers
    const getInitials = (nom, prenom) => {
        return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase();
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const getAge = (dateNaissance) => {
        const today = new Date();
        const birthDate = new Date(dateNaissance);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const getLocationString = (localisation) => {
        if (!localisation) return 'Non spécifié';
        return `${localisation.region} - ${localisation.district_sanitaire}`;
    };

    const resetForm = () => {
        formData.value = {
            nom: '',
            prenom: '',
            date_naissance: '',
            groupe_sanguin: '',
            telephone: '',
            email: '',
            adresse: '',
            localisation_id: '',
            profession: '',
            donneur_organes: false
        };
        errors.value = {};
    };

    const showToast = (message, type = 'success') => {
        // Implémenter votre logique de notification ici
        // Par exemple avec vue-toastification ou autre
    };


    // Lifecycle hooks
    onMounted(async () => {
        patientModal = new Modal(document.getElementById('patientModal'));
        deleteModal = new Modal(document.getElementById('deleteModal'));
        
        await Promise.all([
            fetchPatients(),
            fetchLocalisations()
        ]);
    });

    // // Watch pour la recherche
    // watch([searchQuery, filters], () => {
    //     currentPage.value = 1;
    // });

</script>
  

  <style scoped>
  .patients-list {
    min-height: 400px;
  }
  
  .patient-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #495057;
  }
  
  .cursor-pointer {
    cursor: pointer;
  }
  
  .cursor-pointer:hover {
    background-color: #f8f9fa;
  }
  
  .table th {
    white-space: nowrap;
  }
  
  /* Animation de chargement */
  .spinner-border {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .d-flex.gap-3 {
      flex-direction: column;
      gap: 1rem !important;
    }
  
    .search-box {
      width: 100%;
    }
  
    .btn-success {
      width: 100%;
    }
  }
  </style>

