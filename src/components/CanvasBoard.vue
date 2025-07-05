<script setup>
import {onBeforeUnmount, onMounted, onUnmounted, ref} from "vue";
import Konva from "konva";
import * as API from "../api";
import {exportBoardToLKC, importBoardFromLKC} from '@/composables/useBoardFile'
import { VTooltip, VBtn, VIcon } from 'vuetify/components'
import ChatAi from '@/components/ChatAI.vue';
import {GoogleAuth, GooglePicker} from "@/utils/google_picker.js";

const props = defineProps({
  boardID: String,
  getContextMethod: Function,
});

const snackbar = ref(false)
const snackbarFileName = ref("")

const noteSceneFunc = (context, shape) => {
  context.fillStyle = shape.attrs._bgColor
  context.fillRect(0,0,shape.width(),shape.height())
  shape._sceneFunc(context)
}

// /========================================= STAGE =========================================\

class Stage {
  constructor(projectId = null, api = null, saveIntervalMs = 30000) {
    this.stage = null;
    this.stageContainerRef = null;
    this.transformer = null;
    this.history = [];
    this.historyIndex = -1;
    this.stageContainerResizeObserver = null;
    this.autoSaveInterval = null;
    this.lastSavedData = null;
    this.isSaving = false;
    this.saveIntervalMs = saveIntervalMs;
    this.projectId = projectId;
    this.api = api;

    this.onResize = () => {
      if (!this.stageContainerRef || !this.stageContainerRef.value) return;

      this.stage.width(this.stageContainerRef.value.clientWidth);
      this.stage.height(this.stageContainerRef.value.clientHeight);
    }

    this.init = (stageRef, stageContainerRef) => {
      if (!stageRef || !stageRef.value || !stageContainerRef || !stageContainerRef.value) {
        console.error("Invalid stage or container references");
        return;
      }

      this.stage = stageRef.value.getStage();
      this.stageContainerRef = stageContainerRef;

      this.history = [];
      this.historyIndex = -1;

      this.stageContainerResizeObserver = new ResizeObserver(this.onResize);
      this.stageContainerResizeObserver.observe(stageContainerRef.value);

      const boundSaveSnapshot = this.saveSnapshot.bind(this);
      this.stage.on("mousedown", boundSaveSnapshot);
      this.stage.on("mouseup", boundSaveSnapshot);

      const layer = new Konva.Layer();
      const transformerLayer = new Konva.Layer();

      this.transformer = new Konva.Transformer();
      transformerLayer.add(this.transformer);

      this.stage.add(layer);
      this.stage.add(transformerLayer);

      this.onResize();

      this.saveSnapshot();

      if (this.api && this.projectId) {
        this.startAutoSave();
      }
    }

    this.destroy = () => {
      if (this.stageContainerResizeObserver) {
        this.stageContainerResizeObserver.disconnect();
      }

      if (this.stage) {
        this.stage.off("mousedown");
        this.stage.off("mouseup");
      }
      this.stopAutoSave();
    }

    this.getTopLayer = () => {
      if (!this.stage) return null;

      const layers = this.stage.getLayers();
      return layers.length >= 2 ? layers[layers.length - 2] : null;
    }

    this.getContext = () => {
      const layer = this.getTopLayer()

      return layer.children.filter(child => child instanceof Konva.Text).map((child) => ({
        name: child._id.toString(),
        content: child.attrs.text
      }))
    }

    this.serialize = () => {
      const layer = this.getTopLayer();
      if (!layer) return null;

      layer.find('Image').forEach(imageNode => {
        const img = imageNode.image();
        if (img && img.src) {
          imageNode.setAttr('src', img.src);
        }
      });

      return layer.toJSON();
    }

    this.deserialize = (data) => {
      if (!this.transformer || !this.stage) return;

      this.transformer.nodes([]);
      const layer = this.getTopLayer();
      if (!layer) return;

      layer.destroyChildren();

      let snapshot = data;
      if (typeof data === 'string') {
        try {
          snapshot = JSON.parse(data);
        } catch (error) {
          console.error("Failed to parse snapshot data:", error);
          return;
        }
      }

      if (!snapshot || !snapshot.children) {
        console.error("Invalid snapshot data");
        return;
      }

      const loadPromises = [];

      snapshot.children.forEach((node) => {
        if (node.className === 'Image' && node.attrs.src) {
          const promise = new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              const imageNode = new Konva.Image({
                ...node.attrs,
                image: img,
              });
              layer.add(imageNode);
              resolve();
            };
            img.onerror = () => {
              console.error("Failed to load image:", node.attrs.src);
              resolve();
            };
            img.src = node.attrs.src;
          });
          loadPromises.push(promise);
        } else {
          try {
            const newNode = Konva.Node.create(JSON.stringify(node));
            layer.add(newNode);
          } catch (error) {
            console.error("Failed to create node:", error);
          }
        }
      });

      Promise.all(loadPromises).then(() => {
        layer.children.forEach((node) => {
          if (node.attrs && node.attrs._type === "Note" && typeof noteSceneFunc === 'function') {
            node.sceneFunc(noteSceneFunc);
          }
        });
        layer.draw();
      });
    }

    this.undo = () => {
      if (this.historyIndex <= 0) return;

      this.historyIndex -= 1;
      const snapshot = this.history[this.historyIndex];
      this.deserialize(snapshot);
    }

    this.redo = () => {
      if (this.historyIndex >= this.history.length - 1) return;

      this.historyIndex += 1;
      this.deserialize(this.history[this.historyIndex]);
    }

    this.saveSnapshot = () => {
      const serialized = this.serialize();
      if (!serialized) return;

      if (this.history[this.historyIndex] === serialized) {
        return;
      }

      if (this.history.length - 1 > this.historyIndex) {
        this.history.length = this.historyIndex + 1;
      }

      this.history.push(serialized);
      this.historyIndex += 1;
    }

    this.startAutoSave = () => {
      if (this.autoSaveInterval) {
        this.stopAutoSave();
      }

      this.autoSaveInterval = setInterval(() => {
        this.autoSave();
      }, this.saveIntervalMs);
      console.log(`Auto-save started (every ${this.saveIntervalMs / 1000} seconds)`);
    };

    this.stopAutoSave = () => {
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = null;
        console.log('Auto-save stopped');
      }
    };

    this.showSaveNotification = () => {
      const notification = document.getElementById('save-notification');
      if (notification) {
        notification.classList.remove('hidden');
        notification.classList.add('visible');

        setTimeout(() => {
          notification.classList.remove('visible');
          notification.classList.add('hidden');
        }, 3000);
      }
    };

    this.autoSave = async () => {
      if (this.isSaving || !this.history.length || this.historyIndex < 0 || !this.api) {
        return;
      }

      const currentData = this.history[this.historyIndex];

      if (this.lastSavedData === currentData) {
        return;
      }

      const contentSize = JSON.stringify(currentData).length;
      console.log(`Content size: ${contentSize} bytes`);

      try {
        this.isSaving = true;
        this.triggerSavingIndicator(true);

        const contentToSend = typeof currentData === 'string'
            ? JSON.parse(currentData)
            : currentData;

        await this.api.update({
          id: this.projectId,
          content: contentToSend,
        });

        this.lastSavedData = currentData;
        console.log('Save successful');
        this.showSaveNotification();
      } catch (error) {
        console.error('Save error:', error);
      } finally {
        this.isSaving = false;
        this.triggerSavingIndicator(false);
      }
    };

    this.triggerSavingIndicator = (isShowing) => {
      const indicator = document.getElementById('saving-indicator');
      if (indicator) {
        indicator.style.display = isShowing ? 'block' : 'none';
      }
    }
  }
}

