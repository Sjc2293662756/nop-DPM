import axios from '@/lib/apirequest'

export const Login = ({userName,passWord})=>{
	const data = {
		name:'testa',
		password:"111111"
	}
	return axios.request({
		url:"user/fingerRegister",
		data:data,
		method:'post'
	})
}