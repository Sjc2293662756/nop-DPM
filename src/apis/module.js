import axios from '@/lib/apirequest'

export const moduleList = ({token,groupid}) => {
  const data = {
    token,
    groupid
  }
  return axios.request({
    url: 'api_module/modulelist',
    data,
    method: 'post'
  })
}

export const addModule = ({token,id,datas,title,width,height,resizetype,coverimg,headimg}) => {
  // token,modelid,title,width,height,coverimg,groupid,resizetype,datas
  // const data = {
  //   token,modelid,title,width,height,coverimg,groupid,resizetype,datas
  // }
  // return axios.request({
  //   url: 'api_module/addmodule',
  //   data,
  //   method: 'post'
  // })
  const data = {
    token,
    file_id:id,
    cfg_json:datas,
    title,
    width,
    height,
    resizetype,
    coverimg,
    headimg
  }
  return axios.request({
    url: 'NetInside/admin/viewfileconfig.asp?m=add',
    data,
    method: 'post'
  })
}

export const delModule = ({token,id}) => {
  const data = {
    token,
    id
  }
  return axios.request({
    url: 'api_module/delmodule',
    data,
    method: 'post'
  })
}

export const editModule = ({token,id,datas,title,width,height,resizetype,coverimg,headimg}) => {
  const data = {
    token,
    file_id:id,
    cfg_json:datas,
    title,
    width,
    height,
    resizetype,
    coverimg,
    headimg,
  }
  return axios.request({
    url: 'NetInside/admin/viewfileconfig.asp?m=update',
    data,
    method: 'post'
  })
}

export const moduleMessage = ({token,id}) => {
  const data = {
    token,
    file_id:id
  }
  return axios.request({
    url: 'NetInside/admin/viewfileconfig.asp?m=get',
    params:data,
    method: 'get'
  })
}
// 获取对象 getobjects 
export const getObjects = () => {
  return axios.request({
    url: 'webservice/NetInside?type=groups&json=true',
    method: 'get'
  })
}
// 指标
export const getMetrics = () => {
  return axios.request({
    url: 'NetInside/static/js/metrics.json',
    method: 'get'
  })
}
// 获取本地用户指标
export const getLocalUserMetrics = () => {
  return axios.request({
    url: 'NetInside/js/local_Usermetrics.json',
    method: 'get'
  })
}
// 获取本地进程数据指标local_TopDatametrics
export const getLocalTopDataMetrics = () => {
  return axios.request({
    url: 'NetInside/js/local_TopDatametrics.json',
    method: 'get'
  })
}
// 获取本地节点数据指标pestat_data
export const getLocalpestat_dataMetrics = () => {
  return axios.request({
    url: 'NetInside/js/pestat_data.json',
    method: 'get'
  }) 
}
// 获取本地作业数据指标squeue_data
export const getLocalsqueue_dataMetrics = () => {
  return axios.request({
    url: 'NetInside/js/squeue_data.json',
    method: 'get'
  })
}
// 获取本地服务器数据指标local_TopSummaryDatametrics
export const getLocalTopSummaryDataMetrics = () => {
  return axios.request({
    url: 'NetInside/js/local_TopSummaryDatametrics.json',
    method: 'get'
  })
}
// 排序指标
export const getTopMetrics = () => {
  return axios.request({
    url: 'NetInside/js/top_metrics.json',
    method: 'get'
  })
}
// 获取数据源
export const getIps = () => {
  return axios.request({
    url: 'NetInside/admin/datasource.asp?m=listJson',
    method: 'get'
  })
}
// 导入
export const importJson = (data) => {
  return axios.request({
    url: `NetInside/admin/viewfileconfig.asp?m=import&file_id=${data.file_id}`,
    method: 'post',
    data:data.formData,
  })
}
// 导出
export const exportJson = (data) => {
  return axios.request({
    url: `NetInside/admin/viewfileconfig.asp?m=export&file_id=${data.file_id}`,
    method: 'post',
  })
}