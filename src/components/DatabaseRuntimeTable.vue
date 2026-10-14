<template>
  <div class="runtime-table" :style="{ height: item.style.height }">
    <div class="runtime-toolbar" :class="{ 'runtime-toolbar-editable': editable }">
      <span :class="{ 'runtime-drag-handle': editable }" :title="editable ? '拖动标题或单元格移动组件；右键可置顶、置底、删除；点击箭头展开分类' : ''">运行统计 · {{ editable ? '拖动移动 / 右键编辑 / 点击箭头展开' : '点击分类展开' }}</span>
      <el-button type="text" :loading="loading" @click="reload">刷新</el-button>
    </div>
    <el-alert v-if="error" :title="error" type="warning" :closable="false" show-icon />
    <el-table v-loading="loading" :data="visibleRows" row-key="key" border :height="tableHeight"
      :tree-props="{ children: '_unusedRuntimeChildren', hasChildren: '_unusedRuntimeHasChildren' }"
      :header-cell-style="headerStyle" :cell-style="bodyStyle" style="width:100%">
      <el-table-column label="分析维度 / 条目" prop="label" fixed="left" :width="260">
        <template slot-scope="scope">
          <div class="runtime-name" :style="{ paddingLeft: scope.row.depth * 16 + 'px' }">
            <el-button v-if="scope.row.canExpand" type="text" :loading="scope.row.loading"
              :icon="scope.row.expanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"
              :aria-label="(scope.row.expanded ? '收起' : '展开') + '条目'" @click="toggle(scope.row)" />
            <span v-else class="runtime-spacer" />
            <span class="runtime-label" :title="scope.row.label">{{ scope.row.label }}</span>
          </div>
          <div v-if="scope.row.expanded && scope.row.error" class="runtime-state">
            <el-tooltip :content="scope.row.error"><span>加载失败</span></el-tooltip>
            <el-button type="text" @click="loadChildren(scope.row)">重试</el-button>
          </div>
          <div v-else-if="scope.row.expanded && scope.row.loaded && !scope.row.children.length" class="runtime-state">暂无下级记录</div>
        </template>
      </el-table-column>
      <el-table-column v-for="column in columns" :key="column.id" :label="column.name" :min-width="160" align="right">
        <template slot-scope="scope">{{ scope.row.values[column.id] == null ? '—' : scope.row.values[column.id] }}</template>
      </el-table-column>
      <template slot="empty">{{ loading ? '正在加载运行统计' : '当前时间范围无运行统计数据' }}</template>
    </el-table>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { readDpmUrl } from '@/dataSources/dpm/query'
import { describeDpmError } from '@/dataSources/dpm/errors'
import { runtimeUrl, runtimeColumns, runtimeNodes, visibleRuntimeRows, expandedRuntimePaths } from '@/dataSources/dpm/runtime'

export default {
  name: 'DatabaseRuntimeTable',
  props: {
    item: { type: Object, required: true },
    editable: { type: Boolean, default: false },
    start: { type: [String, Number], required: true },
    end: { type: [String, Number], required: true }
  },
  data () { return { rows: [], columns: runtimeColumns([]), loading: false, error: '', generation: 0, destroyed: false, activeContext: '' } },
  computed: {
    queryContext () {
      try {
        const fixed = readDpmUrl(this.item.config.api).config.timeMode === 'fixed'
        return this.item.config.api + (fixed ? '' : '|' + this.start + '|' + this.end)
      } catch (error) { return this.item.config.api }
    },
    visibleRows () { return visibleRuntimeRows(this.rows) },
    tableHeight () { return Math.max(120, (parseInt(this.item.style.height) || 300) - (this.error ? 85 : 32)) },
    headerStyle () {
      const widgets = this.item.config.widgets || {}
      const style = widgets.headerStyle || {}
      return { background: style.background || '#0F1C29', color: (style.text && style.text.color) || '#A6B2C0', fontSize: ((style.text && style.text.size) || 13) + 'px' }
    },
    bodyStyle () {
      const style = (this.item.config.widgets || {}).xStyle || {}
      return { background: 'transparent', color: style.color || '#ddd', fontSize: (style.fontSize || 13) + 'px' }
    }
  },
  watch: { queryContext: { immediate: true, handler () { this.reload() } } },
  beforeDestroy () { this.destroyed = true; this.generation++ },
  methods: {
    ...mapActions(['ajax']),
    current (generation, context) { return !this.destroyed && generation === this.generation && context === this.queryContext },
    async reload () {
      const generation = ++this.generation
      const context = this.queryContext
      const expanded = this.activeContext === context ? expandedRuntimePaths(this.rows) : []
      this.activeContext = context
      this.rows = []; this.columns = runtimeColumns([]); this.error = ''; this.loading = true
      try {
        const url = runtimeUrl(this.item.config.api, this.start, this.end)
        const rows = await this.ajax({ params: { url, widget: 'biaoge' } })
        if (!this.current(generation, context)) return
        this.columns = runtimeColumns(rows)
        const config = readDpmUrl(this.item.config.api).config
        this.rows = runtimeNodes(rows, String(generation), 0, [], config.rawSortMetric)
        await this.restoreExpanded(this.rows, expanded, generation, context)
      } catch (error) {
        if (this.current(generation, context)) this.error = '运行统计加载失败：' + describeDpmError(error)
      } finally {
        if (this.current(generation, context)) this.loading = false
      }
    },
    async restoreExpanded (nodes, paths, generation, context) {
      for (const node of nodes) {
        if (!this.current(generation, context)) return
        const path = paths.find(path => path.selector === node.selector)
        if (!path || !node.canExpand) continue
        await this.loadChildren(node)
        await this.restoreExpanded(node.children, path.children, generation, context)
      }
    },
    toggle (row) {
      row.expanded = !row.expanded
      if (row.expanded && !row.loaded && !row.loading) this.loadChildren(row)
    },
    async loadChildren (row) {
      if (!row.canExpand || row.loading) return
      const generation = this.generation
      const context = this.queryContext
      row.expanded = true; row.loading = true; row.error = ''
      try {
        const url = runtimeUrl(this.item.config.api, this.start, this.end, row.selector)
        const rows = await this.ajax({ params: { url, widget: 'biaoge' } })
        if (!this.current(generation, context)) return
        const config = readDpmUrl(this.item.config.api).config
        row.children = runtimeNodes(rows, row.key, row.depth + 1, row.ancestors.concat(row.selector), config.rawSortMetric)
        row.loaded = true
      } catch (error) {
        if (this.current(generation, context)) row.error = describeDpmError(error)
      } finally {
        if (this.current(generation, context)) row.loading = false
      }
    }
  }
}
</script>

<style scoped>
.runtime-toolbar { height: 32px; display: flex; justify-content: space-between; align-items: center; color: #a6b2c0; font-size: 12px; }
.runtime-toolbar-editable { cursor: move; }
.runtime-name { display: flex; align-items: center; }
.runtime-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.runtime-spacer { display: inline-block; min-width: 22px; }
.runtime-state { color: #a6b2c0; font-size: 12px; padding-left: 22px; }
.runtime-table >>> .el-table, .runtime-table >>> .el-table tr { background: transparent; }
.runtime-table >>> .el-table__fixed { background: #0f1c29; }
</style>
