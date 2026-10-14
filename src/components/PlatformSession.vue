<template>
  <div v-if="development || session.status === 'required' || dialogVisible" class="platform-session">
    <el-button class="platform-session-button" size="small" :type="connected ? 'success' : 'warning'" @click="dialogVisible = true">
      {{ connected ? '平台已连接' : '平台连接' }}
    </el-button>
    <el-dialog title="平台连接" :visible.sync="dialogVisible" append-to-body custom-class="platform-session-dialog" :close-on-click-modal="false">
      <p>在平台登录页输入账号密码，登录完成后返回编辑器。浏览器会自动保持本次登录会话。</p>
      <el-alert v-if="session.message" :title="session.message" :type="connected ? 'success' : 'warning'" :closable="false" show-icon />
      <div class="platform-session-actions">
        <a :href="loginEntry" target="_blank" rel="noopener" class="el-button el-button--primary el-button--small" @click="awaitingLogin = true">打开平台登录页</a>
        <el-button size="small" :loading="checking" @click="checkConnection(false)">检查连接</el-button>
      </div>
      <p class="platform-session-hint">返回本页时会自动检查连接。连接成功后，可重新打开“编辑数据”加载数据源。</p>
      <span slot="footer"><el-button size="small" @click="dialogVisible = false">返回编辑器</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import { getIps } from '@/apis/module'
import { PLATFORM_LOGIN_ENTRY, platformSession, markPlatformConnected } from '@/lib/platform-session'

export default {
  data () {
    return {
      session: platformSession,
      loginEntry: PLATFORM_LOGIN_ENTRY,
      dialogVisible: false,
      checking: false,
      awaitingLogin: false,
      requestVersion: 0,
      development: process.env.NODE_ENV === 'development'
    }
  },
  computed: {
    connected () { return this.session.status === 'connected' }
  },
  watch: {
    'session.status': {
      immediate: true,
      handler (status) { if (status === 'required') this.dialogVisible = true }
    }
  },
  mounted () {
    window.addEventListener('focus', this.onFocus)
    document.addEventListener('visibilitychange', this.onVisibility)
    if (this.development) this.checkConnection(false)
  },
  beforeDestroy () {
    window.removeEventListener('focus', this.onFocus)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.requestVersion++
  },
  methods: {
    onVisibility () { if (document.visibilityState === 'visible') this.onFocus() },
    onFocus () { if (this.awaitingLogin && !this.checking) this.checkConnection(true) },
    async checkConnection (closeOnSuccess) {
      const version = ++this.requestVersion
      this.checking = true
      try {
        const response = await getIps()
        if (version !== this.requestVersion) return
        if (!Array.isArray(response.data)) throw new Error('平台未返回有效的数据源列表，请确认登录状态。')
        markPlatformConnected()
        this.awaitingLogin = false
        if (closeOnSuccess) this.dialogVisible = false
      } catch (error) {
        if (version !== this.requestVersion) return
        if (error.code !== 'PLATFORM_LOGIN_REQUIRED') {
          this.session.status = 'error'
          this.session.message = error.response && error.response.status === 403
            ? '当前账号没有访问数据源的权限，请确认平台权限。'
            : '连接检查失败，请确认平台可访问后重试。'
        }
      } finally {
        if (version === this.requestVersion) this.checking = false
      }
    }
  }
}
</script>

<style>
.platform-session-button { position: fixed; right: 20px; bottom: 18px; z-index: 2000; }
.platform-session-dialog.el-dialog { width: 480px !important; max-width: calc(100vw - 32px); }
.platform-session-dialog p { line-height: 1.7; }
.platform-session-actions { display: flex; gap: 12px; margin: 20px 0; }
.platform-session-actions a { text-decoration: none; }
.platform-session-hint { color: #909399; font-size: 12px; }
</style>
