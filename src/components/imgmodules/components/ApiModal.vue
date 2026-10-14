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
        <el-dialog title="编辑数据" :visible.sync="dialogFormVisible"  v-loading='formLoading' :close-on-click-modal='false' :close-on-press-escape='false' @closed='resetForm' :modal-append-to-body='false'>
            <el-form :model="formData" :rules="rulesFormData" ref="formData"  label-width="120px">
                <el-form-item label="数据源" prop="ip">
                    <el-select v-model="formData.ip" placeholder="请选择数据源">
                        <el-option v-for="(item,index) in ipOption" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <!-- <el-form-item label="数据类型" prop="type" >
                    <el-select v-model="formData.type" placeholder="请选择数据类型">
                        <el-option v-for="(item,index) in typeOption" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item> -->
                <el-form-item label-width="0px">
                    <div v-for="(obj, index) in formData.objects" :key="index" :style="{marginBottom:(formData.objects.length==(index+1))?'0px':'18px'}" style="display:flex;">
                        <div>
                            <el-form-item
                                :label="'对象'+(index+1)"
                                :prop="`objects.${index}.groupType`"
                                :rules='rulesFormData.groupType'
                            >
                                <el-select v-model="obj.groupType" @change='changeObj(obj,index)' placeholder="请选择对象" >
                                    <el-option v-for="(objItem,objIndex) in obj.groupTypeArr" :key="objIndex" :label="objItem.label" :value="objItem.key"></el-option>
                                </el-select>
                            </el-form-item>
                        </div>
                        <div  v-if="obj.hasArgument">
                            <el-form-item
                                :label="'参数'+(index+1)"
                                :prop="`objects.${index}.groupArgument`"
                                :rules='rulesFormData.groupArgument'
                            >
                                <el-select v-model="obj.groupArgument" placeholder="请选择参数" >
                                    <el-option v-for="(objItem,objIndex) in obj.groupArgumentArr" :key="objIndex" :label="objItem.label" :value="objItem.value"></el-option>
                                </el-select>
                                <el-input v-model="obj.groupArgument" placeholder="请输入参数" style="width:180px"></el-input>
                            </el-form-item>
                        </div>
                        <div style="margin-left:10px">
                            <i class="el-icon-remove-outline fontSize22 pointer"  @click.prevent="removeObj(obj,index)" v-if="index===formData.objects.length-1&&formData.objects.length>1"></i>
                            <i class="el-icon-circle-plus-outline fontSize22 pointer c0073ff"  @click="addObj(obj,index)" v-if="index===formData.objects.length-1&&storageData.length>0"></i>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="指标" prop="metrics">
                    <el-select v-model="metricsCategory" multiple :multiple-limit="(imgtype=='hengxiangzhuzhuangtu'||imgtype=='zongxiangzhuzhuangtu'||imgtype=='jinduhuantu'||imgtype=='yibiaopan'||imgtype=='meiguitu'||imgtype=='bingtu'||imgtype=='shixinbingtu'||imgtype=='shuzitu')?1:0" @change="changeMetricsCategory" placeholder="请选择指标分类">
                        <el-option
                            v-for="(item,index) in metricsOption1"
                            :key="index"
                            :label="item.name"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-select v-model="formData.metrics" multiple :multiple-limit="(imgtype=='hengxiangzhuzhuangtu'||imgtype=='zongxiangzhuzhuangtu'||imgtype=='jinduhuantu'||imgtype=='yibiaopan'||imgtype=='meiguitu'||imgtype=='bingtu'||imgtype=='shixinbingtu'||imgtype=='shuzitu')?1:0" collapse-tags placeholder="请选择指标">
                        <!-- <el-option
                            v-for="(item,index) in metricsOption2"
                            :key="index"
                            :label="item.name"
                            :value="item.value">
                        </el-option> -->
                        <el-option-group
                            v-for="(group,index) in metricsOption2"
                            :key="index"
                            :label="group.name">
                            <el-option
                                v-for="(item,index) in group.value"
                                :key="index"
                                :label="item.name"
                                :value="item.value">
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>
                <el-form-item label="数量"  prop="topCount" v-if="formData.type==='topValues'">
                    <el-input v-model="formData.topCount" type="number" min="0" max="1000" style="width:217px"></el-input>
                </el-form-item>
                <el-form-item label="排序指标" prop="topMetric" v-if="formData.type==='topValues'">
                    <el-select v-model="topMetricCategory" @change="changeTopMetricCategory" placeholder="请选择排序指标分类">
                        <el-option
                            v-for="(item,index) in topMetricsOption1"
                            :key="index"
                            :label="item.name"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-select v-model="formData.topMetric" placeholder="请选择排序指标">
                        <el-option
                            v-for="(item,index) in topMetricsOption2"
                            :key="index"
                            :label="item.name"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="更新时间"  v-if="$route.name==='networkEditor'">
                    <el-input placeholder="请输入更新时间" v-model="updateTime" style="width:217px">
                        <template slot="append">秒</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="时间粒度" prop="granularity" v-if="formData.type==='timeValues'">
                    <!-- <el-input v-model="formData.granularity" type="number" min="0" max="1000" style="width:217px"></el-input> -->
                    <el-select v-model="formData.granularity" placeholder="请选择时间粒度" >
                        <el-option v-for="(objItem,objIndex) in granularityArr" :key="objIndex" :label="objItem.label" :value="objItem.value"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <!-- 设置 -->
            <div v-if="$route.name==='networkEditor'">
                <el-collapse accordion v-model="activeItem">
                    <el-collapse-item name="1">
                        <template slot="title">
                            阈值设置<i class="header-icon el-icon-info"></i>
                        </template>
                        <el-row :gutter="20">
                            <!-- <el-col :span="12"><div class="grid-content bg-purple">11</div></el-col> -->
                            <el-col :span="4" :offset="12"><div class="grid-content">轻微</div></el-col>
                            <el-col :span="4"><div class="grid-content">重大</div></el-col>
                            <el-col :span="4"><div class="grid-content">紧急</div></el-col>
                        </el-row>
                        <el-row :gutter="20" v-for="(item,index) in thresholdArr" :key="index" style="margin-top:10px">
                            <el-col :span="3" >
                                <div class="grid-content">
                                    <el-select v-model="item.relation" placeholder="请选择" v-if="index!=0">
                                        <el-option
                                        v-for="item in logicOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">

                                        </el-option>
                                    </el-select>
                                </div>
                            </el-col>
                            <el-col :span="6"  :offset="index==0?3:0">
                                <div class="grid-content">
                                    <el-select v-model="item.category" placeholder="请选择" disabled>
                                        <el-option
                                        v-for="item in selectedMatrics"
                                        :key="item.value"
                                        :label="item.name"
                                        :value="item.value">
                                        </el-option>
                                    </el-select>
                                </div>
                            </el-col>
                            <el-col :span="3">
                                <div class="grid-content">
                                    <el-select v-model="item.symbol" placeholder="请选择">
                                        <el-option
                                        v-for="item in compareOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                        </el-option>
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
                <el-collapse accordion v-model="activeItem">
                    <el-collapse-item name="2">
                        <template slot="title">
                            样式设置<i class="header-icon el-icon-info"></i>
                        </template>
                        <el-form :model="styleData"  ref="styleData"  label-width="120px">
                            <el-form-item label="背景色">
                                <el-color-picker
                                    v-model="styleData.bgColor"
                                    show-alpha
                                    :predefine="predefineColors">
                                </el-color-picker>
                            </el-form-item>
                            <el-form-item label="边框色">
                                <el-color-picker
                                    v-model="styleData.borderColor"
                                    show-alpha
                                    :predefine="predefineColors">
                                </el-color-picker>
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
import {getObjects,getMetrics,getTopMetrics,getIps} from '@/apis/module.js'
import {getQueryString,descCompare} from "@/lib/common.js"
import { mapActions } from 'vuex'
export default {
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
        }
    },
    data(){
        const checkGroupType=(rule,value,callback)=>{
            let groupArgument=this.formData.groupArgument
            if(value&&groupArgument){
                callback
            }else{
                if(!value){
                    callback(new Error('请选择对象'))
                }
                if(!groupArgument){
                    callback(new Error('请输入参数'))
                }
            }
        }
        return{
            // 移除硬编码时间，使用动态时间
            start: this.getDefaultStartTime(),
            end: this.getDefaultEndTime(),
            dialogFormVisible:false,
            ruleValidate:[],
            // 对象
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
                topCount:'10',//topValue
                topMetric:'TPIO',//topValue
                granularity:'0',//timeValues
            },
            updateTime:undefined,
            ipOption:[],
            typeOption:[{value:'topValues',label:'排序'},{value:'averageValues',label:'指定'},{value:'timeValues',label:'时序'}],
            granularityArr:[{value:'0',label:'自动识别'},{value:'60',label:'1分钟'},{value:'300',label:'5分钟'},{value:'3600',label:'1小时'},{value:'86400',label:'1天'}],
            allObjArr:[],//所有对象
            storageData:[],//暂存数组
            metricsOption1:[],//指标选项一级分类
            metricsOption2:[],//指标选项二级
            topMetricsOption1:[],//排序指标一级分类
            topMetricsOption2:[],//排序指标二级
            metricsCategory:[],
            topMetricCategory:'',
            ajaxUrl:'',
            definedGranularity:60,
            rulesFormData:{
                ip:[
                    { required: true, message: '请选择数据源', trigger: 'change' }
                ],
                type:[
                    { required: true, message: '请选择数据类型', trigger: 'change' }
                ],
                groupType:[
                    { required: true, message: '请选择数据类型' ,  trigger: 'change' }
                ],
                groupArgument:[
                    { required: true, message: '请选择数据参数' ,  trigger: 'change' }
                ],
                metrics:[
                    { required: true, message: '请选择指标', trigger: 'change' }
                ],
                topCount:[
                    { required: true, message: '请选择数量', trigger: 'blur' }
                ],
                topMetric:[
                    { required: true, message: '请选择排序指标', trigger: 'change' }
                ],
                granularity:[
                    { required: true, message: '请选择时间粒度', trigger: 'blur' }
                ],
            },
            logicOption:[{value:'and',label:'与'},{value:'or',label:'或'}],//逻辑
            compareOption:[{value:'>',label:'>'},{value:'<',label:'<'},{value:'>=',label:'>='},{value:'<=',label:'<='}],//比较大小
            thresholdArr:[],
            activeItem:'',
            formLoading:false,
            // 样式设置
            predefineColors: [
                '#ff4500',
                '#ff8c00',
                '#ffd700',
                '#90ee90',
                '#00ced1',
                '#1e90ff',
                '#c71585',
                'rgba(255, 69, 0, 0.68)',
                'rgb(255, 120, 0)',
                'hsv(51, 100, 98)',
                'hsva(120, 40, 94, 0.5)',
                'hsl(181, 100%, 37%)',
                'hsla(209, 100%, 56%, 0.73)',
                '#c7158577'
            ],
            styleData:{
                bgColor:"rgba(255, 69, 0, 0)",
                borderColor:"rgba(255, 69, 0, 0)"
            },
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
            // 针对业务图和网络图
            if(this.$route.name==='networkEditor'){
                this.getSelected()
            }
        }
    },
    methods:{
        ...mapActions([
            'ajax'
        ]),
        // 重新获取父页面的时间
        getNewDate(){
            console.log('重新获取时间')
            this.start=parent.startTimeUnix
            this.end=parent.endTimeUnix
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
            // 优先级：父组件时间 > 默认时间
            if(window.parent && window.parent.startTimeUnix && window.parent.endTimeUnix){
                this.start = window.parent.startTimeUnix
                this.end = window.parent.endTimeUnix
            } else {
                // 使用默认时间（最近1小时）
                this.start = this.getDefaultStartTime()
                this.end = this.getDefaultEndTime()
            }
        },
        // 获取数据源
        getIpsFun(){
            return new Promise((resolve,reject)=>{
                getIps().then(res=>{
                    let arr=[]
                    res.data.length>0&&res.data.forEach((item,index)=>{
                        arr.push({label:item.ip+' | '+item.alias,value:item.ip})
                    })
                    this.ipOption=arr
                    resolve(res)
                })
            }).catch(e=>{
                reject(2)
            })

        },
        openApi(){
            Promise.all([this.getObj(),this.getMetricsFun(),this.getTopMetricsFun(),this.getIpsFun()]).then(res=>{
                if(this.api){
                    this.showItemData()
                }
                if(this.$route.name==='networkEditor'){
                    this.getSelected()
                    this.updateTime=this.updateTimeProps
                    console.log('styleDataProps',this.styleDataProps)
                    if(this.styleDataProps){
                        this.styleData=this.styleDataProps
                    }
                }
            })
            this.formData.type=this.type
            this.dialogFormVisible=true
            // this.formLoading=true
        },
        // 获取已选指标显示阈值设置列表
        getSelected(){
            this.selectedMatrics=[]
                this.formData.metrics.forEach((item,index)=>{
                    this.allMetrics.forEach((item1,index1)=>{
                        item1.value.find((findItem)=>{
                            if(findItem.value===item){
                                this.selectedMatrics.push(findItem)
                            }
                        })
                    })
                })
                this.thresholdArr=[]
                this.selectedMatrics.forEach((item,index)=>{
                    // if(index<=3){
                        this.thresholdArr.push({
                            key:(new Date()).valueOf(),
                            relation:'and',
                            category:item.value,
                            symbol:'>',
                            Minor:'',
                            Major:'',
                            Critical:'',
                            metrics:item.name
                        })
                    // }
                })
            if(this.api){
                this.threshold.forEach((item,index)=>{
                    this.thresholdArr.forEach((item1,index1)=>{
                        if(item1.category===item.category){
                            item1.Minor=item.Minor
                            item1.Major=item.Major
                            item1.Critical=item.Critical
                        }
                    })
                })
            }
        },
        // this.formData= {
        //         objects: [{
        //             groupType:'',
        //             groupArgument: '',
        //             groupTypeArr:[],
        //             groupArgumentArr:[],
        //             key: Date.now()
        //         }],
        //         ip:'',
        //         type:'',
        //         metrics:['TPIO'],
        //         topCount:'10',//topValue
        //         topMetric:'TPIO',//topValue
        //         granularity:'0',//timeValues
        //     }
        // 数据回显
        // https://192.168.1.203/webservice/NetInside?type=topValues&numGroups=3&groupType1=DefinedApp&groupArgument1=HTTPS&groupType2=IPConversations&groupType3=IPConversation&metrics=PKZI,PKZO,TPIO,TPI&start=1649227080&end=1649230680&topMetric=PKIO&topCount=12&json=true&{}
        showItemData(){
            this.metricsOption2=[]
            this.topMetricsOption2=[]
            // substring 不包含开始  包含结束
            this.formData.ip=this.api.substring(8,this.api.indexOf('/webservice'))
            this.formData.metrics=(getQueryString(this.api,'metrics')).split(',')
            // 获取指标对应得分类和指标
            let temp=[]
            this.formData.metrics.forEach((item,index)=>{
                this.allMetrics.forEach((item1,index1)=>{
                    if(item1.value.findIndex((findItem)=>{return findItem.value===item})!==-1){
                        temp.push(item1.name)
                    }
                })
            })
            this.metricsCategory=[...new Set(temp)]
            this.changeMetricsCategory('init')
            this.formData.topCount=getQueryString(this.api,'topCount')
            this.formData.topMetric=getQueryString(this.api,'topMetric')
            this.formData.type=getQueryString(this.api,'type')
            // 排序指标
            this.allTopMetrics.forEach((item,index)=>{
                if(item.value.findIndex((findItem)=>{return findItem.value===this.formData.topMetric})!==-1){
                    this.topMetricCategory=item.name
                }
            })
            this.changeTopMetricCategory('init')
            this.formData.granularity=getQueryString(this.api,'granularity')
            // objects: [{
            //         groupType:'',
            //         groupArgument: '',
            //         groupTypeArr:[],
            //         groupArgumentArr:[],
            //         key: Date.now()
            //     }],
            // this.formData.objects[0].groupType=getQueryString(this.api,'groupType1')
            let num=Number(getQueryString(this.api,'numGroups'))
            for(var i=1;i<=num;i++){
                if(i>1){
                    this.addObj('',i-2)
                }
                this.formData.objects[i-1].groupType=getQueryString(this.api,'groupType'+i)
                this.changeObj(this.formData.objects[i-1].groupTypeArr,i-1,'apppend')
                this.formData.objects[i-1].groupArgument=getQueryString(this.api,'groupArgument'+i)

            }
        },
        // 获取对象
        getObj(){
            this.formData.objects[0].groupTypeArr=[]
            return new Promise((resolve,reject)=>{
                getObjects().then(res=>{
                    this.allObjArr=res.data
                    this.allObjArr.forEach((item)=>{
                        if(item.key==="Prefix24"){
                            item.label='网段'
                        }if(item.key==="BusinessGroup"){
                            item.label='工作组'
                        }if(item.key==="VLAN"){
                            item.label='VLAN'
                        }if(item.key==="WebApplication"){
                            item.label='业务'
                        }if(item.key==="MonInterfaceGroup"){
                            item.label='监控口'
                        }
                        if(item.key!=="ISPAS"&&item.key!="DestAS"&&item.key!="BusinessGroupLink"&&item.key!="Interface"&&item.key!="User"){
                            this.formData.objects[0].groupTypeArr.push(item)
                        }
                    })
                    resolve(res)
                })
            }).catch(e=>{
                reject(2)
            })
        },
        // 改变对象
        changeObj(obj,index,type){
            console.log('改变对象')
            if(!type){
                if(obj.groupType==="WebApplication"||obj.groupType==="PageFamily"||obj.groupType==="User"){
                    this.metricsCategory=['业务访问']
                    this.topMetricCategory='业务访问'
                    this.changeTopMetricCategory()
                    this.changeMetricsCategory()
                    this.formData.metrics=['PGNPGE']
                    this.formData.topMetric='PGNPGE'
                }else{
                    this.metricsCategory=['网络流量']
                    this.topMetricCategory='网络流量'
                    this.changeTopMetricCategory()
                    this.changeMetricsCategory()
                    this.formData.metrics=['TPIO']
                    this.formData.topMetric='TPIO'
                }
            }
            // 暂存数组
            this.storageData=[]
            // 参数清空
            this.formData.objects[index].groupArgument=''
            // 改变选中对象清空后面得选中
            // this.formData.objects.splice(index+1)
            // for(var i=index+1;i<this.formData.objects.length;i++){
            //     this.formData.objects[i].groupType=''
            //     this.formData.objects[i].groupArgument=''
            // }
            if(!type){
                this.formData.objects.splice(index+1,this.formData.objects.length-(index+1))
                console.log('this.formData.objects',this.formData.objects)
            }
            // 获取选中得下级集合
            this.formData.objects[index].groupTypeArr.forEach(item=>{
                if(item.key===this.formData.objects[index].groupType){
                    this.formData.objects[index].existArgument=item.hasArgument
                    this.storageData=item.children
                    // this.formData.objects[index+1]&&
                    if(this.formData.type==='topValues'){
                        // this.formData.objects[index].hasArgument=item.hasArgument
                        this.formData.objects[index].hasArgument=undefined
                    }else if(this.formData.type==='averageValues'||this.formData.type==='timeValues'){
                        this.formData.objects[index].hasArgument=item.hasArgument
                    }
                }
            })
            if(this.formData.objects[index+1]){
                this.formData.objects[index+1].groupTypeArr=this.storageData
            }
            if(!this.formData.objects[index].existArgument&&this.formData.objects.length-1===index&&this.formData.objects[index].groupType!=="TotalTraffic"&&type!='apppend'){
                this.addObj(obj,index)
            }
            // 获取参数可选项
            // if(this.formData.objects[index].hasArgument){
                this.getObjParams(obj,index)
            // }
        },
        // 新增对象
        addObj(item,index) {
            this.formData.objects.push({
                groupArgument: '',
                groupType:'',
                groupTypeArr:[],
                groupArgumentArr:[],
                key: Date.now()
            });
            if(this.formData.type==='topValues'){
                this.formData.objects[index].groupTypeArr.forEach(item=>{
                    if(item.key===this.formData.objects[index].groupType){
                        if(this.formData.objects[index].hasArgument===undefined){
                            this.formData.objects[index].hasArgument=item.hasArgument
                        }
                    }
                })
            }
            this.formData.objects[index+1].groupTypeArr=this.storageData

        },
        // 获取对象参数
        getObjParams(obj,index){
            let groups='',maxIndex=''
            this.formData.objects.forEach((item,index)=>{
                groups+=(item.groupType?('&groupType'+(index+1)+'='+item.groupType):'')+((item.groupArgument&&item.hasArgument)?('&groupArgument'+(index+1)+'='+item.groupArgument):'')
                if(item.groupType){
                    maxIndex=index
                }
            })
            let url=''
            if(obj.groupType==="WebApplication"||obj.groupType==="PageFamily"||obj.groupType==="User"){
                url =`https://${this.formData.ip}/webservice/NetInside?type=topValues&numGroups=${maxIndex+1}${groups}&metrics=PGNPGE&start=${this.start}&end=${this.end}&topMetric=PGNPGE&topCount=10&json=true&{}`
            }else{
                url =`https://${this.formData.ip}/webservice/NetInside?type=topValues&numGroups=${maxIndex+1}${groups}&metrics=TPIO&start=${this.start}&end=${this.end}&topMetric=TPIO&topCount=10&json=true&{}`
            }
            var param ={
                url:encodeURI(url)
            }
            let tempArr=[]
            this.ajaxs(param).then(res=>{
                if(res.length>0){
                    res.forEach((item1,index1)=>{
                        if(item1.group.argument){
                            tempArr.push({value:item1.group.argument,label:item1.group.argument,metricValue:item1.metricValues[0].value})
                        }
                    })
                    tempArr.sort(descCompare("metricValue"))
                    if(this.formData.objects[index]){
                        this.formData.objects[index].groupArgumentArr=tempArr
                    }
                }

            })
        },
        ajaxs(params){
            return new Promise((resolve, reject) => {
            this.ajax({params}).then(function(res){
                resolve(res)
            },function(err){
                reject(err)
            })
            })
        },

        // 删除对象
        removeObj(item,index) {
            var findIndex = this.formData.objects.indexOf(item)
            if (findIndex !== -1) {
                this.formData.objects.splice(findIndex, 1)
            }
            if(this.formData.type==='topValues'){
                this.formData.objects[index-1].groupTypeArr.forEach(item=>{
                    if(item.key===this.formData.objects[index-1].groupType){
                        this.storageData=item.children
                        if(this.formData.objects[index-1].hasArgument===true){
                            this.formData.objects[index-1].hasArgument=undefined
                        }
                    }
                })
            }else{
                this.formData.objects[index-1].groupTypeArr.forEach(item=>{
                    if(item.key===this.formData.objects[index-1].groupType){
                        this.storageData=item.children
                    }
                })
            }

        },
        // 获取指标
        getMetricsFun(){
            this.metricsOption1=[]
            return new Promise((resolve,reject)=>{
                getMetrics().then(res=>{
                    this.allMetrics=res.data
                    this.allMetrics.forEach((item,index)=>{
                        this.metricsOption1.push({value:item.name,name:item.name})
                    })
                    this.metricsCategory=['网络流量']
                    this.changeMetricsCategory('init')
                    resolve(res)
                })
            }).catch(e=>{
                reject(e)
            })
        },
        // 改变指标分类
        changeMetricsCategory(type){
            if(type!=='init'){
                this.formData.metrics=[]
                this.metricsOption2=[]

            }
            this.allMetrics.forEach((item,index)=>{
                this.metricsCategory.forEach((item1,index1)=>{
                    if(item1===item.name){
                        this.metricsOption2.push(item)
                    }
                })
            })
        },
        //获取指标排序选项
        getTopMetricsFun(){
            this.topMetricsOption1=[]
            return new Promise((resolve,reject)=>{
                getTopMetrics().then(res=>{
                    this.allTopMetrics=res.data
                    this.allTopMetrics.forEach((item,index)=>{
                        this.topMetricsOption1.push({value:item.name,name:item.name})
                    })
                    this.topMetricCategory='网络流量'
                    this.changeTopMetricCategory('init')
                    resolve(res)
                })
            }).catch(e=>{
                reject(e)
            })
        },
        // 改变指标排序分类
        changeTopMetricCategory(type){
            if(type!=='init'){
                this.formData.topMetric=''
                this.topMetricsOption2=[]
            }
            this.allTopMetrics.forEach((item,index)=>{
                if(this.topMetricCategory==item.name){
                    item.value.forEach((item1,index1)=>{
                        this.topMetricsOption2.push({value:item1.value,name:item1.name})
                    })

                }

            })
        },
        // 点击确定生成拼接成url
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
            if (valid) {
                let groups='',maxIndex=''
                this.formData.objects.forEach((item,index)=>{
                    groups+=(item.groupType?('&groupType'+(index+1)+'='+item.groupType):'')+((item.groupArgument&&item.hasArgument)?('&groupArgument'+(index+1)+'='+item.groupArgument):'')
                    if(item.groupType){
                        maxIndex=index
                    }
                })
                if(this.formData.type==='topValues'){
                    this.ajaxUrl=`https://${this.formData.ip}/webservice/NetInside?type=${this.formData.type}&numGroups=${maxIndex+1}${groups}&metrics=${(this.formData.metrics).toString()}&start=${this.start}&end=${this.end}&topMetric=${this.formData.topMetric}&topCount=${this.formData.topCount}&json=true&{}`
                }else if(this.formData.type==='timeValues'){
                    if(this.formData.granularity==0){
                        this.formData.granularity=this.definedGranularity
                    }
                    this.ajaxUrl=`https://${this.formData.ip}/webservice/NetInside?type=${this.formData.type}&numGroups=${maxIndex+1}${groups}&metrics=${(this.formData.metrics).toString()}&start=${this.start}&end=${this.end}&granularity=${this.formData.granularity}&json=true&{}`
                }else{
                    this.ajaxUrl=`https://${this.formData.ip}/webservice/NetInside?type=${this.formData.type}&numGroups=${maxIndex+1}${groups}&metrics=${(this.formData.metrics).toString()}&start=${this.start}&end=${this.end}&json=true&{}`
                }
                console.log('ajaxUrl',this.ajaxUrl)
                // this.$emit('postParams',this.ajaxUrl)
                this.dialogFormVisible=false
                this.$refs[formName].resetFields();
                // 业务图网络图
                this.ajaxUrl=encodeURI(this.ajaxUrl)
                if(this.$route.name==='networkEditor'){
                    this.$emit('postParams',this.ajaxUrl,this.thresholdArr,this.updateTime,this.styleData)
                }else{
                     this.$emit('postParams',this.ajaxUrl)
                }

            } else {
                console.log('error submit!!');
                return false;
            }
            });
        },
        resetForm() {
            this.$refs.formData.resetFields();
            this.formData= {
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
                topCount:'10',//topValue
                topMetric:'TPIO',//topValue
                granularity:'0',//timeValues
            }
            this.metricsOption2=[]
            this.metricsCategory=['网络流量']
            this.topMetricCategory='网络流量'
            this.dialogFormVisible=false
        }


    }
}
</script>

