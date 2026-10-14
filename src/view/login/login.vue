<template>
	<div class="logindemo form-bg">
		<div class="container">
			<div class="row">
				<div class="login-container col-md-offset-4 col-md-4">
					<!-- <img class="back" src="../../assets/images/login/18.png"> -->
					<!-- <h3>圣麟 <sub>Data Max</sub></h3> -->
					<h3>圣麟大数据可视化平台</h3>
					<div class="form-horizontal">
						<div class="form-group">
							<input v-on:keyup.enter="Login" v-model="phone" type="text" class="form-control" id="username" placeholder="手机号">
							<i class="fa fa-user"></i>
						</div>
						<div class="form-group help">
							<input v-on:keyup.enter="Login" v-model="password" type="password" class="form-control" id="password" placeholder="密码">
							<i class="fa fa-lock"></i>
						</div>
						<div class="form-group">
							<span class="text">{{errormessage}}</span>
							<button v-on:keyup.enter="Login" v-on:click="Login"  class="btn btn-default">登录</button>
						</div>
					</div>
				</div>
			</div>
			<div class="login-rightPhoto"></div>
		</div>
	</div>
</template>

<script>
	import '../../assets/css/login/zzsc.css';
	import '../../assets/css/login/login.css';
	import { mapActions } from 'vuex'
	export default({
		 data(){ 
		 	return {
		 		errormessage:"",
		 		password:"",
		 		phone:"",
		 		baseurl:"http://114.115.183.117:8080/iot-web"
		 }
		},
		 methods: {
		 	...mapActions([
		      'handleLogin',
		      'getUserInfo'
		    ]),
		  	Login(){
		  		if(this.isNull(this.phone)){
		  			this.errormessage="手机号不能为空";
		  			return;
		  		}
		  		if(this.isNull(this.password)){
		  			this.errormessage="密码不能为空";
		  			return;
		  		}
		  		var params = {
		  			phone:this.phone,
		  			password:this.password
		  		}
		  		this.handleLogin({params}).then(res => {
		  			if (res.code=="1") {
		  				this.getUserInfo().then(ress => {
				          this.$router.push({
				            name: this.$config.homeName
				          })
				        })
		  			}else{
		  				this.errormessage=res.message;
		  			}
			    })	
		  	},
			isNull:function (str) {
			  if ( str == "" ) {
			    return true;
			  }
			  var regu = "^[ ]+$";
			  var re = new RegExp(regu);
			  return re.test(str);
			}
		}
	})
</script>