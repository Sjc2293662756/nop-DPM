import { defaultQuery, metricGroups, SUMMARY_FIELDS } from '@/dataSources/dpm/catalog'
import { buildDpmUrl, readDpmUrl, getParam, queryRequests, selectionFor, syncDpmUrl } from '@/dataSources/dpm/query'
import { parseCsv, normalizeTable, normalizeSeries, combineSeries, canEvaluateThreshold } from '@/dataSources/dpm/normalize'
import { executeDpm } from '@/dataSources/dpm/execute'
// eslint-disable-next-line camelcase
import { changeURLArg, replace_unit, replace_unit2, getDashboardRange } from '@/lib/common'

// Synthetic contract samples based on DPM's consumers, not captured production data.
const base = 'https://dpm.example.test/webservice/NetInside'
const summaryCsv = 'Group,Transactions (#),Average Response Time (Final Response) (sec),Id\r\nOrders,12,0.25,DB_NODE_ID=orders:1521\r\n'
const query = extra => Object.assign(defaultQuery('Database', 'topValues', 'biaoge'), extra)

describe('database requests and persisted configuration', () => {
  it('uses DPM fields, top count and selection with the verified JSON table format', () => {
    const url = queryRequests(base, query({ limit: 20 }), 100, 200)[0]
    expect(getParam(url, 'type')).toBe('getTopGroups')
    expect(getParam(url, 'visibleColumns')).toBe('QUERY_COUNT,AVG_FINAL_RESP_TIME')
    expect(getParam(url, 'selection')).toBe('DB_NODE_ID=?')
    expect(getParam(url, 'top')).toBe('20')
    expect(getParam(url, 'topCount')).toBe('')
    expect(getParam(url, 'metrics')).toBe('')
    expect(getParam(url, 'csv')).toBe('')
    expect(getParam(url, 'json')).toBe('true')
  })
  it('round trips Unicode and reserved characters through save/export and refresh', () => {
    const config = query({ selection: 'DB_NODE_ID=生产%1&实例=一+#/?' })
    const saved = JSON.parse(JSON.stringify({ api: buildDpmUrl(base, config, 100, 200) }))
    const refreshed = changeURLArg(decodeURI(saved.api), [{ key: 'start', value: 300 }, { key: 'end', value: 400 }, { key: 'granularity', value: 60 }])
    expect(readDpmUrl(refreshed).config).toEqual(config)
    expect(readDpmUrl(refreshed).start).toBe('300')
    expect(readDpmUrl(refreshed).end).toBe('400')
    expect(getParam(refreshed, 'selection')).toBe(config.selection)
    expect(getParam(refreshed, 'granularity')).toBe('')
  })
  it('preserves a custom historical interval during preview and automatic refresh', () => {
    const config = query({ timeMode: 'fixed' })
    const api = buildDpmUrl(base, config, 1756971300, 1756974900)
    const refreshed = changeURLArg(api, [{ key: 'start', value: 1920000000 }, { key: 'end', value: 1920003600 }])
    expect(readDpmUrl(refreshed).start).toBe('1756971300')
    expect(readDpmUrl(refreshed).end).toBe('1756974900')
    expect(readDpmUrl(refreshed).config.timeMode).toBe('fixed')
  })
  it('does not duplicate node selectors', () => {
    expect(selectionFor('Database', 'orders:1521')).toBe('DB_NODE_ID=orders:1521')
    expect(selectionFor('Database', 'DB_NODE_ID=orders:1521')).toBe('DB_NODE_ID=orders:1521')
    expect(selectionFor('DatabaseClient', 'client')).toBe('CLIENT_NODE_ID=client')
  })
  it('keeps advanced API text edits and the reopened configuration consistent', () => {
    const api = buildDpmUrl(base, query(), 100, 200).replace('top=10&', 'top=25&').replace('selection=DB_NODE_ID%3D%3F', 'selection=DB_NODE_ID%3Dorders')
    const saved = readDpmUrl(syncDpmUrl(api))
    expect(saved.config.limit).toBe(25)
    expect(saved.config.selection).toBe('DB_NODE_ID=orders')
    expect(() => syncDpmUrl(api.replace('type=getTopGroups', 'type=getRawTable'))).toThrow()
  })
  it('rejects mismatched metrics, missing required nodes, and invalid counts', () => {
    expect(() => queryRequests(base, query({ metrics: ['TPIO'] }), 100, 200)).toThrow()
    expect(() => queryRequests(base, query({ view: 'timeseries', metrics: ['FinalRespTime'] }), 100, 200)).toThrow()
    expect(() => queryRequests(base, query({ limit: 1.5 }), 100, 200)).toThrow()
    expect(() => queryRequests(base, query(), 200, 100)).toThrow()
  })
  it('uses json=true without a conflicting csv flag for raw and slow detail paths', () => {
    for (const view of ['raw', 'slow']) {
      const url = queryRequests(base, query({ view, selection: 'orders', metrics: view === 'raw' ? ['AVG_FINAL_RESP_TIME'] : ['QUERY_END_TIME', 'FINAL_RESP_TIME'] }), 100, 200)[0]
      expect(getParam(url, 'format')).toBe('')
      expect(getParam(url, 'csv')).toBe('')
      expect(getParam(url, 'json')).toBe('true')
    }
    const statementUrl = queryRequests(base, query({ view: 'statements', selection: 'orders', statementSelection: 'DB_NODE_ID=orders AND QUERY_TEXT=statement1', metrics: ['QUERY_TEXT', 'FINAL_RESP_TIME'] }), 100, 200)[0]
    expect(getParam(statementUrl, 'type')).toBe('getStmtTroubleshootData')
  })
  it('restricts related databases to a selected database client', () => {
    const config = query({ view: 'related', selection: 'client-1', metrics: ['QUERY_COUNT_RATE', 'AVG_FINAL_RESP_TIME'] })
    expect(() => queryRequests(base, config, 100, 200)).toThrow()
    config.objectType = 'DatabaseClient'
    const url = queryRequests(base, config, 100, 200)[0]
    expect(getParam(url, 'type')).toBe('getPerfData')
    expect(getParam(url, 'selection')).toBe('CLIENT_NODE_ID=client-1')
  })
  it('exposes thirteen summary fields and only three supported trends', () => {
    expect(SUMMARY_FIELDS).toHaveLength(13)
    expect(metricGroups(query({ view: 'timeseries' }))[0].value.map(item => item.value)).toEqual(['FinalRespTime', 'FirstRespTime', 'TransactionRate'])
  })
})

