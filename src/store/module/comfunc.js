import {
 	fileUpload,
 	ajax,
	localAjax
} from '@/apis/comfunc'
import router from '@/pages/index/router'
import axios from 'axios'

export default{
	state:{
	},//state_end
	mutations:{
		
	},//muntations_end
	getters:{

	},//getters_end
	actions:{
		// 获取分组列表
	    fileUpload ({ commit },params) {
	      return new Promise((resolve, reject) => {
	      	var data = params;
	      	// data.append('token',this.state.user.token)
	        fileUpload(data).then(res => {
	          const data = res.data;
	          resolve(data);
	        }).catch(err => {
	          reject(err)
	        })
	      })
	    },
	    ajax({ commit },{params}){
	    	const url = params.url;
	    	return new Promise((resolve, reject) => {
		      	ajax({url, widget: params.widget}).then(res => {
		          const data = res.data;
		          resolve(data);
		        }).catch(err => {
		          reject(err)
		        })
		    })
	    },
		localAjax({ commit },{params}){
	    	const url = params.url;
			console.log('url111',url)
	    	return new Promise((resolve, reject) => {
				localAjax({url}).then(res => {
					console.log('res0000',res)
		          const data = res.data;
		          resolve(data);
		        }).catch(err => {
		          reject(err)
		        })
		    })
	    }
	} // actions_end
}
