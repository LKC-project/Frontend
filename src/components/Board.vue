<template>
  <div id="stage-container">
    <!-- Editor Overlay -->
    <EditorContent class="editor-overlay" />

    <!-- Konva Stage -->
    <v-stage
        ref="stage"
        :config="stageConfig"
        @mousedown="handleStageMouseDown"
        @touchstart="handleStageMouseDown"
        @dragstart="handleDragstart"
        @dragend="handleDragend"
        @wheel="handleWheel"
    >
      <!-- Konva Layer -->
      <v-layer ref="layer">

        <!-- Transformer -->
        <v-transformer
            ref="transformer"
            :boundBoxFunc="(oldBox, newBox) => newBox"
        />

        <!-- Group for Rectangles and Text -->
        <v-group
            :config="{
      x: 100,
      y: 100,
      draggable: true
    }"
        >
          <!-- Rectangle -->
          <v-rect
              ref="textContainer"
              :config="{
      width: 200,
      height: 100,
      fill: 'lightblue',
      stroke: 'black'
    }"
          />

          <!-- Editable Text -->
          <v-text
              ref="editableText"
              :config="{
      x: 10,
      y: 10,
      width: 180,
      height: 80,
      text: text,
      fontSize: 18,
      fill: 'black',
      wrap: 'word',
      align: 'center',
      verticalAlign: 'middle'
    }"
              @dblclick="startEditing"
          />
        </v-group>

        <!-- Text Area for Editing -->
        <textarea
            v-if="isEditing"
            ref="textInput"
            v-model="text"
            @blur="stopEditing"
            style="position: absolute; top: 210px; left: 110px; width: 180px; height: 80px; resize: none; overflow: hidden;"
        />

        <!-- Rectangles -->
        <v-rect
            v-for="item in rectangles"
            :key="item.id"
            :config="item"
            @transformend="handleTransformEnd"
        />

        <!-- Image Element -->
        <v-image
            v-if="image"
            :config="{
            image: image,
            draggable: true,
            x: 50,
            y: 50,
            scaleX: 1,
            scaleY: 1
          }"
            @transformend="handleTransformEnd"
        />

        <!-- Konva Stars -->
        <v-star
            v-for="item in list"
            :key="item.id"
            :config="{
            x: item.x,
            y: item.y,
            rotation: item.rotation,
            id: item.id,
            numPoints: 5,
            innerRadius: 30,
            outerRadius: 50,
            fill: '#89b717',
            opacity: 0.8,
            draggable: true,
            scaleX: dragItemId === item.id ? item.scale * 1.2 : item.scale,
            scaleY: dragItemId === item.id ? item.scale * 1.2 : item.scale,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffsetX: dragItemId === item.id ? 15 : 5,
            shadowOffsetY: dragItemId === item.id ? 15 : 5,
            shadowOpacity: 0.6
          }"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import StarterKit from "@tiptap/starter-kit";
import EditorContent from "./EditorContent.vue";
import { Editor } from '@tiptap/vue-3';
import Image from '@tiptap/extension-image';
import Konva from 'konva';