describe('database response contracts', () => {
  it('accepts the deployed getTopGroups empty JSON table as no matching records', () => {
    const payload = { columnIds: ['DB Server', 'Transactions (#)', 'Average Response Time (Final Response) (sec)'], columnMetaData: {}, rows: [] }
    expect(normalizeTable(payload, query())).toEqual([])
  })
  it('uses the DB Server label while preserving the JSON row id for node selection', () => {
    const payload = { columnIds: ['DB Server', 'Transactions (#)', 'Average Response Time (Final Response) (sec)'], rows: [{ id: 'DB_NODE_ID=orders:1521', values: { 'DB Server': 'Orders', 'Transactions (#)': 12, 'Average Response Time (Final Response) (sec)': 0.25 } }] }
    const rows = normalizeTable(payload, query())
    expect(rows[0].group.argument).toBe('Orders')
    expect(rows[0].selection).toBe('DB_NODE_ID=orders:1521')
  })
  it('does not evaluate missing or textual database cells as numeric thresholds', () => {
    const fields = normalizeTable('Group,QUERY_COUNT,DB_INSTANCE\na,,0\nb,0,42', query({ metrics: ['QUERY_COUNT', 'DB_INSTANCE'] }))
    expect(canEvaluateThreshold(fields[0].metricValues[0])).toBe(false)
    expect(canEvaluateThreshold(fields[1].metricValues[0])).toBe(true)
    expect(canEvaluateThreshold(fields[1].metricValues[1])).toBe(false)
  })
  it('maps display headers to metrics and keeps the selection separate from the label', () => {
    const rows = normalizeTable(summaryCsv, query())
    expect(rows[0].group.argument).toBe('Orders')
    expect(rows[0].selection).toBe('DB_NODE_ID=orders:1521')
    expect(rows[0].metricValues.map(item => item.value)).toEqual([12, 0.25])
    expect(replace_unit(rows[0].metricValues[1])).toBe('秒')
  })
  it('handles commas, newlines, escaped quotes and BOM in SQL CSV', () => {
    const sql = 'select "a", b\nfrom orders'
    const csv = '\uFEFFGroup,SQL Transaction,Id\r\nq1,"select ""a"", b\nfrom orders",query1\r\n'
    expect(parseCsv(csv)[1][1]).toBe(sql)
    const rows = normalizeTable(csv, query({ view: 'slow', metrics: ['QUERY_TEXT'] }))
    expect(rows[0].metricValues[0].value).toBe(sql)
    expect(rows[0].metricValues[0].metric.valueType).toBe('text')
  })
  it('handles columnIds / rows / values JSON, including the row id', () => {
    const payload = { columnIds: ['Group', 'SQL Transaction', 'Response Time (Final Response) (sec)'], rows: [{ id: 'statement-1', values: { Group: 'q1', 'SQL Transaction': 'select a,b from t', 'Response Time (Final Response) (sec)': 0.5 } }] }
    const rows = normalizeTable(JSON.stringify(payload), query({ view: 'slow', metrics: ['QUERY_TEXT', 'FINAL_RESP_TIME'] }))
    expect(rows[0].selection).toBe('statement-1')
    expect(rows[0].metricValues.map(item => item.value)).toEqual(['select a,b from t', 0.5])
  })
  it('normalizes milliseconds once and keeps units identical across table and chart', () => {
    const rows = normalizeTable('Group,Average Response Time (Final Response) [msec]\nx,250', query({ metrics: ['AVG_FINAL_RESP_TIME'] }))
    const metric = rows[0].metricValues[0]
    expect(metric.value).toBe(0.25)
    expect(metric.unit).toBe('秒')
    expect(replace_unit(metric)).toBe(replace_unit2(metric))
  })
  it('does not invent rate units or convert Kbytes into raw bytes', () => {
    const rows = normalizeTable('Group,QUERY_COUNT_RATE,Kbytes Returned (kbytes)\nx,5,2', query({ metrics: ['QUERY_COUNT_RATE', 'BYTES_RETURNED'] }))
    expect(rows[0].metricValues[0].unit).toBe('')
    expect(rows[0].metricValues[1].value).toBe(2)
    expect(rows[0].metricValues[1].unit).toBe('KB')
  })
  it('preserves null and zero as different values and accepts a header-only table', () => {
    const rows = normalizeTable('Group,QUERY_COUNT\na,\nb,0', query({ metrics: ['QUERY_COUNT'] }))
    expect(rows.map(row => row.metricValues[0].value)).toEqual([null, 0])
    expect(normalizeTable('Group,QUERY_COUNT\n', query({ metrics: ['QUERY_COUNT'] }))).toEqual([])
  })
  it('rejects HTML errors, missing columns, bad CSV and unexpected JSON', () => {
    for (const payload of ['<html>login</html>', 'Group,wrong\nx,1', 'Group,QUERY_COUNT\nx,"unclosed', '{"error":"denied"}']) {
      expect(() => normalizeTable(payload, query({ metrics: ['QUERY_COUNT'] }))).toThrow()
    }
  })
  it('preserves irregular timestamps, separates groups and aligns missing points as null', () => {
    const first = normalizeSeries('Group,QUERY_END_TIME,Average Response Time (Final Response) (sec)\nSQL A,100,1\nSQL A,160,0\nSQL B,120,2', 'FinalRespTime')
    const second = normalizeSeries('Group,QUERY_END_TIME,Average Transaction Rate (#/min)\nSQL A,120,4', 'TransactionRate')
    const result = combineSeries(first.concat(second), 100, 200)
    expect(result.timestamps).toEqual([100, 120, 160])
    expect(result.metricValues.map(item => item.values)).toEqual([[1, null, 0], [null, 2, null], [null, 4, null]])
    expect(result.metricValues[0].metric.label).toContain('SQL A')
    expect(result.metricValues[2].unit).toBe('次/分钟')
  })
  it('preserves duplicate group timestamps without silently aggregating them', () => {
    const result = combineSeries(normalizeSeries('Group,QUERY_END_TIME,AVG_FINAL_RESP_TIME\na,100,1\na,100,2', 'FinalRespTime'), 100, 200)
    expect(result.timestamps).toEqual([100, 100])
    expect(result.metricValues[0].values).toEqual([1, 2])
  })
})

