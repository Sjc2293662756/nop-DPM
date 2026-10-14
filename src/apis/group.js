import axios from '@/lib/apirequest'

export const groupList = (token) => {
  // const data = {
  //   token
  // }
  return axios.request({
    url: 'NetInside/admin/viewfolder.asp?m=list',
    // data,
    method: 'get'
  })
}

export const addGroup = ({token,title}) => {
  const data = {
    token,
    title
  }
  return axios.request({
    url: 'api_group/addgroup',
    data,
    method: 'post'
  })
}

export const delGroup = ({token,id}) => {
  const data = {
    token,
    id
  }
  return axios.request({
    url: 'api_group/delgroup',
    data,
    method: 'post'
  })
}
export const editGroup = ({token,id,title}) => {
  const data = {
    token,
    id,
    title
  }
  return axios.request({
    url: 'api_group/editgroup',
    data,
    method: 'post'
  })
}