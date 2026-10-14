import axios from '@/lib/apirequest'

export const login = ({ phone, password }) => {
  const data = {
    phone,
    password
  }
  return axios.request({
    url: 'api_users/login',
    data,
    method: 'post'
  })
}

export const getUserInfo = (token) => {
  const data = {
    token
  }
  return axios.request({
    url: 'api_users/usermessage',
    data,
    method: 'post'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'logout',
    method: 'post'
  })
}