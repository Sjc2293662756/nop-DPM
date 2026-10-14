<style>
.pointer{
    cursor: pointer;
}
.c0073ff{
    color: #0073ff
}
.fontSize22{
    font-size: 22px
}
.el-dialog{
    width: 960px!important
}
.bg-yellow .el-input__inner{
    background-color:#ffff00;
}
.bg-orange .el-input__inner{
    background-color:#ff9900
}
.bg-red .el-input__inner{
    background-color:#ff0000
}
.add-btn{
    text-align:right;
    margin-top:10px
}
</style>


<template>
    <div class="api-modal">
        <el-dialog title="编辑数据" :visible.sync="dialogFormVisible" v-loading='formLoading' :close-on-click-modal='false' :close-on-press-escape='false' @closed='resetForm' :modal-append-to-body='false'>
            <el-form :model="formData" :rules="rulesFormData" ref="formData" label-width="120px">
                <!-- 数据源配置 -->
                <el-form-item label="数据源" prop="ip">
                    <el-select v-model="formData.ip" placeholder="请选择数据源" @change="handleDataSourceChange">
                        <el-option v-for="(item,index) in ipOption" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                
                <!-- 本地数据源配置 -->
                <template v-if="location == 0">
                    <el-form-item label="选择服务器" prop="groupArgument1">
                        <el-select v-model="formData.groupArgument1" placeholder="请选择服务器IP">
                            <el-option v-for="(objItem,objIndex) in groupArgument1Arr" :key="objIndex" :label="objItem.label" :value="objItem.value"></el-option>
                        </el-select>
                        <el-input v-model="formData.groupArgument1" placeholder="请输入服务器IP" style="width:180px"></el-input>
                    </el-form-item>

                    <el-form-item label="数据类型" prop="groupType1">
                        <el-select v-model="formData.groupType1" placeholder="请选择数据类型" @change="handleDataTypeChange">
                            <el-option v-for="(item,index) in localTypeOption" :key="index" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item v-if="formData.groupType1 === 'UserDB'" label="选择用户名" prop="groupArgument2">
                        <el-select v-model="formData.groupArgument2" placeholder="所有用户">
                            <el-option v-for="(objItem,objIndex) in groupArgument2Arr" :key="objIndex" :label="objItem.label" :value="objItem.value"></el-option>
                        </el-select>
                        <el-input v-model="formData.groupArgument2" placeholder="所有用户" style="width:180px"></el-input>
                    </el-form-item>
                </template>
               
                <!-- 远程数据源对象配置 -->
                <el-form-item label-width="0px" v-if="location == 1">
                    <div v-for="(obj, index) in formData.objects" :key="index" :style="{marginBottom:(formData.objects.length==(index+1))?'0px':'18px'}" style="display:flex;">
                        <div>
                            <el-form-item :label="isDatabase ? '分析对象' : '对象'+(index+1)" :prop="`objects.${index}.groupType`" :rules='rulesFormData.groupType'>
                                <el-select v-model="obj.groupType" @change='handleObjectChange(obj,index)' placeholder="请选择对象">
                                    <el-option v-for="(objItem,objIndex) in obj.groupTypeArr" :key="objIndex" :label="objItem.label" :value="objItem.key"></el-option>
                                </el-select>
                            </el-form-item>
                        </div>
                        <div v-if="obj.hasArgument">
                            <el-form-item :label="'参数'+(index+1)" :prop="`objects.${index}.groupArgument`" :rules='rulesFormData.groupArgument'>
                                <el-select v-model="obj.groupArgument" placeholder="请选择参数">
                                    <el-option v-for="(objItem,objIndex) in obj.groupArgumentArr" :key="objIndex" :label="objItem.label" :value="objItem.value"></el-option>
                                </el-select>
                                <el-input v-model="obj.groupArgument" placeholder="请输入参数" style="width:180px"></el-input>
                            </el-form-item>
                        </div>
                        <div style="margin-left:10px">
                            <i class="el-icon-remove-outline fontSize22 pointer" @click.prevent="removeObj(obj,index)" v-if="index===formData.objects.length-1&&formData.objects.length>1"></i>
                            <i class="el-icon-circle-plus-outline fontSize22 pointer c0073ff" @click="addObj(obj,index)" v-if="!isDatabase&&index===formData.objects.length-1&&storageData.length>0"></i>
                        </div>
                    </div>
                </el-form-item>

                <el-form-item v-if="isDatabase" label="查询时间">
                    <el-radio-group :value="databaseQuery.timeMode || 'dashboard'" @input="handleDatabaseTimeMode">
                        <el-radio label="dashboard">跟随页面时间</el-radio>
                        <el-radio label="fixed">自定义时间</el-radio>
                    </el-radio-group>
                    <el-date-picker v-if="databaseQuery.timeMode === 'fixed'" v-model="databaseTimeRange" type="datetimerange"
                        :clearable="false" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" style="display:block;margin-top:8px;width:400px" />
                </el-form-item>
                <database-fields v-if="isDatabase" ref="databaseFields" v-model="databaseQuery"
                    :source="formData.ip" :start="start" :end="end" :widget="imgtype" :metric-limit="getMetricsLimit()" @refresh-time="handleDatabaseRefreshTime" />

                <!-- 指标配置 -->
                <el-form-item v-if="!isDatabase" label="指标" prop="metrics">
                    <el-select v-model="metricsCategory" multiple :multiple-limit="getMetricsLimit()" @change="handleMetricsCategoryChange" placeholder="请选择指标分类">
                        <el-option v-for="(item,index) in metricsOption1" :key="index" :label="item.name" :value="item.value"></el-option>
                    </el-select>
                    
                    <el-select v-model="formData.metrics" multiple :multiple-limit="getMetricsLimit()" collapse-tags placeholder="请选择指标">
                        <el-option-group v-for="(group,index) in metricsOption2" :key="index" :label="group.name">
                            <el-option v-for="(item,index) in group.value" :key="index" :label="item.name" :value="item.value"></el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>

                <!-- 条件配置 -->
                <template v-if="formData.groupType1 !=='topsummary'">
                    <el-form-item label="数量" prop="topCount" v-if="!isDatabase&&formData.type==='topValues'">
                        <el-input v-model="formData.topCount" type="number" min="0" max="1000" style="width:217px"></el-input>
                    </el-form-item>
                    <el-form-item label="排序指标" prop="topMetric" v-if="!isDatabase&&formData.type==='topValues'">
                        <el-select v-model="topMetricCategory" @change="handleTopMetricCategoryChange" placeholder="请选择排序指标分类">
                            <el-option v-for="(item,index) in topMetricsOption1" :key="index" :label="item.name" :value="item.value"></el-option>
                        </el-select>
                        <el-select v-model="formData.topMetric" placeholder="请选择排序指标">
                            <el-option v-for="(item,index) in topMetricsOption2" :key="index" :label="item.name" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="更新时间" v-if="$route.name==='networkEditor'||$route.name==='applicationEditor'">
                        <el-input placeholder="请输入更新时间" v-model="updateTime" style="width:217px">
                            <template slot="append">秒</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="时间粒度" prop="granularity" v-if="!isDatabase&&formData.type==='timeValues'">
                        <el-select v-model="formData.granularity" placeholder="请选择时间粒度">
                            <el-option v-for="(objItem,objIndex) in granularityArr" :key="objIndex" :label="objItem.label" :value="objItem.value"></el-option>
                        </el-select>
                    </el-form-item>
                </template>
            </el-form>

            <!-- 高级配置 -->
            <div v-if="$route.name==='networkEditor'||$route.name==='applicationEditor'">
                <!-- 阈值设置 -->
                <el-collapse accordion v-model="activeItem">
                    <el-collapse-item name="1">
                        <template slot="title">
                            阈值设置<i class="header-icon el-icon-info"></i>
                        </template>
                        <el-row :gutter="20">
                            <el-col :span="4" :offset="9"><div class="grid-content">轻微</div></el-col>
                            <el-col :span="4"><div class="grid-content">重大</div></el-col>
                            <el-col :span="4"><div class="grid-content">紧急</div></el-col>
                        </el-row>
                        <el-row :gutter="20" v-for="(item,index) in thresholdArr" :key="index" style="margin-top:10px">
                            <el-col :span="6">
                                <div class="grid-content">
                                    <el-select v-model="item.category" placeholder="请选择" disabled>
                                        <el-option v-for="item in selectedMatrics" :key="item.value" :label="item.name" :value="item.value"></el-option>
                                    </el-select>
                                </div>
                            </el-col>
                            <el-col :span="3">
                                <div class="grid-content">
                                    <el-select v-model="item.symbol" placeholder="请选择">
                                        <el-option v-for="item in compareOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </div>
                            </el-col>
                            <el-col :span="4">
                                <div class="grid-content bg-yellow">
                                    <el-input v-model="item.Minor" placeholder=""></el-input>
                                </div>
                            </el-col>
                            <el-col :span="4">
                                <div class="grid-content bg-orange">
                                    <el-input v-model="item.Major" placeholder=""></el-input>
                                </div>
                            </el-col>
                            <el-col :span="4">
                                <div class="grid-content bg-red">
                                    <el-input v-model="item.Critical" placeholder=""></el-input>
                                </div>
                            </el-col>
                        </el-row>
                    </el-collapse-item>
                </el-collapse>

                <!-- 样式设置 -->
                <el-collapse accordion v-model="activeItem">
                    <el-collapse-item name="2">
                        <template slot="title">
                            样式设置<i class="header-icon el-icon-info"></i>
                        </template>
                        <el-form :model="styleData" ref="styleData" label-width="120px">
                            <el-form-item label="背景色">
                                <el-color-picker v-model="styleData.bgColor" show-alpha :predefine="predefineColors"></el-color-picker>
                            </el-form-item>
                            <el-form-item label="边框色">
                                <el-color-picker v-model="styleData.borderColor" show-alpha :predefine="predefineColors"></el-color-picker>
                            </el-form-item>
                            <el-form-item label="动画效果">
                                <el-select v-model="styleData.isAnimation" placeholder="请选择">
                                    <el-option v-for="item in animateOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </el-collapse-item>
                </el-collapse>
            </div>

            <div slot="footer" class="dialog-footer">
                <el-button @click="resetForm()">取 消</el-button>
                <el-button type="primary" @click="submitForm('formData')">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import axios from "axios"
