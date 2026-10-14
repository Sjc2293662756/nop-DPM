'use strict'

// Preserve Path, Secure and HttpOnly; only remove the remote cookie Domain.
module.exports = function platformProxy (target) {
  return {
    target,
    changeOrigin: true,
    secure: false,
    logLevel: 'warn',
    cookieDomainRewrite: '',
    autoRewrite: true,
    protocolRewrite: 'http',
    pathRewrite: { '^/': '' }
  }
}
