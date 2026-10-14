import {
  groupList,
  addGroup,
  delGroup,
  editGroup
} from '@/apis/group'

import { setToken, getToken,setHasGetInfo } from '@/lib/util'

export default{
	state:{
	},//state_end
	mutations:{
		
	},//muntations_end
	getters:{

	},//getters_end
	actions:{
		// 获取分组列表
	    getGroupList ({ commit }) {
	      return new Promise((resolve, reject) => {
	        groupList(this.state.user.token).then(res => {
	          const data = res.data;
	          resolve(data);
	        }).catch(err => {
	          reject(err)
	        })
	      })
	    },
	    addGroup({ commit },{params}){
	    	const token = this.state.user.token;
	    	const title = params.title;
			return new Promise((resolve, reject) => {
		        addGroup({
		        	token,
		        	title
		        }).then(res => {
		          const data = res.data;
		          resolve(data);
		        }).catch(err => {
		          reject(err)
		        })
		     })
	    },
	    delGroup({ commit },{params}){
	    	const token = this.state.user.token;
	    	const id = params.id;
			return new Promise((resolve, reject) => {
		        delGroup({
		        	token,
		        	id
		        }).then(res => {
		          const data = res.data;
		          resolve(data);
		        }).catch(err => {
		          reject(err)
		        })
		     })
	    },
	    editGroup({ commit },{params}){
	    	const token = this.state.user.token;
	    	const id = params.id;
	    	const title = params.title;
			return new Promise((resolve, reject) => {
		        editGroup({
		        	token,
		        	id,
		        	title
		        }).then(res => {
		          const data = res.data;
		          resolve(data);
		        }).catch(err => {
		          reject(err)
		        })
		     })
	    }
	} // actions_end
}