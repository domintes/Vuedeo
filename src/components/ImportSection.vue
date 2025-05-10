<template>
  <div class="import-section">
    <div class="import-options">
      <div class="unified-import">
        <div class="import-controls">
          <div class="file-input-wrap">
            <input 
              type="file" 
              accept=".csv,.html" 
              @change="handleFileUpload" 
              class="file-input" 
              ref="fileInput"
              :key="fileInputKey"
            />
            <button class="select-file-btn" @click="triggerFileInput">
              <i class="pi pi-upload"></i>
              Select File
            </button>
          </div>
          <button 
            @click="importFile" 
            class="import-btn"
            :disabled="!selectedFile"
            :title="!selectedFile ? 'Choose collection file to import' : ''"
          >
            Import
          </button>
        </div>
        <div v-if="!selectedFile" class="input-info">Choose collection file to import</div>
        <div v-else class="file-display">
          <span class="file-name">{{ selectedFile.name }}</span>
          <button class="remove-file-btn" @click="clearFile">&times;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImportSection',
  props: {
    selectedFile: {
      type: Object,
      default: null
    }
  },
  emits: ['file-selected', 'file-clear', 'import'],
  data() {
    return {
      fileInputKey: 0 // Used to reset the file input
    };
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // Store file info in localStorage
        localStorage.setItem('lastSelectedFile', JSON.stringify({
          name: file.name,
          lastModified: file.lastModified,
          type: file.type
        }));
        this.$emit('file-selected', file);
      }
    },
    clearFile() {
      // Clear file from localStorage and reset file input
      localStorage.removeItem('lastSelectedFile');
      this.fileInputKey++; // This forces the file input to reset
      this.$emit('file-clear');
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    importFile() {
      this.$emit('import');
    }
  },
  mounted() {
    // Check for last selected file in localStorage
    const lastSelectedFile = localStorage.getItem('lastSelectedFile');
    if (lastSelectedFile) {
      this.$emit('file-selected', JSON.parse(lastSelectedFile));
    }
  }
};
</script>
