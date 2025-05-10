<template>
  <Layout />
</template>

<script>
import Layout from './components/Layout.vue';

export default {
  name: 'App',
  components: {
    Layout
  }
};
</script>

<style>

body {
  margin: 0;
  padding: 0; 
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

nav {
  padding: 20px;
  background: #2196F3;
  width: 100%;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1em;
  margin: 0;
}

nav a:hover {
  text-decoration: underline;
}
</style>