const stage = new Stage(props.boardID, API.Project);
const stageRef = ref(null);
const stageContainerRef = ref(null);

onMounted(() => {
  stage.init(stageRef, stageContainerRef)
  API.Project.get({id: props.boardID}).then((response) => {
    if (response.content !== null) {
      stage.deserialize(response.content)
      stage.lastSavedData = response.content;
      stage.saveSnapshot();
    }
  })
})

onUnmounted(() => {
  stage.destroy();
})

const exportCurrentBoard = () => {
  exportBoardToLKC(stage);
}

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    importBoardFromLKC(file, stage);
  }
}
// \========================================= STAGE =========================================/



// /========================================= SIDE MENU =========================================\

class TextProperties {
  constructor(node) {
    this.node = node
    this.text = ref(node.text())

    this.updateText = (value) => {
      this.node.text(value)
    }
  }
}

class SideMenu {
  constructor() {
    this.node = ref(null)
    this.page = ref(null)

    this.show = (node) => {
      this.node.value = node

      if (node instanceof Konva.Text) {
        this.page.value = new TextProperties(node)
      } else {
        this.hide()
      }
    }

    this.hide = () => {
      this.node.value = null
      this.page.value = null
    }
  }
}

const sideMenu = new SideMenu()

// \========================================= SIDE MENU =========================================/