describe('shared database execution', () => {
  it('uses the parent time interval or a rolling last hour rather than fixed test dates', () => {
    expect(getDashboardRange('100', '200', 10000)).toEqual({ start: '100', end: '200' })
    expect(getDashboardRange(undefined, undefined, 10000)).toEqual({ start: '6400', end: '10000' })
    expect(getDashboardRange('', '', 10100)).toEqual({ start: '6500', end: '10100' })
  })
  it('does not render a missing single-node value as zero or NaN', async () => {
    const config = defaultQuery('Database', 'averageValues', 'shuzitu')
    config.selection = 'orders'
    const request = () => Promise.resolve({ data: 'Group,QUERY_COUNT\nOrders,', status: 200 })
    await expect(executeDpm(buildDpmUrl(base, config, 100, 200), request)).rejects.toThrow('没有完整')
  })
  it('only sends upstream DPM parameters, without the local configuration', async () => {
    const request = jest.fn(() => Promise.resolve({ data: summaryCsv, status: 200 }))
    const result = await executeDpm(buildDpmUrl(base, query(), 100, 200), request)
    expect(result.data[0].metricValues[0].value).toBe(12)
    expect(request.mock.calls[0][0]).not.toContain('#')
    expect(request.mock.calls[0][0]).not.toContain('nop-dpm')
  })
  it('queries selected curves independently using the refreshed time window', async () => {
    const config = query({ view: 'timeseries', selection: 'DB_NODE_ID=orders', metrics: ['FinalRespTime', 'FirstRespTime'] })
    const request = jest.fn(url => Promise.resolve({ data: getParam(url, 'label') === 'FinalRespTime' ? 'Group,QUERY_END_TIME,AVG_FINAL_RESP_TIME\na,300,0.2' : 'Group,QUERY_END_TIME,AVG_FIRST_RESP_TIME\na,310,0.1', status: 200 }))
    const url = changeURLArg(buildDpmUrl(base, config, 100, 200), [{ key: 'start', value: 300 }, { key: 'end', value: 400 }])
    const result = await executeDpm(url, request)
    expect(request).toHaveBeenCalledTimes(2)
    expect(getParam(request.mock.calls[0][0], 'start')).toBe('300')
    expect(result.data.timestamps).toEqual([300, 310])
  })
  it('preserves legacy URLs and units', () => {
    expect(readDpmUrl(base + '?type=topValues&metrics=TPIO')).toBe(null)
    expect(changeURLArg(base + '?start=100&end=200', [{ key: 'end', value: 400 }])).toBe(base + '?start=100&end=400')
    expect(replace_unit({ metric: { unit: 'msec' }, unit: 'msec' })).toBe('毫秒')
  })
})
