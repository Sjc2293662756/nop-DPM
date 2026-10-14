<template>
	<error-content code="404" desc="Oh~~您没有浏览这个页面的权限~" :src="src"/>
</template>
<script>
	import error401 from '@/assets/images/error-page/error-404.png'
	import errorContent from './error-content.vue'
	export default{
		name:"error_404",
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