<template>
  <div class="layout">
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import Navbar from './Navbar.vue';

export default {
  name: 'Layout',
  components: {
    Navbar
  },
  data() {
    return {
      gridColumns: 3
    };
  },
  methods: {
    updateGridColumns(value) {
      this.gridColumns = Math.max(1, Math.min(7, value));
    }
  }
};
</script>

<style scoped>
.layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

main {
    flex: 1;
    overflow-y: none;
}
</style>
