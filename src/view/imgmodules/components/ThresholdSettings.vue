<style>
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
    <div>
        <el-dialog title="阈值设置" :visible.sync="dialogFormVisible" :modal-append-to-body='false'>
            <el-row :gutter="20">
                <!-- <el-col :span="12"><div class="grid-content bg-purple">11</div></el-col> -->
                <el-col :span="4" :offset="9"><div class="grid-content">轻微</div></el-col>
                <el-col :span="4"><div class="grid-content">重大</div></el-col>
                <el-col :span="4"><div class="grid-content">紧急</div></el-col>
            </el-row>
            <el-row :gutter="20" v-for="(item,index) in thresholdArr" :key="index" style="margin-top:10px">
                <!-- <el-col :span="3" >
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
                </el-col> -->
                  <!-- :offset="index==0?3:0" -->
                <el-col :span="6">
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
                        <el-input v-model="item.Minor" placeholder=""  @input="()=>{return item.Minor=(item.Minor).replace(/[\u4E00-\u9FA5]|[A-Za-z]/g,'')}" ></el-input>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="grid-content bg-orange">
                        <el-input v-model="item.Major" placeholder="" @input="()=>{return item.Major=(item.Major).replace(/[\u4E00-\u9FA5]|[A-Za-z]/g,'')}" ></el-input>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="grid-content bg-red">
                        <el-input v-model="item.Critical" placeholder="" @input="()=>{return item.Critical=(item.Critical).replace(/[\u4E00-\u9FA5]|[A-Za-z]/g,'')}" ></el-input>
                    </div>
                </el-col>
            </el-row>
            <div>
                <span style="color:red">规则提示：</span><br>
              <span style="color:#0e0e0e">选择>或>=时，数值输入：</span>
              <span style="color:#8bcf05">轻微<重大<紧急</span><br>
              <span style="color:#0e0e0e">选择<或<=时，数值输入：</span>
              <span style="color:#8bcf05">轻微>重大>紧急</span>
            </div>
            <div class="add-btn">
                <el-button type="primary" size="mini" @click="add()" v-if="selectedMatrics.length>thresholdArr.length">添加</el-button>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cacle()">取 消</el-button>
                <el-button type="primary" @click="submit()">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import {getMetrics, getLocalUserMetrics, getLocalTopDataMetrics, getLocalTopSummaryDataMetrics,getLocalpestat_dataMetrics,getLocalsqueue_dataMetrics} from '@/apis/module.js'
import {getQueryString} from "@/lib/common.js"