import {getObjects,getMetrics,getTopMetrics,getIps} from '@/apis/module.js'
import {getQueryString,descCompare,getDashboardRange} from "@/lib/common.js"
import { mapActions } from 'vuex'
import DatabaseFields from './ApiModal/DatabaseFields.vue'
import { databaseObjects, defaultQuery, isDatabaseObject, metricGroups } from '@/dataSources/dpm/catalog'
import { defaultWidgetQuery, widgetMetricLimit } from '@/dataSources/dpm/capabilities'
import { runtimeConfiguration } from '@/dataSources/dpm/runtime'
import { buildDpmUrl, readDpmUrl, isDpmUrl } from '@/dataSources/dpm/query'

// 配置常量
const DATA_TYPE_CONFIG = {
    UserDB: {
        metricsCategory: '用户数据',
        defaultMetrics: ['cpu_time'],
        defaultTopMetric: 'cpu_time',
        requiresUserList: true
    },
    topdata: {
        metricsCategory: 'CPU占用',
        defaultMetrics: ['cpu_time'],
        defaultTopMetric: 'cpu_time'
    },
    UserInfo: {
        metricsCategory: '登录信息',
        defaultMetrics: ['jcpu'],
        defaultTopMetric: 'jcpu'
    },
    topsummary: {
        metricsCategory: 'TOP信息',
        defaultMetrics: ['users']
    },
    lao_tjusages: {
        metricsCategory: '作业与用户信息',
        defaultMetrics: ['job_num'],
        defaultTopMetric: 'job_num'
    },
    lao_pestat: {
        metricsCategory: 'CPU与内存资源信息',
        defaultMetrics: ['cpu_usages'],
        defaultTopMetric: 'cpu_usages'
    },

    pestat_data: {
        metricsCategory: '节点资源详情',
        defaultMetrics: ['CPU_use'],
        defaultTopMetric: 'CPU_use'
    },
    pestat_nodefx: {
        metricsCategory: '节点资源分布信息',
        defaultMetrics: ['idle_num'],
        defaultTopMetric: 'idle_num'
    },
    squeue_data: {
        metricsCategory: '作业队列详情',
        defaultMetrics: ['job_status'],
        defaultTopMetric: 'job_status'
    },
    lao_tjnodes: {
        metricsCategory: '节点资源信息',
        defaultMetrics: ['node_total'],
        defaultTopMetric: 'node_total'
    },
    lao_tjstorage: {
        metricsCategory: '存储资源信息',
        defaultMetrics: ['r_storageused'],
        defaultTopMetric: 'r_storageused'
    }
}

