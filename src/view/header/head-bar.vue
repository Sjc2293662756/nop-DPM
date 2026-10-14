<template>
  <div class="header_bar">
      <img class="logo" :src="logoUrl">
      <div class="title">
      </div>
      <div class="user_container">
          <div class="user_manage">
              <img :src="headurl" v-on:click.stop="showUserMessage">
              <div class="user_message" :style="userstyle">
                <div class="user_name">{{name}}</div>
                <div v-on:click="logOut" class="logout">退出登录</div>
              </div>
          </div>
      </div>
      <!-- user_container_end -->
  </div>
</template>

<script>
  import './head-bar.less'
  import { mapActions } from 'vuex'
  const logoUrl = require('@/assets/logo.png')
  export default {
    name: 'HeaderBar',
    components: {
      
    },
    data () {
      return {
        userstyle:{
          display:"none"
        },
        logoUrl:logoUrl,
        headurl:"",
        name:""
      }
    },
    mounted:function(){
        this.name = this.$store.state.user.userName;
        this.headurl = this.$store.state.user.avatar;
    },
    methods:{
      ...mapActions([
          'handleLogOut'
      ]),
      logOut(){
        this.handleLogOut().then(function(){
          this.$router.push({
            name:'login'
          })
        }.bind(this))
      },
      showUserMessage(){
        if (this.userstyle.display == "none") {
          this.userstyle.display = "";
        }else{
          this.userstyle.display = "none";
        }
      },
      hiddenUserMessage(){
        this.userstyle.display = "none";
      },
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