// /========================================= TOOLBAR =========================================\

class ToolbarItem {
  constructor(stage, toolbar) {
    this.stage = stage
    this.toolbar = toolbar

    this.onSelect = () => {}
    this.onDeselect = () => {}
  }
}

class Tool extends ToolbarItem {}
class Action extends ToolbarItem {}

class Mouse extends Tool {
  constructor(stage, toolbar) {
    super(stage, toolbar)

    this.onSelect = () => {
      this.stage.stage.on("mousedown", this.selectNode)
      this.stage.transformer.on("transform", this.onTransform)
      this.setStageNodesDraggable(true)
    }

    this.onDeselect = () => {
      this.stage.stage.off("mousedown", this.selectNode)
      this.stage.transformer.off("transform", this.onTransform)
      this.stage.transformer.nodes([]);
      this.setStageNodesDraggable(false)
      sideMenu.hide()
    }

    this.selectNode = (e) => {
      this.setStageNodesDraggable(true) // - ?
      this.stage.transformer.enabledAnchors(
          ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']
      )

      if (e.target instanceof Konva.Stage) {
        this.stage.transformer.nodes([])
        sideMenu.hide()
        return
      }

      if (e.target.getParent() instanceof Konva.Transformer) {
        sideMenu.hide()
        return
      }

      if (e.target instanceof Konva.Text) {
        if (e.target.attrs._type === "Note") {
          this.stage.transformer.enabledAnchors([])
        }
      }

      this.stage.transformer.nodes([e.target])
      sideMenu.show(e.target)
    }

    this.setStageNodesDraggable = (value) => {
      this.stage.getTopLayer()?.children.forEach(node => {
        node.draggable(value)
      });
    }

    this.onTransform = (e) => {
      if (e.target instanceof Konva.Text) {
        e.target.width(e.target.width() * e.target.scaleX());
        e.target.height(e.target.height() * e.target.scaleY());

        e.target.scaleX(1);
        e.target.scaleY(1);
      }
    }
  }
}

class Draw extends Tool {
  constructor(stage, toolbar) {
    super(stage, toolbar);

    this.drawing = false
    this.line = null

    this.onSelect = () => {
      this.stage.stage.on("mousedown", this.onMouseDown);
      this.stage.stage.on("mouseup", this.onMouseUp);
      this.stage.stage.on("mousemove", this.onMouseMove);
    }

    this.onDeselect = () => {
      this.stage.stage.off("mousedown", this.onMouseDown);
      this.stage.stage.off("mouseup", this.onMouseUp);
      this.stage.stage.off("mousemove", this.onMouseMove);
    }

    this.onMouseDown = () => {
      this.drawing = true

      if (this.line === null) {
        this.line = new Konva.Line({
          points: [],
          stroke: "black",
          strokeWidth: 3,
        })
      }

      const layer = stage.getTopLayer()
      const point = this.stage.stage.getPointerPosition();

      this.line.points([...this.line.points(), point.x, point.y]);
      layer.add(this.line)
    }

    this.onMouseUp = () => {
      this.drawing = false
      this.line = null
    }

    this.onMouseMove = () => {
      if (!this.drawing) {
        return
      }

      const point = this.stage.stage.getPointerPosition();
      this.line.points([...this.line.points(), point.x, point.y]);
    }
  }
}

