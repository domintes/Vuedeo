<template>
  <nav class="navbar">
    <div class="navbar-left">
      <slot></slot>
    </div>
    <div class="navbar-right">
      <button class="settings-btn" @click="toggleSettingsMenu">
        <i class="pi pi-cog"></i>
      </button>
    </div>

    <div v-if="showSettings" class="settings-overlay" @click.self="toggleSettingsMenu">
      <div class="settings-menu">
        <h3>Settings</h3>
        <div class="grid-controls">
          <label>Grid Columns:</label>
          <button @click="updateGridColumns(gridColumns - 1)" :disabled="gridColumns <= 1">-</button>
          <span>{{ gridColumns }}</span>
          <button @click="updateGridColumns(gridColumns + 1)" :disabled="gridColumns >= 7">+</button>
        </div>
        <button class="close-btn" @click="toggleSettingsMenu">Close</button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  props: {
    gridColumns: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      showSettings: false
    };
  },
  methods: {
    updateGridColumns(value) {
      // Ensure the emitted event is clear and specific to grid updates
      this.$emit('update-grid-columns', value);
    },
    toggleSettingsMenu() {
      this.showSettings = !this.showSettings;
    }
  }
};
</script>

<style scoped>
.navbar {
    position: fixed;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--card-bg);
    color: var(--text-color);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.settings-btn {
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 1.5rem;
    cursor: pointer;
    transition: transform 0.2s;
}

.settings-btn:hover {
  transform: scale(1.2);
}

.settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.settings-menu {
    background: var(--card-bg);
    color: var(--text-color);
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    text-align: center;
}

.grid-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

button {
    background: var(--secondary-color);
    color: var(--primary-color);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

button:hover:not(:disabled) {
    background: var(--hover-color);
}

.close-btn {
    background: var(--secondary-color);
    color: var(--primary-color);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background: var(--hover-color);
}
</style>
