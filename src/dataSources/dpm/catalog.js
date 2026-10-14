// Database field names and query recipes come from NetInside DPM 4.0.
// Units are read from response headers; field names alone do not imply a scale.
const field = (id, name, category, aliases, type = 'number') => ({ id, name, category, aliases, type })

export const FIELDS = [
  field('QUERY_COUNT', '查询数', '数据库访问', ['Transactions', 'Query Count', '查询数', '交易总数']),
  field('QUERY_COUNT_RATE', '查询速率', '数据库访问', ['Transaction Rate', 'Query Count Rate']),
  field('AVG_FINAL_RESP_TIME', '平均最终响应时间', '数据库响应', ['Average Response Time (Final Response)']),
  field('AVG_FIRST_RESP_TIME', '平均首包响应时间', '数据库响应', ['Average Response Time (First Response)']),
  field('BYTES_RETURNED', '返回数据量', '数据返回', ['Kbytes Returned', 'Bytes Returned']),
  field('BYTES_RETURNED_RATE', '返回数据速率', '数据返回', ['Rate of Kbytes Returned', 'Rate of Bytes Returned']),
  field('AVG_BYTES_RETURNED', '平均返回数据量', '数据返回', ['Average Kbytes Returned', 'Average Bytes Returned']),
  field('PACKETS_RETURNED', '返回数据包数', '数据包', ['Packets Returned']),
  field('PACKETS_RETURNED_RATE', '返回数据包速率', '数据包', ['Rate of Packets Returned']),
  field('AVG_PACKETS_RETURNED', '平均返回数据包数', '数据包', ['Average Packets Returned']),
  field('ROWS_AFFECTED', '影响行数', '影响行数', ['Rows Affected']),
  field('ROWS_AFFECTED_RATE', '影响行数速率', '影响行数', ['Rate of Rows Affected']),
  field('AVG_ROWS_AFFECTED', '平均影响行数', '影响行数', ['Average Rows Affected']),
  field('FINAL_RESP_TIME', '最终响应时间', '查询明细', ['Response Time (Final Response)', 'Final Response Time', 'Average Response Time (Final Response)']),
  field('QUERY_END_TIME', '查询结束时间', '查询明细', ['Query Ending Minute', 'Query End Time', 'Time', 'Timestamp'], 'time'),
  field('QUERY_TEXT', 'SQL / 查询文本', '查询明细', ['SQL Transaction', 'Query Text', 'SQL'], 'text'),
  field('DB_INSTANCE', '数据库实例', '查询明细', ['DB Instance'], 'text')
]

export const SUMMARY_FIELDS = FIELDS.slice(0, 13).map(item => item.id)
export const RUNTIME_FIELDS = ['AVG_FINAL_RESP_TIME', 'AVG_FIRST_RESP_TIME', 'QUERY_COUNT_RATE', 'BYTES_RETURNED_RATE', 'ROWS_AFFECTED_RATE']
export const RUNTIME_SORTS = {
  AVG_FINAL_RESP_TIME: 'Average Response Time (Final Response) (sec)',
  AVG_FIRST_RESP_TIME: 'Average Response Time (First Response) (sec)',
  QUERY_COUNT_RATE: 'Transaction Rate (#/min)',
  BYTES_RETURNED_RATE: 'Rate of Kbytes Returned (kbytes/min)',
  ROWS_AFFECTED_RATE: 'Rate of Rows Affected (#/min)'
}
// Grouped troubleshoot/performance tables return averages and rates, not SQL rows.
export const PERFORMANCE_FIELDS = ['QUERY_COUNT_RATE', 'AVG_FINAL_RESP_TIME', 'AVG_FIRST_RESP_TIME',
  'BYTES_RETURNED_RATE', 'AVG_BYTES_RETURNED', 'PACKETS_RETURNED_RATE', 'AVG_PACKETS_RETURNED', 'ROWS_AFFECTED_RATE', 'AVG_ROWS_AFFECTED']
export const CURVES = [
  { id: 'FinalRespTime', name: '平均最终响应时间', label: 'Average Response Time (Final Response) (sec)', field: 'AVG_FINAL_RESP_TIME', unit: '秒' },
  { id: 'FirstRespTime', name: '平均首包响应时间', label: 'Average Response Time (First Response) (sec)', field: 'AVG_FIRST_RESP_TIME', unit: '秒' },
  { id: 'TransactionRate', name: '平均事务速率', label: 'Average Transaction Rate (#/min)', field: 'QUERY_COUNT_RATE', unit: '次/分钟' }
]

