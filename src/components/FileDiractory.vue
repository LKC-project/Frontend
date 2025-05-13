<script setup>
import {ref, onMounted, watch, computed, reactive} from 'vue';
import { useRouter } from 'vue-router'
import {getBoard, insertBoard} from "@/utils/boardStotage.js";
import { useAuthStore} from "@/api/auth.js";
import {Project} from "@/api/index.js";


const boards = ref([]);
const router = useRouter()
const folders = ref([]);

const getProjects = async () => {
  const projects = await Project.my()

  console.log(projects)
}

const loadFolders = () => {
  getProjects().then()

  const savedFolders = localStorage.getItem("folders");
  folders.value = savedFolders ? JSON.parse(savedFolders) : [
    // { id: 1, name: "Folder 1", description: "1 card", icon: "mdi-folder", path: "/canva" },
    // { id: 2, name: "Folder 2", description: "2 cards", icon: "mdi-folder", path: "/canva" },
  ];
};

const saveFolders = () => {
  localStorage.setItem("folders", JSON.stringify(folders.value));
};

// onMounted(loadFolders);

watch(folders, saveFolders, {deep: true});

const editingFolder = ref(null);
const editedName = ref("");
const editedDescription = ref("");
const editedIcon = ref("");
// const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const folderToDelete = ref(null);

// ==================================================================

const currentUser = ref(null);
const projectsFetched = ref(false);
const projects = reactive([])

const fieldsRules = {
  name: [
    v => !!v?.trim() || 'Назва не може бути порожньою',
    v => v.length <= 64 || 'Назва не може бути довшою за 64 символа'
  ],
  description: [
      v => !v || v.length <= 255 || 'Опис не може бути довшим за 255 символів'
  ]
}

const showCreateDialog = ref(false);
const createDialogValid = ref(false);
const createDialogWaiting = ref(false);
const createDialogErrorMessage = ref("");

const createInitialData = {name: "", description: null};
const createData = reactive({...createInitialData});

const showEditDialog = ref(false);
const editDialogValid = ref(false);
const editDialogWaiting = ref(false);
const editDialogErrorMessage = ref("");

const editId = ref(null);
const editData = ref({});

// ==================================================================

const isFormValid = computed(() => {
  return editedName.value.trim().length > 0 &&
      editedName.value.length <= 50 &&
      editedDescription.value.length <= 240;
});

// const availableIcons = [
//   { text: "Папка", value: "mdi-folder" },
//   { text: "Документ", value: "mdi-file-document" },
//   { text: "Зображення", value: "mdi-image" },
//   { text: "Відео", value: "mdi-video" },
//   { text: "Музика", value: "mdi-music" },
//   { text: "Завантаження", value: "mdi-download" }
// ];

// ==================================================================

const loadProjects = async () => {
  projectsFetched.value = false
  projects.length = 0

  const userProjects = await Project.my()

  userProjects.map(project => {
    projects.push({
      id: project.id,
      name: project.name,
      description: project.description,
    });
  });

  projects.sort((a, b) => a?.id - b?.id)
  projectsFetched.value = true
}

onMounted(() => {
  loadProjects()
})

const createProject = () => {
  showCreateDialog.value = true;
};

const createDialogValidate = () => {
  createDialogValid.value = Object.entries(createData).map(([name, value]) => (
      fieldsRules[name].map((rule) => (
          rule(value)
      ))
  )).flat().every(rule => rule === true)
}

const cancelCreating = async () => {
  showCreateDialog.value = false
}

const submitCreate = async () => {
  let data = {
    name: createData.name,
  }

  if (createData.description) {
    data.description = createData.description;
  }

  createDialogWaiting.value = true;
  createDialogErrorMessage.value = ""

  let createdProject;

  try {
    createdProject = await Project.create(data)
  } catch (error) {
    createDialogErrorMessage.value = error.message;
    return;
  } finally {
    createDialogWaiting.value = false;
  }

  Object.assign(createData, createInitialData);

  const project = {
    id: createdProject.id,
    name: createdProject.name,
    description: createdProject.description,
  }

  projects.push(project);

  createDialogValidate()
  showCreateDialog.value = false;
}

const editProject = (project) => {
  editId.value = project.id;
  editData.value = {...project};
  delete editData.value.id;
  showEditDialog.value = true;
}

const editDialogValidate = () => {
  editDialogValid.value = Object.entries(editData.value).map(([name, value]) => (
      fieldsRules[name].map((rule) => (
          rule(value)
      ))
  )).flat().every(rule => rule === true)
}

const cancelEditing = () => {
  editId.value = null;
  editData.value = {};
  editDialogValid.value = false;
  showEditDialog.value = false;
}

