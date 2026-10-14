<template>
  <div id="app">
    <router-view :key="$route.fullpath"></router-view>
    <platform-session />
  </div>
</template>

<script>
  import PlatformSession from '@/components/PlatformSession.vue'
  export default {
    name: 'App',
    components: { PlatformSession },
  }
</script>
<style>
	body,html{
	  margin: 0px;
	  padding: 0px;
	  height: 100%;
	  width: 100%;
	}
	#app{
		min-height: 100%;
	}
</style>
