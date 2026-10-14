import {
  login,
  logout,
  getUserInfo,
} from '@/apis/user'

import { setToken, getToken,setHasGetInfo } from '@/lib/util'

export default{
	state:{
		userName:"",
		token:getToken('token'),
		access:[],
		avatar:"",
		setHasGetInfo:false
	},//state_end
	mutations:{
		setToken (state, token) {
	      state.token = token;
	      setToken("token",token)
	    },
	    setUserName (state, name) {
	      state.userName = name;
	    },
	    // 后台获取用户登录权限并保存
	    setAccess (state, access) {
	      state.access = access;
	    },
	    // 后台获取用户登录权限并保存
	    setHasGetInfo (state, access) {
	      state.setHasGetInfo = access;
	    },
	    setAvator(state,access){
	      state.avatar = access;
	    }
	},//muntations_end
	getters:{

	},//getters_end
	actions:{
		// 登录
	    handleLogin ({ commit }, {params}) {
	      const phone = params.phone.trim(); //去掉特殊字符，编码小于32的所有字符
	      const password = params.password;
	      return new Promise((resolve, reject) => {
	        login({
	          phone,
	          password
	        }).then(res => {
	        	const data = res.data;
	        	if (data.code=="1") {
		          	commit('setToken', data.data.userMessage.sessiontoken)
		          	commit('setHasGetInfo', true)
	        	}
	          resolve(data);
	        }).catch(err => {
	          reject(err)
	        })
	      })
	    },
	    // 退出登录
	    handleLogOut ({ state, commit }) {
	      return new Promise((resolve, reject) => {
	        // logout(state.token).then(() => {
	        //   commit('setToken', '')
	        //   commit('setAccess', [])
	        //   resolve()
	        // }).catch(err => {
	        //   reject(err)
	        // })
	        
	        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
	        commit('setToken', '')
	        // commit('setAccess', [])
	        resolve()
	      })
	    },
	    // 获取用户相关信息
	    getUserInfo ({ state, commit }) {
	      return new Promise((resolve, reject) => {
	        try {
	          getUserInfo(state.token).then(res => {
	            const data = res.data;
	            commit('setAvator', data.datas.headurl)
	            commit('setUserName', data.datas.name)
	            // commit('setAccess', data.access)
	            commit('setHasGetInfo', true)
	            resolve(data)
	          }).catch(err => {
	            reject(err)
	          })
	        } catch (error) {
	          reject(error)
	        }
	      })
	    },
	} // actions_end
}