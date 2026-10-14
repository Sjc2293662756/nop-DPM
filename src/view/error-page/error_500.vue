<template>
	<error-content code="500" desc="Oh~~您没有浏览这个页面的权限~" :src="src"/>
</template>
<script>
	import error401 from '@/assets/images/error-page/error-405.png'
	import errorContent from './error-content.vue'
	export default{
		name:"error_405",
		components:{
			errorContent
		},
		data(){
			return {
				src : error401
			}
		}
	}
</script>