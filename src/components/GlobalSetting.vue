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
        <el-dialog title="全局设置" :visible.sync="dialogFormVisible"  :close-on-click-modal='false' :close-on-press-escape='false' @closed='resetForm' :modal-append-to-body='false'>
            <el-form :model="globalData"  ref="globalData"  label-width="120px">
                <el-form-item label="背景色">
                    <el-color-picker
                        v-model="globalData.bgColor"
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
    export default{
        props:{
            globalDataProps:{
                type:Object,
            }
        },
        data(){
            return{
                dialogFormVisible:false,
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
                globalData:{
                    bgColor:'rgba(255, 255, 255, 0)'
                },
                
            }
        },
        mounted(){

        },
        methods:{
            openModal(){
                this.globalData=this.globalDataProps
                this.dialogFormVisible=true
            },
            submitForm(){
                this.$emit('globalParams',this.globalData)
                this.dialogFormVisible=false
            },
            resetForm(){
                this.globalData={
                    bgColor:'rgba(255, 255, 255, 0)'
                }
                this.dialogFormVisible=false
            }
        }
    }
</script>

