const http = require('http')
const createProxy = require('http-proxy-middleware')
const platformProxy = require('../../../build/platform-proxy')

const listen = server => new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const close = server => new Promise(resolve => server.close(resolve))
function request (port, path, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port, path, headers }, response => {
      let body = ''
      response.on('data', chunk => { body += chunk })
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body }))
    }).on('error', reject)
  })
}

describe('same-origin platform login proxy', () => {
  let upstream, proxyServer, upstreamPort, proxyPort
  beforeAll(async () => {
    upstream = http.createServer((req, res) => {
      if (req.url === '/NetInside/') {
        res.writeHead(302, { Location: `https://127.0.0.1:${upstreamPort}/NetInside/login.jsp` })
      } else if (req.url === '/NetInside/login.jsp') {
        res.writeHead(200, { 'Set-Cookie': 'JSESSIONID=login-fixture; Domain=platform.example.test; Path=/NetInside; Secure; HttpOnly' })
      } else if (req.url === '/NetInside/logout.jsp') {
        res.writeHead(200, { 'Set-Cookie': 'JSESSIONID=; Domain=platform.example.test; Path=/NetInside; Max-Age=0; Secure; HttpOnly' })
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ currentSessionForwarded: req.headers.cookie === 'JSESSIONID=login-fixture', noSessionInjected: !req.headers.cookie }))
        return
      }
      res.end('fixture')
    })
    await listen(upstream)
    upstreamPort = upstream.address().port
    const options = platformProxy(`http://127.0.0.1:${upstreamPort}/`)
    options.logLevel = 'silent'
    const proxy = createProxy(options)
    proxyServer = http.createServer((req, res) => proxy(req, res, () => { res.writeHead(404); res.end() }))
    await listen(proxyServer)
    proxyPort = proxyServer.address().port
  })
  afterAll(() => Promise.all([close(proxyServer), close(upstream)]))

  it('keeps login redirects on the local browser origin', async () => {
    const response = await request(proxyPort, '/NetInside/')
    expect(response.status).toBe(302)
    expect(response.headers.location).toBe(`http://127.0.0.1:${proxyPort}/NetInside/login.jsp`)
  })
  it('removes the remote cookie domain and preserves its scope and protections', async () => {
    const cookie = (await request(proxyPort, '/NetInside/login.jsp')).headers['set-cookie'][0]
    expect(cookie).not.toMatch(/Domain=/i)
    expect(cookie).toContain('Path=/NetInside')
    expect(cookie).toContain('Secure')
    expect(cookie).toContain('HttpOnly')
  })
  it('forwards the browser-managed session on data requests', async () => {
    const response = await request(proxyPort, '/NetInside/admin/datasource.asp?m=listJson', { Cookie: 'JSESSIONID=login-fixture' })
    expect(JSON.parse(response.body).currentSessionForwarded).toBe(true)
  })
  it('does not inject an old session when the browser has no cookie', async () => {
    const response = await request(proxyPort, '/NetInside/admin/datasource.asp?m=listJson')
    expect(JSON.parse(response.body).noSessionInjected).toBe(true)
  })
  it('preserves cookie expiry when the platform clears its session', async () => {
    const cookie = (await request(proxyPort, '/NetInside/logout.jsp')).headers['set-cookie'][0]
    expect(cookie).toContain('Max-Age=0')
    expect(cookie).toContain('Path=/NetInside')
  })
})