const submitEdit = async () => {
  let data = {
    id: editId.value,
    name: editData.value.name,
  }

  if (editData.value.description) {
    data.description = editData.value.description;
  }

  editDialogWaiting.value = true;
  editDialogErrorMessage.value = ""

  try {
    await Project.update(data)
  } catch (error) {
    editDialogErrorMessage.value = error.message;
    return;
  } finally {
    editDialogWaiting.value = false;
  }

  editData.value = {}

  editDialogValidate()
  showEditDialog.value = false;

  await loadProjects()
}

// ==================================================================

const startEditing = (folder) => {
  editingFolder.value = folder;
  editedName.value = folder.name;
  editedDescription.value = folder.description;
  editedIcon.value = folder.icon;
  showEditDialog.value = true;
};

const saveEdits = () => {
  if (editingFolder.value && isFormValid.value) {
    const folder = folders.value.find(f => f.id === editingFolder.value.id);
    if (folder) {
      folder.name = editedName.value.trim();
      folder.description = editedDescription.value.trim();
      folder.icon = editedIcon.value;

      Project.update({
        id: editingFolder.value.id,
        name: folder.name,
        description: folder.description,
      }).then()
    }

    getBoard(editingFolder.value.id).then(board => {
      board.name = folder.name;

      insertBoard(board.id, board).then()
    })

    editingFolder.value = null;
    showEditDialog.value = false;
  }
};

// const cancelEditing = () => {
//   editingFolder.value = null;
//   showEditDialog.value = false;
// };

const confirmDelete = (folder) => {
  folderToDelete.value = folder;
  showDeleteDialog.value = true;
};

const deleteFolder = () => {
  if (folderToDelete.value) {
    folders.value = folders.value.filter(f => f.id !== folderToDelete.value.id);
    folderToDelete.value = null;
    showDeleteDialog.value = false;
  }
};

const menuItems = ref([
  { title: 'Account settings', action: 'settings' },
  { title: 'Log out', action: 'logout' }
]);

const handleMenuItem = (item) => {
  const authStore = useAuthStore(); 
  const router = useRouter();  

  switch (item.action) {
    case 'settings':
      console.log('Opening account settings');
      break;
    case 'logout':
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');

      authStore.logout();

      router.push('/login');

      console.log('Logging out');
      break;
    default:
      console.log(`Unknown action: ${item.action}`);
  }
};

const goToHelp = () => router.push('/help')

</script>

