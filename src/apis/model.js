import axios from '@/lib/apirequest'

export const modelList = (token) => {
  const data = {
    token
  }
  return axios.request({
    url: 'api_model/modellist',
    data,
    method: 'post'
  })
}
