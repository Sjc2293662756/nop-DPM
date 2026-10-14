import {
  moduleList,
  addModule,
  delModule,
  editModule,
  moduleMessage
} from '@/apis/module'

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
	    getModuleList ({ commit },{params}) {
	      const token = this.state.user.token;
	      var groupid = params.groupid;
	      return new Promise((resolve, reject) => {
	        moduleList({
	        	token,
	        	groupid
	        }).then(res => {
	          const data = res.data;
	          resolve(data);
	        }).catch(err => {
	          reject(err)
	        })
	      })
	    },
	    moduleMessage({ commit },{params}){
	    	const token = this.state.user.token;
	      	var id = params.id;
	      	return new Promise((resolve, reject) => {
		        moduleMessage({
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
	    addModule({ commit },{params}){
			const token = this.state.user.token;
	    	const id = params.id;
	    	const datas= params.datas;
	    	const title = params.title;
	    	const width = params.width;
	    	const height = params.height;
	    	const resizetype = params.resizetype;
	    	const coverimg = params.coverimg;
	    	const headimg = params.headimg;			
	    	// const token = this.state.user.token;
	    	// const modelid = params.modelid;
	    	// const title = params.title;
            // const width = params.width;
            // const height= params.height;
            // const coverimg= params.coverimg;
            // const groupid= params.groupid;
            // const resizetype= params.resizetype;
            // const datas = params.datas;
			return new Promise((resolve, reject) => {
		        addModule({
		        	// token,
		        	// modelid,
		        	// title,
		        	// width,
		        	// height,
		        	// coverimg,
		        	// groupid,
		        	// resizetype,
		        	// datas
					token,
		        	id,
		        	datas,
		        	title,
		        	width,
		        	height,
		        	resizetype,
		        	coverimg,
		        	headimg,
		        }).then(res => {
		          const data = res.data;
		          resolve(data);
		        }).catch(err => {
		          reject(err)
		        })
		     })
	    },
	    delModule({ commit },{params}){
	    	const token = this.state.user.token;
	    	const id = params.id;
			return new Promise((resolve, reject) => {
		        delModule({
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
	    editModule({ commit },{params}){
	    	const token = this.state.user.token;
	    	const id = params.id;
	    	const datas= params.datas;
	    	const title = params.title;
	    	const width = params.width;
	    	const height = params.height;
	    	const resizetype = params.resizetype;
	    	const coverimg = params.coverimg;
	    	const headimg = params.headimg;
			return new Promise((resolve, reject) => {
		        editModule({
		        	token,
		        	id,
		        	datas,
		        	title,
		        	width,
		        	height,
		        	resizetype,
		        	coverimg,
		        	headimg,
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