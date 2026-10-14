<template>
  <div id="home_container">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'home',
    components: {
    },
    data () {
      return {
        msg: 'Welcome to Your Here'
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
</style>