<template>
  <v-card v-if="false" class="mx-auto">
    <v-card-item style="background-color: #9FA8DA;">
      <div class="d-flex align-center justify-space-between">
        <v-card-title>
          LKC
        </v-card-title>
        <div>
          <v-btn
              class="hover-visible"
              @click="goToHelp"
              :icon="show ? 'mdi-help-circle-outline' : 'mdi-help-circle'"
              size=""
          ></v-btn>

          <v-menu open-on-click>
            <template v-slot:activator="{ props }">
              <v-btn
                  class="avatar-visible"
                  icon
                  v-bind="props"
                  size="small"
              >
                <v-avatar size="32">
                  <v-img
                      alt="John"
                      src="https://cdn.vuetifyjs.com/images/john.jpg"
                  ></v-img>
                </v-avatar>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                  v-for="(item, index) in menuItems"
                  :key="index"
                  @click="handleMenuItem(item)"
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-card-item>
  </v-card>

  <v-card class="mx-auto">
    <v-card-item style="background-color: #E8EAF6;">
      <div class="d-flex align-center justify-center">
        <v-btn
            id="button"
            class="text-none custom-button"
            color="medium-emphasis"
            min-width="92"
            variant="outlined"
            rounded
            @click="createProject"
        >
          Create
        </v-btn>
      </div>
    </v-card-item>
  </v-card>

  <v-container>
    <div class="d-flex justify-center w-full">
      <v-progress-circular
          color="primary"
          indeterminate
          :size="53"
          :width="6"
          v-if="!projectsFetched"
      ></v-progress-circular>
    </div>

    <v-row v-if="projectsFetched">
      <v-col
          v-for="project in projects"
          :key="project.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
      >
        <div class="folder-wrapper">
          <router-link
              :to="'/board/' + project.id"
              class="folder"
          >
            <div class="folder-content">
              <v-icon size="40">mdi-folder</v-icon>
              <div class="text">
                <h3>{{ project.name }}</h3>
                <p>{{ project.description }}</p>
              </div>
            </div>
          </router-link>
          <div class="folder-actions">
            <v-btn icon small @click="editProject(project)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small @click="confirmDelete(project)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <v-container v-if="false">
    <v-row>
      <v-col
          v-for="folder in folders"
          :key="folder.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
      >
        <div class="folder-wrapper">
          <router-link
              :to="folder.path"
              class="folder"
          >
            <div class="folder-content">
              <v-icon size="40">{{ folder.icon }}</v-icon>
              <div class="text">
                <h3>{{ folder.name }}</h3>
                <p>{{ folder.description }}</p>
              </div>
            </div>
          </router-link>
          <div class="folder-actions">
            <v-btn icon small @click="startEditing(folder)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small @click="confirmDelete(folder)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="showCreateDialog" max-width="500px">
    <v-card>
      <v-card-title>Створити проєкт</v-card-title>
      <v-card-text class="d-flex justify-center" v-if="createDialogWaiting">
        <v-progress-circular
            color="primary"
            indeterminate
            :size="53"
            :width="6"
        ></v-progress-circular>
      </v-card-text>

      <v-card-text v-if="!createDialogWaiting">
        <v-alert
            v-if="createDialogErrorMessage"
            class="mb-6"
            closable
            type="error"
            variant="outlined"
            :text="createDialogErrorMessage"
            @update:modelValue="createDialogErrorMessage = ''"
        />

        <v-text-field
            @input="createDialogValidate"
            v-model="createData.name"
            label="Назва проєкту"
            dense
            :counter="64"
            :rules="fieldsRules.name"
        />

        <v-text-field
            @input="createDialogValidate"
            v-model="createData.description"
            label="Опис"
            dense
            :counter="255"
            :rules="fieldsRules.description"
        />
      </v-card-text>

      <v-card-actions>
        <div class="d-flex justify-space-between align-center w-100">
          <v-btn @click="cancelCreating">
            Скасувати
          </v-btn>

          <v-btn @click="submitCreate" :disabled="!createDialogValid" >
            Створити
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showEditDialog" max-width="500px" @update:model-value="cancelEditing()">
    <v-card>
      <v-card-title>Редагувати проєкт</v-card-title>
      <v-card-text class="d-flex justify-center" v-if="editDialogWaiting">
        <v-progress-circular
            color="primary"
            indeterminate
            :size="53"
            :width="6"
        ></v-progress-circular>
      </v-card-text>

      <v-card-text v-if="!editDialogWaiting">
        <v-alert
            v-if="editDialogErrorMessage"
            class="mb-6"
            closable
            type="error"
            variant="outlined"
            :text="editDialogErrorMessage"
            @update:modelValue="editDialogErrorMessage = ''"
        />

        <v-text-field
            @input="editDialogValidate"
            v-model="editData.name"
            label="Назва проєкту"
            dense
            :counter="64"
            :rules="fieldsRules.name"
        />

        <v-text-field
            @input="editDialogValidate"
            v-model="editData.description"
            label="Опис"
            dense
            :counter="255"
            :rules="fieldsRules.description"
        />
      </v-card-text>

      <v-card-actions>
        <v-btn @click="cancelEditing">Скасувати</v-btn>
        <v-btn @click="submitEdit" :disabled="!editDialogValid" color="primary">Зберегти</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Dialog -->
<!--  <v-dialog v-model="false" max-width="500px">-->
<!--    <v-card>-->
<!--      <v-card-title>Редагувати проєкт</v-card-title>-->
<!--      <v-card-text>-->
<!--        <v-text-field-->
<!--            v-model="editData.name"-->
<!--            label="Назва проєкту"-->
<!--            dense-->
<!--            :counter="64"-->
<!--            :rules="fieldsRules.name"-->
<!--        ></v-text-field>-->

<!--        <v-text-field-->
<!--            v-model="editData.description"-->
<!--            label="Опис"-->
<!--            dense-->
<!--            :counter="255"-->
<!--            :rules="fieldsRules.description"-->
<!--        ></v-text-field>-->
<!--      </v-card-text>-->

<!--      <v-card-actions>-->
<!--        <v-btn @click="cancelEditing">Скасувати</v-btn>-->
<!--        <v-btn @click="submitEdit" :disabled="!editDialogValid" color="primary">Зберегти</v-btn>-->
<!--      </v-card-actions>-->
<!--    </v-card>-->
<!--  </v-dialog>-->

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="400px">
    <v-card>
      <v-card-title>Видалити папку</v-card-title>
      <v-card-text>
        Ви впевнені, що хочете видалити папку "{{ folderToDelete?.name }}"? Цю дію неможливо скасувати.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="showDeleteDialog = false">Скасувати</v-btn>
        <v-btn color="error" text @click="deleteFolder">Видалити</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.hover-visible {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding-right: 3px;
}

.avatar-visible {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

.folder-wrapper {
  position: relative;
  margin-bottom: 15px;
}

.folder {
  background: #f0f0ff;
  padding: 20px;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: background-color 0.3s;
}

.folder:hover {
  background: #e0e0ff;
}

.folder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.folder-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s;
}

.folder-wrapper:hover .folder-actions {
  opacity: 1;
}

.text {
  text-align: center;
}

h3 {
  margin: 0;
  font-size: 16px;
}

p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style>