import { CURVES, VIEWS, SUMMARY_FIELDS, RUNTIME_SORTS, isDatabaseObject, migrateDpmQuery } from './catalog'
import { assertWidgetQuery } from './capabilities'

const MARKER = '#nop-dpm-v1='

export function isDpmUrl (url) {
  return typeof url === 'string' && url.includes(MARKER)
}

function encodeConfig (config) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(config)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeConfig (value) {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  return JSON.parse(decodeURIComponent(escape(atob(base64))))
}

export function getParam (url, key) {
  const query = url.split('#')[0].split('?')[1] || ''
  const pair = query.split('&').find(item => item.split('=')[0] === key)
  return pair ? decodeURIComponent(pair.slice(key.length + 1).replace(/\+/g, ' ')) : ''
}

export function selectionFor (objectType, value) {
  if (!value) return ''
  const field = objectType === 'DatabaseClient' ? 'CLIENT_NODE_ID' : 'DB_NODE_ID'
  // Id can contain an entire server-owned selection, including nested scopes.
  // Do not decode it again or add a second DB_NODE_ID prefix.
  return /(?:^|[\s(])(?:DB_NODE_ID|CLIENT_NODE_ID)\s*=/.test(value) ? value : `${field}=${value}`
}

export function validateQuery (config) {
  if (!config || config.version !== 1 || config.provider !== 'dpm' || !isDatabaseObject(config.objectType)) throw new Error('数据库配置版本或对象无效，请重新选择')
  if (config.timeMode && !['dashboard', 'fixed'].includes(config.timeMode)) throw new Error('数据库查询时间模式无效')
  if (config.rangeMax != null && (!Number.isFinite(Number(config.rangeMax)) || Number(config.rangeMax) <= 0)) throw new Error('量程上限应为大于 0 的数值')
  if (config.rawSelection != null && (config.view !== 'raw' || typeof config.rawSelection !== 'string' || !config.rawSelection.trim())) throw new Error('运行统计下钻条件无效')
  if (config.view === 'raw' && config.rawSortMetric && !RUNTIME_SORTS[config.rawSortMetric]) throw new Error('运行统计排序指标无效')
  if (config.view === 'raw' && config.rawSearch != null && (typeof config.rawSearch !== 'string' || config.rawSearch.length > 200)) throw new Error('运行统计搜索条件无效')
  const view = VIEWS.find(item => item.id === config.view)
  const trend = config.view === 'timeseries'
  if (!view && !trend && config.view !== 'nodes') throw new Error('不支持的数据库分析内容')
  if (view && view.clientOnly && config.objectType !== 'DatabaseClient') throw new Error('请先选择数据库客户端')
  const allowed = trend ? CURVES.map(item => item.id) : (view ? view.fields : SUMMARY_FIELDS)
  if (!Array.isArray(config.metrics) || !config.metrics.length || config.metrics.some(id => !allowed.includes(id))) throw new Error('请选择当前分析内容支持的数据库指标')
  if ((trend || config.singleNode || (view && view.node)) && !config.selection) throw new Error('请选择数据库节点')
  if (!Number.isInteger(Number(config.limit)) || Number(config.limit) < 1 || Number(config.limit) > 1000) throw new Error('数量应为 1 至 1000 的整数')
  if (['summary', 'nodes'].includes(config.view) && !SUMMARY_FIELDS.includes(config.topMetric)) throw new Error('请选择有效的数据库排序指标')
}

export function queryRequests (baseUrl, config, start, end) {
  validateQuery(config)
  assertWidgetQuery(config)
  if (!/^https?:\/\/[^/?#]+\/webservice\/NetInside$/.test(baseUrl)) throw new Error('数据库数据源地址无效')
  if (!Number.isFinite(Number(start)) || !Number.isFinite(Number(end)) || Number(start) >= Number(end)) throw new Error('数据库查询时间范围无效')
  const nodeField = config.objectType === 'DatabaseClient' ? 'CLIENT_NODE_ID' : 'DB_NODE_ID'
  const common = { start, end, top: config.limit }
  const build = params => baseUrl + '?' + Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&')
  const selection = selectionFor(config.objectType, config.selection)
  if (config.view === 'timeseries') {
    return config.metrics.map(id => {
      const curve = CURVES.find(item => item.id === id)
      return build(Object.assign({ type: 'getTroubleshootData' }, common, {
        dataType: 'ScriptTimeDataSet',
        dataTypeLabel: curve.label,
        visibleColumns: 'QUERY_END_TIME',
        selection,
        aggrField: 'QUERY_TEXT',
        label: curve.id,
        csv: true
      }))
    })
  }
  if (config.view === 'summary' || config.view === 'nodes') {
    // The deployed service returns a valid empty table with json=true, but an
    // empty CSV body when no database rows match. Keep that distinction.
    return [build(Object.assign({ type: 'getTopGroups', start, end, top: config.limit }, {
      topMetric: config.topMetric,
      visibleColumns: config.metrics.join(','),
      selection: selection || `${nodeField}=?`,
      preselect: '""',
      json: true
    }))]
  }
  if (config.view === 'related') {
    return [build(Object.assign({ type: 'getPerfData' }, common, {
      topMetric: 'QUERY_COUNT_RATE',
      visibleColumns: config.metrics.join(','),
      selection,
      dataType: 'ScriptTabularDataSet',
      dataTypeLabel: 'DB Server',
      preselect: '""',
      label: 'TableData',
      json: true
    }))]
  }
  if (config.view === 'raw') {
    return [build(Object.assign({ type: 'getRawTable' }, common, {
      topMetric: RUNTIME_SORTS[config.rawSortMetric || 'AVG_FINAL_RESP_TIME'],
      visibleColumns: config.metrics.join(','),
      selection: config.rawSelection == null ? selection : config.rawSelection,
      search: config.rawSearch || '',
      preselect: '',
      json: true
    }))]
  }
  const view = VIEWS.find(item => item.id === config.view)
  if (config.view === 'statements' && !config.statementSelection) throw new Error('请选择具体慢事务后查询语句明细')
  const params = Object.assign({ type: view.apiType || 'getTroubleshootData' }, common, {
    dataType: 'ScriptTabularDataSet',
    dataTypeLabel: view.label,
    visibleColumns: (view.requestFields || config.metrics).join(','),
    hiddenColumns: 'QUERY_COUNT',
    selection: config.view === 'statements' ? config.statementSelection : selection,
    aggrField: 'QUERY_TEXT',
    label: view.resultLabel,
    json: true
  })
  return [build(params)]
}

// Keep a versioned configuration in the existing API field. The fragment is
// never sent to the proxy/upstream; old exports and cfg_json need no new schema.
export function buildDpmUrl (baseUrl, config, start, end) {
  return queryRequests(baseUrl, config, start, end)[0] + MARKER + encodeConfig(config)
}

export function readDpmUrl (url) {
  if (!isDpmUrl(url)) return null
  try {
    const original = decodeConfig(url.split(MARKER)[1])
    const config = migrateDpmQuery(original)
    validateQuery(config)
    return { config, migrated: config !== original, baseUrl: url.split('?')[0], start: getParam(url, 'start'), end: getParam(url, 'end') }
  } catch (error) {
    throw new Error('数据库配置无法读取：' + error.message)
  }
}

// Keep the advanced API text editor consistent with the structured selection.
export function syncDpmUrl (url) {
  const saved = readDpmUrl(url)
  if (!saved) return url
  const config = Object.assign({}, saved.config)
  const expected = queryRequests(saved.baseUrl, config, saved.start, saved.end)[0]
  if (getParam(url, 'type') !== getParam(expected, 'type')) throw new Error('请通过“编辑数据”切换数据库分析内容')
  const selection = getParam(url, 'selection')
  if (config.view === 'statements') config.statementSelection = selection
  else config.selection = /^(DB_NODE_ID|CLIENT_NODE_ID)=\?$/.test(selection) ? '' : selection
  config.limit = Number(getParam(url, 'top'))
  if (config.view === 'timeseries') {
    const curve = CURVES.find(item => item.label === getParam(url, 'dataTypeLabel'))
    if (!curve) throw new Error('不支持的数据库趋势指标')
    if (curve.id !== config.metrics[0]) config.metrics = [curve.id]
  } else {
    const view = VIEWS.find(view => view.id === config.view)
    if (view && view.requestFields) {
      if (getParam(url, 'visibleColumns') !== getParam(expected, 'visibleColumns')) throw new Error('请通过“编辑数据”选择当前分析内容的显示指标')
    } else if (!saved.migrated) config.metrics = getParam(url, 'visibleColumns').split(',')
    if (config.view === 'summary') config.topMetric = getParam(url, 'topMetric')
    if (getParam(url, 'dataTypeLabel') !== getParam(expected, 'dataTypeLabel')) throw new Error('请通过“编辑数据”切换数据库分析内容')
  }
  return buildDpmUrl(saved.baseUrl, config, saved.start, saved.end)
}
