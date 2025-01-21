<template>
    <div>
    <!-- Recherche client -->
    <div>
        Recherche client
        <form>
        <fieldset>
            <div class="mb-3">
            <select id="disabledSelect" class="form-select" @change="selectionner()" v-model="oidChoisi">
                <option v-for="item in clients" :key="item.oid_client" :value="item.oid_client">
                {{ item.nom_client }}
                </option>
            </select>
            </div>

            <!-- Ajouter client -->
            <div class="row">
            <div class="col-6">
                <div class="form-check form-switch">
                <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="modifier_client"
                    v-model="isEditing"
                    :disabled="!isClientSelected"
                    @change="handleEditToggle"
                />
                <label class="form-check-label" for="modifier_client">Modifier</label>
                </div>
            </div>
            <div class="col-6 text-center">
                <button type="button" class="btn btn-primary" @click="handleButtonClick">
                    {{ buttonLabel }}
                </button>
            </div>
            </div>

            <!-- Formulaire -->
            <hr />
            <div class="border">
            <h2 class="mb-12 text-center">CLIENT</h2>
            <form class="p-2" style="max-width: 100%" @submit.prevent="handleSubmit">
                <div class="form-row row">
                <div class="col-lg-12">
                    <div class="input-group mb-2" >
                        <span class="col-lg-4 input-group-text">N° Client <span class="text-danger font-weight-bold">*</span></span>
                        <input
                            class="col-lg-8 form-control"
                            type="text"
                            id="champ1"
                            v-model="clientChoisi.oid_client"
                            :disabled="!isFormEditable || isClientSelected"
                        />
                        <span v-if="errors.oid_client" class="text-danger">{{ errors.oid_client }}</span>
                    </div>

                    <div class="input-group mb-2">
                    <span class="col-lg-4 col-md-4 col-xs-4 input-group-text">Nom<span class="text-danger font-weight-bold">*</span></span>
                    <input
                        class="col-lg-8 form-control"
                        type="text"
                        id="champ2"
                        v-model="clientChoisi.nom_client"
                        :disabled="!isFormEditable"
                    />
                    <span v-if="errors.nom_client" class="text-danger">{{ errors.nom_client }}</span>
                    </div>
                    <!-- Add composante facture_head avec un :disabled="!isFormEditable" -->


                    <div class="input-group mb-2">
                    <span class="col-lg-4 input-group-text">Prenom<span class="text-danger font-weight-bold">*</span></span>
                    <input
                        type="text"
                        class="form-control col-lg-8"
                        id="champ3"
                        v-model="clientChoisi.prenom_client"
                        :disabled="!isFormEditable"
                    />
                    <span v-if="errors.prenom_client" class="text-danger">{{ errors.prenom_client }}</span>
                    </div>
                    <div class="input-group mb-2">
                    <span class="col-lg-4 input-group-text">Sexe</span>
                    <select class="col-lg-8 form-select" id="champ4" v-model="clientChoisi.genre" :disabled="!isFormEditable">
                        <option value="">Choisir le sexe</option>
                        <option value="h">Homme</option>
                        <option value="f">Femme</option>
                    </select>
                </div>
                    <div class="input-group mb-2">
                    <span class="col-lg-4 input-group-text">Nationalité</span>
                    <input
                        type="text"
                        class="form-control col-lg-8"
                        id="champ5"
                        v-model="clientChoisi.nationalite"
                        :disabled="!isFormEditable"
                    />

                    </div>
                    <div class="input-group mb-2">
                    <span class="col-lg-4 input-group-text">Ville</span>
                    <input
                        type="text"
                        class="form-control col-lg-8"
                        id="champ6"
                        v-model="clientChoisi.ville_client"
                        :disabled="!isFormEditable"
                    />
                    </div>
                    <div class="input-group mb-2">
                    <span class="col-lg-4 input-group-text">Téléphone</span>
                    <input
                        type="text"
                        class="form-control col-lg-8"
                        id="champ7"
                        v-model="clientChoisi.tel_client"
                        :disabled="!isFormEditable"
                    />
                    </div>
                    <div class="input-group mb-2">
                    <span class="col-lg-4 input-group-text">E-Mail</span>
                    <input
                        type="text"
                        class="form-control col-lg-8"
                        id="champ8"
                        v-model="clientChoisi.email_client"
                        :disabled="!isFormEditable"
                    />
                    </div>
                    <div class="input-group mb-2">
                    <span class="col-lg-4 input-group-text">Adresse</span>
                    <input
                        type="text"
                        class="form-control col-lg-8"
                        id="champ9"
                        v-model="clientChoisi.adresse_client"
                        :disabled="!isFormEditable"
                    />
                    </div>
                    <div class="input-group mb-2">
                    <span class="col-lg-4 input-group-text">Adresse de facturation</span>
                    <input
                        type="text"
                        class="form-control col-lg-8"
                        id="champ10"
                        v-model="clientChoisi.adresse_fact_client"
                        :disabled="!isFormEditable"
                    />
                    </div>
                    <div class="input-group mb-2">
                    <span class="col-lg-4 input-group-text">Limiter</span>
                    <input type="checkbox" :disabled="!isFormEditable" v-model="clientChoisi.limite_client" />
                    <input
                        type="text"
                        class="form-control col-lg-8"
                        id="champ11"
                        v-model="clientChoisi.montant_limite_credit_client"
                        :disabled="!isFormEditable"
                    />
                    </div>
                    <div class="input-group mb-2">
                    <span class="col-lg-4 input-group-text">Alerter</span>
                    <input type="checkbox" :disabled="!isFormEditable" v-model="clientChoisi.alerte_client" />
                    <input
                        type="text"
                        class="form-control col-lg-8"
                        id="champ12"
                        v-model="clientChoisi.observ_client"
                        :disabled="!isFormEditable"
                    />
                </div>
                </div>
                </div>
            </form>
            </div>
        </fieldset>
        </form>
    </div>
    </div>
