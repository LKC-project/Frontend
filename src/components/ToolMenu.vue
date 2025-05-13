<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {useDrawingStore} from "@/stores/useBoardStore.js";

const emit = defineEmits(['trigger-file-input']);
const store = useDrawingStore();

const tools = ref([
  { title: 'Draw', value: 'pen', icon: 'mdi-draw' },
  { title: 'Eraser', value: 'eraser', icon: 'mdi-eraser' },
  { title: 'Eyedropper', value: 'eyedropper', icon: 'mdi-eyedropper' },
  { title: 'Add Text', value: 'text', icon: 'mdi-format-text' },
  { title: 'Image', value: 'image', icon: 'mdi-image-outline' },
  { title: 'Crop Image', value: 'crop', icon: 'mdi-crop' },
  { title: 'Note', value: 'note', icon: 'mdi-note-outline' },
]);

computed(() => store.currentTool);

defineProps({
  fileInputRef: Object
});
const selectTool = (tool) => {
  store.setTool(tool);
  console.log('Select tool:', tool);

  if (tool === 'image') {
    emit('trigger-file-input');
  }
};


</script>

<template>
  <div class="tool-menu">
    <v-sheet class="sidebar-panel" width="64" color="grey-lighten-3" elevation="0">
      <v-list density="compact" nav>
        <v-list-item
            v-for="tool in tools"
            :key="tool.title"
            :value="tool.value"
            @click="selectTool(tool.value)"
        >
          <template v-slot:prepend>
            <v-icon :icon="tool.icon"></v-icon>
          </template>
          <v-tooltip
              activator="parent"
              location="right"
          >
            {{ tool.title }}
          </v-tooltip>
        </v-list-item>
      </v-list>
    </v-sheet>
  </div>
</template>

<style scoped>
.tool-menu {
  position: absolute;
  top: 63px;
  left: 0;
  height: calc(100% - 64px);
  z-index: 10;
}

.sidebar-panel {
  height: 100%;

}
.v-list {
  height: 100%;
  overflow: hidden;
}
</style>