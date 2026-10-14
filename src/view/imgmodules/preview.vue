<template>
  <div class="datamax">
    <!-- <div class="header">
      <div class="header-right">
        <div class="datamax-save" v-on:click="savePage">
             <img src="../../assets/imgs/save.png">
             <span>图片</span>
        </div>
      </div>
    </div> -->
    <!-- header_end -->
    <div class="view-container">  
      <!-- modules-key-end -->
      <div id="view-profile" :style="modules.imgstyleright"  @scroll.passive="getScroll($event)">
        <div id="view-imgs" ref="view-imgs" :style="modules.imgstyle">
          <div id="imgmodules">
            <div class="imgmoduleitem"  v-for="item in imgmodules" :id="item.id" :style="item.style">
              <div v-if="item.type=='tupian'">
                 <img :src="item.config.imgsrc" :class="item.style.animation?'animation':''" :style="{'height':(parseFloat(item.style.height.replace('px',''))-2)+'px','width':(parseFloat(item.style.width.replace('px',''))-2)+'px'}">
              </div>
              <div class="im-dhwb" v-if="item.type=='danhangwenben'" style="display:flex;align-items:center;justify-content:center;">
                <!-- <div :style="item.config.widgets.style">{{item.name}}</div> -->
                <input type="text" readonly v-model="item.name" style="background:transparent;border:none;color:#fff;width:100%;height:100%;padding-left: 10px;padding-right: 10px;outline:none" :style="item.config.widgets.style">
              </div><!-- im-dhwb_end -->
              <div class="im-bg" v-if="item.type == 'biaoge'">
  <div class="im-bg-container">
    <div class="im-bg-header table-style">
      <database-runtime-table :ref="'runtime-' + item.id" v-if="isDpmRuntimeTable(item)" :item="item" :start="start" :end="end" />
<el-table v-else
  border
  :data="item.config.widgets.y"
  style="width: 100%"
  :height="item.style.height"
  :default-sort="{ prop: 'key1', order: 'descending' }"
  :header-cell-style="headerCellStyle(item)"
  :cell-style="bodyCellStyleObj(item)"
  :header-cell-class-name="'th-force-bg'"
  :style="tableInlineStyle(item)"
  :header-row-style="headerRowStyle(item)"

  @row-contextmenu="tableRightClick"
>
  <af-table-column
    v-for="(itemheader,index) in item.config.widgets.x"
    :key="index"
    :prop="'key'+index"
    :label="itemheader.key"
    :column-key="'key'+index"
    sortable
    :sort-methods="sortByDynamicKey"
    :width="item.config.width[index]"
    :header-align="(item.config && item.config.widgets && item.config.widgets.headerStyle && item.config.widgets.headerStyle.align) || 'left'"
    :align="(item.config && item.config.widgets && item.config.widgets.headerStyle && item.config.widgets.headerStyle.align) || 'left'"
  />
</el-table>


    </div>
  </div>
</div>
<!-- im-bg_end -->
              <div class="im-szt" v-if="item.type=='shuzitu'">
                 <div class="im-szt-container" :style="item.config.widgets.style">
                   <div class="im-szt-num" :id='item.id' :style="item.config.widgets.numBackStyle" style="cursor:pointer" @contextmenu.prevent="numRightClick(item)" >
                      <animate-number
                      v-if="String(item.config.widgets.text).indexOf('.')!=-1"
                      mode="auto"
                      from="0" 
                      :to="parseFloat(item.config.widgets.text)"
                      :key="parseFloat(item.config.widgets.text)"
                      :ref="item.id"
                      duration="1000" 
                      easing="easeOutQuad"
                      :formatter="formatter1" 
                      ></animate-number>
                      <animate-number
                      v-if="String(item.config.widgets.text).indexOf('.')==-1"
                      mode="auto"
                      from="0" 
                      :to="parseFloat(item.config.widgets.text)"
                      :key="parseFloat(item.config.widgets.text)"
                      :ref="item.id"
                      duration="1000" 
                      easing="easeOutQuad"
                      :formatter="formatter2" 
                      ></animate-number>
                      {{item.config.widgets.unit}}
                   </div>
                   
                 </div>
              </div>
              <!-- im-szt_end -->
              <!-- 对象是日期时间 -->
              <div class="im-dhwb" v-if="item.type=='riqishijian'">
                <span :style="item.config.widgets.dateStyle.style">{{filterDate('date',item.config.widgets.dateStyle.fontFormat)}}</span>
                <span :style="item.config.widgets.timeStyle.style">{{filterDate('time',item.config.widgets.timeStyle.fontFormat)}}</span>
                <span :style="item.config.widgets.dayStyle.style">{{filterDate('day',item.config.widgets.dayStyle.fontFormat)}}</span>
              </div>
            </div>
          </div>
          <!-- imgmodules_end -->
        </div>
        <!-- view-imgs_end -->
        <!-- 鼠标右键弹出框 -->
        <div id="view-menu" :style="defaultsettings.menustyle">
          <ul style="border:1px solid #eee">
            <li v-on:click.stop="analyze"><i class="el-icon-arrow-right"></i>钻取分析</li>
          </ul>
        </div>
      </div>
      <!-- view-profile_end -->
    </div>
    <!-- view-container_end -->
  </div>
</template>
<script>
import DatabaseRuntimeTable from '@/components/DatabaseRuntimeTable.vue';
import { isDpmRuntimeTable, refreshDpmRuntimeTable } from '@/dataSources/dpm/runtime';

import { dpmChartData, canEvaluateThreshold } from "@/dataSources/dpm/normalize";
import { setDpmScalar, prepareDpmWidgetResult, showDpmWidgetError, refreshDpmVerticalBar, resetDpmVerticalBar } from "@/dataSources/dpm/charts";
import { isDpmUrl } from "@/dataSources/dpm/query";


// 放在 <script> 顶部（import 之后 export default 之前，或文件最上方）
const DEFAULT_TABLE_HEADER_STYLE = {
  height: 44,
  background: '#0F1C29',
  border: { color: '#243041', width: 1 },
  text: { size: 14, color: '#A6B2C0', weight: 600 },
  align: 'left',
  paddingX: 12
};


  var echarts = require('echarts');
  // 引入柱状图
  require('echarts/lib/chart/bar');
  // 引入提示框和标题组件
  require('echarts/lib/component/tooltip');
  require('echarts/lib/component/title');

  var editors =  require('vue2-ace-editor');
  import 'echarts/map/js/china'
  import { Sketch } from 'vue-color'
  import { mapActions } from 'vuex'
  import moduledata from '@/store/module/moduledata'
  import moduledefault from '@/store/module/moduledefault'
  import CountUp from 'vue-countup-v2';
  import $ from "jquery"
  // 截图上传已经修改了toPng的源码，加入了scale的判断
  import domtoimage from 'dom-to-image';
  import
  {changeURLArg,ascCompare,descCompare,replace_disp_str,replace_disp_str2,replace_unit,replace_unit2,num_to_fixed,getQueryString,getDashboardRange} from "@/lib/common.js"
  
  // 放在 import 之后、export default 之前
