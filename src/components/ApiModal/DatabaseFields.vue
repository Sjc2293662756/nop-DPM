<template>
  <div class="database-fields">
    <el-form-item label="分析内容">
      <el-select :value="value.view" @change="changeView" style="width:460px">
        <el-option v-for="view in views" :key="view.id" :label="view.name" :value="view.id" :disabled="view.disabled">
          <el-tooltip :content="view.reason" :disabled="!view.disabled" placement="right">
            <span class="analysis-option">{{ view.name }}<span v-if="view.disabled" class="analysis-restricted">受限</span></span>
          </el-tooltip>
        </el-option>
      </el-select>
      <div class="database-hint">{{ analysisHint }}</div>
      <el-alert v-if="configurationError" :title="'当前配置不适配：' + configurationError + ' 请重新选择分析内容或指标。'"
        type="warning" :closable="false" show-icon />
    </el-form-item>
    <el-form-item :label="value.objectType === 'DatabaseClient' ? '客户端节点' : '数据库节点'">
      <el-select :key="value.objectType + ':' + value.view" :value="value.selection" filterable allow-create default-first-option :loading="loading"
        :placeholder="requiresNode ? '请选择或输入节点标识' : '全部活跃节点（Top 排名）'"
        :clearable="!requiresNode" @change="patch({ selection: $event })" style="width:360px">
        <el-option v-if="!requiresNode" label="全部活跃节点（Top 排名）" value="" />
        <el-option v-for="node in nodes" :key="node.value" :label="node.label" :value="node.value" />
      </el-select>
      <el-button type="text" :loading="loading" @click="refreshNodes">刷新节点</el-button>
      <div class="database-hint">候选为当前时间范围内的 Top {{ nodeLimit }} 活跃节点，可输入其他节点标识。</div>
      <div class="database-hint">查询时间：{{ formatTime(start) }} 至 {{ formatTime(end) }}</div>
      <el-button v-if="nodes.length >= nodeLimit && nodeLimit < 1000" type="text" @click="loadMore">加载更多节点</el-button>
      <el-alert v-if="error" :title="error" type="warning" :closable="false" show-icon />
      <el-alert v-else-if="!loading && nodes.length === 0" title="当前时间范围未返回活跃数据库节点，可调整时间或输入已知节点标识。" type="info" :closable="false" show-icon />
    </el-form-item>
    <el-form-item v-if="value.view === 'statements'" label="慢事务">
      <el-select :value="value.statementSelection || ''" :loading="transactionLoading" filterable
        placeholder="请先选择数据库节点，再选择慢事务" style="width:460px" @change="patch({ statementSelection: $event })">
        <el-option v-for="transaction in transactions" :key="transaction.value" :label="transaction.label" :value="transaction.value" />
      </el-select>
      <el-button type="text" :loading="transactionLoading" @click="loadTransactions">刷新慢事务</el-button>
      <div class="database-hint">语句明细使用所选慢事务的查询条件；只选择数据库节点不能定位具体语句。</div>
      <el-alert v-if="transactionError" :title="transactionError" type="warning" :closable="false" show-icon />
      <el-alert v-else-if="value.selection && !transactionLoading && !transactions.length"
        title="当前节点和时间范围没有可查询的慢事务，请调整查询范围。" type="info" :closable="false" show-icon />
    </el-form-item>
    <el-form-item v-if="runtimeMode" label="展示列">
      <span>分组名称、平均最终响应时间、平均首包响应时间、查询速率、返回数据速率、影响行数速率</span>
      <div class="database-hint">自动使用运行统计的默认列；数值和单位以返回结果为准，无需选择指标。</div>
    </el-form-item>
    <el-form-item v-else label="数据库指标">
      <div v-if="widget === 'zongxiangzhuzhuangtu'" class="database-hint">与网络普通纵向柱状图一致，每次最多选择一个数值指标。</div>
      <el-select :value="value.metrics" multiple :multiple-limit="effectiveMetricLimit" collapse-tags
        placeholder="请选择数据库指标" style="width:460px" @change="patch({ metrics: $event })">
        <el-option-group v-for="group in groups" :key="group.name" :label="group.name">
          <el-option v-for="metric in group.value" :key="metric.value" :label="metric.name" :value="metric.value" :disabled="metric.disabled">
            <el-tooltip :content="metric.reason" :disabled="!metric.disabled" placement="right">
              <span class="analysis-option">{{ metric.name }}<span v-if="metric.disabled" class="analysis-restricted">受限</span></span>
            </el-tooltip>
          </el-option>
        </el-option-group>
      </el-select>
    </el-form-item>
    <el-form-item v-if="!value.singleNode || runtimeMode" :label="runtimeMode ? '每组 Top N' : value.view === 'timeseries' ? '趋势分组数' : '数量'">
      <el-input-number :value="Number(value.limit)" :min="1" :max="1000" :precision="0" @change="patch({ limit: $event })" />
      <div v-if="runtimeMode" class="database-hint">数量用于下钻查询，顶层分析维度数不受此限制；具体条目以接口实际返回为准。</div>
      <div v-if="widget === 'zongxiangzhuzhuangtu'" class="database-hint">{{ value.view === 'raw' ? '数量作为接口请求参数；运行统计可能返回更多分组，图中按实际返回分类展示。' : '数量用于请求本次分类范围。' }}图内按显示指标降序排列，缺失值保留并置后。</div>
    </el-form-item>
    <el-form-item v-if="runtimeMode" label="排序指标">
      <el-select :value="value.rawSortMetric || 'AVG_FINAL_RESP_TIME'" @change="patch({ rawSortMetric: $event })">
        <el-option v-for="metric in runtimeSortOptions" :key="metric.id" :label="metric.name" :value="metric.id" />
      </el-select>
      <div class="database-hint">同一分组内按所选指标降序排列，保留父子层级。</div>
    </el-form-item>
    <el-form-item v-if="runtimeMode" label="包含 SQL 文本">
      <el-input :value="value.rawSearch || ''" :maxlength="200" placeholder="可选关键字" style="width:360px" @input="patch({ rawSearch: $event })" />
    </el-form-item>
    <el-form-item v-if="widget === 'jinduhuantu' || widget === 'yibiaopan'" label="量程上限">
      <el-input :value="value.rangeMax == null ? '' : value.rangeMax" placeholder="自动适配" style="width:180px"
        @input="patch({ rangeMax: $event === '' ? null : $event })" />
      <div class="database-hint">使用所选指标的实际单位；留空时按返回值自动设置量程。</div>
    </el-form-item>
    <el-form-item v-if="value.view === 'summary'" label="排序指标">
      <el-select :value="value.topMetric" @change="patch({ topMetric: $event })">
        <el-option-group v-for="group in summaryGroups" :key="group.name" :label="group.name">
          <el-option v-for="metric in group.value" :key="metric.value" :label="metric.name" :value="metric.value" />
        </el-option-group>
      </el-select>
      <div v-if="widget === 'zongxiangzhuzhuangtu'" class="database-hint">按此指标选取 Top 节点；它可以与柱状图的显示指标不同。</div>
    </el-form-item>
    <el-form-item v-if="value.view === 'timeseries'" label="时间粒度">
      <span>使用数据源返回的时间点</span>
      <div class="database-hint">最终响应时间、首包响应时间以秒展示；事务速率以数据源返回单位为准。不同查询分组分别展示。</div>
    </el-form-item>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { VIEWS, FIELDS, RUNTIME_FIELDS, metricGroups, defaultQuery } from '@/dataSources/dpm/catalog'