export const VIEWS = [
  { id: 'summary', name: '节点统计', fields: SUMMARY_FIELDS, defaults: ['QUERY_COUNT', 'AVG_FINAL_RESP_TIME'] },
  { id: 'related', name: '访问的数据库', groupLabel: '数据库', fields: PERFORMANCE_FIELDS.filter(id => id !== 'AVG_FIRST_RESP_TIME'), defaults: ['QUERY_COUNT_RATE', 'AVG_FINAL_RESP_TIME'], node: true, clientOnly: true },
  { id: 'instances', name: '数据库实例', label: 'DB Instance', resultLabel: 'InstancesData', requestFields: ['FINAL_RESP_TIME', 'DB_INSTANCE', 'QUERY_TEXT'], fields: PERFORMANCE_FIELDS, defaults: ['AVG_FINAL_RESP_TIME', 'AVG_FIRST_RESP_TIME', 'QUERY_COUNT_RATE'], node: true },
  { id: 'applications', name: '数据库应用', label: 'Application', resultLabel: 'ApplicationsData', requestFields: ['FINAL_RESP_TIME', 'DB_INSTANCE', 'QUERY_TEXT'], fields: PERFORMANCE_FIELDS, defaults: ['AVG_FINAL_RESP_TIME', 'AVG_FIRST_RESP_TIME', 'QUERY_COUNT_RATE'], node: true },
  { id: 'commands', name: '查询命令', label: 'Query Command', resultLabel: 'CommandsData', requestFields: ['FINAL_RESP_TIME', 'DB_INSTANCE', 'QUERY_TEXT'], fields: PERFORMANCE_FIELDS, defaults: ['AVG_FINAL_RESP_TIME', 'AVG_FIRST_RESP_TIME', 'QUERY_COUNT_RATE'], node: true },
  { id: 'slow', name: '慢事务明细', label: 'Query Ending Minute', resultLabel: 'SlowestTransactionsData', fields: ['QUERY_END_TIME', 'ROWS_AFFECTED', 'FINAL_RESP_TIME', 'QUERY_TEXT'], node: true, json: true },
  { id: 'statements', name: '语句级慢事务', apiType: 'getStmtTroubleshootData', label: 'Query Ending Minute', resultLabel: 'SlowestTransactionsData', fields: ['QUERY_END_TIME', 'ROWS_AFFECTED', 'FINAL_RESP_TIME', 'QUERY_TEXT'], node: true },
  { id: 'raw', name: '运行统计', groupLabel: '运行分组', fields: SUMMARY_FIELDS, defaults: RUNTIME_FIELDS, node: true }
]

export function migrateDpmQuery (config) {
  if (config.contractVersion === 2 || !['related', 'instances', 'applications', 'commands', 'raw'].includes(config.view)) return config
  const view = VIEWS.find(view => view.id === config.view)
  if (!Array.isArray(config.metrics)) return config
  const metrics = config.metrics.map(id => {
    if (id === 'FINAL_RESP_TIME') return 'AVG_FINAL_RESP_TIME'
    if (config.view === 'related' && id === 'QUERY_COUNT') return 'QUERY_COUNT_RATE'
    if (['instances', 'applications', 'commands'].includes(config.view) && ['DB_INSTANCE', 'QUERY_TEXT'].includes(id)) return null
    if (config.view === 'raw' && id === 'QUERY_END_TIME') return null
    return id
  }).filter(id => id !== null)
  return Object.assign({}, config, { contractVersion: 2, metrics: metrics.length ? Array.from(new Set(metrics)) : view.defaults.slice() })
}

export function isDatabaseObject (key) {
  return key === 'Database' || key === 'DatabaseClient'
}

export function databaseObjects () {
  return [
    { key: 'Database', label: '数据库', hasArgument: false, children: [] },
    { key: 'DatabaseClient', label: '数据库客户端', hasArgument: false, children: [] }
  ]
}

export function defaultQuery (objectType = 'Database', mode = 'topValues', widget = '') {
  const trend = mode === 'timeValues'
  return {
    version: 1,
    contractVersion: 2,
    provider: 'dpm',
    timeMode: 'dashboard',
    objectType,
    view: trend ? 'timeseries' : 'summary',
    selection: '',
    metrics: trend ? ['FinalRespTime'] : (widget === 'biaoge' ? ['QUERY_COUNT', 'AVG_FINAL_RESP_TIME'] : ['QUERY_COUNT']),
    topMetric: 'QUERY_COUNT',
    limit: mode === 'averageValues' ? 1 : (trend ? 5 : 10),
    singleNode: mode === 'averageValues'
  }
}

export function metricGroups (query) {
  if (query.view === 'timeseries') return [{ name: '数据库趋势', value: CURVES.map(item => ({ value: item.id, name: item.name })) }]
  const view = VIEWS.find(item => item.id === query.view) || VIEWS[0]
  return FIELDS.filter(item => view.fields.includes(item.id)).reduce((groups, item) => {
    let group = groups.find(group => group.name === item.category)
    if (!group) { group = { name: item.category, value: [] }; groups.push(group) }
    group.value.push({ value: item.id, name: item.name })
    return groups
  }, [])
}