var DBG = true;
function dlog() { if (DBG && window && window.console) console.log.apply(console, arguments); }


  export default {
    name: 'preview',
    components: { DatabaseRuntimeTable,
      editor: editors,
      'photoshop-picker': Sketch,
      CountUp
    },
    data () {
      return {
        baseURL:"https://" + window.location.host,
        moduledata:moduledata,
        colors:"#fff",
        msg: '',
        imgtype:"",
        message:{
          style:{
            display:"none"
          }
        },
        currentmodule:{
          datatypeset:{ //数据样式保存当前点击的哪个颜色块
            index:"",
            indexcolor:"",
            num:""
          },
          content:"",//编辑器数据内容
          type:"",//组件类型
          apitype:{
            display:"none" //api下拉框是否展开
          },
          config:{
            imgsrc:"",
            chart:false, //是否是百度地图组件
            img:true,//是否是图片组件
            datas:false,//是否需要数据支撑
            datastype:"default",//获取数据类型 default和api两种
            autodata:"关闭",
            autodatatime:"10",
            apitypeselect:"POST",//默认显示post
            api:"",
            widgets:{},
            defaultdata:""
          },
          editorconfig:{ //编辑器配置
            theme:"monokai",
            lang:"json",
            enableEmmet:true
          },
          id:"",
          name:"",
          width:"",
          height:"",
          left:"",
          top:"",
          zindex:""
        },
        // 大屏设置
        defaultsettings:{
          style:{
            width:"",
            height:"",
            display:"none"
          },
          // 菜单样式
          menustyle:{
            left:"10px",
            top:"10px",
            display:"none"
          },
          title:"测试模板",
          viewconfigstyle:{
            display:"none"
          },
          filename:"",
          src:"",//背景图
          headimg:"",//缩略图
          resizetype:1,
          resizetypename:"全屏等比缩放(大屏/PC)",
          // 清除背景图
          clearnstyle:{
            display:"none"
          },
          // 图片选择
          srcchoosestyle:{
            display:""
          },
          // 缩放方式选择
          resizetypestyle:{
            display:"none"
          },
          // 数据请求方式
          datatypestyle:{
            style:{
              display:"none"
            },
            name:"静态数据"
          },
           // 选择背景图
          choosestyle:{
            display:""
          }
        },
        // 可供选择的选项
        modules:{
          radiodata:100,
          radio:1,
          // 大屏默认宽高
          defaulestyle:{
            width:"",
            height:""
          },
          moduleid:"",
          imgstyleright:{
              right:"0px",
              "overflow-x": "auto",
              "overflow-y": "hidden"
          },
          // 缩放的比例
          imgstyle:{
              "background-size": "100% 100%",
              "background-repeat":"no-repeat",
              "background-image":"",
              "margin-left":"0px",
              "margin-top":"0px",
              // width:"1920px",
              // height:"1080px",
          },
          // canvas栅格样式
          gridstype:{
            display:"none",
            opacity:0.3
          },
          style:{
            display:"none"
          },
          modulesource:[]
        },
        // 所有的组件选项
        modulessource:[
          {
            id:"jichu",
            type:"",
            img:require('../../assets/imgs/3.png'),
            name:"统计组件",
            modules:[
              {
                type:"zongxiangzhuzhuangtu",
                name:"纵向柱状图",
                id:"1",
                src:require("../../assets/imgs/15.png"),
                data:{}
              },{
                type:"caisezhuzhuangtu",
                name:"彩色柱状图",
                id:"2",
                src:require("../../assets/imgs/2.png"),
                data:{}
              },
              {
                type:"mianjitu",
                name:"面积图",
                id:"3",
                src:require("../../assets/imgs/16.png"),
                data:{}
              },
              {
                type:"tupian",
                name:"图片",
                id:"4",
                src:require("../../assets/imgs/13.png"),
                data:{}
              },
              {
                type:"jinduhuantu",
                name:"进度环图",
                id:"5",
                src:require("../../assets/imgs/1.png"),
                data:{}
              },
              {
                type:"meiguitu",
                name:"玫瑰图",
                id:"6",
                src:require("../../assets/imgs/17.png"),
                data:{}
              }
            ]
          },{
            id:"wenzi",
            type:"wenzi",
            img:require('../../assets/imgs/19.png'),
            name:"文字组件",
            modules:[
              {
                type:"danhangwenben",
                name:"单行文本",
                id:"8",
                src:require("../../assets/imgs/18.png"),
                data:{}
              },{
                type:"biaoge",
                name:"表格",
                id:"9",
                src:require("../../assets/imgs/21.png"),
                data:{}
              },{
                type:"shuzitu",
                name:"表格",
                id:"10",
                src:require("../../assets/imgs/22.png"),
                data:{}
              }
            ]
          },
        ],
        imgmodules:[
        ], //保存每个组件的信息，包括id等
        zooms:{
          show:false, //是否展示遮罩拖拽层
          resize:false, //是否缩放，缩放模式，防止点击事件和mousedown事件冲突
          ctrenter:false,//ctr按键是否按下,多选模式
          type:"",//拖拽缩放时候的类型，总共8个，left,top,right,bottom...
          style:{
            width:"",
            height:"",
            top:"",
            left:""
          },//拖拽组件的样式保存
        },
        start:'',
        end:'',
        granularity:60,
        timer:null,
        flag:false,
        delay: 1000,
        startVal:0,
        options1: {
            useEasing: true,
            useGrouping: true,
            separator: '',
            decimalPlaces: 3,
        },
        options2: {
            useEasing: true,
            useGrouping: true,
            separator: '',
            decimalPlaces: 0,
        },
        scrollLeft:0,
        scrollTop:0,
        currentItem:{
          target:{},
          type:''
        },
        TrafficTrend:['IPProtocol','Non-TCPUDPIPProtocol','TotalTraffic'],//总流量
        IPAnalyse:['IPAddress','ConnectedIP','OriginatingIP'],//IP地址
        NetAnalyse:['Prefix24'],//网段
        GroupAnalyse:['BusinessGroup','ConnectedBusinessGroup','MemberBusinessGroup','ClientBusinessGroup'],//工作组
        ConversationAnalyse:['IPConversation'],//IP会话
        ApplicationProfile:['Application','OtherApp','DefinedApp'],//已知应用
        BusinessAnalyse:['WebApplication'],//业务
        PagePerformance:['PageFamily','User'],//页面族
        InterfaceAnalyse:['Interface','MonInterfaceGroup'],//接口

        year:'',
        month:'',
        date:'',
        hour:'',
        minute:'',
        second:'',
      }
    },
    created(){
      var _self = this;
    },
    mounted:function(){
      let moduleid = this.$route.query.id||"";
      this.modules.moduleid = moduleid;

      window.onresize = () => {
        this.changeWindow();
      }
      window.oncontextmenu = function(){return false;}
      const vm=this
      window.getNewDate=vm.getNewDate
      this.$nextTick(()=>{
           this.updateTimeRange()
          this.granularity=60
          let t = this.end - this.start;
          if (t > 21600 && t < 259200) {
              this.granularity = 300;
          } else if (t > 259200 && t < 2592000) {
              this.granularity = 3600;
          } else if (t > 3600000) {
              this.granularity = 86400;
          }
          this.moduleContent();
      })
      document.onmouseup = (Ce) => {
          if (Ce.button!=2) {
            this.menuHidden();
          }
      }
      this.showtime()
    },
    destroyed(){
      for (let i = 0; i < this.imgmodules.length; i++) {
        clearInterval(this.imgmodules[i].config.time);
      }
    },
    

  methods: { isDpmRuntimeTable,

    // #RRGGBBAA -> rgba(r,g,b,a)；其他格式原样返回
hex8ToRgba: function (c) {
  if (typeof c === 'string' && /^#[0-9A-Fa-f]{8}$/.test(c)) {
    var r = parseInt(c.substr(1, 2), 16);
    var g = parseInt(c.substr(3, 2), 16);
    var b = parseInt(c.substr(5, 2), 16);
    var a = parseInt(c.substr(7, 2), 16) / 255;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }
  return c;
},

  // 表格整体内联样式（把 CSS 变量挂到 <el-table>）
  tableInlineStyle: function (item) {
    var fs = 14, color = '#fff';
    var w = item && item.config && item.config.widgets;
    if (w && w.xStyle) {
      if (w.xStyle.fontSize != null) fs = w.xStyle.fontSize;
      if (w.xStyle.color)           color = w.xStyle.color;
    }
    var hs = this.getHeaderStyle(item);
var bg = hs && hs.background ? this.hex8ToRgba(hs.background) : '#0F1C29';
var bc = (hs && hs.border && hs.border.color) ? this.hex8ToRgba(hs.border.color) : '#243041';

return {
  'font-size': fs + 'px',
  color: color,
  '--thBg': bg,
  '--thBorderColor': bc
};


    var st = {
      'font-size': fs + 'px',
      color: color,
      '--thBg': bg,
      '--thBorderColor': borderC
    };
    if (window && window.console) console.log('[tableInlineStyle]', item && item.id, st);
    return st;
  },

  // 表头整行样式
  headerRowStyle: function (item) {
    var hs = this.getHeaderStyle(item);
    var h  = (hs && hs.height) != null ? hs.height : 44;
    var st = { height: h + 'px', lineHeight: h + 'px' };
    if (window && window.console) console.log('[headerRowStyle]', item && item.id, st);
    return st;
  },

  // 表头单元格样式
  headerCellStyle(item) {
  var hs = this.getHeaderStyle(item);
  var borderW = (hs.border && hs.border.width) != null ? hs.border.width : 1;
  var borderC = (hs.border && hs.border.color) ? this.hex8ToRgba(hs.border.color) : '#243041';

  var style = {
    background: this.hex8ToRgba(hs.background || '#0F1C29'),
    color: hs.text && hs.text.color ? this.hex8ToRgba(hs.text.color) : '#A6B2C0',
    fontWeight: hs.text && hs.text.weight ? hs.text.weight : 600,
    fontSize: (hs.text && hs.text.size ? hs.text.size : 14) + 'px',
    borderBottom: borderW + 'px solid ' + borderC,
    borderRight:  borderW + 'px solid ' + borderC,
    borderLeft:   borderW + 'px solid ' + borderC,
    textAlign: hs.align || 'left'
  };
  return style;
},


  // 正文单元格样式（整表统一）
  bodyCellStyleObj: function (item) {
    var hs = this.getHeaderStyle(item);
    var borderW = ((hs.border && hs.border.width) != null ? hs.border.width : 1) + 'px';
    var borderC = (hs.border && hs.border.color) ? hs.border.color : '#243041';
    var st = { borderBottom: borderW + ' solid ' + borderC };
    if (window && window.console) console.log('[bodyCellStyleObj]', item && item.id, st);
    return st;
  },

  // 已有的：取 headerStyle（保持 ES5 写法）
  getHeaderStyle: function (item) {
    var w  = item && item.config && item.config.widgets;
    var hs = w && w.headerStyle;
    if (hs) return hs;
    return {
      height: 44,
      background: '#0F1C29',
      border: { color: '#243041', width: 1 },
      text:   { size: 14, color: '#A6B2C0', weight: 600 },
      align: 'left',
      paddingX: 12
    };
  },

  /**
   * 通用排序函数，Element-UI 的 :sort-method 要求返回数值
   * @param {Object} a 当前行数据
   * @param {Object} b 对比行数据
   * @param {Number} index 列索引
   */
   sortByDynamicKey: function (a, b, index) {
    var key = 'key' + index;
    var va = a && a[key];
    var vb = b && b[key];
    // 尝试转数值
    var na = parseFloat(va);
    var nb = parseFloat(vb);
    if (isNaN(na)) na = 0;
    if (isNaN(nb)) nb = 0;
    return na - nb;
  },
 
      // 实时获取当前年月日 时分秒 星期
    showtime() {
      let nowDate = new Date();
      this.year = nowDate.getFullYear();
      this.month = nowDate.getMonth() + 1 < 10?`0${ nowDate.getMonth() + 1}`:(nowDate.getMonth() + 1);
      this.date = nowDate.getDate()<10 ? `0${nowDate.getDate()}`:nowDate.getDate();
      this.hour = nowDate.getHours() < 10 ? "0" + nowDate.getHours() : nowDate.getHours();
      this.minute = nowDate.getMinutes() < 10 ? "0" + nowDate.getMinutes() : nowDate.getMinutes();
      this.second = nowDate.getSeconds() < 10 ? "0" + nowDate.getSeconds() : nowDate.getSeconds();
      setTimeout(this.showtime,1000);
    },

    filterDate(type,format){
      if(type==='date'){
        if(format==='-'){
          return this.year + "-" + this.month + "-" + this.date
        }else if(format==='.'){
          return this.year + "." + this.month + "." + this.date
        }else if(format==='年月日'){
          return this.year + "年" + this.month + "月" + this.date + "日" 
        }
      }else if(type==='time'){
        if(format===':'){
          return this.hour + ":" + this.minute + ":" + this.second
        }else if(format==='时分秒'){
          return this.hour + "时" + this.minute + "分" + this.second + "秒" 
        }
      }else if(type==='day'){
        let nowDate = new Date();
        if(format==='星期一'){
          return  new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六")[nowDate.getDay()];
        }else if(format==='Monday'){
          return  new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")[nowDate.getDay()];
        }else if(format==='Mon.'){
          return  new Array("Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat.")[nowDate.getDay()];
        }
      }
    },
      getScroll(event){
        // 获取滚动条滚动的距离
        this.scrollLeft=event.target.scrollLeft
        this.scrollTop=event.target.scrollTop
      },
      //表格右键显示菜单
      tableRightClick(row,column,event){
        if (!row.type) { this.menuHidden(); return; }
        let ip=''
        let tableId=$(event.target).parentsUntil('#imgmodules').last().attr('id')
        for (let i = 0; i < this.imgmodules.length; i++) {
            if (this.imgmodules[i].id==tableId) {
              let url=decodeURI(this.imgmodules[i].config.api)
              ip=url.substring(8,url.indexOf('/webservice'))
            }
        }
        event.name=row.key0
        console.log('row.type',row)
        this.currentItem={
          target:event,
          type:row.type,
          ip:ip
        }
        let currentClientX = event.clientX;
        let currentClientY = event.clientY;
        this.defaultsettings.menustyle.display="";
        this.defaultsettings.menustyle.left=(currentClientX+2)+this.scrollLeft+"px";
        this.defaultsettings.menustyle.top=(currentClientY+2)+this.scrollTop+"px";
      },
      // 数字图鼠标右键显示菜单
      numRightClick(item){
        if(!item.config.api)return
        if(isDpmUrl(item.config.api)){ this.menuHidden(); return; }
        let url=decodeURI(item.config.api)
        let ip=url.substring(8,url.indexOf('/webservice'))
        const numGroups=getQueryString(url,'numGroups')
        let type=getQueryString(url,`groupType${numGroups}`)
        // let type=getQueryString(url,'groupType1')
        let groupArgument1=getQueryString(url,'groupArgument1')
        this.currentItem={
          target:{name:groupArgument1},
          type:type,
          ip:ip
        }
        let currentClientX = event.clientX;
        let currentClientY = event.clientY;
        this.defaultsettings.menustyle.display="";
        this.defaultsettings.menustyle.left=(currentClientX+2)+this.scrollLeft+"px";
        this.defaultsettings.menustyle.top=(currentClientY+2)+this.scrollTop+"px";
      },
      // 显示菜单
      menuShow(Ce,type,ip,category,argument){
        if(!type){ this.menuHidden(); return; }
        if(category==='yibiaopan'||category==='jinduhuantu'||category==='mianjitu'||category==='zhexiantu'){
            Ce.name=argument
        }
        this.currentItem={
          target:Ce,
          type:type,
          ip:ip
        }
        console.log('currentItem',this.currentItem)
        let currentClientX = Ce.event.event.clientX;
        let currentClientY = Ce.event.event.clientY;
        this.defaultsettings.menustyle.display="";
        this.defaultsettings.menustyle.left=(currentClientX+2)+this.scrollLeft+"px";
        this.defaultsettings.menustyle.top=(currentClientY+2)+this.scrollTop+"px";
      },
      menuHidden(Ce){
        this.defaultsettings.menustyle.display="none";
      },
      // 钻取分析跳转
      analyze(){
        // this.baseURL+
        // let requestApi='https://114.112.96.198/NetInside/admin/datasource.asp?m=proxy&url='
        if(this.TrafficTrend.includes(this.currentItem.type)){ //总流量
          window.open(`https://${this.currentItem.ip}/NetInside/network/TrafficTrend.jsp?start=${this.start}&end=${this.end}`)
        }else if(this.IPAnalyse.includes(this.currentItem.type)){ //IP地址
          window.open(`https://${this.currentItem.ip}/NetInside/network/IPAnalyse.jsp?refreshFlag=null&inputItemR=${encodeURI(this.currentItem.target.name)}&start=${this.start}&end=${this.end}`)
        }else if(this.NetAnalyse.includes(this.currentItem.type)){ //网段
          window.open(`https://${this.currentItem.ip}/NetInside/network/NetAnalyse.jsp?refreshFlag=null&inputItemR=${encodeURI(this.currentItem.target.name)}&start=${this.start}&end=${this.end}`)
        }else if(this.GroupAnalyse.includes(this.currentItem.type)){ //工作组
          window.open(`https://${this.currentItem.ip}/NetInside/network/GroupAnalyse.jsp?refreshFlag=null&inputItemR=${encodeURI(this.currentItem.target.name)}&start=${this.start}&end=${this.end}`)
        }else if(this.ConversationAnalyse.includes(this.currentItem.type)){ //IP会话
          window.open(`https://${this.currentItem.ip}/NetInside/network/ConversationAnalyse.jsp?refreshFlag=null&inputItemR=${encodeURI(this.currentItem.target.name)}&start=${this.start}&end=${this.end}`)
        }else if(this.ApplicationProfile.includes(this.currentItem.type)){ //已知应用
          window.open(`https://${this.currentItem.ip}/NetInside/application/ApplicationProfile.jsp?refreshFlag=null&inputItemR=${encodeURI(this.currentItem.target.name)}&start=${this.start}&end=${this.end}`)
        }
        // else if(this.TrafficTrend.includes(this.currentItem.type)){ //未知应用
        //   window.open(`https://${this.currentItem.ip}/NetInside/application/ApplicationProfile.jsp?refreshFlag=null&inputItemR=${this.currentItem.target.name}`)
        // }
        else if(this.BusinessAnalyse.includes(this.currentItem.type)){ //业务
          window.open(`https://${this.currentItem.ip}/NetInside/business/BusinessAnalyse.jsp?refreshFlag=null&inputItemR=${encodeURI(this.currentItem.target.name)}&start=${this.start}&end=${this.end}`)
        }else if(this.PagePerformance.includes(this.currentItem.type)){ //页面族
          window.open(`https://${this.currentItem.ip}/NetInside/business/PagePerformance.jsp?refreshFlag=null&start=${this.start}&end=${this.end}`)
        }else if(this.InterfaceAnalyse.includes(this.currentItem.type)){ //接口
          window.open(`https://${this.currentItem.ip}/NetInside/network/InterfaceAnalyse.jsp?refreshFlag=null&inputItemR=null&start=${this.start}&end=${this.end}`)
        }
        // else if(this.TrafficTrend.includes(this.currentItem.type)){ //监控口
        //   window.open(`https://${this.currentItem.ip}/NetInside/network/InterfaceAnalyse.jsp`)
        // }else if(this.TrafficTrend.includes(this.currentItem.type)){ //初始组
        //   window.open(`https://${this.currentItem.ip}/NetInside/network/GroupAnalyse.jsp?refreshFlag=null&inputItemR=${encodeURI(this.currentItem.target.name)}`)
        // }
      },
      ...mapActions([
          'moduleMessage',
          'fileUpload',
          'editModule',
          'ajax'
      ]),
       cellStyle({row,column,rowIndex,columnIndex}){
        if(row['bg'+columnIndex]){
          if(row['bg'+columnIndex]=='Minor'){
            return 'background-color:#ffff00!important'
          }else if(row['bg'+columnIndex]=='Major'){
            return 'background-color:#ff9900!important'
          }else if(row['bg'+columnIndex]=='Critical'){
            return 'background-color:#ff0000!important'
          }else{
            return 'background-color:trasparent'
          }

        }
      },
      // 页面生成图片下载
      savePage(){
        var node = document.getElementById('view-imgs');
        domtoimage.toJpeg(node)
        .then((dataUrl)=> {
          let blobfile = this.dataURLToBlob(dataUrl);
          let url={
            name:this.$route.query.pageName,
            src:blobfile
          }
          let link=document.createElement('a')
          link.setAttribute("href",window.URL.createObjectURL(url.src))
          link.setAttribute("downLoad",url.name+".jpg")
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
      },
      updateTimeRange(){
        let start, end
        try {
          start = window.parent.startTimeUnix
          end = window.parent.endTimeUnix
        } catch (error) { /* Cross-origin standalone embedding uses a rolling interval. */ }
        const range = getDashboardRange(start, end)
        this.start = range.start
        this.end = range.end
      },
      // 重新获取父页面的时间
      getNewDate(type){
        if(type!='auto'&&this.timer){
          for (let i = 0; i < this.imgmodules.length; i++) {
            clearInterval(this.imgmodules[i].config.time);
          }
          this.flag=false
        }
           
          this.updateTimeRange()
          this.granularity=60
          let t = this.end - this.start;
          if (t > 21600 && t < 259200) {
              this.granularity = 300;
          } else if (t > 259200 && t < 2592000) {
              this.granularity = 3600;
          } else if (t > 3600000) {
              this.granularity = 86400;
          }
          // 根据选择的时间渲染图表数据
          this.getModuleData(type)
      },
      // 获取大屏详情
      moduleContent(){
        let params = {
          id:this.modules.moduleid
        }
        if (!this.modules.moduleid) {
          return;
        }
        this.moduleMessage({params}).then(function(res){
            if (res.status=="1") {
                var data = res.data;
                if (!res.data) {
                  return;
                }
                if (res.data.cfg_json) {
                  this.imgmodules = JSON.parse(res.data.cfg_json);
                  this.getModuleData();
                }


                this.modules.defaulestyle.width = data.width;
                this.modules.defaulestyle.height = data.height;
                this.defaultsettings.title = data.title;
                this.modules.imgstyle["background-image"] = "url("+data.coverimg+")";
                this.defaultsettings.src=data.coverimg;
                this.defaultsettings.headimg=data.headimg;
                this.defaultsettings.resizetype = data.resizetype;

                switch(data.resizetype) {
                  case "0":
                    this.defaultsettings.resizetypename="全屏等比缩放(大屏/PC)";
                    break;
                  case "1":
                    this.defaultsettings.resizetypename="按高度适配(横向滚动)";
                    break;
                  case "2":
                    this.defaultsettings.resizetypename="按宽度适配(移动端)";
                    break;
                }
                this.changeWindow();
            }else{
              // this.$Message(res.message);
            }
        }.bind(this))
      },
      titleChange(e){
        this.defaultsettings.title= e.target.value;
        this.editModules();
      },
      // 获取基础数据并渲染，判断是否定时获取，判断是否api获取等
      getModuleData(changeType){
          for (let i = 0; i < this.imgmodules.length; i++) {
            
            if(this.imgmodules[i].type=="zongxiangzhuzhuangtu"||this.imgmodules[i].type=="caisezhuzhuangtu"||this.imgmodules[i].type=="hengxiangzhuzhuangtu"||this.imgmodules[i].type=="meiguitu"||this.imgmodules[i].type=="bingtu"||this.imgmodules[i].type=="shixinbingtu"||this.imgmodules[i].type=="mianjitu"||this.imgmodules[i].type=="zhexiantu"||this.imgmodules[i].type=="jinduhuantu"||this.imgmodules[i].type=="yibiaopan"||this.imgmodules[i].type=="danhangwenben"||this.imgmodules[i].type=="shuzitu"||this.imgmodules[i].type=="biaoge"||this.imgmodules[i].type=="hengxiangduidiezhuzhuangtu"||this.imgmodules[i].type=="zongxiangduidiezhuzhuangtu"){
              if(!changeType||changeType=='handle'){//全局加载
                this.autoGetData(this.imgmodules[i].type,this.imgmodules[i].id);
              }else if(changeType==='auto'){//自动加载
                if(this.imgmodules[i].config.datastype=="api"&&this.imgmodules[i].config.autodata=="关闭"){
                  let type = this.imgmodules[i].type;
                  let id = this.imgmodules[i].id;
                  if (this.imgmodules[i].style.display!="none") {
                    this.autoGetData(type,id);
                  }
                }
              }
              if(this.imgmodules[i].config.datastype=="api"&&this.imgmodules[i].config.autodata=="开启"){
                let type = this.imgmodules[i].type;
                let id = this.imgmodules[i].id;
                if(!changeType||changeType=='handle'){
                  this.flag=false
                  if(this.flag==false){
                    this.timer = setInterval(function(){
                        if (this.imgmodules[i].config.datastype=="api"&&this.imgmodules[i].config.autodata=="开启"&&this.imgmodules[i].style.display!="none") {
                          this.autoGetData(type,id);
                        }
                    }.bind(this),(this.imgmodules[i].config.autodatatime||10)*1000);
                    this.flag=true
                  }
                  this.imgmodules[i].config.time = this.timer;
                }
                
              }
            }
          } //for_end
      },
      autoGetData(type,id){
        // 非当前页面
        if (this.$route.path!="/preview") {
          return;
        }
        this.updateTimeRange()
        if (type=="zongxiangzhuzhuangtu") { //纵向柱状图
          this.reZongxiangzhuzhuangtu("",id);
        }else if (type=="hengxiangzhuzhuangtu"){ //横向柱状图
          this.reHengxiangzhuzhuangtu("",id);
        }else if (type=="hengxiangduidiezhuzhuangtu"){ //横向堆叠柱状图
          this.reHengxiangduidiezhuzhuangtu("",id);
        }else if (type=="zongxiangduidiezhuzhuangtu"){ //纵向堆叠柱状图
          this.reZongxiangduidiezhuzhuangtu("",id);
        }else if (type=="meiguitu") { //玫瑰图
          this.reMeiGuitu("",id);
        }else if (type=="bingtu") { //饼图
          this.reBingtu("",id);
        }else if (type=="shixinbingtu") { //实心饼图
          this.reShixinbingtu("",id);
        }else if (type=="mianjitu") { //面积图
          this.reMianjitu("",id);
        }else if (type=="zhexiantu") { //折线图
          this.reZhexiantu("",id);
        }else if(type=="jinduhuantu"){ //进度环图
          this.reJinduhuantu("",id)
        }else if(type=="yibiaopan"){ //仪表盘
          this.reYibiaopan("",id)
        }else if(type=="danhangwenben"){ //单行文本
          this.reDanhangwenben("",id)
        }else if(type=="shuzitu"){ //数字图
          this.reShuzitu("",id)
        }else if(type=="biaoge"){ //表格
          this.reBiaoge("",id)
        }
      },
      changeWindow(){
        let windowWidth = document.body.clientWidth;
        let windowHeight = document.body.clientHeight;
        let windowRadio = windowWidth/windowHeight;
        let dataRadio = this.modules.defaulestyle.width/this.modules.defaulestyle.height;
        if (this.defaultsettings.resizetype=="1") {
            this.modules.imgstyleright['overflow-x']="auto";
            this.modules.imgstyleright['overflow-y']="hidden";
            // 为了消除滚动条的影响
            if (windowRadio>=dataRadio) {
                this.modules.radio = windowHeight/this.modules.defaulestyle.height;
            }else{
                this.modules.radio = (windowHeight-17)/this.modules.defaulestyle.height;
            }

            this.modules.imgstyle["transform"]="scale("+ this.modules.radio+")";
            this.modules.imgstyle["width"]=this.modules.defaulestyle.width+"px";
            this.modules.imgstyle["height"]=this.modules.defaulestyle.height+"px";
            // margin-top的计算方法，scale会导致缩放了却会占用空间，
            if (this.modules.radio>=1) {
              this.modules.imgstyle["margin-top"] = this.modules.defaulestyle.height*(this.modules.radio-1)+"px";
            }else{
              this.modules.imgstyle["margin-top"] = "-"+this.modules.defaulestyle.height*(1-this.modules.radio)+"px";
            }
            this.modules.imgstyle["margin-left"] = "0px";
            return;
        }
        if (this.defaultsettings.resizetype=="2") {
            this.modules.imgstyleright['overflow-x']="hidden";
            this.modules.imgstyleright['overflow-y']="auto";

            // 为了消除滚动条的影响
            if (windowRadio>=dataRadio) {
                this.modules.radio = (windowWidth-17)/this.modules.defaulestyle.width;
            }else{
                this.modules.radio = windowWidth/this.modules.defaulestyle.width;
            }
            this.modules.imgstyle["transform"]="scale("+ this.modules.radio+")";
            this.modules.imgstyle["width"]=this.modules.defaulestyle.width+"px";
            this.modules.imgstyle["height"]=this.modules.defaulestyle.height+"px";
            if (this.modules.radio>=1) {
              this.modules.imgstyle["margin-top"] = this.modules.defaulestyle.height*(this.modules.radio-1)+"px";
            }else{
              this.modules.imgstyle["margin-top"] = "-"+this.modules.defaulestyle.height*(1-this.modules.radio)+"px";
            }

            this.modules.imgstyle["margin-left"] = "0px";
            return;
        }
        if (this.defaultsettings.resizetype=="0") {
          this.modules.imgstyleright['overflow-x']="hidden";
          this.modules.imgstyleright['overflow-y']="hidden";
        }
        if (windowRadio>=dataRadio) {
          if (this.defaultsettings.resizetype=="0") {
              this.modules.radio = windowHeight/this.modules.defaulestyle.height;
              this.modules.imgstyle["transform"]="scale("+ this.modules.radio+")";
              this.modules.imgstyle["width"]=this.modules.defaulestyle.width+"px";
              this.modules.imgstyle["height"]=this.modules.defaulestyle.height+"px";
              if (this.modules.radio>=1) {
                this.modules.imgstyle["margin-top"] = this.modules.defaulestyle.height*(this.modules.radio-1)+"px";
              }else{
                this.modules.imgstyle["margin-top"] = "-"+this.modules.defaulestyle.height*(1-this.modules.radio)+"px";
              }
              this.modules.imgstyle["margin-left"] = (windowWidth-this.modules.defaulestyle.width*this.modules.radio)/2+"px";
          }

        }else{
          if (this.defaultsettings.resizetype=="0") {
            this.modules.radio = windowWidth/this.modules.defaulestyle.width;
            this.modules.imgstyle["transform"]="scale("+ this.modules.radio+")";
            this.modules.imgstyle["width"]=this.modules.defaulestyle.width+"px";
            this.modules.imgstyle["height"]=this.modules.defaulestyle.height+"px";

            this.modules.imgstyle["margin-left"] ="0px";
            this.modules.imgstyle["margin-top"] = ((windowHeight-this.modules.defaulestyle.height*this.modules.radio)/2-this.modules.defaulestyle.height*(1-this.modules.radio))+"px";
          }
        }


      },
      moduleListHidden(){
        this.modules.style.display="none"
      },
      // 缩放时候只是重新计算宽度
      resizeWidth(){
        this.zooms.show = true;
        this.zooms.style.width = Ce.target.width+"px";
      },
      // 缩放时候只是重新计算高度
      resizeHeight(){
        this.zooms.show = true;
        this.zooms.style.height = Ce.target.height+"px";
      },
      // 缩放时候重新计算高度和宽度
      resizeRightBottom(left,top){
        this.zooms.show = true;
        // X轴,Y轴缩小的比例
        let widthRadio = (left/parseFloat(this.zooms.style.width.replace('px','')));
        let heightRadio = (top/parseFloat(this.zooms.style.height.replace('px','')));
        // 先变更遮罩层的宽高
        this.zooms.style.width = (parseFloat(this.zooms.style.width.replace('px',''))+left)+"px";
        this.zooms.style.height = (parseFloat(this.zooms.style.height.replace('px',''))+top)+"px";
        //拖动和缩放已经选中的组件
        this.reSizeHeightAndWidthModules(widthRadio,heightRadio);
      },
      resizeBottomMouseMove(e){
        e.preventDefault();
      },
      resizeMouseMove(e){
        e.preventDefault();
      },
      resizeRightMouseMove(e){
        e.preventDefault();
      },
      boardMouseMove(e){
        e.preventDefault();
      },
      //拖动已经选中的组件,重新更新所有已选中的组件的位置
      moveModules(Ce,left,top){
        // 先更新每个组件的位置
          for (let j = 0; j < this.imgmodules.length; j++) {
              if ( this.imgmodules[j].selects) {
                let disX = parseFloat(this.imgmodules[j].style.left.replace("px",""));
                let disY = parseFloat(this.imgmodules[j].style.top.replace("px",""));
                this.imgmodules[j].style.left = (left + disX) + 'px';
                this.imgmodules[j].style.top = (top + disY) + 'px';
              }
          }
          // 然后再更新拖拽组件的位置
          this.currentModuleMoveResize();
      },
      // 向右拉动时候只计算宽度
      resizeRight(left,top){
        this.zooms.show = true;
        // X轴,Y轴缩小的比例
        let widthRadio = (left/parseFloat(this.zooms.style.width.replace('px','')));
        // 先变更遮罩层的宽高
        this.zooms.style.width = (parseFloat(this.zooms.style.width.replace('px',''))+left)+"px";
        //拖动和缩放已经选中的组件
        this.reSizeWidthModules(widthRadio);
      },
      // 向下拉动时候只计算宽度
      resizeBottom(left,top){
        this.zooms.show = true;
        // X轴,Y轴缩小的比例
        let heightRadio = (top/parseFloat(this.zooms.style.height.replace('px','')));
        // 先变更遮罩层的宽高
        this.zooms.style.height = (parseFloat(this.zooms.style.height.replace('px',''))+top)+"px";
        //拖动和缩放已经选中的组件
        this.reSizeHeightModules(heightRadio);
      },
      /*
        向左拉动只需要计算宽度和左侧距离
       */
      resizeLeft(left,top){
        this.zooms.show = true;
        // X轴,Y轴缩小的比例
        let widthRadio = (left/parseFloat(this.zooms.style.width.replace('px','')));
        let oldZoomLeft = parseFloat(this.zooms.style.left.replace('px',''));
        let newZoomLeft = oldZoomLeft+left;
        // 先变更遮罩层的宽高
        this.zooms.style.width = (parseFloat(this.zooms.style.width.replace('px',''))-left)+"px";
        this.zooms.style.left = newZoomLeft + "px";
        //拖动和缩放已经选中的组件
        this.reSizeLeftModules(widthRadio,oldZoomLeft,newZoomLeft);
      },
      reSizeLeftModules(widthRadio,oldZoomLeft,newZoomLeft){
        let styleLeft = parseFloat(this.zooms.style.left.replace("px",""));
          for (let j = 0; j < this.imgmodules.length; j++) {
              if (this.imgmodules[j].selects) {
                let disX = parseFloat(this.imgmodules[j].style.width.replace("px",""));
                let disLeft = parseFloat(this.imgmodules[j].style.left.replace("px",""));
                this.imgmodules[j].style.width = (disX - disX*widthRadio) + 'px';
                this.imgmodules[j].style.left = (newZoomLeft+(disLeft-oldZoomLeft)*(1-widthRadio))+'px';
                if (this.imgmodules[j].chart) {
                  this.imgmodules[j].chart.resize();
                }
              }
          }
      },
      resizeRightTop(left,top){
        this.zooms.show = true;
        // X轴,Y轴缩小的比例
        let widthRadio = (left/parseFloat(this.zooms.style.width.replace('px','')));
        let heightRadio = (top/parseFloat(this.zooms.style.height.replace('px','')));
        let oldZoomLeft = parseFloat(this.zooms.style.left.replace('px',''));
        let oldZoomTop = parseFloat(this.zooms.style.top.replace('px',''));
        let newZoomTop = oldZoomTop+top;
        // 先变更遮罩层的宽高
        this.zooms.style.width = (parseFloat(this.zooms.style.width.replace('px',''))+left)+"px";
        this.zooms.style.height = (parseFloat(this.zooms.style.height.replace('px',''))-top)+"px";
        this.zooms.style.top = newZoomTop + "px";
        //拖动和缩放已经选中的组件
        this.reSizeRightTopModules(widthRadio,heightRadio,oldZoomLeft,oldZoomTop,newZoomTop);
      },
      reSizeRightTopModules(widthRadio,heightRadio,oldZoomLeft,oldZoomTop,newZoomTop){
        let styleLeft = parseFloat(this.zooms.style.left.replace("px",""));
        let styleTop = parseFloat(this.zooms.style.top.replace("px",""));
          for (let j = 0; j < this.imgmodules.length; j++) {
              if (this.imgmodules[j].selects) {
                let disX = parseFloat(this.imgmodules[j].style.width.replace("px",""));
                let disY = parseFloat(this.imgmodules[j].style.height.replace("px",""));
                let disLeft = parseFloat(this.imgmodules[j].style.left.replace("px",""));
                let disTop = parseFloat(this.imgmodules[j].style.top.replace("px",""));
                this.imgmodules[j].style.width = (disX + disX*widthRadio) + 'px';
                this.imgmodules[j].style.height = (disY - disY*heightRadio) + 'px';
                this.imgmodules[j].style.left = (oldZoomLeft+(disLeft-oldZoomLeft)*(1+widthRadio))+'px';
                this.imgmodules[j].style.top = (newZoomTop+(disTop-oldZoomTop)*(1-heightRadio))+'px';
                if (this.imgmodules[j].chart) {
                  this.imgmodules[j].chart.resize();
                }
              }
          }
      },
      resizeTop(left,top){
        this.zooms.show = true;
        // X轴,Y轴缩小的比例
        let heightRadio = (top/parseFloat(this.zooms.style.height.replace('px','')));
        let oldZoomTop = parseFloat(this.zooms.style.top.replace('px',''));
        let newZoomTop = oldZoomTop+top;
        // 先变更遮罩层的宽高
        this.zooms.style.height = (parseFloat(this.zooms.style.height.replace('px',''))-top)+"px";
        this.zooms.style.top = newZoomTop + "px";
        //拖动和缩放已经选中的组件
        this.reSizeTopModules(heightRadio,oldZoomTop,newZoomTop);
      },
      reSizeTopModules(heightRadio,oldZoomTop,newZoomTop){
        let styleTop = parseFloat(this.zooms.style.top.replace("px",""));
          for (let j = 0; j < this.imgmodules.length; j++) {
              if (this.imgmodules[j].selects) {
                let disY = parseFloat(this.imgmodules[j].style.height.replace("px",""));
                let disTop = parseFloat(this.imgmodules[j].style.top.replace("px",""));
                this.imgmodules[j].style.height = (disY - disY*heightRadio) + 'px';
                this.imgmodules[j].style.top = (newZoomTop+(disTop-oldZoomTop)*(1-heightRadio))+'px';
                if (this.imgmodules[j].chart) {
                  this.imgmodules[j].chart.resize();
                }
              }
          }
      },
      resizeLeftTop(left,top){
        this.zooms.show = true;
        // X轴,Y轴缩小的比例
        let widthRadio = (left/parseFloat(this.zooms.style.width.replace('px','')));
        let heightRadio = (top/parseFloat(this.zooms.style.height.replace('px','')));
        let oldZoomLeft = parseFloat(this.zooms.style.left.replace('px',''));
        let oldZoomTop = parseFloat(this.zooms.style.top.replace('px',''));
        let newZoomLeft = oldZoomLeft+left;
        let newZoomTop = oldZoomTop+top;
        // 先变更遮罩层的宽高

        this.zooms.style.width = (parseFloat(this.zooms.style.width.replace('px',''))-left)+"px";
        this.zooms.style.height = (parseFloat(this.zooms.style.height.replace('px',''))-top)+"px";
        this.zooms.style.left = newZoomLeft + "px";
        this.zooms.style.top = newZoomTop + "px";
        //拖动和缩放已经选中的组件
        this.reSizeLeftTopModules(widthRadio,heightRadio,oldZoomLeft,newZoomLeft,oldZoomTop,newZoomTop);
      },
      reSizeLeftTopModules(widthRadio,heightRadio,oldZoomLeft,newZoomLeft,oldZoomTop,newZoomTop){
        let styleLeft = parseFloat(this.zooms.style.left.replace("px",""));
        let styleTop = parseFloat(this.zooms.style.top.replace("px",""));
          for (let j = 0; j < this.imgmodules.length; j++) {
              if (this.imgmodules[j].selects) {
                let disX = parseFloat(this.imgmodules[j].style.width.replace("px",""));
                let disY = parseFloat(this.imgmodules[j].style.height.replace("px",""));
                let disLeft = parseFloat(this.imgmodules[j].style.left.replace("px",""));
                let disTop = parseFloat(this.imgmodules[j].style.top.replace("px",""));
                this.imgmodules[j].style.width = (disX - disX*widthRadio) + 'px';
                this.imgmodules[j].style.height = (disY - disY*heightRadio) + 'px';
                this.imgmodules[j].style.left = (newZoomLeft+(disLeft-oldZoomLeft)*(1-widthRadio))+'px';
                this.imgmodules[j].style.top = (newZoomTop+(disTop-oldZoomTop)*(1-heightRadio))+'px';
                if (this.imgmodules[j].chart) {
                  this.imgmodules[j].chart.resize();
                }
              }
          }
      },
      /*
           左下角拉动需要计算宽高以及左侧顶部的距离
      */
      resizeLeftBottom(left,top){
        this.zooms.show = true;
        // X轴,Y轴缩小的比例
        let widthRadio = (left/parseFloat(this.zooms.style.width.replace('px','')));
        let heightRadio = (top/parseFloat(this.zooms.style.height.replace('px','')));
        let oldZoomLeft = parseFloat(this.zooms.style.left.replace('px',''));
        let newZoomLeft = oldZoomLeft+left;
        // 先变更遮罩层的宽高
        this.zooms.style.width = (parseFloat(this.zooms.style.width.replace('px',''))-left)+"px";
        this.zooms.style.left = newZoomLeft + "px";
        this.zooms.style.height = (parseFloat(this.zooms.style.height.replace('px',''))+top)+"px";
        //拖动和缩放已经选中的组件
        this.reSizeLeftBottomModules(widthRadio,heightRadio,oldZoomLeft,newZoomLeft);
      },
      reSizeLeftBottomModules(widthRadio,heightRadio,oldZoomLeft,newZoomLeft){
        let styleLeft = parseFloat(this.zooms.style.left.replace("px",""));
        let styleTop = parseFloat(this.zooms.style.top.replace("px",""));
          for (let j = 0; j < this.imgmodules.length; j++) {
              if (this.imgmodules[j].selects) {
                let disX = parseFloat(this.imgmodules[j].style.width.replace("px",""));
                let disY = parseFloat(this.imgmodules[j].style.height.replace("px",""));
                let disLeft = parseFloat(this.imgmodules[j].style.left.replace("px",""));
                let disTop = parseFloat(this.imgmodules[j].style.top.replace("px",""));
                this.imgmodules[j].style.width = (disX - disX*widthRadio) + 'px';
                this.imgmodules[j].style.height = (disY + disY*heightRadio) + 'px';
                this.imgmodules[j].style.left = (newZoomLeft+(disLeft-oldZoomLeft)*(1-widthRadio))+'px';
                this.imgmodules[j].style.top = (disTop + (disTop-styleTop)*heightRadio) + 'px';
                if (this.imgmodules[j].chart) {
                  this.imgmodules[j].chart.resize();
                }
              }
          }
      },
      /*
        向下缩放时，重新计算宽度和高度以及左侧和顶上的距离
       */
      reSizeHeightModules(heightRadio){
        let styleTop = parseFloat(this.zooms.style.top.replace("px",""));
          for (let j = 0; j < this.imgmodules.length; j++) {
              if (this.imgmodules[j].selects) {
                let disY = parseFloat(this.imgmodules[j].style.height.replace("px",""));
                let disTop = parseFloat(this.imgmodules[j].style.top.replace("px",""));
                this.imgmodules[j].style.height = (disY + disY*heightRadio) + 'px';
                this.imgmodules[j].style.top = (disTop + (disTop-styleTop)*heightRadio) + 'px';
                if (this.imgmodules[j].chart) {
                  this.imgmodules[j].chart.resize();
                }
              }
          }
      },
      /*
        右下角缩放时，重新计算宽度和高度以及左侧和顶上的距离
       */
      reSizeWidthModules(widthRadio){
        let styleLeft = parseFloat(this.zooms.style.left.replace("px",""));
          for (let j = 0; j < this.imgmodules.length; j++) {
              if (this.imgmodules[j].selects) {
                let disX = parseFloat(this.imgmodules[j].style.width.replace("px",""));
                let disLeft = parseFloat(this.imgmodules[j].style.left.replace("px",""));
                this.imgmodules[j].style.width = (disX + disX*widthRadio) + 'px';
                this.imgmodules[j].style.left = (disLeft+ (disLeft-styleLeft)*widthRadio) + 'px';
                if (this.imgmodules[j].chart) {
                  this.imgmodules[j].chart.resize();
                }
              }
          }
      },
      /*
        右下角缩放时，重新计算宽度和高度以及左侧和顶上的距离
       */
      reSizeHeightAndWidthModules(widthRadio,heightRadio){
        let styleLeft = parseFloat(this.zooms.style.left.replace("px",""));
        let styleTop = parseFloat(this.zooms.style.top.replace("px",""));
          for (let j = 0; j < this.imgmodules.length; j++) {
              if (this.imgmodules[j].selects) {
                let disX = parseFloat(this.imgmodules[j].style.width.replace("px",""));
                let disY = parseFloat(this.imgmodules[j].style.height.replace("px",""));
                let disLeft = parseFloat(this.imgmodules[j].style.left.replace("px",""));
                let disTop = parseFloat(this.imgmodules[j].style.top.replace("px",""));
                this.imgmodules[j].style.width = (disX + disX*widthRadio) + 'px';
                this.imgmodules[j].style.height = (disY + disY*heightRadio) + 'px';
                this.imgmodules[j].style.left = (disLeft+ (disLeft-styleLeft)*widthRadio) + 'px';
                this.imgmodules[j].style.top = (disTop + (disTop-styleTop)*heightRadio) + 'px';
                if (this.imgmodules[j].chart) {
                  this.imgmodules[j].chart.resize();
                }
              }
          }
      },
      /*
         按下组件移动，并重新显示拖拽样式
       */
      imgModulesMouseDown(Ce,id){
        this.moduleListHidden();
        // Ce.preventDefault();
        var num = 0;
        for (let i = 0; i < this.imgmodules.length; i++) {
            if (this.imgmodules[i].id == id) {
              this.imgmodules[i].selects = true; //设置当前组件为选中
              this.imgmodules[i].style.border='1px dotted rgba(35,195,18,1)';
              num  = i;
            }else{
              if (!this.zooms.ctrenter){
                //如果没有按下ctr按键，则不把其他的组件设置为不选中
                this.imgmodules[i].selects = false;
                this.imgmodules[i].style.border='1px dotted rgba(35,195,18,0)';
              }
            }
        }
        //算出鼠标相对元素的位置
        let disX = parseFloat(this.imgmodules[num].style.left.replace("px",""));
        let disY = parseFloat(this.imgmodules[num].style.top.replace("px",""));
        let currentClientX = Ce.clientX;
        let currentClientY = Ce.clientY;
        this.currentmodule.id = id;
        this.currentmodule.zindex = this.imgmodules[num].style['z-index'];
        this.currentmodule.name = this.imgmodules[num].name;
        this.currentmodule.type = this.imgmodules[num].type;
        this.currentmodule.config = this.imgmodules[num].config;
        if (this.currentmodule.config.datastype=="default") {
          this.defaultsettings.datatypestyle.name="静态数据";
        }else{
          this.defaultsettings.datatypestyle.name="API";
        }

        this.defaultsettings.choosestyle.display="";
        this.defaultsettings.srcchoosestyle.display="";
        this.defaultsettings.clearnstyle.display="none";
        this.reCurrentSizeShow(disX,disY,this.imgmodules[num].style.width.replace("px",""),this.imgmodules[num].style.height.replace("px",""))
        document.onmousemove = (Ce)=>{
            // 栅格显示
            this.modules.gridstype.display="";
            //鼠标按下并移动的事件
            //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
            let left = (Ce.clientX - currentClientX)/this.modules.radio;  //左右移动的距离
            let top = (Ce.clientY - currentClientY)/this.modules.radio; //上下移动的距离
            this.imgmodules[num].style.left = (left + disX) + 'px';
            this.imgmodules[num].style.top = (top + disY) + 'px';
            this.currentModuleMoveResize();
        };
        document.onmouseup = (Ce) => {
          this.zooms.resize  = true; //设置模式为缩放模式
          // 但是不想讓click事件执行，因此300毫秒以后再把click事件放开，这样300毫秒内click事件已经判断完毕resize了
          setTimeout(function(){
            this.zooms.resize  = false;
          }.bind(this),300);
          // 栅格消失
            this.modules.gridstype.display="none";
            document.onmousemove = null;
            document.onmouseup = null;
        };
      },
      // 当前组件移动，放大缩小时候重新计算选中组件的位置
      currentModuleMoveResize(){
        for (let i = 0; i < this.imgmodules.length; i++) {
            if (this.imgmodules[i].id==this.currentmodule.id) {
              let left = this.imgmodules[i].style.left.replace("px","");
              let top = this.imgmodules[i].style.top.replace("px","");
              let width = this.imgmodules[i].style.width.replace("px","");
              let height = this.imgmodules[i].style.height.replace("px","");
              this.reCurrentSizeShow(left,top,width,height);
            }
        }
      },
      // 重新计算当前选中组件的宽高
      reCurrentSizeShow(left,top,width,height){
        this.currentmodule.left = Math.round(left);
        this.currentmodule.top = Math.round(top);
        this.currentmodule.width = Math.round(width);
        this.currentmodule.height = Math.round(height);
      },
      imgModulesMouseUp(e){
        e.preventDefault();
      },
      imgModulesMouseMove(e){
        e.preventDefault();
      },
      //图片转换格式为Blob文件
      dataURLToBlob(dataurl) {
            let arr = dataurl.split(',');
            let mime = arr[0].match(/:(.*?);/)[1];
            let bstr = atob(arr[1]);
            let n = bstr.length;
            let u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
      },
      /*保存图片的方法（即按钮点击触发的方法）
          第一个参数为需要保存的div的id名
          第二个参数为保存图片的名称 */
      saveImage(divText) {
        this.$Spin.show();
        var node = document.getElementById('view-imgs');
        domtoimage.toPng(node)
        .then(function (dataUrl) {
            var blobfile = this.dataURLToBlob(dataUrl);
            var formData = new window.FormData();
            formData.append('file',blobfile);
            this.fileUpload(formData).then(function(res){
              if(res.code=="1"){
                this.defaultsettings.headimg =res.data.url;
                this.$Spin.hide();
                this.editModules();
              }else{
                this.$Spin.hide();
                this.$Message.info(res.message);
              }
            }.bind(this))
        }.bind(this),function(err){
          this.$Spin.hide();
        }.bind(this))
        .catch(function (error) {
          this.$Spin.hide();
        }.bind(this));
      },
      // 绘画网格
      drawGrid(color,stepx,stepy){
        var c_canvas = document.getElementById("imggriddraw")
        var ctx = c_canvas.getContext("2d");
        ctx.strokeStyle = "#f1dedf";
        ctx.strokeWidth = 1;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var x = 0.5; x < stepx; x += 20) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, stepy);
          ctx.stroke();
        }
        for (var y = 0.5; y < stepy; y += 20) {
          ctx.moveTo(0, y);
          ctx.lineTo(stepx, y);
          ctx.stroke();
        }
        ctx.closePath();
        return;
      },
      // 基础柱状图
      moduleJiChuzhuzhuangtu(e){
        var moduledatas = JSON.parse(JSON.stringify(this.moduledata.state.zongxiangzhuzhuangtu.datas));
        var zongxiangzhuzhuangtu = JSON.parse(JSON.stringify(this.moduledata.state.zongxiangzhuzhuangtu))
        var params = {
          xAxis:zongxiangzhuzhuangtu.xAxis,
          yAxis:zongxiangzhuzhuangtu.yAxis,
          moduledatas:{
            x:zongxiangzhuzhuangtu.x,
            y:zongxiangzhuzhuangtu.y,
            label:zongxiangzhuzhuangtu.label,
            style:zongxiangzhuzhuangtu.style
          }
        }
        var widgets = moduledefault.Zongxiangzhuzhuangtu(params)
        var data = {
          id:(new Date()).valueOf(),
          type : "zongxiangzhuzhuangtu",
          selects:false,
          name:"纵向柱状图",
          config:{
            imgsrc:"",
            chart:true, //是否是百度地图组件
            img:false,//是否是图片组件
            datas:true,//是否需要数据支撑
            datastype:"default",//获取数据类型 default和api两种
            autodata:"关闭",
            datasetbeforecontent:"+", //数据样式的before是+还是-
            xAxiosbeforecontent:"+",
            yAxiosbeforecontent:"+",
            widgetdata:moduledatas,
            params:params,
            autodatatime:"10",
            apitypeselect:"POST",//默认显示post
            api:"",
            widgets:widgets,
            defaultdata:""
          },
          style:{
              "width":"500px",
              "height":"300px",
              "left":(e.clientX-100)/this.modules.radio+"px",
              "top":(e.clientY-130)/this.modules.radio+"px",
              "z-index":'1',
              "border":'1px dotted rgba(35,195,18,0)',
              "position":"absolute",
              "display":""
          }
        } /*data_end*/
        this.imgmodules.push(data);
        this.imgtype = "";
        this.$nextTick(()=>{
            var myChart = echarts.init(document.getElementById(data.id));
            data.chart = myChart;
            myChart.setOption(data.config.widgets,true);
            myChart.resize();
        })
      },
      // 玫瑰图
      moduleMeiguitu(e){
        var moduledatas = JSON.parse(JSON.stringify(this.moduledata.state.meiguitu.datas));
        var meiguitu = JSON.parse(JSON.stringify(this.moduledata.state.meiguitu))
        var params = {
          color:meiguitu.color,
          style:meiguitu.style,
          label:meiguitu.label,
          moduledatas:{
            x:meiguitu.x,
            y:meiguitu.y,
            label:meiguitu.label,
            legend:meiguitu.legend
          }
        }
        var widgets = moduledefault.Meiguitu(params);
        var data = {
          id:(new Date()).valueOf(),
          type : "meiguitu",
          selects:false,
          name:"玫瑰图",
          config:{
            imgsrc:"",
            chart:true, //是否是百度地图组件
            img:false,//是否是图片组件
            datas:true,//是否需要数据支撑
            datastype:"default",//获取数据类型 default和api两种
            autodata:"关闭",
            datasetbeforecontent:"+", //数据样式的before是+还是-
            widgetdata:moduledatas,
            params:params,
            autodatatime:"10",
            apitypeselect:"POST",//默认显示post
            api:"",
            widgets:widgets,
            defaultdata:""
          },
          style:{
              "width":"500px",
              "height":"400px",
              "left":(e.clientX-100)/this.modules.radio+"px",
              "top":(e.clientY-130)/this.modules.radio+"px",
              "z-index":'1',
              "border":'1px dotted rgba(35,195,18,0)',
              "position":"absolute",
              "display":""
          }
        } /*data_end*/
        this.imgmodules.push(data);
        this.imgtype = "";
        this.$nextTick(()=>{
            var myChart = echarts.init(document.getElementById(data.id));
            data.chart = myChart;
            myChart.setOption(data.config.widgets,true);
            myChart.resize();
        })
      },
      // 饼图
      moduleBingtu(e){
        var moduledatas = JSON.parse(JSON.stringify(this.moduledata.state.bingtu.datas));
        var bingtu = JSON.parse(JSON.stringify(this.moduledata.state.bingtu))
        var params = {
          color:bingtu.color,
          style:bingtu.style,
          label:bingtu.label,
          moduledatas:{
            x:bingtu.x,
            y:bingtu.y,
            label:bingtu.label,
            legend:bingtu.legend
          }
        }
        var widgets = moduledefault.Bingtu(params);
        var data = {
          id:(new Date()).valueOf(),
          type : "bingtu",
          selects:false,
          name:"饼图",
          config:{
            imgsrc:"",
            chart:true, //是否是百度地图组件
            img:false,//是否是图片组件
            datas:true,//是否需要数据支撑
            datastype:"default",//获取数据类型 default和api两种
            autodata:"关闭",
            datasetbeforecontent:"+", //数据样式的before是+还是-
            widgetdata:moduledatas,
            params:params,
            autodatatime:"10",
            apitypeselect:"POST",//默认显示post
            api:"",
            widgets:widgets,
            defaultdata:""
          },
          style:{
              "width":"500px",
              "height":"400px",
              "left":(e.clientX-100)/this.modules.radio+"px",
              "top":(e.clientY-130)/this.modules.radio+"px",
              "z-index":'1',
              "border":'1px solid #104867',
              "position":"absolute",
              "display":""
          }
        } /*data_end*/
        this.imgmodules.push(data);
        this.imgtype = "";
        this.$nextTick(()=>{
            var myChart = echarts.init(document.getElementById(data.id));
            data.chart = myChart;
            myChart.setOption(data.config.widgets,true);
            myChart.resize();
        })
      },
      // 进度环图
      moduleJinDuhuantu(e){
        var moduledatas = JSON.parse(JSON.stringify(this.moduledata.state.jinduhuantu.datas));
        var jinduhuantu = JSON.parse(JSON.stringify(this.moduledata.state.jinduhuantu))
        var params =  {
          value:jinduhuantu.value,
          name:jinduhuantu.name,
          radius:jinduhuantu.radius,
          color:jinduhuantu.color,
          style:jinduhuantu.style
        }
        var widgets = moduledefault.Jinduhuantu(params);
        var data = {
          id:(new Date()).valueOf(),
          type : "jinduhuantu",
          selects:false,
          name:"进度环图",
          config:{
            imgsrc:"",
            chart:true, //是否是百度地图组件
            img:false,//是否是图片组件
            datas:true,//是否需要数据支撑
            datastype:"default",//获取数据类型 default和api两种
            autodata:"关闭",
            autodatatime:"10",
            datasetbeforecontent:"+", //数据样式的before是+还是-
            params:params,
            widgetdata:moduledatas,
            apitypeselect:"POST",//默认显示post
            api:"",
            widgets:widgets,
            defaultdata:""
          },
          style:{
              "width":"200px",
              "height":"200px",
              "left":(e.clientX-100)/this.modules.radio+"px",
              "top":(e.clientY-130)/this.modules.radio+"px",
              "z-index":'1',
              "border":'1px dotted rgba(35,195,18,0)',
              "position":"absolute",
              "display":""
          }
        } /*data_end*/
        this.imgmodules.push(data);
        this.imgtype = "";
        this.$nextTick(()=>{
            var myChart = echarts.init(document.getElementById(data.id));
            data.chart = myChart;
            myChart.setOption(data.config.widgets,true);
            myChart.resize();
        })
      },
      //柱状图组件
      moduleZhuzhuangtu(e){
        // JSON.parse(JSON.stringify 深度复制，防止之后新建的时候数据污染
        var moduledatas = JSON.parse(JSON.stringify(this.moduledata.state.caisezhuzhuangtu.datas));
        var caisezhuzhuangtu = JSON.parse(JSON.stringify(this.moduledata.state.caisezhuzhuangtu))
        var params = {
          xAxis:caisezhuzhuangtu.xAxis,
          yAxis:caisezhuzhuangtu.yAxis,
          moduledatas:{
            x:caisezhuzhuangtu.x,
            y:caisezhuzhuangtu.y,
            label:caisezhuzhuangtu.label,
            style:caisezhuzhuangtu.style
          }
        }
        var widgets = moduledefault.Caisezhuzhuangtu(params)
        var data = {
          id:(new Date()).valueOf(),
          type : "caisezhuzhuangtu",
          selects:false,
          name:"柱状图",
          config:{
            imgsrc:"",
            chart:true, //是否是百度地图组件
            img:false,//是否是图片组件
            datas:true,//是否需要数据支撑
            datastype:"default",//获取数据类型 default和api两种
            autodata:"关闭",
            datasetbeforecontent:"+", //数据样式的before是+还是-
            xAxiosbeforecontent:"+",
            yAxiosbeforecontent:"+",
            widgetdata:moduledatas,
            params:params,
            autodatatime:"10",
            apitypeselect:"POST",//默认显示post
            api:"",
            widgets:widgets,
            defaultdata:""
          },
          style:{
              "width":"500px",
              "height":"300px",
              "left":(e.clientX-100)/this.modules.radio+"px",
              "top":(e.clientY-130)/this.modules.radio+"px",
              "z-index":'1',
              "border":'1px dotted rgba(35,195,18,0)',
              "position":"absolute",
              "display":""
          }
        } /*data_end*/
        this.imgmodules.push(data);
        this.imgtype = "";
        this.$nextTick(()=>{
            var myChart = echarts.init(document.getElementById(data.id));
            data.chart = myChart;
            myChart.setOption(data.config.widgets,true);
            myChart.resize();
        })
      },
      //横向柱状图组件
      moduleHengxiangzhuzhuangtu(e){
        // JSON.parse(JSON.stringify 深度复制，防止之后新建的时候数据污染
        var moduledatas = JSON.parse(JSON.stringify(this.moduledata.state.hengxiangzhuzhuangtu.datas));
        var hengxiangzhuzhuangtu = JSON.parse(JSON.stringify(this.moduledata.state.hengxiangzhuzhuangtu))
        var params = {
          xAxis:hengxiangzhuzhuangtu.xAxis,
          yAxis:hengxiangzhuzhuangtu.yAxis,
          moduledatas:{
            x:hengxiangzhuzhuangtu.x,
            y:hengxiangzhuzhuangtu.y,
            label:hengxiangzhuzhuangtu.label,
            style:hengxiangzhuzhuangtu.style
          }
        }
        var widgets = moduledefault.Hengxiangzhuzhuangtu(params)
        var data = {
          id:(new Date()).valueOf(),
          type : "hengxiangzhuzhuangtu",
          selects:false,
          name:"横向柱状图",
          config:{
            imgsrc:"",
            chart:true, //是否是百度地图组件
            img:false,//是否是图片组件
            datas:true,//是否需要数据支撑
            datastype:"default",//获取数据类型 default和api两种
            autodata:"关闭",
            datasetbeforecontent:"+", //数据样式的before是+还是-
            xAxiosbeforecontent:"+",
            yAxiosbeforecontent:"+",
            widgetdata:moduledatas,
            params:params,
            autodatatime:"10",
            apitypeselect:"POST",//默认显示post
            api:"",
            widgets:widgets,
            defaultdata:""
          },
          style:{
              "width":"500px",
              "height":"300px",
              "left":(e.clientX-100)/this.modules.radio+"px",
              "top":(e.clientY-130)/this.modules.radio+"px",
              "z-index":'1',
              "border":'1px solid #104867',
              "position":"absolute",
              "display":""
          }
        } /*data_end*/
        this.imgmodules.push(data);
        this.imgtype = "";
        this.$nextTick(()=>{
            var myChart = echarts.init(document.getElementById(data.id));
            data.chart = myChart;
            myChart.setOption(data.config.widgets,true);
            myChart.resize();
        })
      },
      // 新增面积图组件
      moduleMianjitu(e){
        var moduledatas = JSON.parse(JSON.stringify(this.moduledata.state.mianjitu.datas));
        var mianjitu = JSON.parse(JSON.stringify(this.moduledata.state.mianjitu))
        var params = {
          xAxis:mianjitu.xAxis,
          yAxis:mianjitu.yAxis,
          moduledatas:{
            x:mianjitu.x,
            y:mianjitu.y,
            label:mianjitu.label,
            style:mianjitu.style
          }
        }
        var widgets = moduledefault.Mianjitu(params);
        var data = {
          id:(new Date()).valueOf(),
          type:"mianjitu",
          selects:false,
          name:"面积图",
          config:{
           imgsrc:"",
            chart:true, //是否是百度地图组件
            img:false,//是否是图片组件
            datas:true,//是否需要数据支撑
            datastype:"default",//获取数据类型 default和api两种
            autodata:"关闭",
            datasetbeforecontent:"+", //数据样式的before是+还是-
            xAxiosbeforecontent:"+",
            yAxiosbeforecontent:"+",
            widgetdata:moduledatas,
            params:params,
            autodatatime:"10",
            apitypeselect:"POST",//默认显示post
            api:"",
            widgets:widgets,
            defaultdata:""
          },
          style:{
              "width":"500px",
              "height":"300px",
              "left":(e.clientX-100)/this.modules.radio+"px",
              "top":(e.clientY-130)/this.modules.radio+"px",
              "z-index":'1',
              "border":'1px dotted rgba(35,195,18,0)',
              "position":"absolute",
              "display":""
          }
        } /*data_end*/
        this.imgmodules.push(data);
        this.imgtype = "";
        this.$nextTick(()=>{
            var myChart = echarts.init(document.getElementById(data.id));
            data.chart = myChart;
            var symbolSize = 20;
            var datas = [[15, 0], [-50, 10], [-56.5, 20], [-46.5, 30], [-22.1, 40]];
            myChart.setOption(data.config.widgets,true);
            myChart.resize();
        })  /*next_tick_end*/
      },
      // 新增折线图组件
      moduleZhexiantu(e){
        var moduledatas = JSON.parse(JSON.stringify(this.moduledata.state.zhexiantu.datas));
        var zhexiantu = JSON.parse(JSON.stringify(this.moduledata.state.zhexiantu))
        var params = {
          xAxis:zhexiantu.xAxis,
          yAxis:zhexiantu.yAxis,
          moduledatas:{
            x:zhexiantu.x,
            y:zhexiantu.y,
            label:zhexiantu.label,
            style:zhexiantu.style
          }
        }
        var widgets = moduledefault.Zhexiantu(params);
        var data = {
          id:(new Date()).valueOf(),
          type:"zhexiantu",
          selects:false,
          name:"折线图",
          config:{
           imgsrc:"",
            chart:true, //是否是百度地图组件
            img:false,//是否是图片组件
            datas:true,//是否需要数据支撑
            datastype:"default",//获取数据类型 default和api两种
            autodata:"关闭",
            datasetbeforecontent:"+", //数据样式的before是+还是-
            xAxiosbeforecontent:"+",
            yAxiosbeforecontent:"+",
            widgetdata:moduledatas,
            params:params,
            autodatatime:"10",
            apitypeselect:"POST",//默认显示post
            api:"",
            widgets:widgets,
            defaultdata:""
          },
          style:{
              "width":"500px",
              "height":"300px",
              "left":(e.clientX-100)/this.modules.radio+"px",
              "top":(e.clientY-130)/this.modules.radio+"px",
              "z-index":'1',
              "border":'1px dotted rgba(35,195,18,0)',
              "position":"absolute",
              "display":""
          }
        } /*data_end*/
        this.imgmodules.push(data);
        this.imgtype = "";
        this.$nextTick(()=>{
            var myChart = echarts.init(document.getElementById(data.id));
            data.chart = myChart;
            var symbolSize = 20;
            var datas = [[15, 0], [-50, 10], [-56.5, 20], [-46.5, 30], [-22.1, 40]];
            myChart.setOption(data.config.widgets,true);
            myChart.resize();
        })  /*next_tick_end*/
      },
      moduleTupian(e){
        var data = {
          id:(new Date()).valueOf(),
          type : "tupian",
          selects:false,
          name:"图片",
          config:{
            imgsrc:require("../../assets/imgs/13.png"),
            chart:false, //是否是百度地图组件
            img:true,//是否是图片组件
            datas:false,//是否需要数据支撑
            widgetdata:"",
            datastype:"default",//获取数据类型 default和api两种
            autodata:"关闭",
            autodatatime:"10",
            apitypeselect:"POST",//默认显示post
            api:"",
            widgets:{},
            defaultdata:""
          },
          style:{
              "width":"90px",
              "height":"90px",
              "left":(e.clientX-100)/this.modules.radio+"px",
              "top":(e.clientY-130)/this.modules.radio+"px",
              "z-index":'1',
              "border":'1px dotted rgba(35,195,18,0)',
              "position":"absolute",
              "display":""
          }
        } /*data_end*/
        this.imgmodules.push(data);
        this.imgtype = "";
      },
      // 表格
      moduleBiaoge(e) {
  const moduledatas = JSON.parse(JSON.stringify(this.moduledata.state.biaoge.datas));
  const biaoge = JSON.parse(JSON.stringify(this.moduledata.state.biaoge));

  const data = {
    id: Date.now(),
    type: 'biaoge',
    _columnsReady: false,
    datatype: 'topValues',
    selects: false,
    name: '表格',
    config: {
      imgsrc: '',
      chart: false,
      img: false,
      datas: true,
      widgetdata: moduledatas,
      datasetbeforecontent: '+',
      datastype: 'api',              // 和编辑页保持一致（如你的预览也走接口）
      autodata: '关闭',
      autodatatime: '10',
      apitypeselect: 'POST',
      api: '',
      widgets: {
        ...biaoge.config,
        headerStyle: (biaoge.config && biaoge.config.headerStyle) || DEFAULT_TABLE_HEADER_STYLE
      },
      defaultdata: '',
      width: []
    },
    style: {
      width: '500px',
      height: '250px',
      // —— 建议与编辑页保持同一定位公式（任选一种，别混用除法/加滚动量两套）——
      left: e.clientX - 100 + this.scrollLeft / this.modules.radio + 'px',
      top:  e.clientY - 90  + this.scrollTop  / this.modules.radio + 'px',
      'z-index': '1',
      border: '1px solid transparent',
      position: 'absolute',
      display: '',
      'border-radius': '0px',
      background: 'transparent'
    }
  };

  this.imgmodules.push(data);
  this.imgtype = '';
},

      moduleShuzitu(e){
        var moduledatas = JSON.parse(JSON.stringify(this.moduledata.state.shuzitu.datas));
        var shuzitu = JSON.parse(JSON.stringify(this.moduledata.state.shuzitu))
        var data = {
          id:(new Date()).valueOf(),
          type : "shuzitu",
          selects:false,
          name:"数字图",
          config:{
            imgsrc:"",
            chart:false, //是否是百度地图组件
            img:false,//是否是图片组件
            datas:true,//是否需要数据支撑
            widgetdata:moduledatas,
            datasetbeforecontent:"+", //数据样式的before是+还是-
            datastype:"api",//获取数据类型 default和api两种
            autodata:"关闭",
            autodatatime:"10",
            apitypeselect:"POST",//默认显示post
            api:"",
            widgets:shuzitu.config,
            defaultdata:""
          },
          style:{
              "width":"330px",
              "height":"65px",
              "left":(e.clientX-100)/this.modules.radio+"px",
              "top":(e.clientY-90)/this.modules.radio+"px",
              "z-index":'1',
              "border":'1px dotted rgba(35,195,18,0)',
              "position":"absolute",
              "display":""
          }
        } /*data_end*/
        this.imgmodules.push(data);
        this.imgtype = "";
      },
      // 单行文本
      moduleDanhangwenben(e){
        var moduledatas = JSON.parse(JSON.stringify(this.moduledata.state.danhangwenben.datas));
        var danhangwenben = JSON.parse(JSON.stringify(this.moduledata.state.danhangwenben))
        var data = {
          id:(new Date()).valueOf(),
          type : "danhangwenben",
          selects:false,
          name:"单行文本",
          config:{
            imgsrc:"http://leqcdn.shengdianshiji.com/datamax_default_14.png",
            chart:false, //是否是百度地图组件
            img:false,//是否是图片组件
            datas:true,//是否需要数据支撑
            widgetdata:moduledatas,
            datasetbeforecontent:"+", //数据样式的before是+还是-
            datastype:"default",//获取数据类型 default和api两种
            autodata:"关闭",
            autodatatime:"10",
            apitypeselect:"POST",//默认显示post
            api:"",
            widgets:danhangwenben.config,
            defaultdata:""
          },
          style:{
              "width":"200px",
              "height":"40px",
              "left":(e.clientX-100)/this.modules.radio+"px",
              "top":(e.clientY-90)/this.modules.radio+"px",
              "z-index":'1',
              "border":'1px dotted rgba(35,195,18,0)',
              "position":"absolute",
              "display":""
          }
        } /*data_end*/
        this.imgmodules.push(data);
        this.imgtype = "";
      },
      // 重新设置横向柱状图的样式
      reHengxiangzhuzhuangtu(j,id){
        for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            // 如果是静态数据
            if ((currentmodule.config.datas&&currentmodule.config.datastype=="default")||(currentmodule.config.datas&&currentmodule.config.datastype=="api"&&!currentmodule.config.api)) {
              var params = currentmodule.config.params;
              var widgets = moduledefault.Hengxiangzhuzhuangtu(params);
              currentmodule.config.widgets = widgets;
              this.$nextTick(() => {
                if (currentmodule.config.datas&&currentmodule.config.chart) {
                  if (currentmodule.chart) {
                    currentmodule.chart.clear()
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }else{
                    var myChart = echarts.init(document.getElementById(id));
                    currentmodule.chart = myChart;
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }
                }
              })
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    };
                    // var param ={
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}]),
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                      var params = currentmodule.config.params;
                      let result=res
                      let x=[],y=[],label=[],sortArray=[],unit=''
                      if(result&&result.length>0){
                        result.forEach((item,index)=>{
                          if(item.metricValues[0].unit==='kb/sec'){
                            item.metricValues[0].value=item.metricValues[0].value/1000
                          }
                          sortArray.push({argument:item.group.argument||item.group.label,value:item.metricValues[0].value})
                          if(index===0){
                            item.metricValues[0].metric.label=replace_disp_str(item.metricValues[0].metric.label)
                            label.push(item.metricValues[0].metric.label)
                            unit=replace_unit(item.metricValues[0])
                          }
                        })
                        sortArray.sort(ascCompare("value"))
                        sortArray.forEach((item,index)=>{
                          if((result[0].metricValues[0].metric.dpm && item.value !== null) || num_to_fixed(item.value,3)!=0){
                            y.push(item.argument)
                            x.push(result[0].metricValues[0].metric.dpm ? item.value : num_to_fixed(item.value,3))
                          }
                        })
                      }
                       params.moduledatas.x = [x]||[];
                       params.moduledatas.y = y||[];
                       params.moduledatas.label = label||[];
                       params.moduledatas.unit = unit||'';
                       var data = {
                        "x":params.moduledatas.x,
                        "y":params.moduledatas.y,
                        "label":params.moduledatas.label
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                       var widgets = moduledefault.Hengxiangzhuzhuangtu(params);
                       currentmodule.config.widgets = widgets;
                        this.$nextTick(() => {
                          if (currentmodule.config.datas&&currentmodule.config.chart) {
                            if (currentmodule.chart) {
                              currentmodule.chart.clear()
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                            }else{
                              var myChart = echarts.init(document.getElementById(id));
                              currentmodule.chart = myChart;
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                              currentmodule.chart.on('contextmenu', (param)=>{
                                let url=decodeURI(currentmodule.config.api)
                                let ip=url.substring(8,url.indexOf('/webservice'))
                                const numGroups=getQueryString(url,'numGroups')
                                let type=getQueryString(url,`groupType${numGroups}`)
                                // console.log('param',param)
                                this.menuShow(param,type,ip);
                              });
                            }
                          }
                        })
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        }
      },
      // 重新设置玫瑰图的样式，涉及到函数
      reMeiGuitu(j,id){
         for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            // 如果是静态数据
            if ((currentmodule.config.datas&&currentmodule.config.datastype=="default")||(currentmodule.config.datas&&currentmodule.config.datastype=="api"&&!currentmodule.config.api)) {
              var params = currentmodule.config.params;
              params.moduledatas.dpmComposition = false;
              params.moduledatas.dpmStackSingle = false;
              var widgets = moduledefault.Meiguitu(params);
              currentmodule.config.widgets = widgets;
              this.$nextTick(() => {
                if (currentmodule.config.datas&&currentmodule.config.chart) {
                  if (currentmodule.chart) {
                    currentmodule.chart.clear()
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }else{
                    var myChart = echarts.init(document.getElementById(id));
                    currentmodule.chart = myChart;
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }
                }
              })
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    };
                    // var param ={
                    //   // url: currentmodule.config.api,
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}]),
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                      var params = currentmodule.config.params;
                      let x=[],y=[],unit='',label=''
                      let result=res
                      if(result&&result.length>0){
                        for(var i=0;i<result.length;i++){
                          if(result[i].metricValues[0].unit==='kb/sec'){
                            result[i].metricValues[0].value=result[i].metricValues[0].value/1000
                          }
                          if((result[i].metricValues[0].metric.dpm && result[i].metricValues[0].value !== null) || (result[i].metricValues[0].metric.dpm ? result[i].metricValues[0].value : num_to_fixed(result[i].metricValues[0].value, 3)) != 0){
                            x.push(result[i].group.argument||result[i].group.label)
                            y.push((result[i].metricValues[0].metric.dpm ? result[i].metricValues[0].value : num_to_fixed(result[i].metricValues[0].value, 3)))
                          }
                          // if(i==0){
                          //   unit=replace_unit(result[0].metricValues[0])
                          //   label=replace_disp_str(result[0].metricValues[0].metric.label)
                          // }
                        }
                        let groupType1=getQueryString(newUrl,'groupType1')
                        if (groupType1 !== 'lao_pestat' && groupType1 !== 'lao_tjnodes' && groupType1 !== 'lao_tjstorage' && groupType1 !== 'lao_tjusages'&& groupType1 !== 'pestat_data'&& groupType1 !== 'squeue_data'&& groupType1 !== 'pestat_nodefx') {
                          unit = replace_unit(result[0].metricValues[0]);
                          label = replace_disp_str(
                            result[0].metricValues[0].metric.label
                          );
                        }
                      }
                       params.label = label;
                       params.moduledatas.x = x;
                       params.moduledatas.y = y;
                       params.moduledatas.label = [];
                       params.moduledatas.unit = unit;
                       params.color=params.color.length>x.length?params.color.slice(0,x.length):params.color
                       params.style.color=params.style.color.length>x.length?params.style.color.slice(0,x.length):params.style.color
                       var data = {
                        "x":params.moduledatas.x,
                        "y":params.moduledatas.y,
                        "label":params.moduledatas.label
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                       var widgets = moduledefault.Meiguitu(params);
                       currentmodule.config.widgets = widgets;
                        this.$nextTick(() => {
                          if (currentmodule.config.datas&&currentmodule.config.chart) {
                            if (currentmodule.chart) {
                              currentmodule.chart.clear()
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                            }else{
                              var myChart = echarts.init(document.getElementById(id));
                              currentmodule.chart = myChart;
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                              currentmodule.chart.on('contextmenu', (param)=>{
                                let url=decodeURI(currentmodule.config.api)
                                let ip=url.substring(8,url.indexOf('/webservice'))
                                const numGroups=getQueryString(url,'numGroups')
                                let type=getQueryString(url,`groupType${numGroups}`)
                                this.menuShow(param,type,ip);
                              });
                            }
                          }
                        })
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        } //for_end
      },
       // 重新设置饼图的样式，涉及到函数
      reBingtu(j,id){
         for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            // 如果是静态数据
            if ((currentmodule.config.datas&&currentmodule.config.datastype=="default")||(currentmodule.config.datas&&currentmodule.config.datastype=="api"&&!currentmodule.config.api)) {
              var params = currentmodule.config.params;
              params.moduledatas.dpmComposition = false;
              params.moduledatas.dpmStackSingle = false;
              var widgets = moduledefault.Bingtu(params);
              currentmodule.config.widgets = widgets;
              this.$nextTick(() => {
                if (currentmodule.config.datas&&currentmodule.config.chart) {
                  if (currentmodule.chart) {
                    currentmodule.chart.clear()
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }else{
                    var myChart = echarts.init(document.getElementById(id));
                    currentmodule.chart = myChart;
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }
                }
              })
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    };
                    // var param ={
                    //   // url: currentmodule.config.api,
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}]),
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                      var params = currentmodule.config.params;
                      let x=[],y=[],unit='',label=''
                      let result=res
                      if(result&&result.length>0){
                        for(var i=0;i<result.length;i++){
                          if(result[0].metricValues[0].unit==='kb/sec'){
                            result[i].metricValues[0].value=result[i].metricValues[0].value/1000
                          }
                          if((result[i].metricValues[0].metric.dpm && result[i].metricValues[0].value !== null) || (result[i].metricValues[0].metric.dpm ? result[i].metricValues[0].value : num_to_fixed(result[i].metricValues[0].value, 3)) != 0){
                            x.push(result[i].group.argument||result[i].group.label)
                            y.push((result[i].metricValues[0].metric.dpm ? result[i].metricValues[0].value : num_to_fixed(result[i].metricValues[0].value, 3)))
                          }
                          // if(i==0){
                          //   unit=replace_unit(result[0].metricValues[0])
                          //   label=replace_disp_str(result[0].metricValues[0].metric.label)
                          // }
                        }
                        let groupType1=getQueryString(newUrl,'groupType1')
                        if (groupType1 !== 'lao_pestat' && groupType1 !== 'lao_tjnodes' && groupType1 !== 'lao_tjstorage' && groupType1 !== 'lao_tjusages'&& groupType1 !== 'pestat_data'&& groupType1 !== 'squeue_data'&& groupType1 !== 'pestat_nodefx') {
                          unit = replace_unit(result[0].metricValues[0]);
                          label = replace_disp_str(
                            result[0].metricValues[0].metric.label
                          );
                        }
                      }
                       params.label = label;
                       params.moduledatas.x = x;
                       params.moduledatas.y = y;
                       params.moduledatas.label = [];
                       params.moduledatas.unit = unit;
                       params.color=params.color.length>x.length?params.color.slice(0,x.length):params.color
                       params.style.color=params.style.color.length>x.length?params.style.color.slice(0,x.length):params.style.color
                       var data = {
                        "x":params.moduledatas.x,
                        "y":params.moduledatas.y,
                        "label":params.moduledatas.label
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                       var widgets = moduledefault.Bingtu(params);
                       currentmodule.config.widgets = widgets;
                        this.$nextTick(() => {
                          if (currentmodule.config.datas&&currentmodule.config.chart) {
                            if (currentmodule.chart) {
                              currentmodule.chart.clear()
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                            }else{
                              var myChart = echarts.init(document.getElementById(id));
                              currentmodule.chart = myChart;
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                              currentmodule.chart.on('contextmenu', (param)=>{
                                let url=decodeURI(currentmodule.config.api)
                                let ip=url.substring(8,url.indexOf('/webservice'))
                                const numGroups=getQueryString(url,'numGroups')
                                let type=getQueryString(url,`groupType${numGroups}`)
                                this.menuShow(param,type,ip);
                              });
                            }
                          }
                        })
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        } //for_end
      },
      // 重新设置饼图的样式，涉及到函数
      reShixinbingtu(j,id){
         for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            // 如果是静态数据
            if ((currentmodule.config.datas&&currentmodule.config.datastype=="default")||(currentmodule.config.datas&&currentmodule.config.datastype=="api"&&!currentmodule.config.api)) {
              var params = currentmodule.config.params;
              params.moduledatas.dpmComposition = false;
              params.moduledatas.dpmStackSingle = false;
              var widgets = moduledefault.Shixinbingtu(params);
              currentmodule.config.widgets = widgets;
              this.$nextTick(() => {
                if (currentmodule.config.datas&&currentmodule.config.chart) {
                  if (currentmodule.chart) {
                    currentmodule.chart.clear()
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }else{
                    var myChart = echarts.init(document.getElementById(id));
                    currentmodule.chart = myChart;
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }
                }
              })
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    };
                    // var param ={
                    //   // url: currentmodule.config.api,
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}]),
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                      var params = currentmodule.config.params;
                      let x=[],y=[],unit='',label=''
                      let result=res
                      if(result&&result.length>0){
                        for(var i=0;i<result.length;i++){
                          if(result[i].metricValues[0].unit==='kb/sec'){
                            result[i].metricValues[0].value=result[i].metricValues[0].value/1000
                          }
                          if((result[i].metricValues[0].metric.dpm && result[i].metricValues[0].value !== null) || (result[i].metricValues[0].metric.dpm ? result[i].metricValues[0].value : num_to_fixed(result[i].metricValues[0].value, 3)) != 0){
                            x.push(result[i].group.argument||result[i].group.label)
                            y.push((result[i].metricValues[0].metric.dpm ? result[i].metricValues[0].value : num_to_fixed(result[i].metricValues[0].value, 3)))
                          }
                          // if(i==0){
                          //   unit=replace_unit(result[0].metricValues[0])
                          //   label=replace_disp_str(result[0].metricValues[0].metric.label)
                          // }
                        }
                        let groupType1=getQueryString(newUrl,'groupType1')
                        if (groupType1 !== 'lao_pestat' && groupType1 !== 'lao_tjnodes' && groupType1 !== 'lao_tjstorage' && groupType1 !== 'lao_tjusages'&& groupType1 !== 'pestat_data'&& groupType1 !== 'squeue_data'&& groupType1 !== 'pestat_nodefx') {
                          unit = replace_unit(result[0].metricValues[0]);
                          label = replace_disp_str(
                            result[0].metricValues[0].metric.label
                          );
                        }
                      }                      
                       params.label = label;
                       params.moduledatas.x = x;
                       params.moduledatas.y = y;
                       params.moduledatas.label = [];
                       params.moduledatas.unit = unit;
                       params.color=params.color.length>x.length?params.color.slice(0,x.length):params.color
                       params.style.color=params.style.color.length>x.length?params.style.color.slice(0,x.length):params.style.color
                       var data = {
                        "x":params.moduledatas.x,
                        "y":params.moduledatas.y,
                        "label":params.moduledatas.label
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                       var widgets = moduledefault.Shixinbingtu(params);
                       currentmodule.config.widgets = widgets;
                        this.$nextTick(() => {
                          if (currentmodule.config.datas&&currentmodule.config.chart) {
                            if (currentmodule.chart) {
                              currentmodule.chart.clear()
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                            }else{
                              var myChart = echarts.init(document.getElementById(id));
                              currentmodule.chart = myChart;
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                              currentmodule.chart.on('contextmenu', (param)=>{
                                let url=decodeURI(currentmodule.config.api)
                                let ip=url.substring(8,url.indexOf('/webservice'))
                                const numGroups=getQueryString(url,'numGroups')
                                let type=getQueryString(url,`groupType${numGroups}`)
                                this.menuShow(param,type,ip);
                              });
                            }
                          }
                        })
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        } //for_end
      },
      timeToSeconds(timeStr) {
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parseInt(parts[2]);
        return hours * 3600+ minutes * 60+ seconds;
      },

      
      reBiaoge(j, id) {
 const runtimeItem = this.imgmodules.find(item => item.id == id);
 if (isDpmRuntimeTable(runtimeItem)) { refreshDpmRuntimeTable(this, runtimeItem); return; }

  console.log("biao====")
  for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            this.$nextTick(()=>{
              $('#'+currentmodule.id+' .el-table th.el-table__cell.is-leaf').css("borderBottom",currentmodule.style.border)
              $('#'+currentmodule.id+' .el-table td.el-table__cell').css("borderBottom",currentmodule.style.border)
              $('#'+currentmodule.id+' .el-table.el-table--border .el-table__cell').css("borderRight",currentmodule.style.border)
              $('#'+currentmodule.id+' .el-table.el-table--border').css("border",currentmodule.style.border)
            })
            // 如果是静态数据
            if (currentmodule.config.datas&&currentmodule.config.datastype=="default") {
              // var widgets = currentmodule.config.widgets;
              // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){

                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    };

                    
                    // var param ={
                    //   // url: currentmodule.config.api,
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}]),
                    // }
                    currentmodule.config.widgets.y=[];

                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                      var widgets = currentmodule.config.widgets;
                      // let type=getQueryString(currentmodule.config.api,'groupType1')
                      const numGroups=getQueryString(currentmodule.config.api,'numGroups')
                      let type=getQueryString(currentmodule.config.api,`groupType${numGroups}`)
                      let x=[],y=[]
                      let result=res
                      if(result&&result.length>0){
                        x.push({})
                        this.$set(x[0],'key',result[0].group.label=='Unknown'?'名称':(result[0].group.label=='已知应用'||result[0].group.label=='未知应用')?'应用':result[0].group.label)
                        for(var i=0;i<result[0].metricValues.length;i++){
                          result[0].metricValues[i].metric.label = replace_disp_str2(
                            result[0].metricValues[i].metric.label
                          );
                          x.push({key:replace_unit(result[0].metricValues[i]) ? result[0].metricValues[i].metric.label + "[" + replace_unit(result[0].metricValues[i]) + "]" : result[0].metricValues[i].metric.label,value:result[0].metricValues[i].metric.id})
                        }
                        for(var i=0;i<result.length;i++){

                          for(var j=0;j<result[i].metricValues.length;j++){
                            if(j==0){
                              y.push({'key0':result[i].group.argument||result[i].group.label})
                            }
                            // 20241022修改
                            if (result[i].metricValues[j].unit && result[i].metricValues[j].value !== null && !result[i].metricValues[j].metric.dpm) {
                              if(result[i].metricValues[j].unit==='kb/sec'){
                                result[i].metricValues[j].value=(num_to_fixed(result[i].metricValues[j].value/1000,3))
                              }else if(result[i].metricValues[j].unit==='msec'){
                                // result[i].metricValues[j].value=(num_to_fixed(result[i].metricValues[j].value/1000,4))
                                result[i].metricValues[j].value=(num_to_fixed(result[i].metricValues[j].value,4))
                              }else{
                                result[i].metricValues[j].value=(num_to_fixed(result[i].metricValues[j].value,3))
                              }
                            }
                            
                            // 阈值
                            if(currentmodule.config.threshold && canEvaluateThreshold(result[i].metricValues[j])){
                              let item=currentmodule.config.threshold.find((item)=>{return item.category===result[0].metricValues[j].metric.id})
                              
                              //console.log('itemitemitem',item)
                              let metricItemValue=""
                              if(result[i].metricValues[j].metric.id === "cpu_time"){
                                metricItemValue = this.timeToSeconds(result[i].metricValues[j].value)
                                console.log('result[i].metricValues[j].value',result[i].metricValues[j].value)
                              }else{
                                metricItemValue = result[i].metricValues[j].value
                              }

                              if(item){
                                y[i]['bg'+(j+1)]=''
                                item.Minor?item.Minor=parseFloat(item.Minor):item.Minor=''
                                item.Major?item.Major=parseFloat(item.Major):item.Major=''
                                item.Critical?item.Critical=parseFloat(item.Critical):item.Critical=''
                                if(item.Minor&&item.Major&&item.Critical){
                                  if(item.symbol==='>'||item.symbol==='>='){
                                    if( metricItemValue>item.Minor&& metricItemValue<item.Major){
                                      y[i]['bg'+(j+1)]='Minor'
                                    }else if( metricItemValue>item.Major&& metricItemValue<item.Critical){
                                      y[i]['bg'+(j+1)]='Major'
                                    }else if( metricItemValue>item.Critical){
                                      y[i]['bg'+(j+1)]='Critical'
                                    }
                                  }else{
                                    if( metricItemValue<item.Minor&& metricItemValue>item.Major){
                                      y[i]['bg'+(j+1)]='Minor'
                                    }else if( metricItemValue<item.Major&& metricItemValue>item.Critical){
                                      y[i]['bg'+(j+1)]='Major'
                                    }else if( metricItemValue<item.Critical){
                                      y[i]['bg'+(j+1)]='Critical'
                                    }
                                  }
                                }else if(item.Minor&&item.Major&&!item.Critical){
                                  if(item.symbol==='>'||item.symbol==='>='){
                                    if( metricItemValue>item.Minor&& metricItemValue<item.Major){
                                      y[i]['bg'+(j+1)]='Minor'
                                    }else if(metricItemValue>item.Major){
                                      y[i]['bg'+(j+1)]='Major'
                                    }
                                  }else{
                                    if( metricItemValue<item.Minor&& metricItemValue>item.Major){
                                      y[i]['bg'+(j+1)]='Minor'
                                    }else if(metricItemValue<item.Major){
                                      y[i]['bg'+(j+1)]='Major'
                                    }
                                  }
                                }else if(item.Minor&&!item.Major&&item.Critical){
                                  if(item.symbol==='>'||item.symbol==='>='){
                                    if( metricItemValue>item.Minor&& metricItemValue<item.Critical){
                                      y[i]['bg'+(j+1)]='Minor'
                                    }else if(metricItemValue>item.Critical){
                                      y[i]['bg'+(j+1)]='Critical'
                                    }
                                  }else{
                                    if( metricItemValue<item.Minor&& metricItemValue>item.Critical){
                                      y[i]['bg'+(j+1)]='Minor'
                                    }else if(metricItemValue<item.Critical){
                                      y[i]['bg'+(j+1)]='Critical'
                                    }
                                  }
                                  
                                }else if(!item.Minor&&item.Major&&item.Critical){
                                  if(item.symbol==='>'||item.symbol==='>='){
                                    if( metricItemValue>item.Major&& metricItemValue<item.Critical){
                                      y[i]['bg'+(j+1)]='Major'
                                    }else if(metricItemValue>item.Critical){
                                      y[i]['bg'+(j+1)]='Critical'
                                    }
                                  }else{
                                    if( metricItemValue<item.Major&& metricItemValue>item.Critical){
                                      y[i]['bg'+(j+1)]='Major'
                                    }else if(metricItemValue<item.Critical){
                                      y[i]['bg'+(j+1)]='Critical'
                                    }
                                  }
                                  
                                }else if(item.Minor&&!item.Major&&!item.Critical){
                                  if(item.symbol==='>'||item.symbol==='>='){
                                    if(metricItemValue>item.Minor){
                                      y[i]['bg'+(j+1)]='Minor'
                                    }
                                  }else{
                                    if(metricItemValue<item.Minor){
                                      y[i]['bg'+(j+1)]='Minor'
                                    }
                                  }
                                  
                                }else if(!item.Minor&&item.Major&&!item.Critical){
                                  if(item.symbol==='>'||item.symbol==='>='){
                                    if(metricItemValue>item.Major){
                                      y[i]['bg'+(j+1)]='Major'
                                    }
                                  }else{
                                    if(metricItemValue<item.Major){
                                      y[i]['bg'+(j+1)]='Major'
                                    }
                                  }
                                  
                                }else if(!item.Minor&&!item.Major&&item.Critical){
                                  if(item.symbol==='>'||item.symbol==='>='){
                                    if(metricItemValue>item.Critical){
                                      y[i]['bg'+(j+1)]='Critical'
                                    }
                                  }else{
                                    if(metricItemValue<item.Critical){
                                      y[i]['bg'+(j+1)]='Critical'
                                    }
                                  }
                                  
                                }
                              }
                            }
                            // y[i]['key'+(j+1)]=Number(result[i].metricValues[j].value)
                            y[i]["key" + (j + 1)] = result[i].metricValues[j].value
                            y[i].type=type
                          }
                        }
                      }
                      
                      widgets.x = x||[];
                      widgets.y = y||[];
                       var data = {
                        "x":widgets.x,
                        "y":widgets.y
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                       this.$nextTick(()=>{
                        $('#'+currentmodule.id+' .el-table th.el-table__cell.is-leaf').css("borderBottom",currentmodule.style.border)
                        $('#'+currentmodule.id+' .el-table td.el-table__cell').css("borderBottom",currentmodule.style.border)
                        $('#'+currentmodule.id+' .el-table.el-table--border .el-table__cell').css("borderRight",currentmodule.style.border)
                        $('#'+currentmodule.id+' .el-table.el-table--border').css("border",currentmodule.style.border)
                      })
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        } //for_end
      },




      formatter1(text){
          return text.toFixed(3)
      },
      formatter2(text){
          return text.toFixed(0)
      },
      reShuzitu(j,id){
        for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            // 如果是静态数据
            if (currentmodule.config.datas&&currentmodule.config.datastype=="default") {
              // var widgets = currentmodule.config.widgets;
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    };
                    // var param ={
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                      var widgets = currentmodule.config.widgets;
                      let text='',unit=''
                      let result=res
                      if(result&&result.length>0){
                        result.forEach((item,index)=>{
                          if(item.metricValues[0].unit==='kb/sec'){
                            item.metricValues[0].value=item.metricValues[0].value/1000
                          }
                          text=(num_to_fixed(item.metricValues[0].value,3))
                          unit=replace_unit(item.metricValues[0])
                        })
                        this.$refs[id][0].start()
                        if(currentmodule.config.threshold){
                          currentmodule.config.threshold[0].Minor?currentmodule.config.threshold[0].Minor=parseFloat(currentmodule.config.threshold[0].Minor):currentmodule.config.threshold[0].Minor=''
                          currentmodule.config.threshold[0].Major?currentmodule.config.threshold[0].Major=parseFloat(currentmodule.config.threshold[0].Major):currentmodule.config.threshold[0].Major=''
                          currentmodule.config.threshold[0].Critical?currentmodule.config.threshold[0].Critical=parseFloat(currentmodule.config.threshold[0].Critical):currentmodule.config.threshold[0].Critical=''
                          if(currentmodule.config.threshold[0].Minor&&currentmodule.config.threshold[0].Major&&currentmodule.config.threshold[0].Critical){
                            // currentmodule.config.widgets.style.color='#ffffff'
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(text>currentmodule.config.threshold[0].Minor&&text<currentmodule.config.threshold[0].Major){
                                currentmodule.config.widgets.style.color='#ffff00'
                              }else if(text>currentmodule.config.threshold[0].Major&&text<currentmodule.config.threshold[0].Critical){
                                  currentmodule.config.widgets.style.color='#ff9900'
                              }else if(text>currentmodule.config.threshold[0].Critical){
                                  currentmodule.config.widgets.style.color='#ff0000'
                              }
                            }else{
                              if(text<currentmodule.config.threshold[0].Minor&&text>currentmodule.config.threshold[0].Major){
                                currentmodule.config.widgets.style.color='#ffff00'
                              }else if(text<currentmodule.config.threshold[0].Major&&text>currentmodule.config.threshold[0].Critical){
                                  currentmodule.config.widgets.style.color='#ff9900'
                              }else if(text<currentmodule.config.threshold[0].Critical){
                                  currentmodule.config.widgets.style.color='#ff0000'
                              }
                            }
                            
                          }else if(currentmodule.config.threshold[0].Minor&&currentmodule.config.threshold[0].Major&&!currentmodule.config.threshold[0].Critical){
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(text>currentmodule.config.threshold[0].Minor&&text<currentmodule.config.threshold[0].Major){
                                currentmodule.config.widgets.style.color='#ffff00'
                              }else if(text>currentmodule.config.threshold[0].Major){
                                currentmodule.config.widgets.style.color='#ff9900'
                              }
                            }else{
                              if(text<currentmodule.config.threshold[0].Minor&&text>currentmodule.config.threshold[0].Major){
                                currentmodule.config.widgets.style.color='#ffff00'
                              }else if(text<currentmodule.config.threshold[0].Major){
                                currentmodule.config.widgets.style.color='#ff9900'
                              }
                            }
                          }else if(currentmodule.config.threshold[0].Minor&&!currentmodule.config.threshold[0].Major&&currentmodule.config.threshold[0].Critical){
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(text>currentmodule.config.threshold[0].Minor&&text<currentmodule.config.threshold[0].Critical){
                                currentmodule.config.widgets.style.color='#ffff00'
                              }else if(text>currentmodule.config.threshold[0].Critical){
                                currentmodule.config.widgets.style.color='#ff0000'
                              }
                            }else{
                              if(text<currentmodule.config.threshold[0].Minor&&text>currentmodule.config.threshold[0].Critical){
                                currentmodule.config.widgets.style.color='#ffff00'
                              }else if(text<currentmodule.config.threshold[0].Critical){
                                currentmodule.config.widgets.style.color='#ff0000'
                              }
                            }
                            
                          }else if(!currentmodule.config.threshold[0].Minor&&currentmodule.config.threshold[0].Major&&currentmodule.config.threshold[0].Critical){
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(text>currentmodule.config.threshold[0].Major&&text<currentmodule.config.threshold[0].Critical){
                                currentmodule.config.widgets.style.color='#ff9900'
                              }else if(text>currentmodule.config.threshold[0].Critical){
                                currentmodule.config.widgets.style.color='#ff0000'
                              }
                            }else{
                              if(text<currentmodule.config.threshold[0].Major&&text>currentmodule.config.threshold[0].Critical){
                                currentmodule.config.widgets.style.color='#ff9900'
                              }else if(text<currentmodule.config.threshold[0].Critical){
                                currentmodule.config.widgets.style.color='#ff0000'
                              }
                            }
                            
                          }else if(currentmodule.config.threshold[0].Minor&&!currentmodule.config.threshold[0].Major&&!currentmodule.config.threshold[0].Critical){
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(text>currentmodule.config.threshold[0].Minor){
                                currentmodule.config.widgets.style.color='#ffff00'
                              }
                            }else{
                              if(text<currentmodule.config.threshold[0].Minor){
                                currentmodule.config.widgets.style.color='#ffff00'
                              }
                            }
                            
                          }else if(!currentmodule.config.threshold[0].Minor&&currentmodule.config.threshold[0].Major&&!currentmodule.config.threshold[0].Critical){
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(text>currentmodule.config.threshold[0].Major){
                                currentmodule.config.widgets.style.color='#ff9900'
                              }
                            }else{
                              if(text<currentmodule.config.threshold[0].Major){
                                currentmodule.config.widgets.style.color='#ff9900'
                              }
                            }
                            
                          }else if(!currentmodule.config.threshold[0].Minor&&!currentmodule.config.threshold[0].Major&&currentmodule.config.threshold[0].Critical){
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(text>currentmodule.config.threshold[0].Critical){
                                currentmodule.config.widgets.style.color='#ff0000'
                              }
                            }else{
                              if(text<currentmodule.config.threshold[0].Critical){
                                currentmodule.config.widgets.style.color='#ff0000'
                              }
                            }
                          }
                        }
                      }
                        widgets.text = text.toString()||"";
                        widgets.unit = unit||"";
                       var data = {
                        "text":widgets.text,
                        "unit":widgets.unit
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        } //for_end
      },
      reDanhangwenben(j,id){
        for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            // 如果是静态数据
            if (currentmodule.config.datas&&currentmodule.config.datastype=="default") {
              // var widgets = currentmodule.config.widgets;
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    };
                    // var param ={
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                       var widgets = currentmodule.config.widgets;
                      let text=''
                      res.forEach((item,index)=>{
                        text=item.metricValues[0].value
                      })
                      widgets.text = text||"";
                       var data = {
                        "text":widgets.text
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        } //for_end
      },
      reJinduhuantu(j,id){
        for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            // 如果是静态数据
            if ((currentmodule.config.datas&&currentmodule.config.datastype=="default")||(currentmodule.config.datas&&currentmodule.config.datastype=="api"&&!currentmodule.config.api)) {
              var params = currentmodule.config.params;
              params.dpm = false;
              var widgets = moduledefault.Jinduhuantu(params);
              currentmodule.config.widgets = widgets;
              this.$nextTick(() => {
                if (currentmodule.config.datas&&currentmodule.config.chart) {
                  if (currentmodule.chart) {
                    currentmodule.chart.clear()
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }else{
                    var myChart = echarts.init(document.getElementById(id));
                    currentmodule.chart = myChart;
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }
                }
              })
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    };
                    // var param ={
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}]),
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                      var params = currentmodule.config.params;
                      let value='',name=''
                      let result=res
                      if(result&&result.length>0){
                        result.forEach((item,index)=>{
                          if(item.metricValues[0].unit==='kb/sec'){
                            item.metricValues[0].value=item.metricValues[0].value/1000
                          }
                          if(currentmodule.config.numtype==='负向' && !item.metricValues[0].metric.dpm){
                            value=(100-Number(num_to_fixed(item.metricValues[0].value,2)))
                          }else{
                            value=(Number(num_to_fixed(item.metricValues[0].value,2)))
                          }
                          name=replace_disp_str(item.metricValues[0].metric.label)
                        })
                        if(currentmodule.config.threshold){
                          currentmodule.config.threshold[0].Minor?currentmodule.config.threshold[0].Minor=parseFloat(currentmodule.config.threshold[0].Minor):currentmodule.config.threshold[0].Minor=''
                          currentmodule.config.threshold[0].Major?currentmodule.config.threshold[0].Major=parseFloat(currentmodule.config.threshold[0].Major):currentmodule.config.threshold[0].Major=''
                          currentmodule.config.threshold[0].Critical?currentmodule.config.threshold[0].Critical=parseFloat(currentmodule.config.threshold[0].Critical):currentmodule.config.threshold[0].Critical=''
                          if(currentmodule.config.threshold[0].Minor&&currentmodule.config.threshold[0].Major&&currentmodule.config.threshold[0].Critical){
                            params.color[0]='#ffffff'
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(value>currentmodule.config.threshold[0].Minor&&value<currentmodule.config.threshold[0].Major){
                                params.color[0]='#ffff00'
                              }else if(value>currentmodule.config.threshold[0].Major&&value<currentmodule.config.threshold[0].Critical){
                                  params.color[0]='#ff9900'
                              }else if(value>currentmodule.config.threshold[0].Critical){
                                  params.color[0]='#ff0000'
                              }
                            }else{
                              if(value<currentmodule.config.threshold[0].Minor&&value>currentmodule.config.threshold[0].Major){
                                params.color[0]='#ffff00'
                              }else if(value<currentmodule.config.threshold[0].Major&&value>currentmodule.config.threshold[0].Critical){
                                  params.color[0]='#ff9900'
                              }else if(value<currentmodule.config.threshold[0].Critical){
                                  params.color[0]='#ff0000'
                              }
                            }
                            
                          }else if(currentmodule.config.threshold[0].Minor&&currentmodule.config.threshold[0].Major&&!currentmodule.config.threshold[0].Critical){
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(value>currentmodule.config.threshold[0].Minor&&value<currentmodule.config.threshold[0].Major){
                                params.color[0]='#ffff00'
                              }else if(value>currentmodule.config.threshold[0].Major){
                                params.color[0]='#ff9900'
                              }
                            }else{
                              if(value<currentmodule.config.threshold[0].Minor&&value>currentmodule.config.threshold[0].Major){
                                params.color[0]='#ffff00'
                              }else if(value<currentmodule.config.threshold[0].Major){
                                params.color[0]='#ff9900'
                              }
                            }
                            
                          }else if(currentmodule.config.threshold[0].Minor&&!currentmodule.config.threshold[0].Major&&currentmodule.config.threshold[0].Critical){
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(value>currentmodule.config.threshold[0].Minor&&value<currentmodule.config.threshold[0].Critical){
                                params.color[0]='#ffff00'
                              }else if(value>currentmodule.config.threshold[0].Critical){
                                params.color[0]='#ff0000'
                              }
                            }else{
                              if(value<currentmodule.config.threshold[0].Minor&&value>currentmodule.config.threshold[0].Critical){
                                params.color[0]='#ffff00'
                              }else if(value<currentmodule.config.threshold[0].Critical){
                                params.color[0]='#ff0000'
                              }
                            }
                            
                          }else if(!currentmodule.config.threshold[0].Minor&&currentmodule.config.threshold[0].Major&&currentmodule.config.threshold[0].Critical){
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(value>currentmodule.config.threshold[0].Major&&value<currentmodule.config.threshold[0].Critical){
                                params.color[0]='#ff9900'
                              }else if(value>currentmodule.config.threshold[0].Critical){
                                params.color[0]='#ff0000'
                              }
                            }else{
                              if(value<currentmodule.config.threshold[0].Major&&value>currentmodule.config.threshold[0].Critical){
                                params.color[0]='#ff9900'
                              }else if(value<currentmodule.config.threshold[0].Critical){
                                params.color[0]='#ff0000'
                              }
                            }
                            
                          }else if(currentmodule.config.threshold[0].Minor&&!currentmodule.config.threshold[0].Major&&!currentmodule.config.threshold[0].Critical){
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(value>currentmodule.config.threshold[0].Minor){
                                params.color[0]='#ffff00'
                              }
                            }else{
                              if(value<currentmodule.config.threshold[0].Minor){
                                params.color[0]='#ffff00'
                              }
                            }
                            
                          }else if(!currentmodule.config.threshold[0].Minor&&currentmodule.config.threshold[0].Major&&!currentmodule.config.threshold[0].Critical){
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(value>currentmodule.config.threshold[0].Major){
                                params.color[0]='#ff9900'
                              }
                            }else{
                              if(value<currentmodule.config.threshold[0].Major){
                                params.color[0]='#ff9900'
                              }
                            }
                            
                          }else if(!currentmodule.config.threshold[0].Minor&&!currentmodule.config.threshold[0].Major&&currentmodule.config.threshold[0].Critical){
                            if(currentmodule.config.threshold[0].symbol==='>'||currentmodule.config.threshold[0].symbol==='>='){
                              if(value>currentmodule.config.threshold[0].Critical){
                                params.color[0]='#ff0000'
                              }
                            }else{
                              if(value<currentmodule.config.threshold[0].Critical){
                                params.color[0]='#ff0000'
                              }
                            }
                          }
                        }
                      }
                      
                       params.value =value||"0";
                       params.name = name||"百分比";
                       setDpmScalar(params, result, currentmodule.config.api);
                       var data = {
                        "value":params.value,
                        "name":params.name
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                       var widgets = moduledefault.Jinduhuantu(params);
                       currentmodule.config.widgets = widgets;
                       this.$nextTick(() => {
                          if (currentmodule.config.datas&&currentmodule.config.chart) {
                            if (currentmodule.chart) {
                              currentmodule.chart.clear()
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                            }else{
                              var myChart = echarts.init(document.getElementById(id));
                              currentmodule.chart = myChart;
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                              currentmodule.chart.on('contextmenu', (param)=>{
                                let url=decodeURI(currentmodule.config.api)
                                let ip=url.substring(8,url.indexOf('/webservice'))
                                const numGroups=getQueryString(url,'numGroups')
                                let type=getQueryString(url,`groupType${numGroups}`)
                                let groupArgument1=getQueryString(url,'groupArgument1')
                                this.menuShow(param,type,ip,'jinduhuantu',groupArgument1);
                              });
                            }
                          }
                        })
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        } //for_end
      },
      // 重新设置仪表盘
      reYibiaopan(j,id){
        for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            // 如果是静态数据
            if ((currentmodule.config.datas&&currentmodule.config.datastype=="default")||(currentmodule.config.datas&&currentmodule.config.datastype=="api"&&!currentmodule.config.api)) {
              var params = currentmodule.config.params;
              params.dpm = false;
              var widgets = moduledefault.Yibiaopan(params);
              currentmodule.config.widgets = widgets;
              this.$nextTick(() => {
                if (currentmodule.config.datas&&currentmodule.config.chart) {
                  if (currentmodule.chart) {
                    currentmodule.chart.clear()
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }else{
                    var myChart = echarts.init(document.getElementById(id));
                    currentmodule.chart = myChart;
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }
                }
              })
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    };
                    // var param ={
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}]),
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                       var params = currentmodule.config.params;
                      let value='',name=''
                      let result=res
                      if(result&&result.length>0){
                        result.forEach((item,index)=>{
                          if(item.metricValues[0].unit==='kb/sec'){
                            item.metricValues[0].value=item.metricValues[0].value/1000
                          }
                          value=(num_to_fixed(item.metricValues[0].value,2))
                          name=replace_disp_str(item.metricValues[0].metric.label)
                        })
                      }
                       params.value = value||"0";
                       params.name = name||"流向";
                       setDpmScalar(params, result, currentmodule.config.api);
                       var data = {
                        "value":params.value,
                        "name":params.name
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                       var widgets = moduledefault.Yibiaopan(params);
                       currentmodule.config.widgets = widgets;
                       this.$nextTick(() => {
                          if (currentmodule.config.datas&&currentmodule.config.chart) {
                            if (currentmodule.chart) {
                              currentmodule.chart.clear()
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                            }else{
                              var myChart = echarts.init(document.getElementById(id));
                              currentmodule.chart = myChart;
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                              currentmodule.chart.on('contextmenu', (param)=>{
                                let url=decodeURI(currentmodule.config.api)
                                let ip=url.substring(8,url.indexOf('/webservice'))
                                const numGroups=getQueryString(url,'numGroups')
                                let type=getQueryString(url,`groupType${numGroups}`)
                                let groupArgument1=getQueryString(url,'groupArgument1')
                                this.menuShow(param,type,ip,'yibiaopan',groupArgument1);
                              });
                            }
                          }
                        })
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        } //for_end
      },
      reMianjitu(j,id){
        for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            // 如果是静态数据
            if ((currentmodule.config.datas&&currentmodule.config.datastype=="default")||(currentmodule.config.datas&&currentmodule.config.datastype=="api"&&!currentmodule.config.api)) {
              var params = currentmodule.config.params;
              params.moduledatas.dpm = false;
              var widgets = moduledefault.Mianjitu(params);
              currentmodule.config.widgets = widgets;
              this.$nextTick(() => {
                if (currentmodule.config.datas&&currentmodule.config.chart) {
                  if (currentmodule.chart) {
                    currentmodule.chart.clear()
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }else{
                    var myChart = echarts.init(document.getElementById(id));
                    currentmodule.chart = myChart;
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }
                }
              })
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end},{'key':'granularity',value:this.granularity}])
                    };
                    // var param ={
                    //   // url: currentmodule.config.api,
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end},{'key':'granularity',value:this.granularity}]),
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                      var params = currentmodule.config.params;
                      let x=[],y=[],label=[],unit=[]
                      let result=res
                      params.moduledatas.dpm = false;
                      if (result && result.provider === 'dpm') {
                        const data = dpmChartData(result, time => this.$moment(time * 1000).format('MM-DD HH:mm:ss'));
                        Object.assign(params.moduledatas, data);
                        x = data.x; y = data.y; label = data.label; unit = data.unit;
                      } else if(result){
                        for(var i=0;i<result.metricValues.length;i++){
                          result.metricValues[i].metric.label=replace_disp_str2(result.metricValues[i].metric.label)
                          label.push(result.metricValues[i].metric.label)
                          unit.push(replace_unit2(result.metricValues[i]))
                          if(result.metricValues[i].unit == 'kb/sec'){
                            for(var j=0;j<result.metricValues[i].values.length;j++){
                              result.metricValues[i].values[j]=(num_to_fixed(result.metricValues[i].values[j]/1000,3))
                            }
                          }else if(result.metricValues[i].unit == 'msec'){
                            for(var j=0;j<result.metricValues[i].values.length;j++){
                              result.metricValues[i].values[j]=(num_to_fixed(result.metricValues[i].values[j]/1000,4))
                            }
                          }else{
                            for(var j=0;j<result.metricValues[i].values.length;j++){
                              result.metricValues[i].values[j]=(num_to_fixed(result.metricValues[i].values[j],3))
                            }
                          }
                          y.push(result.metricValues[i].values)
                        }
                        var granularity=(result.interval.end-result.interval.start)/y[0].length
                        var time = result.interval.start;
                        for(i=0;i<y[0].length;i++){
                            time = i>0?time+granularity:time;
                            x.push(this.$moment(parseInt(time)*1000).format('MM-DD HH:mm'));
                        }
                      }
                      
                       params.moduledatas.x = x||[];
                       params.moduledatas.y = y||[];
                       params.moduledatas.label = label|| [];
                       params.moduledatas.unit = unit|| [];
                       params.moduledatas.style.y=params.moduledatas.style.y.length>params.moduledatas.y.length?params.moduledatas.style.y.slice(0,params.moduledatas.y.length):params.moduledatas.style.y
                       var data = {
                        "x":params.moduledatas.x,
                        "y":params.moduledatas.y,
                        "label":params.moduledatas.label
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                       var widgets = moduledefault.Mianjitu(params);
                       currentmodule.config.widgets = widgets;
                        this.$nextTick(() => {
                          if (currentmodule.config.datas&&currentmodule.config.chart) {
                            if (currentmodule.chart) {
                              currentmodule.chart.clear()
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                            }else{
                              var myChart = echarts.init(document.getElementById(id));
                              currentmodule.chart = myChart;
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                              currentmodule.chart.on('contextmenu', (param)=>{
                                let url=decodeURI(currentmodule.config.api)
                                let ip=url.substring(8,url.indexOf('/webservice'))
                                const numGroups=getQueryString(url,'numGroups')
                                let type=getQueryString(url,`groupType${numGroups}`)
                                let groupArgument1=getQueryString(url,'groupArgument1')
                                this.menuShow(param,type,ip,'mianjitu',groupArgument1);
                              });
                            }
                          }
                        })
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        }
      },
      // 折线图重新绘制
      reZhexiantu(j,id){
        for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            // 如果是静态数据
            if ((currentmodule.config.datas&&currentmodule.config.datastype=="default")||(currentmodule.config.datas&&currentmodule.config.datastype=="api"&&!currentmodule.config.api)) {
              var params = currentmodule.config.params;
              params.moduledatas.dpm = false;
              var widgets = moduledefault.Zhexiantu(params);
              currentmodule.config.widgets = widgets;
              this.$nextTick(() => {
                if (currentmodule.config.datas&&currentmodule.config.chart) {
                  if (currentmodule.chart) {
                    currentmodule.chart.clear()
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }else{
                    var myChart = echarts.init(document.getElementById(id));
                    currentmodule.chart = myChart;
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }
                }
              })
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end},{'key':'granularity',value:this.granularity}])
                    };
                    // var param ={
                    //   // url: currentmodule.config.api,
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end},{'key':'granularity',value:this.granularity}]),
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                       var params = currentmodule.config.params;
                      let x=[],y=[],label=[],unit=[]
                      let result=res
                      params.moduledatas.dpm = false;
                      if (result && result.provider === 'dpm') {
                        const data = dpmChartData(result, time => this.$moment(time * 1000).format('MM-DD HH:mm:ss'));
                        Object.assign(params.moduledatas, data);
                        x = data.x; y = data.y; label = data.label; unit = data.unit;
                      } else if(result){
                        for(var i=0;i<result.metricValues.length;i++){
                          result.metricValues[i].metric.label=replace_disp_str2(result.metricValues[i].metric.label)
                          label.push(result.metricValues[i].metric.label)
                          unit.push(replace_unit2(result.metricValues[i]))
                          if(result.metricValues[i].unit == 'kb/sec'){
                            for(var j=0;j<result.metricValues[i].values.length;j++){
                              result.metricValues[i].values[j]=(num_to_fixed(result.metricValues[i].values[j]/1000,3))
                            }
                          }else if(result.metricValues[i].unit == 'msec'){
                            for(var j=0;j<result.metricValues[i].values.length;j++){
                              result.metricValues[i].values[j]=(num_to_fixed(result.metricValues[i].values[j]/1000,4))
                            }
                          }else{
                            for(var j=0;j<result.metricValues[i].values.length;j++){
                              result.metricValues[i].values[j]=(num_to_fixed(result.metricValues[i].values[j],3))
                            }
                          }
                          y.push(result.metricValues[i].values)
                        }

                        var granularity=(result.interval.end-result.interval.start)/y[0].length
                        var time = result.interval.start;
                        for(i=0;i<y[0].length;i++){
                            time = i>0?time+granularity:time;
                            x.push(this.$moment(parseInt(time)*1000).format('MM-DD HH:mm'));
                        }
                      }
                      
                       params.moduledatas.x = x||[];
                       params.moduledatas.y = y||[];
                       params.moduledatas.label = label|| [];
                       params.moduledatas.unit = unit|| [];
                       params.moduledatas.style.y=params.moduledatas.style.y.length>params.moduledatas.y.length?params.moduledatas.style.y.slice(0,params.moduledatas.y.length):params.moduledatas.style.y
                       var data = {
                        "x":params.moduledatas.x,
                        "y":params.moduledatas.y,
                        "label":params.moduledatas.label
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                       var widgets = moduledefault.Zhexiantu(params);
                       currentmodule.config.widgets = widgets;
                        this.$nextTick(() => {
                          if (currentmodule.config.datas&&currentmodule.config.chart) {
                            if (currentmodule.chart) {
                              currentmodule.chart.clear()
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                            }else{
                              var myChart = echarts.init(document.getElementById(id));
                              currentmodule.chart = myChart;
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                              currentmodule.chart.on('contextmenu', (param)=>{
                                let url=decodeURI(currentmodule.config.api)
                                let ip=url.substring(8,url.indexOf('/webservice'))
                                const numGroups=getQueryString(url,'numGroups')
                                let type=getQueryString(url,`groupType${numGroups}`)
                                let groupArgument1=getQueryString(url,'groupArgument1')
                                this.menuShow(param,type,ip,'zhexiantu',groupArgument1);
                              });
                            }
                          }
                        })
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        }
      },
      // 基础柱状图数据重新编排页面样式
      reZongxiangzhuzhuangtu(j,id){
        for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
          if (currentmodule.config.datas && currentmodule.config.datastype === "api" && isDpmUrl(currentmodule.config.api)) {
            refreshDpmVerticalBar(this, currentmodule, moduledefault.Zongxiangzhuzhuangtu, () => echarts.init(document.getElementById(id)));
            continue;
          }
          resetDpmVerticalBar(currentmodule);
            // 如果是静态数据
            if ((currentmodule.config.datas&&currentmodule.config.datastype=="default")||(currentmodule.config.datas&&currentmodule.config.datastype=="api"&&!currentmodule.config.api)) {
              var params = currentmodule.config.params;
              params.x = JSON.parse(currentmodule.config.widgetdata).x;
              params.y = JSON.parse(currentmodule.config.widgetdata).y;
              params.moduledatas.y = JSON.parse(currentmodule.config.widgetdata).y;
              params.moduledatas.x = JSON.parse(currentmodule.config.widgetdata).x;
              var widgets = moduledefault.Zongxiangzhuzhuangtu(params);
              currentmodule.config.widgets = widgets;
              this.$nextTick(() => {
                if (currentmodule.config.datas&&currentmodule.config.chart) {
                  if (currentmodule.chart) {
                    currentmodule.chart.clear()
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }else{
                    var myChart = echarts.init(document.getElementById(id));
                    currentmodule.chart = myChart;
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }
                }
              })
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"&&currentmodule.config.api){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    };
                    // var param ={
                    //   // url: currentmodule.config.api,
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}]),
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                      var params = currentmodule.config.params;
                      let result=res
                      let x=[],y=[],label=[],sortArray=[],unit=''
                        if(result&&result.length>0){
                           result.forEach((item,index)=>{
                            if(item.metricValues[0].unit==='kb/sec'){
                              item.metricValues[0].value=item.metricValues[0].value/1000
                            }
                            sortArray.push({argument:item.group.argument||item.group.label,value:item.metricValues[0].value,unit:item.metricValues[0].unit})
                            if(index===0){
                              item.metricValues[0].metric.label=replace_disp_str(item.metricValues[0].metric.label)
                              label.push(item.metricValues[0].metric.label)
                              unit=replace_unit(item.metricValues[0])
                            }
                          })

                          sortArray.sort(descCompare("value"))
                          sortArray.forEach((item,index)=>{
                            if((result[0].metricValues[0].metric.dpm && item.value !== null) || num_to_fixed(item.value,3)!=0){
                              x.push(item.argument)
                              y.push(result[0].metricValues[0].metric.dpm ? item.value : num_to_fixed(item.value,3))
                            }
                          })
                        }
                        params.moduledatas.x = x||[];
                        params.moduledatas.y = [y]||[];
                        params.moduledatas.label = label||[];
                        params.moduledatas.unit = unit||'';
                       var data = {
                        "x":params.moduledatas.x,
                        "y":params.moduledatas.y,
                        "label":params.moduledatas.label
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                       var widgets = moduledefault.Zongxiangzhuzhuangtu(params);
                       currentmodule.config.widgets = widgets;
                        this.$nextTick(() => {
                          if (currentmodule.config.datas&&currentmodule.config.chart) {
                            if (currentmodule.chart) {
                              currentmodule.chart.clear()
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                            }else{
                              var myChart = echarts.init(document.getElementById(id));
                              myChart.clear()
                              currentmodule.chart = myChart;
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                              currentmodule.chart.on('contextmenu', (param)=>{
                                let url=decodeURI(currentmodule.config.api)
                                let ip=url.substring(8,url.indexOf('/webservice'))
                                const numGroups=getQueryString(url,'numGroups')
                                let type=getQueryString(url,`groupType${numGroups}`)
                                this.menuShow(param,type,ip);
                              });
                            }
                          }
                        })
                    }.bind(this))
                  }// if(objExp.test(currentmodule.config.api)==true)
                }// if (currentmodule.config.api)_end
              }
            }
          }//if_end
        }
      }, // reZongxiangzhuzhuangtu_end
      // 重新设置横向堆叠柱状图的样式
      reHengxiangduidiezhuzhuangtu(j,id){
        for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            // 如果是静态数据
            if ((currentmodule.config.datas&&currentmodule.config.datastype=="default")||(currentmodule.config.datas&&currentmodule.config.datastype=="api"&&!currentmodule.config.api)) {
              var params = currentmodule.config.params;
              params.moduledatas.dpmComposition = false;
              params.moduledatas.dpmStackSingle = false;
              var widgets = moduledefault.Hengxiangduidiezhuzhuangtu(params);
              currentmodule.config.widgets = widgets;
              this.$nextTick(() => {
                if (currentmodule.config.datas&&currentmodule.config.chart) {
                  if (currentmodule.chart) {
                    currentmodule.chart.clear()
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }else{
                    var myChart = echarts.init(document.getElementById(id));
                    currentmodule.chart = myChart;
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }
                }
              })
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    };
                    // var param ={
                    //   // url: currentmodule.config.api,
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}]),
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                       var params = currentmodule.config.params;
                      let x=[],y=[],label=[],sortArray=[],unit=[]
                      let result=res
                      if(result&&result.length>0){
                        // 处理数据
                        for(var i=0;i<result.length;i++){
                          sortArray.push({argument:result[i].group.argument||result[i].group.label})
                          let itemvalue=[]
                          for(var j=0;j<result[i].metricValues.length;j++){
                            if(i===0){
                              result[0].metricValues[j].metric.label=replace_disp_str2(result[0].metricValues[j].metric.label)
                              label.push(result[0].metricValues[j].metric.label)
                            }
                            if(!result[i].metricValues[j].metric.dpm && result[i].metricValues[j].unit==="kb/sec"){
                              result[i].metricValues[j].value=num_to_fixed(result[i].metricValues[j].value/1000,3)
                            }else if(!result[i].metricValues[j].metric.dpm && result[i].metricValues[j].unit==="msec"){
                              result[i].metricValues[j].value=num_to_fixed(result[i].metricValues[j].value/1000,4)
                            }else if (!result[i].metricValues[j].metric.dpm){
                              result[i].metricValues[j].value=num_to_fixed(result[i].metricValues[j].value,3)
                            }
                            // unit.push(result[0].metricValues[j])
                            unit.push(replace_unit2(result[0].metricValues[j]))
                            itemvalue.push((result[i].metricValues[j].metric.dpm ? result[i].metricValues[j].value : parseFloat(result[i].metricValues[j].value)))
                          }
                          sortArray[i].value=itemvalue
                          sortArray[i].valueSum=itemvalue.reduce((n,m) => n + m);
                        }
                        // 排序
                        sortArray.sort(ascCompare("valueSum"))
                        for(var z=0;z<sortArray[0].value.length;z++){
                          x.push([])
                        }
                        for(var i=0;i<sortArray.length;i++){
                          if(result[0].metricValues[0].metric.dpm || sortArray[i].valueSum != 0){
                            y.push(sortArray[i].argument)
                            for(var j=0;j<sortArray[i].value.length;j++){
                              x[j].push(sortArray[i].value[j])
                            }
                          }
                        }
                      }
                      params.moduledatas.x = x||[];
                      params.moduledatas.y = y||[];
                      params.moduledatas.label = label||[];
                      params.moduledatas.unit = unit||[];
                      params.moduledatas.style.x=params.moduledatas.style.x.length>params.moduledatas.x.length?params.moduledatas.style.x.slice(0,params.moduledatas.x):params.moduledatas.style.x
                       var data = {
                        "x":params.moduledatas.x,
                        "y":params.moduledatas.y,
                        "label":params.moduledatas.label
                       }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                       var widgets = moduledefault.Hengxiangduidiezhuzhuangtu(params);
                       currentmodule.config.widgets = widgets;
                        this.$nextTick(() => {
                          if (currentmodule.config.datas&&currentmodule.config.chart) {
                            if (currentmodule.chart) {
                              currentmodule.chart.clear()
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                            }else{
                              var myChart = echarts.init(document.getElementById(id));
                              currentmodule.chart = myChart;
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                              currentmodule.chart.on('contextmenu', (param)=>{
                                let url=decodeURI(currentmodule.config.api)
                                let ip=url.substring(8,url.indexOf('/webservice'))
                                const numGroups=getQueryString(url,'numGroups')
                                let type=getQueryString(url,`groupType${numGroups}`)
                                this.menuShow(param,type,ip);
                              });
                            }
                          }
                        })
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        }
      },
      // 重新设置纵向堆叠柱状图的样式
      reZongxiangduidiezhuzhuangtu(j,id){
        for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id==id) {
            var currentmodule = this.imgmodules[i];
            // 如果是静态数据
            if ((currentmodule.config.datas&&currentmodule.config.datastype=="default")||(currentmodule.config.datas&&currentmodule.config.datastype=="api"&&!currentmodule.config.api)) {
              var params = currentmodule.config.params;
              params.moduledatas.dpmComposition = false;
              params.moduledatas.dpmStackSingle = false;
              var widgets = moduledefault.Zongxiangduidiezhuzhuangtu(params);
              currentmodule.config.widgets = widgets;
              this.$nextTick(() => {
                if (currentmodule.config.datas&&currentmodule.config.chart) {
                  if (currentmodule.chart) {
                    currentmodule.chart.clear()
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }else{
                    var myChart = echarts.init(document.getElementById(id));
                    currentmodule.chart = myChart;
                    currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                    //currentmodule.chart.resize();
                  }
                }
              })
            // 如果是api请求数据
            }else if (currentmodule.config.datas&&currentmodule.config.datastype=="api"){
              if (currentmodule.config.datas&&currentmodule.config.datastype=="api") {
                if (currentmodule.config.api) {
                  var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                  var objExp=new RegExp(Expression);
                  if(objExp.test(currentmodule.config.api)==true){
                    let newUrl = ''
                    if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                      newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                    }else{
                      newUrl = currentmodule.config.api
                    }
                    // console.log('newUrl',newUrl)
                    var param = {
                      url: changeURLArg(newUrl,[{'key':'start',value:this.start},{'key':'end',value:this.end}])
                    };
                    // var param ={
                    //   url:changeURLArg(currentmodule.config.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}]),
                    // }
                    this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(function(res){
                      var params = currentmodule.config.params;
                      let x=[],y=[],label=[],sortArray=[],unit=[]
                      let result=res
                      if(result&&result.length>0){
                        // 处理数据
                        for(var i=0;i<result.length;i++){
                          sortArray.push({argument:result[i].group.argument||result[i].group.label})
                          let itemvalue=[]
                          for(var j=0;j<result[i].metricValues.length;j++){
                            if(i===0){
                              result[0].metricValues[j].metric.label=replace_disp_str2(result[0].metricValues[j].metric.label)
                              label.push(result[0].metricValues[j].metric.label)
                            }
                            if(!result[i].metricValues[j].metric.dpm && result[i].metricValues[j].unit==="kb/sec"){
                              result[i].metricValues[j].value=num_to_fixed(result[i].metricValues[j].value/1000,3)
                            }else if(!result[i].metricValues[j].metric.dpm && result[i].metricValues[j].unit==="msec"){
                              result[i].metricValues[j].value=num_to_fixed(result[i].metricValues[j].value/1000,4)
                            }else if (!result[i].metricValues[j].metric.dpm){
                              result[i].metricValues[j].value=num_to_fixed(result[i].metricValues[j].value,3)
                            }
                            unit.push(replace_unit2(result[0].metricValues[j]))
                            itemvalue.push((result[i].metricValues[j].metric.dpm ? result[i].metricValues[j].value : parseFloat(result[i].metricValues[j].value)))
                          }
                          sortArray[i].value=itemvalue
                          sortArray[i].valueSum=itemvalue.reduce((n,m) => n + m);
                        }
                        // 排序
                        sortArray.sort(descCompare("valueSum"))
                        for(var z=0;z<sortArray[0].value.length;z++){
                          y.push([])
                        }
                        for(var i=0;i<sortArray.length;i++){
                          if(result[0].metricValues[0].metric.dpm || sortArray[i].valueSum != 0){
                            x.push(sortArray[i].argument)
                            for(var j=0;j<sortArray[i].value.length;j++){
                              y[j].push(sortArray[i].value[j])
                            }
                          }                          
                        }
                      }
                      
                      params.moduledatas.x = x||[];
                      params.moduledatas.y = y||[];
                      params.moduledatas.label = label||[];
                      params.moduledatas.unit = unit||[];
                      params.moduledatas.style.y=params.moduledatas.style.y.length>params.moduledatas.y.length?params.moduledatas.style.y.slice(0,params.moduledatas.y):params.moduledatas.style.y
                      var data = {
                      "x":params.moduledatas.x,
                      "y":params.moduledatas.y,
                      "label":params.moduledatas.label
                      }
                       currentmodule.config.widgetdata = JSON.stringify(data, null, 2);
                       var widgets = moduledefault.Zongxiangduidiezhuzhuangtu(params);
                       currentmodule.config.widgets = widgets;
                        this.$nextTick(() => {
                          if (currentmodule.config.datas&&currentmodule.config.chart) {
                            if (currentmodule.chart) {
                              currentmodule.chart.clear()
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                            }else{
                              var myChart = echarts.init(document.getElementById(id));
                              currentmodule.chart = myChart;
                              currentmodule.chart.setOption(currentmodule.config.widgets,{lazyUpdate:true});
                              //currentmodule.chart.resize();
                              currentmodule.chart.on('contextmenu', (param)=>{
                                let url=decodeURI(currentmodule.config.api)
                                let ip=url.substring(8,url.indexOf('/webservice'))
                                const numGroups=getQueryString(url,'numGroups')
                                let type=getQueryString(url,`groupType${numGroups}`)
                                this.menuShow(param,type,ip);
                              });
                            }
                          }
                        })
                    }.bind(this))
                  }
                }
              }
            }
          }//if_end
        }
      },
      // 根据当前时间获取出当前月份的所有天数
      getVirtulData(month) {
        var time = new Date(month);
        var year = time.getFullYear();
        var month =
          time.getMonth() + 1 < 10
            ? "0" + (time.getMonth() + 1)
            : time.getMonth() + 1;
        var startTime = year + "-" + month + "-01"; //先获取到当前时间的月份第一天
        var endTime =
          year +
          "-" +
          (time.getMonth() + 2 < 10
            ? "0" + (time.getMonth() + 2)
            : time.getMonth() + 2) +
          "-01"; //当前月份的下个月的第一天
        var date = +echarts.number.parseDate(startTime);
        var end = +echarts.number.parseDate(endTime);
        var dayTime = 3600 * 24 * 1000;
        var data = [];
        for (var time = date; time < end; time += dayTime) {
          var str = 0;
          data.push([echarts.format.formatTime("yyyy-MM-dd", time), str]);
          str++;
        }
        return data;
      },
      apiChange(e){
        var api = e.target.value;
        var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
        var objExp=new RegExp(Expression);
        if(objExp.test(api)==true){
          this.currentmodule.config.api = api;
          var params ={
            api: api,
            type:this.currentmodule.config.apitypeselect
          }
          this.ajaxs(params).then(function(){

          })
        }else{
          this.$Message.info("API地址错误！")
        }
      },
      ajaxs(params){
        return new Promise((resolve, reject) => {
          this.ajax({params}).then((res)=>{
            const item = this.imgmodules.find(item => item.id === params.componentId);
            if(item) prepareDpmWidgetResult(item, params.url, res);
            resolve(res)
          },(err)=>{
            showDpmWidgetError(this.imgmodules.find(item => item.id === params.componentId), err);
            reject(err)
          })
        })
      }
    }
  }