export default {
    props:{
        api:{
            type:String,
            default:''
        },
        threshold:{
            type:null,
            default:''
        }

    },
    data(){
        return{
            dialogFormVisible:false,
            allMetrics:[],//所有指标
            selectedMatrics:[],//已有指标
            logicOption:[{value:'and',label:'与'},{value:'or',label:'或'}],//逻辑
            compareOption:[{value:'>',label:'>'},{value:'<',label:'<'},{value:'>=',label:'>='},{value:'<=',label:'<='}],//比较大小
            thresholdArr:[],
            groupType1:'',
        }
    },
    mounted(){

    },
    methods:{
        openModal(){
            console.log('threshold',this.threshold)
            console.log('api',this.api)
            this.thresholdArr=this.threshold
            this.dialogFormVisible=true
            this.getMetricsFun().then(res=>{
                this.selectedMatrics=[]
                if(this.api){
                    let metricsArr=(getQueryString(this.api,'metrics')).split(',')
                    console.log('metricsArr',metricsArr)
                    console.log('allMetrics',this.allMetrics)
                    metricsArr.forEach((item,index)=>{
                        this.allMetrics.forEach((item1,index1)=>{
                            item1.value.find((findItem)=>{
                                if(findItem.value===item){
                                    // 用户数据只有pcu_time可以设置阈值
                                    if(this.groupType1 === 'UserDB'){
                                        if(item==='cpu_time'){
                                            this.selectedMatrics.push(findItem)
                                        }
                                    }else{
                                        this.selectedMatrics.push(findItem)
                                    }
                                    
                                }
                            })
                        })
                    })
                }
                if(!this.thresholdArr){
                    this.thresholdArr=[]
                    this.selectedMatrics.forEach((item,index)=>{
                        if(index<=3){
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
                        }
                    })
                }else{
                    let tempArr=[]
                    this.selectedMatrics.forEach((item,index)=>{
                        let findItem=this.thresholdArr.find((findItem,findIndex)=>{
                            if(item.value==findItem.category){
                                return findItem
                            }
                        })
                        if(findItem){
                            tempArr.push(findItem)
                        }else{
                            tempArr.push({
                                key:(new Date()).valueOf(),
                                relation:'and',
                                category:item.value,
                                symbol:'>',
                                Minor:'',
                                Major:'',
                                Critical:'',
                                metrics:item.name
                            })
                        }
                    })
                    this.thresholdArr=tempArr
                }
            })

            
        },
        // 添加
        add(){
            this.thresholdArr.push({
                key:(new Date()).valueOf(),
                relation:'and',
                category:this.selectedMatrics[this.thresholdArr.length].value,
                symbol:'>',
                Minor:'',
                Major:'',
                Critical:'',
                metrics:this.selectedMatrics[this.thresholdArr.length].name,

            })
        },
        // 取消
        cacle(){
            this.dialogFormVisible=false
        },
        // 确定
        submit(){
            // let isRules=true
            // this.thresholdArr.forEach((item,index)=>{
            //     item.Minor!=''?item.Minor=parseFloat(item.Minor):item.Minor=''
            //     item.Major!=''?item.Major=parseFloat(item.Major):item.Major=''
            //     item.Critical!=''?item.Critical=parseFloat(item.Critical):item.Critical=''
            //     if(item.Minor&&item.Major&&item.Critical){
            //         if(item.Minor>item.Major||item.Minor>item.Critical||item.Major>item.Critical){
            //             isRules=false
            //         }
            //     }else if(item.Minor&&item.Major&&!item.Critical){
            //         if(item.Minor>item.Major){
            //             isRules=false
            //         }
            //     }else if(item.Minor&&!item.Major&&item.Critical){
            //         if(item.Minor>item.Critical){
            //             isRules=false
            //         }
            //     }else if(!item.Minor&&item.Major&&item.Critical){
            //         if(item.Major>item.Critical){
            //             isRules=false
            //         }
            //     }
            // })
            // if(!isRules){
            //     this.$message.error('数据不符合规则，请检查数据!')
            //     return;
            // }
            this.$emit('threshold',this.thresholdArr)
            this.dialogFormVisible=false
        },
        // 获取指标
        getMetricsFun(){
            return new Promise((resolve,reject)=>{
                this.groupType1=(getQueryString(this.api,'groupType1'))
                if(this.groupType1 === 'UserDB'){
                    //用户指标
                    getLocalUserMetrics().then(res=>{
                        this.allMetrics=res.data
                        resolve(res)
                    })
                }else if(this.groupType1 === 'topdata'){
                    //进程数据
                    getLocalTopDataMetrics().then(res=>{
                        this.allMetrics=res.data
                        resolve(res)
                    })
                    
                }else if(this.groupType1 === 'pestat_data'){
                    //节点数据
                    getLocalpestat_dataMetrics().then(res=>{
                        this.allMetrics=res.data
                        resolve(res)
                    })
                    
                }else if(this.groupType1 === 'squeue_data'){
                    //作业数据
                    getLocalsqueue_dataMetrics().then(res=>{
                        this.allMetrics=res.data
                        resolve(res)
                    })
                    
                }else if(this.groupType1 === 'topsummary'){
                    //服务器数据
                    getLocalTopSummaryDataMetrics().then(res=>{
                        this.allMetrics=res.data
                        resolve(res)
                    })
                    
                }else{
                    getMetrics().then(res=>{
                        this.allMetrics=res.data
                        resolve(res)
                    })
                }


                    
                
            }).catch(e=>{
                reject(e)
            })
        },
        // 
    }
}
</script>