class Eraser extends Tool {
  constructor(stage, toolbar) {
    super(stage, toolbar);

    this.erasing = false

    this.onSelect = () => {
      this.stage.stage.on("mousedown", this.onMouseDown);
      this.stage.stage.on("mouseup", this.onMouseUp);
      this.stage.stage.on("mousemove", this.onMouseMove);
    }

    this.onDeselect = () => {
      this.stage.stage.off("mousedown", this.onMouseDown);
      this.stage.stage.off("mouseup", this.onMouseUp);
      this.stage.stage.off("mousemove", this.onMouseMove);
    }

    this.onMouseDown = (e) => {
      this.erasing = true
      this.erase(e)
    }

    this.onMouseUp = () => {
      this.erasing = false
    }

    this.onMouseMove = (e) => {
      this.erase(e)
    }

    this.erase = (e) => {
      if (this.erasing && e.target instanceof Konva.Line) {
        e.target.destroy()
      }
    }
  }
}

class Text extends Tool {
  constructor(stage, toolbar) {
    super(stage, toolbar);

    this.onSelect = () => {
      this.stage.stage.on("mouseup", this.onMouseUp);
    }

    this.onDeselect = () => {
      this.stage.stage.off("mouseup", this.onMouseUp);
    }

    this.onMouseUp = () => {
      const pos = this.stage.stage.getPointerPosition()

      const text = new Konva.Text({
        x: pos.x,
        y: pos.y,
        fontSize: 20,
        width: 200,
        text: "Text",
        _type: "Text",
      })

      this.stage.getTopLayer().add(text)
      this.toolbar.selectTool(0)
    }
  }
}

class Note extends Tool {
  constructor(stage, toolbar) {
    super(stage, toolbar);

    this.onSelect = () => {
      this.stage.stage.on("mouseup", this.onMouseUp);
    }

    this.onDeselect = () => {
      this.stage.stage.off("mouseup", this.onMouseUp);
    }

    this.onMouseUp = () => {
      const pos = this.stage.stage.getPointerPosition();

      let note = new Konva.Text({
        x: pos.x,
        y: pos.y,
        width: 200,
        height: 300,
        fontSize: 20,
        text: "Text",
        padding: 10,
        _type: "Note",
        _bgColor: "#fff8b8",
        sceneFunc: noteSceneFunc,
      })

      this.stage.getTopLayer().add(note);
      this.toolbar.selectTool(0)
    }
  }
}

class UploadImage extends Action {
  constructor(stage, toolbar) {
    super(stage, toolbar);

    this.fileInput = null

    this.onSelect = () => {
      console.log(1123)
      this.fileInput = document.createElement('input');
      this.fileInput.type = 'file';
      this.fileInput.accept = 'image/*';
      this.fileInput.style.display = 'none';
      this.fileInput.addEventListener('change', this.onChange);

      document.body.appendChild(this.fileInput);
      this.fileInput.click();

      console.log(this.toolbar)
    }

    this.onDeselect = () => {
      this.fileInput.remove();
      this.fileInput = null;
    }

    this.onChange = async (event) => {
      const file = event.target.files[0];

      if (!file) {
        return
      }

      const imageUrl = (await API.Image.upload({file: file})).url

      const img = new Image()
      img.crossOrigin = "Anonymous";

      img.onload = () => {
        const konvaImage = new Konva.Image({
          x: 50,
          y: 50,
          image: img,
          width: img.width,
          height: img.height,
        });

        this.stage.getTopLayer().add(konvaImage)
        this.stage.saveSnapshot()
        this.toolbar.selectTool(0)
      }

      img.src = imageUrl
    }
  }
}

class Save extends Action {
  constructor(stage, toolbar) {
    super(stage, toolbar)

    this.onSelect = () => {
      return exportBoardToLKC(this.stage);
    }

    this.manualSave = async () => {
      if (this.stage.autoSave) {
        await this.stage.autoSave();
      }
      return exportBoardToLKC(this.stage);
    }
  }
}

class Load extends Action {
  constructor(stage, toolbar) {
    super(stage, toolbar)

    this.onSelect = () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.lkc';
      fileInput.style.display = 'none';

      document.body.appendChild(fileInput);

      fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const data = JSON.parse(reader.result);
              if (data.snapshot) {
                this.stage.deserialize(data.snapshot);
              } else {
                console.error('File does not contain snapshot data');
              }
            } catch (error) {
              console.error('Failed to parse .lkc file:', error);
            }
          };
          reader.readAsText(file);
        }

        document.body.removeChild(fileInput);
      });

      fileInput.click();
    }

    this.loadFromLocalStorage = () => {
      const savedData = localStorage.getItem("stage");
      if (savedData) {
        this.stage.deserialize(savedData);
        return true;
      }
      return false;
    }
  }
}

