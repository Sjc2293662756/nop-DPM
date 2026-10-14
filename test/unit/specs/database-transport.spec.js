import axios from '@/lib/apirequest'
import { Message } from 'element-ui'
import { ajax } from '@/apis/comfunc'
import { defaultQuery } from '@/dataSources/dpm/catalog'
import { buildDpmUrl } from '@/dataSources/dpm/query'

jest.mock('@/lib/apirequest', () => ({ request: jest.fn() }))
jest.mock('element-ui', () => ({ Message: { error: jest.fn() } }))

const base = 'https://dpm.example.test/webservice/NetInside'
describe('existing datasource proxy integration', () => {
  beforeEach(() => jest.clearAllMocks())
  it('transparently returns normalized DPM data through the existing ajax action API', async () => {
    axios.request.mockResolvedValue({ data: 'Group,Transactions (#),Id\nOrders,12,DB_NODE_ID=orders', status: 200 })
    const result = await ajax({ url: buildDpmUrl(base, defaultQuery(), 100, 200) })
    const request = axios.request.mock.calls[0][0]
    expect(request.url).toBe('NetInside/admin/datasource.asp?m=proxy')
    expect(request.params.url).not.toContain('#')
    expect(request.params.url).toContain('type=getTopGroups')
    expect(result.data[0].metricValues[0].value).toBe(12)
  })
  it('reports a query-count-only data failure rather than silently treating it as empty', async () => {
    axios.request.mockResolvedValue({ data: '<html>Permission denied</html>', status: 200 })
    await expect(ajax({ url: buildDpmUrl(base, defaultQuery(), 100, 200) })).rejects.toThrow()
    expect(Message.error).toHaveBeenCalledTimes(1)
  })
  it('leaves legacy remote requests untouched', async () => {
    const data = [{ group: { argument: 'host' }, metricValues: [] }]
    axios.request.mockResolvedValue({ data, status: 200 })
    const url = base + '?type=topValues&metrics=TPIO&json=true'
    expect((await ajax({ url })).data).toBe(data)
    expect(axios.request.mock.calls[0][0].params.url).toBe(url)
  })
})
