// 图表
const imgeditor = () => import('@/view/imgmodules/imgeditor.vue')
const preview = () => import('@/view/imgmodules/preview.vue')
// 网络图
const networkEditor = () => import('@/view/network/editor.vue')
const networkView = () => import('@/view/network/view.vue')
// 业务图
const applicationEditor = () => import('@/view/application/editor.vue')
const applicationView = () => import('@/view/application/view.vue')

export const route = [
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
	}
  ]