export default {
  components: {
    EditorContent,
    StarterKit,
  },
  data() {
    return {
      list: [],
      text: 'SDIDFF',
      dragItemId: null,
      image: null,
      isEditing: false,
      editableTextNode: null,
      stageConfig: {
        width: window.innerWidth,
        height: window.innerHeight,
        draggable: false,
        image: null,
      },
      rectangles: [
        {
          rotation: 0,
          x: 10,
          y: 10,
          width: 100,
          height: 100,
          scaleX: 1,
          scaleY: 1,
          fill: 'red',
          name: 'rect1',
          draggable: true,
        },
        {
          rotation: 0,
          x: 150,
          y: 150,
          width: 100,
          height: 100,
          scaleX: 1,
          scaleY: 1,
          fill: 'green',
          name: 'rect2',
          draggable: true,
        },
      ],
      selectedShapeName: '',
      ctrlPressed: false,
    };
  },
  created() {
    const image = new window.Image();
    image.src = "https://i.pinimg.com/236x/81/3e/b6/813eb68f3d7d20d7890b9e3819ca9100.jpg";
    image.onload = () => {
      this.image = image;
      this.stageConfig.image = image;
    };
  },
  mounted() {
    this.initStage();
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  },
  methods: {
    startEditing(e) {
      const textNode = e.target;
      this.editableTextNode = textNode;

      // Create textarea
      const textarea = document.createElement('textarea');
      const stage = textNode.getStage();
      const container = stage.container();
      container.appendChild(textarea);

      // Position textarea over text
      const textPosition = textNode.absolutePosition();
      const stageBox = stage.container().getBoundingClientRect();

      textarea.value = textNode.text();
      textarea.style.position = 'absolute';
      textarea.style.top = (textPosition.y + stageBox.top) + 'px';
      textarea.style.left = (textPosition.x + stageBox.left) + 'px';
      textarea.style.width = textNode.width() + 'px';
      textarea.style.height = textNode.height() + 'px';
      textarea.style.fontSize = textNode.fontSize() + 'px';
      textarea.style.border = 'none';
      textarea.style.background = 'none';
      textarea.style.outline = 'none';
      textarea.style.resize = 'none';
      textarea.style.overflow = 'hidden';
      textarea.style.transformOrigin = 'left top';
      textarea.style.textAlign = 'center';
      textarea.focus();

      textarea.addEventListener('input', () => {
        textNode.text(textarea.value);
        this.text = textarea.value;
      });

      textarea.addEventListener('blur', () => {
        textNode.text(textarea.value);
        this.text = textarea.value;
        container.removeChild(textarea);
        this.editableTextNode = null;
      });
    },
    selectShape(name) {
      this.selectedShapeName = name;
      this.updateTransformer();
    },
    updateTransformer() {
      const transformerNode = this.$refs.transformer.getNode();
      const stage = transformerNode.getStage();
      const selectedNode = stage.findOne(`.${this.selectedShapeName}`);
      if (selectedNode) {
        transformerNode.nodes([selectedNode]);
      } else {
        transformerNode.nodes([]);
      }
      transformerNode.getLayer().batchDraw();
    },
    handleTransformEnd(e) {
      const shape = this.rectangles.find(r => r.name === this.selectedShapeName);
      if (shape) {
        shape.x = e.target.x();
        shape.y = e.target.y();
        shape.scaleX = e.target.scaleX();
        shape.scaleY = e.target.scaleY();
        shape.rotation = e.target.rotation();
      }
    },
    handleStageMouseDown(e) {
      // clicked on stage - clear selection
      if (e.target === e.target.getStage()) {
        this.selectedShapeName = '';
        this.updateTransformer();
        return;
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer =
          e.target.getParent().className === 'Transformer';
      if (clickedOnTransformer) {
        return;
      }

      // find clicked rect by its name
      const name = e.target.name();
      const rect = this.rectangles.find((r) => r.name === name);
      if (rect) {
        this.selectedShapeName = name;
      } else {
        this.selectedShapeName = '';
      }
      this.updateTransformer();
    },

    initStage() {
      for (let n = 0; n < 30; n++) {
        this.list.push({
          id: Math.round(Math.random() * 10000).toString(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          rotation: Math.random() * 180,
          scale: Math.random(),
        });
      }
    },
    handleDragstart(e) {
      this.dragItemId = e.target.id();  // Ensure dragItemId is set from the event

      if (!this.dragItemId) {
        console.error("No dragItemId found");
        return;
      }

      const item = this.list.find((i) => i.id === this.dragItemId);
      if (!item) {
        console.error("Item not found for id:", this.dragItemId);
        return;
      }

      // Move the item to the end of the list to bring it to the top visually (if necessary)
      const index = this.list.indexOf(item);
      if (index > -1) {
        this.list.splice(index, 1);  // Remove item
        this.list.push(item);  // Add item at the end of the list
      }
    },
    handleDragend(e) {
      this.dragItemId = null;
    },
    handleWheel(e) {
      if (this.ctrlPressed) {
        const stage = this.$refs.stage.getStage();
        const scaleBy = 1.02;
        const oldScale = stage.scaleX();
        const mousePos = stage.getPointerPosition();
        const newScale = e.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        stage.scale({ x: newScale, y: newScale });
        const newPos = {
          x: mousePos.x - ((mousePos.x - stage.x()) / oldScale) * newScale,
          y: mousePos.y - ((mousePos.y - stage.y()) / oldScale) * newScale,
        };
        stage.position(newPos);
        stage.batchDraw();
      }
    },
    handleKeyDown(e) {
      if (e.ctrlKey) {
        this.ctrlPressed = true;
      }
    },
    handleKeyUp(e) {
      if (!e.ctrlKey) {
        this.ctrlPressed = false;
      }
    },
  },
};
</script>

<style>
.editor-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
}

#stage-container {
  position: relative;
  background-color: #c5e3d9;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
