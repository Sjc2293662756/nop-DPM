import { defaultQuery, VIEWS, metricGroups } from '@/dataSources/dpm/catalog'
import { buildDpmUrl, readDpmUrl, queryRequests, getParam, syncDpmUrl } from '@/dataSources/dpm/query'
import { normalizeTable } from '@/dataSources/dpm/normalize'
import { executeDpm } from '@/dataSources/dpm/execute'
import DatabaseFields from '@/components/ApiModal/DatabaseFields.vue'

const base = 'https://dpm.example.test/webservice/NetInside'
function query (view) {
  const recipe = VIEWS.find(item => item.id === view)
  return Object.assign(defaultQuery('Database', 'topValues', 'biaoge'), { view, selection: 'orders', metrics: recipe.defaults || recipe.fields })
}

describe('deployed database detail response contracts', () => {
  it('uses JSON alone for details so SQL commas never go through malformed CSV', () => {
    for (const view of ['instances', 'applications', 'commands', 'slow', 'raw']) {
      const url = queryRequests(base, query(view), 100, 200)[0]
      expect(getParam(url, 'json')).toBe('true')
      expect(getParam(url, 'csv')).toBe('')
      expect(getParam(url, 'format')).toBe('')
    }
  })
  it('offers grouped performance fields instead of SQL detail fields in grouped views', () => {
    for (const view of ['instances', 'applications', 'commands']) {
      const ids = metricGroups(query(view)).reduce((all, group) => all.concat(group.value.map(item => item.value)), [])
      expect(ids).toContain('QUERY_COUNT_RATE')
      expect(ids).toContain('AVG_FINAL_RESP_TIME')
      expect(ids).not.toContain('QUERY_TEXT')
      expect(getParam(queryRequests(base, query(view), 100, 200)[0], 'visibleColumns')).toBe('FINAL_RESP_TIME,DB_INSTANCE,QUERY_TEXT')
    }
  })
  it('preserves grouped display metrics during advanced URL edits', () => {
    const config = Object.assign(query('instances'), { metrics: ['AVG_FINAL_RESP_TIME', 'QUERY_COUNT_RATE'] })
    const api = buildDpmUrl(base, config, 100, 200)
    expect(readDpmUrl(syncDpmUrl(api)).config.metrics).toEqual(config.metrics)
  })
  it('preserves the actual instance, application and command grouping labels', () => {
    for (const [view, column, label] of [['instances', 'DB Instance', '数据库实例'], ['applications', 'Application', '数据库应用'], ['commands', 'Query Command', '查询命令']]) {
      const config = Object.assign(query(view), { metrics: ['AVG_FINAL_RESP_TIME'] })
      const table = { columnIds: [column, 'Average Response Time (Final Response) (sec)'], rows: [{ id: 'selected-row', values: { [column]: 'original group', 'Average Response Time (Final Response) (sec)': 0.25 } }] }
      const rows = normalizeTable(table, config)
      expect(rows[0].group).toEqual({ label, argument: 'original group' })
      expect(rows[0].metricValues[0].value).toBe(0.25)
    }
  })
  it('uses available transaction rate instead of requiring a missing count in related databases', () => {
    const config = Object.assign(query('related'), { objectType: 'DatabaseClient' })
    const rows = normalizeTable({ columnIds: ['DB Server', 'Transaction Rate (#/min)', 'Average Response Time (Final Response) (sec)'],
      rows: [{ values: { 'DB Server': 'Orders', 'Transaction Rate (#/min)': 2, 'Average Response Time (Final Response) (sec)': 0.25 } }] }, config)
    expect(rows[0].metricValues.map(item => item.value)).toEqual([2, 0.25])
    expect(rows[0].group.label).toBe('数据库')
  })
  it('restores an old grouped view configuration using its revised available fields', () => {
    const config = Object.assign(query('instances'), { metrics: ['FINAL_RESP_TIME', 'DB_INSTANCE', 'QUERY_TEXT'] })
    delete config.contractVersion
    const marker = btoa(JSON.stringify(config)).replace(/=+$/, '')
    const saved = readDpmUrl(base + '?start=100&end=200#nop-dpm-v1=' + marker)
    expect(saved.config.metrics).toEqual(['AVG_FINAL_RESP_TIME'])
    expect(saved.config.selection).toBe('orders')
  })
  it('keeps slow SQL text intact when using the verified JSON response', () => {
    const config = query('slow')
    const sql = 'select "a", b\nfrom orders'
    const rows = normalizeTable({ columnIds: ['Query Ending Minute', 'Rows Affected (#)', 'Response Time (Final Response) (sec)', 'SQL Transaction'],
      rows: [{ id: 'transaction-1', values: { 'Query Ending Minute': '2026-10-07 13:00', 'Rows Affected (#)': 3, 'Response Time (Final Response) (sec)': 0.2, 'SQL Transaction': sql } }] }, config)
    expect(rows[0].metricValues.find(item => item.metric.id === 'QUERY_TEXT').value).toBe(sql)
    expect(rows[0].selection).toBe('transaction-1')
  })
  it('does not request a timestamp that the running statistics endpoint does not return', () => {
    const config = query('raw')
    expect(config.metrics).not.toContain('QUERY_END_TIME')
    expect(getParam(buildDpmUrl(base, config, 100, 200), 'visibleColumns')).not.toContain('QUERY_END_TIME')
  })
  it('requires the actual slow transaction selector before requesting statement detail', () => {
    const config = query('statements')
    expect(() => queryRequests(base, config, 100, 200)).toThrow('具体慢事务')
    config.statementSelection = 'DB_NODE_ID=orders AND QUERY_TEXT=statement1'
    expect(getParam(queryRequests(base, config, 100, 200)[0], 'selection')).toBe(config.statementSelection)
  })
  it('loads actual transaction selectors for statement drilldown instead of using a SQL display label', async () => {
    const context = { source: 'dpm.example.test',
      start: 100,
      end: 200,
      value: query('statements'),
      transactionRequestId: 0,
      ajax: jest.fn(() => Promise.resolve([{ selection: 'DB_NODE_ID=orders AND QUERY_TEXT=statement1',
        group: { argument: '13:00' },
        metricValues: [{ metric: { id: 'QUERY_TEXT' }, value: 'select a,b from orders' }] }])) }
    await DatabaseFields.methods.loadTransactions.call(context)
    expect(context.transactions[0].value).toBe('DB_NODE_ID=orders AND QUERY_TEXT=statement1')
    expect(readDpmUrl(context.ajax.mock.calls[0][0].params.url).config.view).toBe('slow')
    expect(context.transactionLoading).toBe(false)
  })
  it('clears the selected transaction when the database node changes', () => {
    const context = { value: Object.assign(query('statements'), { statementSelection: 'old transaction' }), $emit: jest.fn() }
    DatabaseFields.methods.patch.call(context, { selection: 'new node' })
    expect(context.$emit.mock.calls[0][1].statementSelection).toBe('')
  })
  it('does not render a null statement response as an empty successful table', async () => {
    const config = Object.assign(query('statements'), { statementSelection: 'DB_NODE_ID=orders AND QUERY_TEXT=statement1' })
    await expect(executeDpm(buildDpmUrl(base, config, 100, 200), () => Promise.resolve({ data: null, status: 200 }))).rejects.toThrow('语句级结果')
  })
})
