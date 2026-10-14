export function describeDpmError (error) {
  if (error.code === 'DPM_EMPTY_RESPONSE') return '数据源未返回可解析的数据库结果。请确认该数据源支持 DPM 查询，并选择有数据库记录的时间范围。'
  if (error.code === 'PLATFORM_LOGIN_REQUIRED') return '平台登录会话已过期，请登录平台后重新加载节点。'
  const status = error.response && error.response.status
  if (status === 400) return '查询被拒绝（HTTP 400）。请核对查询时间、数据源设备时间及 DPM 接口支持情况。'
  if (status === 403) return '数据库查询权限不足（HTTP 403），请检查平台和数据源的访问权限。'
  if (status === 404) return '数据库查询接口未找到（HTTP 404），请确认数据源地址与 DPM 部署路径。'
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return '数据库查询超时，请检查数据源连接后重试。'
  return error.message || '数据库查询失败，请检查数据源连接。'
}
