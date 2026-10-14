import mains from '@/view/main/main.vue'
import login from '@/view/login/login'
import home from '@/view/home/home.vue'
import imgeditor from '@/view/imgmodules/imgeditor.vue'
import preview from '@/view/imgmodules/preview.vue'

import error_401 from '@/view/error-page/error_401.vue'
import error_404 from '@/view/error-page/error_404.vue'
import error_500 from '@/view/error-page/error_500.vue'

// 网络图
import networkEditor from '@/view/network/editor.vue'
import networkView from '@/view/network/view.vue'
// 业务图
import applicationEditor from '@/view/application/editor.vue'
import applicationView from '@/view/application/view.vue'

export const route = [
	{
	  path: '/',
	  name: '_home',
	  redirect: '/home',
	  meta:{
	  },
	  component:mains,
	  children:[
	  	{
	  		path:"/home",
	  		name:'home',
	  		meta:{
	  			title:"首页",
	  			icon:""
	  		},
	  		component:home
	  	}
	  ],
	},
	{
		path: '/login',
		name: 'login',
		component:login
	},
	{	
		name: 'imgeditor',
		path: '/imgeditor',
		component:imgeditor,
		meta:{
			title:"视图定制",
		},
	},
	{	
		name: 'preview',
		path: '/preview',
		component:preview,
		meta:{
			authorization:false,
			title:"视图定制",
		}
	},
	// 网络图编辑
	{	
		name: 'networkEditor',
		path: '/network/editor',
		component:networkEditor,
		meta:{
			authorization:false,
			title:"网络图",
		}
	},
	// 网络图查看
	{	
		name: 'networkView',
		path: '/network/view',
		component:networkView,
		meta:{
			authorization:false,
			title:"网络图",
		}
	},
	// 业务图编辑
	{	
		name: 'applicationEditor',
		path: '/application/editor',
		component:applicationEditor,
		meta:{
			authorization:false,
			title:"业务图",
		}
	},
	// 业务图查看
	{	
		name: 'applicationView',
		path: '/application/view',
		component:applicationView,
		meta:{
			authorization:false,
			title:"业务图",
		}
	},
	{
	  	path: '/401',
	  	name: 'error_401',
	  	meta: {
	  	  hideInMenu: true
	  	},
	  	component:error_401
	},
	{
	  	path: '/500',
	  	name: 'error_500',
	  	meta: {
	  	  hideInMenu: true
	  	},
	  	component: error_500
	},
	{
	  	path: '/404',
	  	name: 'error_404',
	  	meta: {
	  	  hideInMenu: true
	  	},
	  	component: () => error_404
	}
  ]