class SaveProjectToGoogleDrive extends Action {
  constructor(stage, toolbar) {
    super(stage, toolbar)

    this.onSelect = async () => {
      const token = await GoogleAuth.google_drive()

      const response = await API.GoogleDrive.uploadProject({
        access_token: token,
        project: JSON.stringify({
          metadata: {
            title: 'Board',
            createdAt: new Date().toISOString(),
          },
          snapshot: this.stage.serialize(),
        })
      })

      snackbarFileName.value = response.file_name
      snackbar.value = true
    }
  }
}

class LoadProjectFromGoogleDrive extends Action {
  constructor(stage, toolbar) {
    super(stage, toolbar);

    this.picker = new GooglePicker()

    this.onSelect = () => {
      this.picker.show(this.callback)
    }

    this.onDeselect = () => {

    }

    this.callback = async (data) => {
      const file = await this.picker.downloadImage(data.file.id)

      this.stage.deserialize(file.snapshot)
    }
  }
}

class Undo extends Action {
  constructor(stage, toolbar) {
    super(stage, toolbar)

    this.onSelect = () => {
      this.stage.undo()
    }
  }
}

class Redo extends Action {
  constructor(stage, toolbar) {
    super(stage, toolbar)

    this.onSelect = () => {
      this.stage.redo()
    }
  }
}

class ToolBar {
  constructor() {
    this.selectedTool = ref(0)
    this.tools = ref([])

    this.init = (stage) => {
      this.stage = stage;

      this.tools.value.push(
          {name: "Mouse", icon: "mdi-cursor-default", handler: new Mouse(this.stage, this)},
          {name: "Draw", icon: "mdi-draw", handler: new Draw(this.stage, this)},
          {name: "Eraser", icon: "mdi-eraser", handler: new Eraser(this.stage, this)},
          // {name: "Eyedropper", icon: "mdi-eyedropper", handler: new Tool(this.stage, this)},
          {name: "Add Text", icon: "mdi-format-text", handler: new Text(this.stage, this)},
          {name: "Image", icon: "mdi-image-outline", handler: new UploadImage(this.stage, this)},
          // {name: "Crop Image", icon: "mdi-crop", handler: new Tool(this.stage, this)},
          {name: "Note", icon: "mdi-note-outline", handler: new Note(this.stage, this)},
          {name: "Export", icon: "mdi-content-save-all-outline", handler: new Save(this.stage, this)},
          {name: "Import", icon: "mdi-file-upload-outline", handler: new Load(this.stage, this)},
          {
            name: "Export to google drive",
            icon: "mdi-google-drive",
            handler: new SaveProjectToGoogleDrive(this.stage, this)
          },
          {
            name: "Import from google drive",
            icon: "mdi-folder-google-drive",
            handler: new LoadProjectFromGoogleDrive(this.stage, this)
          },
          {name: "Undo", icon: "mdi-undo", handler: new Undo(this.stage, this)},
          {name: "Redo", icon: "mdi-redo", handler: new Redo(this.stage, this)}
      )
      this.tools.value[this.selectedTool.value].handler.onSelect()
    }

    this.destroy = () => {
      this.tools.value[this.selectedTool.value].handler.onDeselect()
    }

    this.selectTool = (toolIndex) => {
      if (this.tools.value[toolIndex].handler instanceof Action) {
        this.tools.value[toolIndex].handler.onSelect()
        return
      }

      this.tools.value[this.selectedTool.value].handler.onDeselect()
      this.selectedTool.value = toolIndex
      this.tools.value[this.selectedTool.value].handler.onSelect()
    }
  }
}

const toolbar = new ToolBar()

onMounted(() => {
  toolbar.init(stage)
})

onBeforeUnmount(toolbar.destroy)

const getContext = () => {
  if (!stage.stage) {
    console.warn('Stage is not initialized');
    return [];
  }

  const layers = stage.stage.getLayers();
  console.log('Stage layers:', layers);

  const topLayer = layers.length >= 2 ? layers[layers.length - 2] : null;
  if (!topLayer) {
    console.warn('Top layer not found');
    return [];
  }

  console.log('Top layer:', topLayer);

  const textNodes = topLayer.getChildren(node => node.getClassName() === 'Text');
  console.log('Text nodes:', textNodes);

  const texts = textNodes
      .filter(node => node.attrs._type === 'Text')
      .map(node => ({
        name: "",
        content: node.text()
      }))
      .filter(item => item.content.length <= 100);

  console.log('getContext result:', texts);

  console.log(2143215637465542354)
  console.log(texts)
  console.log(2143215637465542354)

  return texts;
};


