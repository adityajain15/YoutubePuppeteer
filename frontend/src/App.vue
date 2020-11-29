<template>
  <div id="app">
    <div id="nav" class="tc mb4">
      <router-link to="/">Views</router-link> |
      <router-link to="/about">Categories</router-link> |
      <router-link to="/time">Length</router-link>
    </div>
    <router-view/>
  </div>
</template>
<script>
export default {
  name: 'App',
  created () {
    this.$store.dispatch('getVideos')
  }
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
