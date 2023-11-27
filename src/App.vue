<template>
  <div id="app">
    <div class="app-container">
      <MapComponent />
    </div>
  </div>
</template>

<script>
import MapComponent from '@/components/MapComponent.vue';

export default {
  components: {
    MapComponent
  },
  methods: {
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
}

.app-container {
  display: flex;
}
</style>