// \========================================= TOOLBAR =========================================/

</script>

<template>
  <!-- /========================================= SIDE MENU =========================================\ -->
  <div class="side-menu-container">
    <v-card class="side-menu-card" v-if="sideMenu.node.value instanceof Konva.Text">
      <v-card-title ref="Title">{{ sideMenu.node.value.attrs._type }}</v-card-title>
      <v-card-text>
        {{ sideMenu.page.update }}
        <v-text-field
            label="Текст"
            v-model="sideMenu.page.value.text"
            @update:modelValue="sideMenu.page.value.updateText"
        />
      </v-card-text>
    </v-card>
  </div>
  <!-- \========================================= SIDE MENU =========================================/ -->

  <ChatAi v-if="boardID" :projectId="boardID" :getContextMethod="stage.getContext"></ChatAi>
  <div id="save-notification" class="save-notification hidden">Дошка збережена!</div>

  <div class="main-container">
    <!-- /========================================= TOOLBAR =========================================\ -->
    <div class="toolbar">
      <v-btn
          v-for="(tool, index) in toolbar.tools.value"
          :key="index"
          :icon="tool.icon"
          :variant="toolbar.selectedTool.value === index ? 'tonal' : 'elevated'"
          :disabled="Object.getPrototypeOf(tool.handler).constructor === Tool"
          size="small"
          @click="() => { toolbar.selectTool(index) }"
      >
        <v-tooltip
            :text="tool.name"
            location="bottom"
        >
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props">{{ tool.icon }}</v-icon>
          </template>
        </v-tooltip>
      </v-btn>
    </div>
    <!-- \========================================= TOOLBAR =========================================/ -->

    <!-- /========================================= STAGE =========================================\ -->
    <div ref="stageContainerRef" id="stageContainer" class="stage">
      <!-- /========================================= DELETE IT =========================================\ -->
      <!-- <div class="debug-info">
        <p class="hidden">{{ updateDebug }}</p>
        <p>HistoryLength: {{ stage?.history?.length }}</p>
        <p>HistoryIndex: {{ stage?.historyIndex }} (+1)</p>
      </div> -->
      <!-- \========================================= DELETE IT =========================================/ -->

      <v-stage ref="stageRef"/>
    </div>
    <!-- \========================================= STAGE =========================================/ -->
  </div>

  <v-snackbar
      v-model="snackbar"
      color="#9fa8da"
      rounded="pill"
      :timeout="4000"
  >
    Проєкт збережений {{ snackbarFileName }}
  </v-snackbar>
</template>

<style scoped>
.side-menu-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  min-width: 20rem;
  height: auto;
  right: 0;
  padding: 0.5rem;
  z-index: 50;
  pointer-events: none;
}

.side-menu-card {
  pointer-events: auto;
}

.main-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.toolbar {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 0.25rem;
  height: 100%;
  background-color: #9FB3DF;
  padding: 0.25rem;
}

.toolbar button {
  background-color: #ffffff;
  color: #2e2e2e;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.toolbar button:hover {
  background-color: #f5f5f5;
  border-color: #cfcfcf;
}

.toolbar button:active {
  background-color: #eaeaea;
  border-color: #bfbfbf;
}


.toolbar {
  gap: 0.5rem;
  align-items: stretch;
}

.stage {
  height: auto;
  max-height: 100%;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  background-color: #BDDDE4;
  flex-grow: 1;
  position: relative;
}

.properties {
  height: 100%;
  flex-shrink: 0;
  min-width: 16rem;
  padding: 0.5rem;
  background-color: #BFDBFE;
}

.debug-info {
  position: absolute;
}

.hidden {
  display: none;
}

.save-notification {
  position: fixed;
  top: 80px;
  right: 20px;
  background-color: #64b667;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.save-notification.visible {
  opacity: 1;
}

.save-notification.hidden {
  opacity: 0;
  pointer-events: none;
  background-color: #64b667;
}
</style>