</template>
<script>
import { ref, computed } from "vue";
import { useClients } from "../composables/usePatients";
import { useToast } from "vue-toastification";

export default {
    setup(props, { emit }) {
    const { clients, client, showClient, createClient, updateClient, fetchClients } = useClients();

    // createClient();
    fetchClients();

    const newClient = ref({
        oid_client: "",
        nom_client: "",
        prenom_client: "",
        genre: "",
        nationalite: "",
        ville_client: "",
        tel_client: "",
        email_client: "",
        adresse_client: "",
        adresse_fact_client: "",
        limite_client: false,
        montant_limite_credit_client: "",
        alerte_client: false,
        observ_client: "",
    });

    const showForm = ref(false);
    const isEditing = ref(false);
    const oidChoisi = ref("");
    const clientChoisi = ref({});
    const buttonState = ref("nouveau");


    const errors = ref({});

    const isFormEditable = computed(() => buttonState.value !== "nouveau");

    const buttonLabel = computed(() => {
        switch (buttonState.value) {
        case "nouveau":
            return "+ Nouveau";
        case "Valider":
            return "Valider";
        case "mis a jour":
            return " Mis à jour";
        }
    });

    const isClientSelected = computed(() => {
      return oidChoisi.value !== "";
    });

    const toggleForm = () => {
        showForm.value = !showForm.value;
        if (!showForm.value) {
        resetForm();
        }
    };


    const validateForm = () => {
        errors.value = {};
        if (!clientChoisi.value.oid_client) {
            errors.value.oid_client = "N° client est requis";
        }
        if (!clientChoisi.value.nom_client) {
            errors.value.nom_client = "Nom est requis";
        }
        if (!clientChoisi.value.prenom_client) {
            errors.value.prenom_client = "Prenom est requis";
        }
        
        return Object.keys(errors.value).length === 0;
    };

    const addClient = async () => {
        const toast = useToast();

        if (!validateForm()) {
            toast.error('Validation impossible : Veuillez remplir tous les champs', { timeout: 2000, position: 'top-center' });
            return;
        }

        try {
            const existante = clients.value.find((client) => client.oid_client === clientChoisi.value.oid_client);
            if (existante) {
                toast.error('Le client existe déjà', { timeout: 2000, position: 'top-center' });
                return;
            }
            await createClient(clientChoisi.value);
            toast.success('Client ajouté', { timeout: 2000, position: 'top-center' });
            oidChoisi.value = clientChoisi.value.oid_client;
            emit('selectClient', clientChoisi.value);  // Émettre l'événement avec les données du client
            selectionner( oidChoisi.value);
            showForm.value = false;
            buttonState.value = "nouveau";
            await fetchClients();
        } catch (error) {
            toast.error('Erreur lors de l\'ajout du client : ' + error.toString(), { timeout: 2000, position: 'top-center' });
        }
    };


    const editClient = async () => {
        const toast = useToast();
        await updateClient(clientChoisi.value);
        toast.success('Client mis à jour', { timeout: 2000, position: 'top-center' });
        emit('selectClient', clientChoisi.value);  // Émettre l'événement avec les données du client
        selectionner();
        resetForm();
        isEditing.value = false;
        showForm.value = false;
        buttonState.value = "nouveau";
        await fetchClients();
    };

    const handleSubmit = () => {
        if (isEditing.value) {
        editClient();
        } else {
        addClient();
        }
    };


    const selectionner = async () => {
        isEditing.value = false;
        try {
        await showClient(oidChoisi.value);
        clientChoisi.value = client.value;
        emit('selectClient', client.value);  // Émettre l'événement avec les données du client
        buttonState.value = "nouveau";
        } catch (error) {
        console.error("Erreur lors de la sélection du client:", error);
        }
    };


    const handleButtonClick = () => {
        switch (buttonState.value) {
        case "nouveau":
            showForm.value = true;
            oidChoisi.value = ""; //mise a jour de selecte
            resetForm();
            buttonState.value = "Valider";
            break;
        case "Valider":
            handleSubmit();
            break;
        case "mis a jour":
            
            handleSubmit();
            selectionner();
            break;
        }
        // resetForm();
    };

    const handleEditToggle = () => {
        if (isEditing.value) {
        buttonState.value = "mis a jour";
        } else {
        buttonState.value = "nouveau";
        }
    };

    const resetForm = () => {
        clientChoisi.value = {
        oid_client: "",
        nom_client: "",
        prenom_client: "",
        genre: "",
        nationalite: "",
        ville_client: "",
        tel_client: "",
        email_client: "",
        adresse_client: "",
        adresse_fact_client: "",
        limite_client: false,
        montant_limite_credit_client: "",
        alerte_client: false,
        observ_client: "",
        };
        isEditing.value = false;
    };

    return {
        clients,
        client,
        showClient,
        fetchClients,
        createClient,
        editClient,
        newClient,
        showForm,
        isEditing,
        oidChoisi,
        clientChoisi,
        toggleForm,
        handleSubmit,
        selectionner,
        resetForm,
        addClient,
        buttonState,
        buttonLabel,
        isFormEditable,
        handleButtonClick,
        handleEditToggle,
        errors,
        isClientSelected,
    };
    },
};
</script>

<style>
.form-container {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
};
.text-danger {
    color: red;
    font-size: 0.875em;
}
</style>