</script>
<style scoped  lang="less">

</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  @import "../../assets/less/style.less";
  .animation{
    animation: circle 4s infinite linear;
  }
  @-webkit-keyframes circle {
      0% {
          transform: rotate(0deg);
      }

      100% {
          transform: rotate(360deg);
      }
  }

  li{
    list-style-type:none;
  }
  .datamax{
    .view-container{
      /* position: absolute; */
      /* top: 0px; */
      width: 100%;
      height:100%;
      cursor: default;
      // background: #053039;

      #view-profile{
        height: 100%;
        width: 100%;
      #view-imgs{
        background-image:url('../../assets/images/bgImg.png')!important;
        height: 100%!important;
        transform-origin: left bottom;
        #imggrid{
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;
          #imggriddraw{
            width: 100%;
            height: 100%;
          }
        }
        #imgmodules{
          position: absolute;
          left: 0px;
          overflow: auto;
          width: 100%;
          height: 100%;
        }
      }
      /* #view-imgs_end */
       #view-menu{
          position:absolute;
          width:100px;
          background:#9bc690;
          z-index:3002;

          ul{
            width: 100%;
            li{
                text-align: center;
                color:#000;
                cursor: pointer;
                transition: 0.3s;
                padding: 5px;
                i{
                 margin-right: 4px;
                }
            }
            // li:hover{
            //   color: #ececec;
            //   background:#505050;
            // }
          }
        }
     }
     /* #view-profile_end */
    }
  }
  .imgmoduleitem{
    box-sizing:border-box;
    -moz-box-sizing:border-box; /* Firefox */
    -webkit-box-sizing:border-box; /* Safari */
  }
</style>

<style>
.im-bg .el-table thead th.th-force-bg,
.im-bg .el-table__header-wrapper th.th-force-bg,
.im-bg .el-table thead.is-group th.th-force-bg {
  background: var(--thBg) !important;
  background-color: var(--thBg) !important;
  background-image: none !important;
  border-bottom-color: var(--thBorderColor) !important;
}
.im-bg .el-table thead th.th-force-bg .cell {
  background: transparent !important;
}

/* 1) 先把头部行/单元格打成我们的背景色（覆盖你们的透明 & ElementUI 默认） */
.datamax .view-container .table-style .el-table thead tr,
.datamax .view-container .table-style .el-table thead th {
  background: var(--thBg) !important;
  background-color: var(--thBg) !important;
  background-image: none !important;
}

/* 2) 清理 th 内部 .cell 的背景，避免遮挡 */
.datamax .view-container .table-style .el-table thead th .cell {
  background: transparent !important;
}

/* 3) 同步边框颜色（与编辑端一致），使用我们挂在 el-table 上的 CSS 变量 */
.datamax .view-container .table-style .el-table td,
.datamax .view-container .table-style .el-table th {
  border-color: var(--thBorderColor) !important;
}

</style>




