import {
 	modelList
} from '@/apis/model'

export default{
	state:{
	},//state_end
	mutations:{
		
	},//muntations_end
	getters:{

	},//getters_end
	actions:{
		// 获取分组列表
	    modelLists ({ commit }) {
	      return new Promise((resolve, reject) => {
	        modelList(this.state.user.token).then(res => {
	          const data = res.data;
	          resolve(data);
	        }).catch(err => {
	          reject(err)
	        })
	      })
	    }
	} // actions_end
}