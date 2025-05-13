<template>
  <div class="text-editor-container">
    <div class="control-group">
      <button @click="closeEditor">Close</button>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'

export default {
  components: {
    EditorContent,
  },
  props: {
    initialContent: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      editor: null,
    }
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Color,
        TextStyle,
      ],
      content: this.initialContent,
      onUpdate: () => {
        this.$emit('update:content', this.editor.getHTML())
      }
    })
  },
  beforeUnmount() {
    this.editor.destroy()
  },
  methods: {
    closeEditor() {
      this.$emit('close')
    }
  }
}
</script>