import axios from '@/lib/apirequest'
import { isDpmUrl, readDpmUrl } from '@/dataSources/dpm/query'
import { executeDpm } from '@/dataSources/dpm/execute'
import { Message } from 'element-ui'
// axios.defaults.withCredentials = true;

export const fileUpload = (data) => {
  return axios.request({
    url: 'NetInside/admin/viewfile.asp?m=uploadImg&id='+data.id,
    data:data.formData,
    method: 'post',
    headers:{
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 假设this.formData已经在作用域内定义，并且axios已经被正确引入
export const ajax = ({url, widget}) => {
  if (isDpmUrl(url)) {
    let nodeRequest = false
    try { nodeRequest = readDpmUrl(url).config.view === 'nodes' } catch (error) { /* executeDpm reports invalid configurations. */ }
    return executeDpm(url, target => axios.request({
      url: 'NetInside/admin/datasource.asp?m=proxy',
      params: { url: target },
      method: 'get',
      timeout: 30000,
      headers: { Accept: 'text/csv, application/json, text/plain' }
    }), widget).catch(error => {
      // Node discovery has an inline retry/error state in DatabaseFields.
      if (!nodeRequest) Message.error('数据库数据加载失败：' + error.message)
      return Promise.reject(error)
    })
  }
  var data = {url};
  console.log("data",data);
  
      if (data.url && data.url.indexOf('/NetInside/')!== -1) {
        console.log(11111111)
          // 如果data中的url包含/NetInside/，直接使用这个url发送请求，不走params
          return axios.request({
              url: data.url,
              method: 'get',
              headers: {
                  'Content-Type': 'application/json;charset=UTF-8',
                  'Accept': 'application/json;charset=UTF-8',
               },
              // credentials: 'include'
              // withCredentials: true
          });
      } else {
        console.log(2222)
          // 如果不包含/NetInside/，使用带params的方式发送请求
          return axios.request({
              url: 'NetInside/admin/datasource.asp?m=proxy',
              params: data,
              method: 'get',
              headers: {
                  'Content-Type': 'application/json;charset=UTF-8',
                  'Accept': 'application/json;charset=UTF-8'
              }
          });
      }
  throw new Error('this.formData is not defined');
};



// export const ajax = ({url}) => {
//   var data = {url};
//   // if(url.startsWith())
//     return axios.request({
//       url: 'NetInside/admin/datasource.asp?m=proxy',
//       params:data,
//       method: 'get',
//       headers:{
//         'Content-Type':'application/json;charset=UTF-8',
//         'Accept':'application/json;charset=UTF-8'
//       }
//     })
// }


export const localAjax = ({url}) => {
    return axios.request({
      url: url,
      method: 'get',
      headers:{
        'Content-Type':'application/json;charset=UTF-8',
        'Accept':'application/json;charset=UTF-8'
      }
    })
}
