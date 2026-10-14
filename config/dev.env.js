'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const replay = process.env.NOP_TEST_START_TIME && process.env.NOP_TEST_END_TIME
  ? {
    VUE_APP_TEST_TIME_ENABLED: '"true"',
    VUE_APP_TEST_START_TIME: JSON.stringify(process.env.NOP_TEST_START_TIME),
    VUE_APP_TEST_END_TIME: JSON.stringify(process.env.NOP_TEST_END_TIME)
  }
  : {}

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  ENV_CONFIG: '"dev"',
  
    BASE_API: '"/"',
 

  // 历史回放仅在显式设置 NOP_TEST_START_TIME / NOP_TEST_END_TIME 时启用。
}, replay)