const API_TYPE_CONFIG = {
    topValues: {
        requiresTopCount: true,
        requiresTopMetric: true
    },
    averageValues: {
        requiresTopCount: false,
        requiresTopMetric: false
    },
    timeValues: {
        requiresGranularity: true
    }
}

const GRANULARITY_OPTIONS = [
    {value:'0',label:'自动识别'},
    {value:'60',label:'1分钟'},
    {value:'300',label:'5分钟'},
    {value:'3600',label:'1小时'},
    {value:'86400',label:'1天'}
]

const COMPARE_OPTIONS = [
    {value:'>',label:'>'},
    {value:'<',label:'<'},
    {value:'>=',label:'>='},
    {value:'<=',label:'<='}
]

const ANIMATE_OPTIONS = [
    {value: '1',label: '是'},
    {value: '0',label: '否'}
]

export default {
    components: { DatabaseFields },
    props:{
        type:{
            type:String,
            default:''
        },
        api:{
            type:String,
            default:''
        },
        threshold:{
            type:Array,
        },
        updateTimeProps:{
            type:[String,Number],
        },
        imgtype:{
            type:String,
            default:''
        },
        styleDataProps:{
            type:Object,
        },
        startTime:{
            type:[String,Number],
            default: null
        },
        endTime:{
            type:[String,Number],
            default: null
        }
    },
    data(){
        return{
            // 移除硬编码时间，使用动态时间
            start: this.getDefaultStartTime(),
            end: this.getDefaultEndTime(),
            dialogFormVisible:false,
            formLoading:false,
            databaseQuery: defaultQuery(),
            sourceRequestId: 0,
            
            // 表单数据
            formData: {
                objects: [{
                    groupType:'',
                    groupArgument: '',
                    groupTypeArr:[],
                    groupArgumentArr:[],
                    key: Date.now()
                }],
                ip:'',
                type:'',
                metrics:['TPIO'],
                topCount:'10',
                topMetric:'TPIO',
                granularity:'0',
                groupArgument1:'',
                groupArgument2:'',
                groupType1:''
            },
            
            // 配置数据
            updateTime:undefined,
            ipOption:[],
            location:1,
            groupArgument1Arr:[],
            groupArgument2Arr:[],
            localTypeOption:[],
            storageData:[],
            
            // 指标数据
            metricsOption1:[],
            metricsOption2:[],
            topMetricsOption1:[],
            topMetricsOption2:[],
            metricsCategory:[],
            topMetricCategory:'',
            allMetrics:[],
            allTopMetrics:[],
            selectedMatrics:[],
            
            // 阈值和样式
            thresholdArr:[],
            activeItem:'',
            styleData:{
                bgColor:"rgba(255, 69, 0, 0)",
                borderColor:"rgba(255, 69, 0, 0)",
                isAnimation:'0'
            },
            
            // 常量配置
            granularityArr: GRANULARITY_OPTIONS,
            compareOption: COMPARE_OPTIONS,
            animateOption: ANIMATE_OPTIONS,
            predefineColors: [
                '#ff4500','#ff8c00','#ffd700','#90ee90','#00ced1',
                '#1e90ff','#c71585','rgba(255, 69, 0, 0.68)',
                'rgb(255, 120, 0)','hsv(51, 100, 98)',
                'hsva(120, 40, 94, 0.5)','hsl(181, 100%, 37%)',
                'hsla(209, 100%, 56%, 0.73)','#c7158577'
            ],
            
            // 表单验证规则
            rulesFormData:{
                ip:[{ required: true, message: '请选择数据源', trigger: 'change' }],
                groupArgument1:[{ required: true, message: '请选择服务器IP', trigger: 'change' }],
                groupArgument2:[{ required: false, message: '请选择用户名', trigger: 'change' }],
                groupType1:[{ required: true, message: '请选择数据类型', trigger: 'change' }],
                type:[{ required: true, message: '请选择数据类型', trigger: 'change' }],
                groupType:[{ required: true, message: '请选择对象', trigger: 'change' }],
                groupArgument:[{ required: true, message: '请选择数据参数', trigger: 'change' }],
                metrics:[{ required: true, message: '请选择指标', trigger: 'change' }],
                topCount:[{ required: true, message: '请选择数量', trigger: 'blur' }],
                topMetric:[{ required: true, message: '请选择排序指标', trigger: 'change' }],
                granularity:[{ required: true, message: '请选择时间粒度', trigger: 'blur' }]
            }
        }
    },
    computed: {
        isDatabase(){
            return this.location == 1 && this.formData.objects.length > 0 && isDatabaseObject(this.formData.objects[0].groupType)
        },
        databaseTimeRange: {
            get(){ return [new Date(Number(this.start) * 1000), new Date(Number(this.end) * 1000)] },
            set(range){
                if(!range || range.length !== 2) return
                const start = Math.floor(range[0].getTime() / 1000)
                const end = Math.floor(range[1].getTime() / 1000)
                if(!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return
                this.start = String(start)
                this.end = String(end)
            }
        }
    },
    mounted(){
        const vm=this
        window.getNewDate=vm.getNewDate
        this.$nextTick(()=>{
            // 使用动态时间，移除硬编码
            this.updateTimeRange()
        })
    },
    watch:{
        databaseQuery: {
            deep: true,
            handler(query){
                if(this.isDatabase){
                    this.allMetrics = metricGroups(query)
                    if(this.formData.metrics.join(',') !== query.metrics.join(',')) this.formData.metrics = query.metrics.slice()
                }
            }
        },
        'formData.granularity':function(newVal,oldVal){
            if(newVal==0){
                let t = this.end - this.start;
                if (t > 21600 && t < 259200) {
                    this.definedGranularity = 300;
                } else if (t > 259200 && t < 2592000) {
                    this.definedGranularity = 3600;
                } else if (t > 3600000) {
                    this.definedGranularity = 86400;
                }
            }
        },
        'formData.metrics':function(newVal,oldVal){
            if(this.$route.name==='networkEditor'||this.$route.name==='applicationEditor'){
                this.updateThresholdArr()
            }
        }
    },
    methods:{
        ...mapActions(['ajax','localAjax']),
        
        // 工具方法
        getNewDate(){
            this.updateTimeRange()
        },
        
        // 获取默认开始时间（当前时间往前推1小时）
        getDefaultStartTime(){
            const now = new Date()
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
            return Math.floor(oneHourAgo.getTime() / 1000).toString()
        },
        
        // 获取默认结束时间（当前时间）
        getDefaultEndTime(){
            const now = new Date()
            return Math.floor(now.getTime() / 1000).toString()
        },
        
        // 更新时间范围
        updateTimeRange(){
            const valid = (start, end) => start !== '' && start != null && end !== '' && end != null &&
                Number.isFinite(Number(start)) && Number.isFinite(Number(end)) && Number(start) < Number(end)
            let range = valid(this.startTime, this.endTime) ? getDashboardRange(this.startTime, this.endTime) : null
            try {
                if(!range && valid(window.parent.startTimeUnix, window.parent.endTimeUnix)){
                    range = getDashboardRange(window.parent.startTimeUnix, window.parent.endTimeUnix)
                }
            } catch(error) { /* Standalone cross-origin frames use the default range. */ }
            if(!range && process.env.NODE_ENV === 'development'){
                const params = new URLSearchParams(window.location.search)
                if(valid(params.get('testStart'), params.get('testEnd'))){
                    range = getDashboardRange(params.get('testStart'), params.get('testEnd'))
                } else if(process.env.VUE_APP_TEST_TIME_ENABLED === 'true' &&
                          valid(process.env.VUE_APP_TEST_START_TIME, process.env.VUE_APP_TEST_END_TIME)){
                    range = getDashboardRange(process.env.VUE_APP_TEST_START_TIME, process.env.VUE_APP_TEST_END_TIME)
                }
            }
            range = range || getDashboardRange()
            this.start = range.start
            this.end = range.end
        },
        
        getMetricsLimit(){
            if(this.isDatabase) return widgetMetricLimit(this.imgtype)
            const singleMetricsTypes = ['hengxiangzhuzhuangtu','zongxiangzhuzhuangtu','jinduhuantu','yibiaopan','meiguitu','bingtu','shixinbingtu','shuzitu']
            const excludeTypes = ['lao_pestat', 'lao_tjnodes', 'lao_tjstorage', 'lao_tjusages', 'pestat_data', 'squeue_data', 'pestat_nodefx']
            
            if(singleMetricsTypes.includes(this.imgtype) && !excludeTypes.includes(this.formData.groupType1)){
                return 1
            }
            return 0
        },
        
        // 数据源相关方法
        async handleDataSourceChange(){
            await this.getObj()
        },
        
        async handleDataTypeChange(){
            const context = this.sourceContext()
            const dataType = this.formData.groupType1
            const config = DATA_TYPE_CONFIG[this.formData.groupType1]
            if(!config) return
            const isCurrent = () => this.sourceContextMatches(context) && dataType === this.formData.groupType1
            
            if(config.requiresUserList){
                await this.getLocalUserList()
                if(!isCurrent()) return
            }
            await this.getLocalMetrics()
            if(!isCurrent()) return
            
            this.metricsCategory = [config.metricsCategory]
            this.topMetricCategory = config.metricsCategory
            this.changeTopMetricCategory()
            this.changeMetricsCategory()
            this.formData.metrics = config.defaultMetrics
            if(config.defaultTopMetric){
                this.formData.topMetric = config.defaultTopMetric
            }
        },
        
        // 对象相关方法
        handleObjectChange(obj, index){
            this.changeObj(obj, index)
        },
        handleDatabaseTimeMode(mode){
            this.databaseQuery = Object.assign({}, this.databaseQuery, { timeMode: mode })
            if(mode === 'dashboard') this.updateTimeRange()
        },
        handleDatabaseRefreshTime(){
            if(this.databaseQuery.timeMode !== 'fixed') this.updateTimeRange()
        },
        
        addObj(item, index) {
            this.formData.objects.push({
                groupArgument: '',
                groupType:'',
                groupTypeArr:[],
                groupArgumentArr:[],
                key: Date.now()
            });
            //   让上一行的“参数”块在点 + 后立即可见（与 old 行为一致）
            if (this.formData.type === 'topValues') {
                const prev = this.formData.objects[index];
                if (prev && Array.isArray(prev.groupTypeArr)) {
                const hit = prev.groupTypeArr.find(it => it.key === prev.groupType);
                if (hit && prev.hasArgument === undefined) {
                    this.formData.objects[index].hasArgument = hit.hasArgument;
                }
                } 
            }
            this.formData.objects[index+1].groupTypeArr = this.storageData
        },
        
        removeObj(item, index) {
            const findIndex = this.formData.objects.indexOf(item)
            if (findIndex !== -1) {
                this.formData.objects.splice(findIndex, 1)
            }
        },
        
        // 指标相关方法
        handleMetricsCategoryChange(){
            this.changeMetricsCategory()
        },
        
        handleTopMetricCategoryChange(){
            this.changeTopMetricCategory()
        },
        
        // 核心业务方法
        async openApi(){
            this.initForm()
            this.updateTimeRange()
            if(isDpmUrl(this.api)){
                await this.getIpsFun()
            } else {
                await Promise.all([
                    this.getObjClear(),
                    this.getMetricsFun(),
                    this.getTopMetricsFun(),
                    this.getIpsFun()
                ])
            }
            
            if(this.api){
                await this.showItemData()
            }
            
            if(this.$route.name==='networkEditor'||this.$route.name==='applicationEditor'){
                this.updateThresholdArr()
                this.updateTime = this.updateTimeProps
                if(this.styleDataProps){
                    this.styleData = this.styleDataProps
                }
            }
            
            this.formData.type = this.type
            this.dialogFormVisible = true
        },
        
        initForm(){
            this.sourceRequestId++
            this.databaseQuery = defaultWidgetQuery('Database', this.type, this.imgtype)
            this.formData = {
                objects: [{
                    groupType:'',
                    groupArgument: '',
                    groupTypeArr:[],
                    groupArgumentArr:[],
                    key: Date.now()
                }],
                ip:'',
                type:'',
                metrics:['TPIO'],
                topCount:'10',
                topMetric:'TPIO',
                granularity:'0',
                groupArgument1:'',
                groupArgument2:'',
                groupType1:''
            }
            this.metricsOption2 = []
            this.metricsCategory = ['网络流量']
            this.topMetricCategory = '网络流量'
        },
        
        updateThresholdArr(){
            this.selectedMatrics = []
            this.formData.metrics.forEach((item) => {
                this.allMetrics.forEach((item1) => {
                    const found = item1.value.find((findItem) => findItem.value === item)
                    if(found){
                        this.selectedMatrics.push(found)
                    }
                })
            })
            
            this.thresholdArr = this.selectedMatrics.map((item) => ({
                key: (new Date()).valueOf(),
                relation: 'and',
                category: item.value,
                symbol: '>',
                Minor: '',
                Major: '',
                Critical: '',
                metrics: item.name
            }))
            
            if(this.api && this.threshold){
                this.threshold.forEach((item) => {
                    const thresholdItem = this.thresholdArr.find((item1) => item1.category === item.category)
                    if(thresholdItem){
                        Object.assign(thresholdItem, {
                            Minor: item.Minor,
                            Major: item.Major,
                            Critical: item.Critical,
                            symbol: item.symbol
                        })
                    }
                })
            }
        },
        
        // API生成方法
        generateApiUrl(){
            if(this.isDatabase){
                let config = Object.assign({}, this.databaseQuery, { widget: this.imgtype, widgetPolicyVersion: 1 })
                if(config.view === 'raw' && this.imgtype === 'biaoge') config = runtimeConfiguration(config)
                return buildDpmUrl(`https://${this.formData.ip}/webservice/NetInside`, config, this.start, this.end)
            }
            if(this.location == 0){
                return this.generateLocalApiUrl()
            } else {
                return this.generateRemoteApiUrl()
            }
        },
        
        generateLocalApiUrl(){
            const baseUrl = `https://${this.formData.ip}/NetInside/webservice/NetInside`
            const type = this.formData.type
            const groupType1 = this.formData.groupType1
            const groupArgument1 = this.formData.groupArgument1
            const metrics = this.formData.metrics.toString()
            const start = this.start
            const end = this.end

            let url = `${baseUrl}?type=${type}&numGroups=1&groupType1=${groupType1}`

            if (groupArgument1) {
                url += `&groupArgument1=${groupArgument1}`
            }

            url += `&metrics=${metrics}&start=${start}&end=${end}`

            if (type === 'topValues') {
                url += `&topMetric=${this.formData.topMetric}&topCount=${this.formData.topCount}`
            } else if (type === 'timeValues') {
                const granularity = this.formData.granularity || this.definedGranularity
                url += `&granularity=${granularity}`
            }

            return encodeURI(url + '&json=true')
        },
        
        generateRemoteApiUrl(){
            let groups = ''
            let maxIndex = ''
            
            this.formData.objects.forEach((item, index) => {
                if(item.groupType === 'Application' || item.groupType === 'OtherApp' || item.groupType === 'DefinedApp'){
                    if(item.groupArgument){
                        if(item.groupArgument.indexOf("-udp") != -1){
                            item.groupArgument = "udp:" + this.getport(item.groupArgument)
                        } else if(item.groupArgument.indexOf("-tcp") != -1){
                            item.groupArgument = "tcp:" + this.getport(item.groupArgument)
                        }
                    }
                }
                
                groups += (item.groupType ? `&groupType${index+1}=${item.groupType}` : '') + 
                         ((item.groupArgument && item.hasArgument) ? `&groupArgument${index+1}=${item.groupArgument}` : '')
                
                if(item.groupType){
                    maxIndex = index
                }
            })
            
            const baseUrl = `https://${this.formData.ip}/webservice/NetInside`
            const type = this.formData.type
            const metrics = this.formData.metrics.toString()
            const start = this.start
            const end = this.end
            
            let url = `${baseUrl}?type=${type}&numGroups=${maxIndex+1}${groups}&metrics=${metrics}&start=${start}&end=${end}`
            
            if(type === 'topValues'){
                url += `&topMetric=${this.formData.topMetric}&topCount=${this.formData.topCount}`
            } else if (type === 'timeValues'){
                const granularity = this.formData.granularity || this.definedGranularity
                url += `&granularity=${granularity}`
            }
            
            return encodeURI(url + '&json=true')
        },
        
        // 表单提交
        submitForm(formName) {
            if(this.isDatabase){
                try { this.$refs.databaseFields.validate() } catch(error) {
                    this.$message.error(error.message)
                    return
                }
            }
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    let apiUrl
                    try { apiUrl = this.generateApiUrl() } catch(error) {
                        this.$message.error(error.message)
                        return
                    }
                    this.dialogFormVisible = false
                    
                    if(this.$route.name === 'networkEditor' || this.$route.name === 'applicationEditor'){
                        this.$emit('postParams', apiUrl, this.thresholdArr, this.updateTime, this.styleData)
                    } else {
                        this.$emit('postParams', apiUrl)
                    }
                }
            })
        },
        
        resetForm() {
            this.sourceRequestId++
            this.$refs.formData.resetFields()
            this.location = 1
            this.dialogFormVisible = false
        },

        sourceContext(){
            return { version: this.sourceRequestId, source: this.formData.ip, location: this.location }
        },

        sourceContextMatches(context){
            return context.version === this.sourceRequestId && context.source === this.formData.ip && context.location === this.location
        },
        
        // 数据加载方法（保持原有逻辑，但简化结构）
        async getIpsFun(){
            try {
                const res = await getIps()
                this.ipOption = res.data.map(item => ({
                    label: `${item.ip}|${item.location == 0 ? '本地' : '远程'}|${item.alias}`,
                    value: item.ip,
                    location: item.location
                }))
            } catch(e) {
                console.error('获取IP列表失败:', e)
            }
        },
        
        async getObjClear(){
            this.formData.objects[0].groupTypeArr = []
        },
        
        async getObj(skipMetrics = false){
            const requestId = ++this.sourceRequestId
            const source = this.formData.ip
            this.ipOption.forEach(item => {
                if(item.value === this.formData.ip){
                    this.location = item.location
                }
            })
            
            this.resetFormData()
            
            if(this.location == 0){
                await Promise.all([
                    this.getServiceIpList(),
                    this.getDataTypeList(),
                    this.getLocalUserList()
                ])
            } else {
                if(!skipMetrics) this.getMetricsFun()
                this.formData.objects[0].groupTypeArr = databaseObjects()
                const param = {
                    url: `https://${this.formData.ip}/webservice/NetInside?type=groups&json=true`
                }
                try {
                    const res = await this.ajaxs(param)
                    if(requestId === this.sourceRequestId && source === this.formData.ip){
                        if(!Array.isArray(res)) throw new Error('对象目录格式无效')
                        this.processRemoteObjects(res)
                    }
                } catch(error) {
                    if(requestId === this.sourceRequestId){
                        this.$message.warning('通用对象目录加载失败，仍可选择数据库并加载数据库节点')
                    }
                }
            }
        },
        
        resetFormData(){
            this.formData.objects = [{
                groupType:'',
                groupArgument: '',
                groupTypeArr:[],
                groupArgumentArr:[],
                key: Date.now()
            }]
            this.formData.type = this.type
            this.formData.metrics = ['TPIO']
            this.formData.topCount = '1'
            this.formData.topMetric = 'TPIO'
            this.formData.granularity = '0'
            this.formData.groupArgument1 = ''
            this.formData.groupArgument2 = ''
            this.formData.groupType1 = ''
        },
        
        processRemoteObjects(res){
            this.allObjArr = res
            this.formData.objects[0].groupTypeArr = databaseObjects()
            const objectMap = {
                'Prefix24': '网段',
                'BusinessGroup': '工作组',
                'VLAN': 'VLAN',
                'WebApplication': '业务',
                'MonInterfaceGroup': '监控口',
                'ClientBusinessGroup': '用户组'
            }
            
            this.allObjArr.forEach(item => {
                if(objectMap[item.key]){
                    item.label = objectMap[item.key]
                }
                
                const excludeKeys = ['ISPAS', 'DestAS', 'BusinessGroupLink', 'Interface', 'User']
                if(!excludeKeys.includes(item.key) && !isDatabaseObject(item.key)){
                    this.formData.objects[0].groupTypeArr.push(item)
                }
            })
        },
        
        // 其他必要的方法（保持原有功能）
        changeObj(obj, index, type){
            if(index === 0 && isDatabaseObject(obj.groupType)){
                this.formData.objects.splice(1)
                this.$set(this.formData.objects[0], 'hasArgument', false)
                this.storageData = []
                const timeMode = this.databaseQuery.timeMode || 'dashboard'
                this.databaseQuery = Object.assign(defaultWidgetQuery(obj.groupType, this.type, this.imgtype), { timeMode })
                if(timeMode !== 'fixed') this.updateTimeRange()
                this.allMetrics = metricGroups(this.databaseQuery)
                this.formData.metrics = this.databaseQuery.metrics.slice()
                return
            }
            if(index === 0){
                if(!type){
                    const businessTypes = ['WebApplication', 'PageFamily', 'User', 'ClientBusinessGroup']
                    if(businessTypes.includes(obj.groupType)){
                        this.metricsCategory = ['业务访问']
                        this.topMetricCategory = '业务访问'
                        this.changeTopMetricCategory()
                        this.changeMetricsCategory()
                        this.formData.metrics = ['PGNPGE']
                        this.formData.topMetric = 'PGNPGE'
                    } else {
                        this.metricsCategory = ['网络流量']
                        this.topMetricCategory = '网络流量'
                        this.changeTopMetricCategory()
                        this.changeMetricsCategory()
                        this.formData.metrics = ['TPIO']
                        this.formData.topMetric = 'TPIO'
                    }
                }
                this.getMetricsFun(obj)
                this.getTopMetricsFun(obj)
            }
            
            this.storageData = []
            this.formData.objects[index].groupArgument = ''
            
            if(!type){
                this.formData.objects.splice(index+1, this.formData.objects.length-(index+1))
            }
            
            this.formData.objects[index].groupTypeArr.forEach(item => {
                if(item.key === this.formData.objects[index].groupType){
                    this.formData.objects[index].existArgument = item.hasArgument
                    this.storageData = item.children
                    if(this.formData.type === 'topValues'){
                        this.formData.objects[index].hasArgument = undefined
                    } else if(['averageValues', 'timeValues'].includes(this.formData.type)){
                        this.formData.objects[index].hasArgument = item.hasArgument
                    }
                }
            })
            
            if(this.formData.objects[index+1]){
                this.formData.objects[index+1].groupTypeArr = this.storageData
            }
            
            if(!this.formData.objects[index].existArgument && 
               this.formData.objects.length-1 === index && 
               this.formData.objects[index].groupType !== "TotalTraffic" && 
               type !== 'apppend'){
                this.addObj(obj, index)
            }
            
            this.getObjParams(index)
        },
        
        async getObjParams(index){
            if(this.isDatabase) return
            const context = this.sourceContext()
            const source = this.formData.ip
            const objectKeys = this.formData.objects.map(item => item.groupType).join('|')
            let groups = ''
            let maxIndex = ''
            let url = ''
            
            this.formData.objects.forEach((item, index) => {
                groups += (item.groupType ? `&groupType${index+1}=${item.groupType}` : '') + 
                         ((item.groupArgument) ? `&groupArgument${index+1}=${item.groupArgument}` : '')
                if(item.groupType){
                    maxIndex = index
                }
                if(index === this.formData.objects.length-1){
                    const businessTypes = ['WebApplication', 'PageFamily', 'ClientBusinessGroup', 'User']
                    if(businessTypes.includes(this.formData.objects[0].groupType)){
                        url = `https://${this.formData.ip}/webservice/NetInside?type=topValues&numGroups=${maxIndex+1}${groups}&metrics=PGNPGE&start=${this.start}&end=${this.end}&topMetric=PGNPGE&topCount=10&json=true`
                    } else {
                        url = `https://${this.formData.ip}/webservice/NetInside?type=topValues&numGroups=${maxIndex+1}${groups}&metrics=TPIO&start=${this.start}&end=${this.end}&topMetric=TPIO&topCount=10&json=true`
                    }
                }
            })
            
            const param = { url: encodeURI(url) }
            const res = await this.ajaxs(param)
            if(!this.sourceContextMatches(context) || this.isDatabase || source !== this.formData.ip || objectKeys !== this.formData.objects.map(item => item.groupType).join('|')) return
            
            if(res.length > 0){
                const tempArr = res
                    .filter(item => item.group.argument)
                    .map(item => ({
                        value: item.group.argument,
                        label: item.group.argument,
                        metricValue: item.metricValues[0].value
                    }))
                    .sort(descCompare("metricValue"))
                
                if(this.formData.objects[index]){
                    this.formData.objects[index].groupArgumentArr = tempArr
                }
            }
        },
        
        async getMetricsFun(obj){
            if(this.isDatabase) return
            const context = this.sourceContext()
            const source = this.formData.ip
            const objectKey = this.formData.objects[0].groupType
            this.metricsOption1 = []
            try {
                const res = await getMetrics()
                if(!this.sourceContextMatches(context) || this.isDatabase || source !== this.formData.ip || objectKey !== this.formData.objects[0].groupType) return
                this.allMetrics = res.data
                
                if(obj){
                    const businessTypes = ['WebApplication', 'PageFamily', 'ClientBusinessGroup']
                    const businessMetrics = ['业务网络', '业务访问', '业务性能', '响应代码']
                    
                    if(businessTypes.includes(obj.groupType)){
                        this.metricsOption1 = this.allMetrics
                            .filter(item => businessMetrics.includes(item.name))
                            .map(item => ({value: item.name, name: item.name}))
                    } else {
                        this.metricsOption1 = this.allMetrics
                            .filter(item => !businessMetrics.includes(item.name))
                            .map(item => ({value: item.name, name: item.name}))
                    }
                    this.changeMetricsCategory('init')
                } else {
                    this.metricsOption1 = this.allMetrics.map(item => ({value: item.name, name: item.name}))
                    this.metricsCategory = ['网络流量']
                    this.changeMetricsCategory('init')
                }
            } catch(e) {
                console.error('获取指标失败:', e)
            }
        },
        
        changeMetricsCategory(type){
            if(type !== 'init'){
                this.formData.metrics = []
                this.metricsOption2 = []
            }
            
            this.metricsOption2 = this.allMetrics.filter(item => 
                this.metricsCategory.includes(item.name)
            )
        },
        
        async getTopMetricsFun(obj){
            if(this.isDatabase) return
            const context = this.sourceContext()
            const source = this.formData.ip
            const objectKey = this.formData.objects[0].groupType
            this.topMetricsOption1 = []
            try {
                const res = await getTopMetrics()
                if(!this.sourceContextMatches(context) || this.isDatabase || source !== this.formData.ip || objectKey !== this.formData.objects[0].groupType) return
                this.allTopMetrics = res.data
                
                if(obj){
                    const businessTypes = ['WebApplication', 'PageFamily', 'ClientBusinessGroup']
                    const businessMetrics = ['业务网络', '业务访问', '业务性能', '响应代码']
                    
                    if(businessTypes.includes(obj.groupType)){
                        this.topMetricsOption1 = this.allTopMetrics
                            .filter(item => businessMetrics.includes(item.name))
                            .map(item => ({value: item.name, name: item.name}))
                    } else {
                        this.topMetricsOption1 = this.allTopMetrics
                            .filter(item => !businessMetrics.includes(item.name))
                            .map(item => ({value: item.name, name: item.name}))
                    }
                    this.changeTopMetricCategory('init')
                } else {
                    this.topMetricsOption1 = this.allTopMetrics.map(item => ({value: item.name, name: item.name}))
                    this.topMetricCategory = '网络流量'
                    this.changeTopMetricCategory('init')
                }
            } catch(e) {
                console.error('获取排序指标失败:', e)
            }
        },
        
        changeTopMetricCategory(type){
            if(type !== 'init'){
                this.formData.topMetric = ''
                this.topMetricsOption2 = []
            }
            
            const category = this.allTopMetrics.find(item => item.name === this.topMetricCategory)
            if(category){
                this.topMetricsOption2 = category.value.map(item => ({
                    value: item.value,
                    name: item.name
                }))
            }
        },
        
        // 本地数据相关方法
        async getLocalMetrics(){
            const context = this.sourceContext()
            const dataType = this.formData.groupType1
            const urlMap = {
                "lao_pestat": "/NetInside/js/local_lao_pestat.json",
                "lao_tjnodes": "/NetInside/js/local_lao_tjnodes.json",
                "lao_tjstorage": "/NetInside/js/local_lao_tjstorage.json",
                "lao_tjusages": "/NetInside/js/local_lao_tjusages.json",
                "pestat_data": "/NetInside/js/pestat_data.json",
                "pestat_nodefx": "/NetInside/js/pestat_nodefx.json",
                "squeue_data": "/NetInside/js/squeue_data.json",
                "UserDB": "/NetInside/js/local_Usermetrics.json",
                "topdata": "/NetInside/js/local_TopDatametrics.json",
                "UserInfo": "/NetInside/js/local_UserInfometrics.json",
                "topsummary": "/NetInside/js/local_TopSummaryDatametrics.json"
            }
            
            const url = urlMap[this.formData.groupType1]
            if(url){
                const param = { url }
                const res = await this.localAjaxs(param)
                if(!this.sourceContextMatches(context) || dataType !== this.formData.groupType1 || this.isDatabase) return
                this.allMetrics = res
                const arr = res.map(item => ({ value: item.name, name: item.name }))
                this.metricsOption1 = arr
                this.allTopMetrics = res
                this.topMetricsOption1 = arr
            }
        },
        
        async getLocalUserList(){
            const context = this.sourceContext()
            const param = {
                url: "/NetInside/webservice/NetInside?type=getTopCpuTimeUsername"
            }
            const res = await this.localAjaxs(param)
            if(!this.sourceContextMatches(context)) return
            this.groupArgument2Arr = res.map(item => ({
                label: item.group.argument,
                value: item.group.argument
            }))
        },
        
        async getServiceIpList(){
            const context = this.sourceContext()
            const localParam = {
                url: "/NetInside/webservice/NetInside?type=getLocalServerIp&json=true"
            }
            const res = await this.localAjaxs(localParam)
            if(!this.sourceContextMatches(context)) return
            this.groupArgument1Arr = res.map(item => ({
                label: item.group.argument,
                value: item.group.argument
            }))
        },
        
        async getDataTypeList(){
            const context = this.sourceContext()
            const dataTypeParam = {
                url: "/NetInside/js/local_dataTypes.js"
            }
            const res = await this.localAjaxs(dataTypeParam)
            if(!this.sourceContextMatches(context)) return
            this.localTypeOption = res.map(item => ({
                label: item.label,
                value: item.key
            }))
        },
        
        // 数据回显方法
        async showItemData(){
            if(isDpmUrl(this.api)){
                try {
                    const saved = readDpmUrl(this.api)
                    this.formData.ip = saved.baseUrl.replace(/^https?:\/\//, '').split('/')[0]
                    this.location = 1
                    await this.getObj(true)
                    this.formData.objects[0].groupType = saved.config.objectType
                    this.$set(this.formData.objects[0], 'hasArgument', false)
                    this.databaseQuery = Object.assign({}, saved.config, { widget: this.imgtype, widgetPolicyVersion: 1 })
                    if(saved.config.timeMode === 'fixed'){
                        this.start = saved.start
                        this.end = saved.end
                    }
                    this.allMetrics = metricGroups(saved.config)
                    this.formData.metrics = saved.config.metrics.slice()
                    this.formData.type = this.type
                    this.storageData = []
                } catch(error) { this.$message.error(error.message) }
                return
            }
            this.metricsOption2 = []
            this.topMetricsOption2 = []
            this.groupArgument1Arr = []
            this.localTypeOption = []
            
            const decodeApi = decodeURIComponent(this.api)
            
            if(decodeApi.indexOf('/NetInside/') === -1){
                this.formData.ip = decodeApi.substring(8, decodeApi.indexOf('/webservice'))
                this.location = 1
            } else {
                this.formData.ip = decodeApi.substring(8, decodeApi.indexOf('/NetInside/'))
                this.location = 0
            }
            
            await this.getObj()
            
            this.formData.groupArgument1 = getQueryString(decodeApi, 'groupArgument1')
            this.formData.groupType1 = getQueryString(decodeApi, 'groupType1')
            await this.getLocalMetrics()
            this.formData.groupArgument2 = getQueryString(decodeApi, 'groupArgument2')
            
            const metrics = getQueryString(decodeApi, 'metrics').split(',')
            const excludeMetrics = ['CONI', 'CONO', 'RFCI', 'RFCO', 'FILI', 'FILO', 'RFRO', 'RFRI']
            
            if(!excludeMetrics.some(metric => metrics.includes(metric))){
                this.formData.metrics = metrics
                const temp = []
                this.formData.metrics.forEach((item) => {
                    this.allMetrics.forEach((item1) => {
                        if(item1.value.findIndex((findItem) => findItem.value === item) !== -1){
                            temp.push(item1.name)
                        }
                    })
                })
                this.metricsCategory = [...new Set(temp)]
                this.changeMetricsCategory('init')
            } else {
                this.metricsCategory = []
                this.formData.metrics = []
            }
            
            this.formData.topCount = getQueryString(decodeApi, 'topCount')
            this.formData.topMetric = getQueryString(decodeApi, 'topMetric')
            this.formData.type = getQueryString(decodeApi, 'type')
            
            this.allTopMetrics.forEach((item) => {
                if(item.value.findIndex((findItem) => findItem.value === this.formData.topMetric) !== -1){
                    this.topMetricCategory = item.name
                }
            })
            this.changeTopMetricCategory('init')
            
            this.formData.granularity = getQueryString(decodeApi, 'granularity')
            const num = Number(getQueryString(decodeApi, 'numGroups'))
            
            for(let i = 1; i <= num; i++){
                if(i > 1){
                    this.addObj('', i-2)
                }
                this.formData.objects[i-1].groupType = getQueryString(decodeApi, `groupType${i}`)
                this.changeObj({groupType: this.formData.objects[i-1].groupType}, i-1, 'apppend')
                this.formData.objects[i-1].groupArgument = getQueryString(decodeApi, `groupArgument${i}`)
            }
        },
        
        // 工具方法
        ajaxs(params){
            return new Promise((resolve, reject) => {
                this.ajax({params}).then(resolve, reject)
            })
        },
        
        localAjaxs(params){
            return new Promise((resolve, reject) => {
                this.localAjax({params}).then(resolve, reject)
            })
        },
        
        getport(name){
            for(let i = 0; i < this.$portInfo.portJSON.length; i++){
                if(this.$portInfo.portJSON[i].n === name){
                    return this.$portInfo.portJSON[i].p
                }
            }
        }
    }
}
</script>


