<template>
  <div class="header_bar">
      <img class="logo" :src="logoUrl">
      <div class="title">
        <h3>组织人员管理</h3>
      </div>
      <div class="user_container">
          <div @click="goHome" class="user_message">
            <img :src="homeUrl">
            <span>首页</span>
          </div>
          <div class="user_manage">
              
          </div>
      </div>
  </div>
</template>

<script>
  import './header-bar.less'
  const logoUrl = require('@/assets/logo.png')
  const homeUrl = require('@/assets/images/header/home.png')
  export default {
    name: 'HeaderBar',
    components: {
      
    },
    data () {
      return {
        logoUrl:logoUrl,
        homeUrl:homeUrl,
        msg: 'Welcome to Your Here'
      }
    },
    methods:{
      goHome(){
        this.$router.push({
          name: this.$config.homeName
        })
      }
    }
  }
</script>

<style scoped>

</style>