import { runtimeConfiguration } from '@/dataSources/dpm/runtime'
import { buildDpmUrl, validateQuery } from '@/dataSources/dpm/query'
import { describeDpmError } from '@/dataSources/dpm/errors'
import { analysisOptions, defaultWidgetMetrics, widgetMetricLimit, widgetQueryIssue, metricIssue, assertWidgetQuery, isStackWidget, isCompositionWidget } from '@/dataSources/dpm/capabilities'

export default {
  props: {
    value: { type: Object, required: true },
    source: { type: String, required: true },
    start: { type: [String, Number], required: true },
    end: { type: [String, Number], required: true },
    widget: { type: String, default: '' },
    metricLimit: { type: Number, default: 0 }
  },
  data () {
    return { nodes: [],
      loading: false,
      error: '',
      requestId: 0,
      nodeLimit: 100,
      transactions: [],
      transactionLoading: false,
      transactionError: '',
      transactionRequestId: 0 }
  },
  computed: {
    runtimeMode () { return this.value.view === 'raw' && this.widget === 'biaoge' },
    runtimeSortOptions () { return FIELDS.filter(field => RUNTIME_FIELDS.includes(field.id)) },
    analysisHint () {
      if (this.runtimeMode) return '运行统计使用可展开树表；点击分类加载下级条目，顶层分类没有数值时显示“—”。'
      if (isStackWidget(this.widget)) return '本版使用单系列统计；尚未提供互斥组成分项，不能将不同指标直接堆叠。'
      if (isCompositionWidget(this.widget)) return '占比基于本次返回的节点；仅开放总量指标，平均值和未确认口径的速率不能求占比。'
      if (this.value.view === 'timeseries') return '按真实时间点展示变化；响应时间与事务速率单位不同，请分别配置图表。'
      if (this.value.singleNode) return '展示所选节点的一个统计值；分组与明细的单值选择尚未开放。'
      return '可选择适合当前组件的分析内容；受限项可悬停查看原因。'
    },
    views () { return analysisOptions(this.widget, this.value.objectType, this.value.view) },
    configurationError () { return widgetQueryIssue(this.value, this.widget) },
    effectiveMetricLimit () { return widgetMetricLimit(this.widget, this.metricLimit) },
    requiresNode () {
      const view = VIEWS.find(view => view.id === this.value.view)
      return this.value.singleNode || this.value.view === 'timeseries' || !!(view && view.node)
    },
    groups () {
      return metricGroups(this.value).map(group => ({ name: group.name,
        value: group.value.map(metric => {
          const reason = metricIssue(this.value, metric.value, this.widget)
          return Object.assign({}, metric, { disabled: !!reason, reason })
        }) }))
    },
    summaryGroups () { return metricGroups({ view: 'summary' }) },
    nodeContext () { return [this.source, this.start, this.end, this.value.objectType].join('|') },
    transactionContext () { return [this.nodeContext, this.value.selection, this.value.view].join('|') }
  },
  watch: {
    nodeContext: { immediate: true, handler () { this.nodeLimit = 100; this.nodes = []; this.loadNodes() } },
    transactionContext: { immediate: true, handler () { this.transactions = []; this.loadTransactions() } }
  },
  beforeDestroy () { this.requestId++; this.transactionRequestId++ },
  methods: {
    ...mapActions(['ajax']),
    formatTime (time) { return new Date(Number(time) * 1000).toLocaleString('zh-CN', { hour12: false }) },
    async refreshNodes () {
      const context = this.nodeContext
      this.$emit('refresh-time')
      await this.$nextTick()
      if (this.nodeContext === context) this.loadNodes()
    },
    patch (values) {
      if (Object.prototype.hasOwnProperty.call(values, 'selection')) values.statementSelection = ''
      this.$emit('input', Object.assign({}, this.value, values))
    },
    changeView (id) {
      const option = this.views.find(view => view.id === id)
      if (!option || option.disabled) return
      const query = Object.assign({}, this.value, { view: id })
      this.patch({ view: id,
        metrics: defaultWidgetMetrics(query, this.widget),
        topMetric: 'QUERY_COUNT',
        widget: this.widget,
        widgetPolicyVersion: 1,
        statementSelection: '' })
    },
    loadMore () { this.nodeLimit = Math.min(1000, this.nodeLimit * 2); this.loadNodes() },
    async loadTransactions () {
      const version = ++this.transactionRequestId
      this.transactionError = ''
      this.transactionLoading = false
      if (!this.source || !this.value.selection || this.value.view !== 'statements') return
      this.transactionLoading = true
      try {
        const query = Object.assign(defaultQuery(this.value.objectType, 'topValues', 'biaoge'), {
          view: 'slow',
          selection: this.value.selection,
          limit: 100,
          metrics: ['QUERY_END_TIME', 'FINAL_RESP_TIME', 'QUERY_TEXT'] })
        const url = buildDpmUrl(`https://${this.source}/webservice/NetInside`, query, this.start, this.end)
        const rows = await this.ajax({ params: { url } })
        if (version !== this.transactionRequestId) return
        this.transactions = rows.filter(row => row.selection).map(row => {
          const text = row.metricValues.find(item => item.metric.id === 'QUERY_TEXT')
          return { value: row.selection, label: row.group.argument + ' · ' + (text ? String(text.value).slice(0, 80) : row.selection) }
        })
        if (rows.length && !this.transactions.length) this.transactionError = '数据源未返回慢事务选择条件，无法查询语句明细。'
      } catch (error) {
        if (version === this.transactionRequestId) this.transactionError = '慢事务加载失败：' + describeDpmError(error)
      } finally {
        if (version === this.transactionRequestId) this.transactionLoading = false
      }
    },
    async loadNodes () {
      if (!this.source) return
      const version = ++this.requestId
      this.loading = true
      this.error = ''
      try {
        const query = Object.assign({}, this.value, { view: 'nodes', metrics: ['QUERY_COUNT', 'AVG_FINAL_RESP_TIME'], topMetric: 'QUERY_COUNT', limit: this.nodeLimit, selection: '', singleNode: false })
        const url = buildDpmUrl(`https://${this.source}/webservice/NetInside`, query, this.start, this.end)
        const rows = await this.ajax({ params: { url } })
        if (version !== this.requestId) return
        // Missing Id must not silently turn a display label into a selector.
        this.nodes = rows.filter(row => row.selection).map(row => ({ value: row.selection, label: row.group.argument }))
        if (rows.length && !this.nodes.length) this.error = '数据源未返回节点标识，请输入已知节点标识或检查数据源返回格式。'
      } catch (error) {
        if (version === this.requestId) this.error = '节点加载失败：' + describeDpmError(error)
      } finally {
        if (version === this.requestId) this.loading = false
      }
    },
    validate () {
      const query = this.runtimeMode ? runtimeConfiguration(this.value) : this.value
      validateQuery(query)
      assertWidgetQuery(query, this.widget)
      if (this.value.view === 'statements' && !this.value.statementSelection) throw new Error('请选择具体慢事务后查询语句明细')
      if (this.effectiveMetricLimit && this.value.metrics.length > this.effectiveMetricLimit) throw new Error('当前组件只支持一个数据库指标')
    }
  }
}
</script>

<style scoped>
.database-hint { color: #909399; font-size: 12px; line-height: 22px; }
.analysis-option { display: block; }
.analysis-restricted { float: right; color: #909399; font-size: 12px; margin-left: 16px; }
</style>
