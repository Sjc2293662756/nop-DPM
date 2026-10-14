import HttpRequest from '@/lib/axios'
import { platformSession, isPlatformLoginResponse } from '@/lib/platform-session'

describe('browser-managed platform sessions', () => {
  beforeEach(() => {
    document.cookie = 'JSESSIONID=current-login-fixture; Path=/'
    platformSession.status = 'unknown'
    platformSession.message = ''
  })
  afterEach(() => {
    document.cookie = 'JSESSIONID=; Max-Age=0; Path=/'
    document.cookie = 'JSESSIONIDSSO=; Max-Age=0; Path=/'
  })

  it('does not set a forbidden Cookie header', () => {
    const client = new HttpRequest('/')
    expect(Object.prototype.hasOwnProperty.call(client.getInsideConfig().headers, 'Cookie')).toBe(false)
  })

  it('preserves the current login cookie across repeated data requests', async () => {
    const client = new HttpRequest('/')
    const adapter = config => Promise.resolve({
      data: [],
      status: 200,
      headers: {},
      config,
      request: { responseURL: 'http://localhost/NetInside/admin/datasource.asp?m=listJson' }
    })
    await client.request({ url: 'NetInside/admin/datasource.asp?m=listJson', adapter })
    await client.request({ url: 'NetInside/admin/datasource.asp?m=listJson', adapter })
    expect(document.cookie.includes('JSESSIONID=current-login-fixture')).toBe(true)
    expect(platformSession.status).toBe('connected')
  })

  it('rejects a redirected login page instead of treating it as successful API data', async () => {
    const client = new HttpRequest('/')
    const adapter = config => Promise.resolve({
      data: '<html><form action="/NetInside/login.asp"></form></html>',
      status: 200,
      headers: {},
      config,
      request: { responseURL: 'http://localhost/NetInside/login.jsp;jsessionid=fixture' }
    })
    await expect(client.request({ url: 'NetInside/admin/datasource.asp?m=listJson', adapter })).rejects.toMatchObject({ code: 'PLATFORM_LOGIN_REQUIRED' })
    expect(platformSession.status).toBe('required')
    expect(Object.keys(client.queue)).toHaveLength(0)
  })

  it('recognizes HTTP 401 while preserving a valid browser cookie for re-login', async () => {
    const client = new HttpRequest('/')
    const error = Object.assign(new Error('unauthorized'), { response: { status: 401 } })
    await expect(client.request({ url: 'NetInside/admin/datasource.asp?m=listJson', adapter: () => Promise.reject(error) })).rejects.toMatchObject({ code: 'PLATFORM_LOGIN_REQUIRED' })
    expect(document.cookie.includes('JSESSIONID=current-login-fixture')).toBe(true)
  })

  it('keeps network and permission errors distinct from expired sessions', async () => {
    const client = new HttpRequest('/')
    for (const status of [403, 503]) {
      const error = Object.assign(new Error('request failed'), { response: { status } })
      await expect(client.request({ url: 'NetInside/admin/datasource.asp?m=listJson', adapter: () => Promise.reject(error) })).rejects.toBe(error)
    }
    expect(platformSession.status).toBe('unknown')
  })

  it('does not confuse a downstream datasource login page with platform authentication', () => {
    expect(isPlatformLoginResponse({
      status: 200,
      data: '<html><form action="/NetInside/login.asp"></form></html>',
      config: { url: 'NetInside/admin/datasource.asp?m=proxy' },
      request: { responseURL: 'http://localhost/NetInside/admin/datasource.asp?m=proxy' }
    })).toBe(false)
    expect(isPlatformLoginResponse({ status: 200, data: 'Group,SQL\nx,"<form action=""login.asp"">"' })).toBe(false)
  })

  it('preserves custom content negotiation without accepting a frontend Cookie header', async () => {
    const client = new HttpRequest('/')
    let headers
    const adapter = config => {
      headers = config.headers
      return Promise.resolve({ data: [], status: 200, headers: {}, config })
    }
    await client.request({ url: 'NetInside/admin/datasource.asp?m=listJson', headers: { Accept: 'text/csv', Cookie: 'ignored-fixture' }, adapter })
    expect(headers.Accept).toBe('text/csv')
    expect(headers['Content-Type']).toBe('application/json')
    expect(Object.prototype.hasOwnProperty.call(headers, 'Cookie')).toBe(false)
  })
})
