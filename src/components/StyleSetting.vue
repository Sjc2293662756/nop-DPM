<template>
    <div>
        <el-dialog title="设置" :visible.sync="dialogFormVisible"  :close-on-click-modal='false' :close-on-press-escape='false' @closed='resetForm' :modal-append-to-body='false'>
            <el-form :model="tableStyleData"  ref="tableStyleData"  label-width="120px">
                <el-form-item label="字体大小" v-if="category!='areaBlock'">
                    <el-input 
                        type="number"
                        v-model="tableStyleData.titleFontSize"
                        style="width:200px"
                    ></el-input>
                </el-form-item>
                <el-form-item label="字体颜色" v-if="category!='areaBlock'">
                    <el-color-picker
                        v-model="tableStyleData.titleFontColor"
                        show-alpha
                        :predefine="predefineColors">
                    </el-color-picker>
                </el-form-item>
                <el-form-item label="表格字体大小" v-if="category!='areaBlock'&&category!='textBlock'">
                    <el-input 
                        type="number"
                        v-model="tableStyleData.tableFontSize"
                        style="width:200px"
                    ></el-input>
                </el-form-item>
                <el-form-item label="背景色">
                    <el-color-picker
                        v-model="tableStyleData.bgColor"
                        show-alpha
                        :predefine="predefineColors">
                    </el-color-picker>
                </el-form-item>
                <el-form-item label="边框色" v-if="category!='areaBlock'&&borderColor">
                    <el-color-picker
                        v-model="tableStyleData.borderColor"
                        show-alpha
                        :predefine="predefineColors">
                    </el-color-picker>
                </el-form-item>
                
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetForm()">取 消</el-button>
                <el-button type="primary" @click="submitForm('formData')">确 定</el-button>
            </div>
        </el-dialog>
        
    </div>
</template>
<script>
export default {
    props:{
        tableStyleDataProps:{
            type:Object,
        },
        category:{
            type:String,
            default:undefined
        },
        borderColor:{
            type:Boolean,
            default:undefined
        },
    },
    data(){
        return{
            dialogFormVisible:false,
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
            tableStyleData:{
                bgColor:"#ffffff",
                borderColor:"#333333",
                titleFontSize:'14',
                tableFontSize:'14',
                titleFontColor:'#333333'
            },
        }
    },
    created(){
        

    },
    mounted(){
    },
    methods:{
        openModal(){
            this.dialogFormVisible=true
            if(this.tableStyleDataProps){
                this.tableStyleData=this.tableStyleDataProps
            }
        },
        // 关闭弹窗
        resetForm(){
            this.dialogFormVisible=false
            this.tableStyleData={
                bgColor:"#ffffff",
                borderColor:"#333333",
                titleFontSize:'14',
                tableFontSize:'14',
                titleFontColor:"#333333"
            }
        },
        // 保存设置
        submitForm(){
            this.$emit('postStyle',this.tableStyleData)
            this.dialogFormVisible=false
            // this.$refs[formName].resetFields();
        }
    }
}
</script>

