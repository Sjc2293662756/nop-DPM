import { readDpmUrl, queryRequests } from './query'
import { normalizeTable, normalizeSeries, combineSeries } from './normalize'
import { isCompositionWidget } from './capabilities'

export async function executeDpm (url, request, widget) {
  const saved = readDpmUrl(url)
  const { baseUrl, start, end } = saved
  const config = widget ? Object.assign({}, saved.config, { widget }) : saved.config
  const requests = queryRequests(baseUrl, config, start, end)
  const responses = await Promise.all(requests.map(target => request(target)))
  if (config.view === 'statements' && (responses[0].data == null || String(responses[0].data).trim() === 'null' || String(responses[0].data).trim() === '')) {
    const error = new Error('所选慢事务未返回语句级结果，请确认已采集语句数据及数据源支持语句查询')
    error.code = 'DPM_STATEMENT_UNAVAILABLE'
    throw error
  }
  if (config.view === 'timeseries') {
    const series = responses.reduce((all, response, index) => all.concat(normalizeSeries(response.data, config.metrics[index])), [])
    return { data: combineSeries(series, start, end), status: 200 }
  }
  const rows = normalizeTable(responses[0].data, config)
  if (config.view !== 'nodes' && isCompositionWidget(config.widget)) {
    const values = rows.map(row => row.metricValues[0].value)
    const reason = values.some(value => value === null) ? '构成数据存在缺失值，无法展示完整占比；缺失值不能补为 0'
      : values.some(value => value < 0) ? '构成图需要非负数值，当前响应包含负数' : ''
    if (reason) {
      const error = new Error(reason)
      error.code = 'DPM_COMPOSITION_INVALID'
      throw error
    }
  }
  if (config.singleNode && rows.length > 1) throw new Error('数据源返回了多个节点，请选择唯一数据库节点')
  if (config.singleNode && (!rows.length || rows[0].metricValues.some(item => item.value === null))) throw new Error('所选节点在当前时间范围没有完整的指标数据')
  return { data: rows, status: responses[0].status }
}
