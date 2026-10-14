<template>
    <div>
        <div style="width: 100%; display: flex; justify-content: space-between">
            <div id="myDiagramDiv"
            :style="{background:globalData.bgColor}"
                style="flex-grow: 1; height: 100vh; position: relative; -webkit-tap-highlight-color: rgba(255, 255, 255, 0); cursor: auto;">
                <canvas tabindex="0" width="797" height="100vh"
                    style="position: absolute; top: 0px; left: 0px; z-index: 2; user-select: none; width: 797px; height: 100vh; cursor: auto;">This
                    text is displayed if your browser does not support the Canvas HTML element.
                </canvas>
                <div style="position: absolute; overflow: auto; width: 797px; height: 100vh; z-index: 1;">
                    <div style="position: absolute; width: 1px; height: 1px;"></div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapActions } from 'vuex'
import {changeURLArg,getQueryString,replace_unit,replace_disp_str2,num_to_fixed} from "@/lib/common.js"
export default {
    data(){
        return{
            baseURL:"https://" + window.location.host,
            id:this.$route.query.id,
            myDiagram:{},
            currentmodule:{
                threshold:[],
                api:""
            },
            showModal:true,
            add:false,
            start:'',
            end:'',
            jsonData:{},
            // timer1:null,
            // timer2:null,
            // flag1:false,
            // flag2:false,
            globalData:{
                bgColor:'rgba(255, 255, 255, 0)'
            },
            currentGroupColorList: [],//当前点击区块下元素报警颜色集合
            currentGroupKeys:[],  //当前点击区块下元素key的集合
        }
    },
    mounted(){
        this.init()
        let vm=this
        window.getNewDate=vm.getNewDate
        this.$nextTick(()=>{
            this.start=parent.startTimeUnix
            this.end=parent.endTimeUnix
            // this.start='1678755600'
            // this.end='1678759200'
            
            this.moduleContent()
        })
    },
    methods:{
        // 重新获取父页面的时间
        getNewDate(type){
            // if(this.timer1){
            //     for(var i=0;i<this.timer1;i++){
            //         clearInterval(this.timer1)
            //     }
            //     this.flag1=false
            // }
            // if(this.timer2){
            //     for(var i=0;i<this.timer2;i++){
            //         clearInterval(this.timer2)
            //     }
            //     this.flag2=false
            // }
            this.start=parent.startTimeUnix
            this.end=parent.endTimeUnix
            // 根据选择的时间渲染图表数据
            this.autoData(type)
            
        },
        ...mapActions([
            'moduleMessage',
            'ajax'
        ]),
        // 获取大屏详情
        moduleContent(){
            this.add=false
            let params = {
                id:this.id
            }
            if (!this.id) {
                return;
            }
            this.moduleMessage({params}).then(function(res){
                if (res.status=="1") {
                    var data = res.data;
                    if (!res.data) {
                    return;
                    }
                    if (res.data.cfg_json) {
                         this.globalData=JSON.parse(res.data.cfg_json).globalData
                        this.jsonData=JSON.parse(res.data.cfg_json)
                        this.myDiagram.animationManager.initialAnimationStyle = go.AnimationManager.None;
                        this.myDiagram.model = go.Model.fromJson(this.jsonData);
                        // 自动获取
                        this.autoData()
                    }
                }else{
                this.add=true
                }
            }.bind(this))
        },
        // 递归处理数据
        deepData(arr,key){
            arr.forEach(item=>{
                if(key===item.group){
                // console.log('递归 处理数据')
                this.currentGroupColorList.push(item.warningTip)
                this.currentGroupKeys.push(item.key)
                this.deepData(arr,item.key)
                }
            })
        },
        // 折叠报警颜色处理
        closeWarningBg(){
            // console.log('处理折叠区块的颜色')
            // console.log(' this.myDiagram.model.linkDataArray', this.myDiagram.model.linkDataArray)
            // console.log('this.myDiagram.model.nodeDataArray',this.myDiagram.model.nodeDataArray)
            this.myDiagram.model.nodeDataArray.forEach(item1=>{
                if(item1.expand===false){
                    this.currentGroupColorList=[]
                    this.currentGroupKeys=[]
                    this.deepData(this.myDiagram.model.nodeDataArray,item1.key)
                    // 连线
                    // console.log('currentGroupKeys',this.currentGroupKeys)
                    this.myDiagram.model.linkDataArray.forEach(item2=>{
                        if(this.currentGroupKeys.indexOf(item2.from)!==-1&&this.currentGroupKeys.indexOf(item2.to)!==-1){
                            this.currentGroupColorList.push(item2.warningTip)
                        }
                    })
                    // console.log('currentGroupColorList',this.currentGroupColorList)
                    if(this.currentGroupColorList.indexOf('#ff0000')!=-1){
                        item1.warnBgFill="#ff0000"
                        // this.myDiagram.model.setDataProperty(item1,"warnBgFill","#ff0000");
                    }else if(this.currentGroupColorList.indexOf('#ff9900')!=-1){
                        // this.myDiagram.model.setDataProperty(item1,"warnBgFill","#ff9900");
                         item1.warnBgFill="#ff9900"
                    }else if(this.currentGroupColorList.indexOf('#ffff00')!=-1){
                        // this.myDiagram.model.setDataProperty(item1,"warnBgFill","#ffff00");
                         item1.warnBgFill="#ffff00"
                    }else{
                        // this.myDiagram.model.setDataProperty(item1,"warnBgFill",item1.definedFill);
                        item1.warnBgFill=item1.definedFill
                    }
                    this.myDiagram.model.updateTargetBindings(item1)
                }
            })
        },
        autoData(type){
            let allTotal=this.jsonData.linkDataArray.length+this.jsonData.nodeDataArray.length
            this.jsonData.linkDataArray.forEach(async (item,index)=>{
                if(item.api){
                    await this.autoGetData(item,'link',index+1)
                    if(item.updateTime){
                        item.updateTime=Number(item.updateTime)
                            if(!type){
                                setInterval(function(){
                                    this.autoGetData(item,'link',allTotal)
                                }.bind(this),item.updateTime*1000)
                            }
                    }
                }
            })
            this.jsonData.nodeDataArray.forEach(async (item,index)=>{
                if(item.api){
                    await this.autoGetData(item,'',this.jsonData.linkDataArray.length+index+1)
                    if(item.updateTime){
                        item.updateTime=Number(item.updateTime)
                            if(!type){
                                setInterval(function(){
                                    this.autoGetData(item,'',allTotal)
                                }.bind(this),item.updateTime*1000)
                            }
                        
                    }
                }                
            })
        },
        async autoGetData(item,type,len){
                item.api=decodeURI(item.api)
                var param ={
                    url:changeURLArg(item.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}]),
                }
                let result = await this.ajaxs(param)
                if(result.length>0){
                    // 根据阈值判断color值
                    let array=[],colorList=[]
                    result.forEach(element => {
                        // console.log('this.myDiagram.model',this.myDiagram.model)
                        element.metricValues.forEach((metricItem,metricIndex)=>{
                            let color="transparent"
                            metricItem.value=parseFloat(metricItem.value)
                            let findItem = item.threshold.find(findItem=>{return findItem.category===metricItem.metric.id})
                            findItem.Major?findItem.Major=parseFloat(findItem.Major):findItem.Major=''
                            findItem.Minor?findItem.Minor=parseFloat(findItem.Minor):findItem.Minor=''
                            findItem.Critical?findItem.Critical=parseFloat(findItem.Critical):findItem.Critical=''
                            if(findItem.Minor&&findItem.Major&&findItem.Critical){
                                if(findItem.symbol==='>'||findItem.symbol==='>='){
                                    if(metricItem.value>findItem.Minor&&metricItem.value<findItem.Major){
                                        color='#ffff00'
                                    }else if(metricItem.value>findItem.Major&&metricItem.value<findItem.Critical){
                                        color='#ff9900'
                                    }else if(metricItem.value>findItem.Critical){
                                        color='#ff0000'
                                    }else{
                                        color='transparent'
                                    }
                                }else{
                                    if(metricItem.value<findItem.Minor&&metricItem.value>findItem.Major){
                                        color='#ffff00'
                                    }else if(metricItem.value<findItem.Major&&metricItem.value>findItem.Critical){
                                        color='#ff9900'
                                    }else if(metricItem.value<findItem.Critical){
                                        color='#ff0000'
                                    }else{
                                        color='transparent'
                                    }
                                }
                                
                            }else if(findItem.Minor&&findItem.Major&&!findItem.Critical){
                                if(findItem.symbol==='>'||findItem.symbol==='>='){
                                    if(metricItem.value>findItem.Minor&&metricItem.value<findItem.Major){
                                        color='#ffff00'
                                    }else if(metricItem.value>findItem.Major){
                                        color='#ff9900'
                                    }else{
                                        color='transparent'
                                    }
                                }else{
                                    if(metricItem.value<findItem.Minor&&metricItem.value>findItem.Major){
                                        color='#ffff00'
                                    }else if(metricItem.value<findItem.Major){
                                        color='#ff9900'
                                    }else{
                                        color='transparent'
                                    }
                                }
                                
                            }else if(findItem.Minor&&!findItem.Major&&findItem.Critical){
                                if(findItem.symbol==='>'||findItem.symbol==='>='){
                                    if(metricItem.value>findItem.Minor&&metricItem.value<findItem.Critical){
                                        color='#ffff00'
                                    }else if(metricItem.value>findItem.Critical){
                                        color='#ff0000'
                                    }else{
                                        color='transparent'
                                    }
                                }else{
                                    if(metricItem.value<findItem.Minor&&metricItem.value>findItem.Critical){
                                        color='#ffff00'
                                    }else if(metricItem.value<findItem.Critical){
                                        color='#ff0000'
                                    }else{
                                        color='transparent'
                                    }
                                }
                                
                            }else if(!findItem.Minor&&findItem.Major&&findItem.Critical){
                                if(findItem.symbol==='>'||findItem.symbol==='>='){
                                    if(metricItem.value>findItem.Major&&metricItem.value<findItem.Critical){
                                        color='#ff9900'
                                    }else if(metricItem.value>findItem.Critical){
                                        color='#ff0000'
                                    }else{
                                        color='transparent'
                                    }
                                }else{
                                    if(metricItem.value<findItem.Major&&metricItem.value>findItem.Critical){
                                        color='#ff9900'
                                    }else if(metricItem.value<findItem.Critical){
                                        color='#ff0000'
                                    }else{
                                        color='transparent'
                                    }
                                }
                                
                            }else if(findItem.Minor&&!findItem.Major&&!findItem.Critical){
                                if(findItem.symbol==='>'||findItem.symbol==='>='){
                                    if(metricItem.value>findItem.Minor){
                                        color='#ffff00'
                                    }else{
                                        color='transparent'
                                    }
                                }else{
                                    if(metricItem.value<findItem.Minor){
                                        color='#ffff00'
                                    }else{
                                        color='transparent'
                                    }
                                }
                                
                            }else if(!findItem.Minor&&findItem.Major&&!findItem.Critical){
                                if(findItem.symbol==='>'||findItem.symbol==='>='){
                                    if(metricItem.value>findItem.Major){
                                        color='#ff9900'
                                    }else{
                                        color='transparent'
                                    }
                                }else{
                                    if(metricItem.value<findItem.Major){
                                        color='#ff9900'
                                    }else{
                                        color='transparent'
                                    }
                                }
                                
                            }else if(!findItem.Minor&&!findItem.Major&&findItem.Critical){
                                if(findItem.symbol==='>'||findItem.symbol==='>='){
                                    if(metricItem.value>findItem.Critical){
                                        color='#ff0000'
                                    }else{
                                        color='transparent'
                                    }
                                }else{
                                    if(metricItem.value<findItem.Critical){
                                        color='#ff0000'
                                    }else{
                                        color='transparent'
                                    }
                                }
                                
                            }
                            if(metricItem.unit==='kb/sec'){
                                metricItem.value=metricItem.value/1000
                            }
                            array.push({category:metricItem.metric.id,color:color,figure:"Ellipse",name:replace_disp_str2(metricItem.metric.label)+'\n'+num_to_fixed(metricItem.value,3)+replace_unit(metricItem),value:num_to_fixed(metricItem.value,3)+""+replace_unit(metricItem)})
                            colorList.push(color)
                        })
                    });
                    item.files=array
                    if(colorList.indexOf('#ff0000')!=-1){
                        item.warningTip="#ff0000"
                    }else if(colorList.indexOf('#ff9900')!=-1){
                        item.warningTip="#ff9900"
                    }else if(colorList.indexOf('#ffff00')!=-1){
                        item.warningTip="#ffff00"
                    }else{
                        if(type=='link'){
                            item.warningTip="#333"
                        }else{
                             item.warningTip="transparent"
                        }
                        
                    }
                    if(len===this.jsonData.linkDataArray.length+this.jsonData.nodeDataArray.length){
                        this.closeWarningBg()
                    }
                    
                    // this.myDiagram.animationManager.stopAnimation(true);
                    var animation = new go.Animation();
                    animation.reversible = true; // reverse the animation at the end, doubling its total time
                    animation.duration=200;
                    if(type=='link'){
                        this.myDiagram.links.each((link)=>{
                            if(link.data.from==item.from&&link.data.to==item.to&&item.updateTime&&item.styleData.isAnimation=='1'){
                                animation.add(link, "opacity", 1, 0);
                            }
                        });
                    }else{
                        this.myDiagram.nodes.each((node)=>{
                            if(node.key==item.key&&item.updateTime&&item.styleData.isAnimation=='1'){
                                animation.add(node, "opacity", 1, 0);
                            }
                        });
                    }
                    animation.start(); // start the animation immediately
                    this.myDiagram.model.updateTargetBindings(item)
                    

                }else{
                    item.files=[]
                    if(type=='link'){
                            item.warningTip="#333"
                        }else{
                             item.warningTip="transparent"
                        }
                    this.myDiagram.model.updateTargetBindings(item)
                }
        },
        //
        ajaxs(params){
            return new Promise((resolve, reject) => {
            this.ajax({params}).then(function(res){
                resolve(res)
            },function(err){
                reject(err)
            })
            })
        },
         onSelectionChanged(e) {
            var node = e.diagram.selection.first();
            let isLink = false;
            if (node instanceof go.Node) {
                this.currentmodule = node.part.data;
            } else if (node instanceof go.Link) {
                let data = node.data;
                isLink = true;
                e.diagram.model.setDataProperty(data, "showbtn", true);
                this.currentmodule=data
            } else {
                //updateProperties(null);
            }
            let it = e.diagram.links;
            while (it.next()) {
                let data = it.value.data;
                if (node != it.value) {
                e.diagram.model.setDataProperty(data, "showbtn", false);
                }
            }
        },
        // 钻取分析跳转
        analyze(type,ip,argument){
            // this.baseURL+
            // let requestApi='https://114.112.96.198/NetInside/admin/datasource.asp?m=proxy&url='
            if(type=='TotalTraffic'){ //总流量
            window.open(`https://${ip}/NetInside/network/TrafficTrend.jsp`)
            }else if(type=='IPAddress'){ //IP地址
            window.open(`https://${ip}/NetInside/network/IPAnalyse.jsp?refreshFlag=null&inputItemR=${encodeURI(argument)}`)
            }else if(type=='Prefix24'){ //网段
            window.open(`https://${ip}/NetInside/network/NetAnalyse.jsp?refreshFlag=null&inputItemR=${encodeURI(argument)}`)
            }else if(type=='BusinessGroup'){ //工作组
            window.open(`https://${ip}/NetInside/network/GroupAnalyse.jsp?refreshFlag=null&inputItemR=${encodeURI(argument)}`)
            }else if(type=='IPConversation'){ //IP会话
            window.open(`https://${ip}/NetInside/network/ConversationAnalyse.jsp?refreshFlag=null&inputItemR=${encodeURI(argument)}`)
            }else if(type=='DefinedApp'){ //已知应用
            window.open(`https://${ip}/NetInside/application/ApplicationProfile.jsp?refreshFlag=null&inputItemR=${encodeURI(argument)}`)
            }else if(type=='OtherApp'){ //未知应用
            window.open(`https://${ip}/NetInside/application/ApplicationProfile.jsp?refreshFlag=null&inputItemR=${encodeURI(argument)}`)
            }else if(type=='WebApplication'){ //业务
            window.open(`https://${ip}/NetInside/business/BusinessAnalyse.jsp?refreshFlag=null&inputItemR=${encodeURI(argument)}`)
            }else if(type=='PageFamily'){ //页面族
            window.open(`https://${ip}/NetInside/business/PagePerformance.jsp?refreshFlag=null`)
            }else if(type=='MonInterfaceGroup'){ //监控口
            window.open(`https://${ip}/NetInside/network/InterfaceAnalyse.jsp`)
            }else if(type=='ClientBusinessGroup'){ //初始组
            window.open(`https://${ip}/NetInside/network/GroupAnalyse.jsp?refreshFlag=null&inputItemR=${encodeURI(argument)}`)
            }
        },
        // 递归处理数据
        deepData(arr,key){
            arr.forEach(item=>{
                if(key===item.group){
                // console.log('递归 处理数据')
                this.currentGroupColorList.push(item.warningTip)
                this.currentGroupKeys.push(item.key)
                this.deepData(arr,item.key)
                }
            })
        },
        init(){
            if (window.goSamples) goSamples(); 
            var $ = go.GraphObject.make;//创建对象  // for conciseness in defining templates
            this.myDiagram =$(go.Diagram, "myDiagramDiv",
            {
                mouseDrop: e => finishDrop(e, null),
                allowHorizontalScroll: false,
                // "toolManager.mouseWheelBehavior": go.ToolManager.WheelNone,
                isReadOnly: false,//只读
                ChangedSelection: e => {
                    this.onSelectionChanged(e);
                }
            });
            // var fieldTemplate =
            //     $(go.Panel, "TableRow",  // this Panel is a row in the containing Table
            //         /*new go.Binding("portId", "name"),  // this Panel is a "port"
            //         {
            //             background: "transparent",  // so this port's background can be picked by the mouse
            //             fromSpot: go.Spot.Right,  // links only go from the right side to the left side
            //             toSpot: go.Spot.Left
            //         },  // allow drawing links from or to this port
            //         */
            //     new go.Binding("background", "color"),
            //     //    $(go.Shape,
            //     //         { width: 5, height: 5, column: 0, strokeWidth: 2, margin: 0 },
            //     //         new go.Binding("figure", "figure"),
            //     //         new go.Binding("background", "color")),
            //         $(go.TextBlock,
            //             { margin: new go.Margin(3, 5), column: 1, font: "bold 13px sans-serif" },
            //             new go.Binding("text", "name")),
            //         $(go.TextBlock,
            //             { margin: new go.Margin(3, 5), column: 2, font: "13px sans-serif" },
            //             new go.Binding("text", "value"))
            //     );
            // 一行两列显示
            var fieldTemplate =
            $(go.Panel, "TableRow",
            new go.Binding("row", "itemIndex",
            function(i) { return Math.floor(i/2) })
            .ofObject(),
            $(go.TextBlock,
                { textAlign: 'center',width:160,height:45,verticalAlignment:go.Spot.Center},
                new go.Binding("text", "name"),
                new go.Binding("font", "tableFontSize",function(tableFontSize){ return tableFontSize+"px sans-serif"}),
                // new go.Binding("marginLeft", "itemIndex", function(i) { return i%2 === 0 ? 2 : 20 }).ofObject(),
                new go.Binding("column", "itemIndex", function(i) { return  i%2*4+0 }).ofObject(),
                new go.Binding("background", "color")
                ),
            )
            var partContextMenu = $(
                "ContextMenu","Vertical",
                {
                    background: "transparent",
                    width: 100,
                    margin: new go.Margin(10, 10, 10, 10),
                    visible: true,
                },
                new go.Binding("visible", "files",files=>(files.length>0?true:false)),
                $("ContextMenuButton",
                    {
                        "ButtonBorder.fill": "#45ad2a",
                        "ButtonBorder.stroke": "#eee",
                        "ButtonBorder.strokeWidth": 1,
                        "_buttonFillOver": "#9bc690",
                        "_buttonStrokeOver": "#9bc690",
                        "_buttonStrokePressed": "#9bc690",
                        "_buttonFillPressed": "#9bc690",
                        visible: true,
                        margin: new go.Margin(10, 0, 10, 0),
                    },
                
                    $(go.TextBlock, {
                        text: "钻取分析",
                        margin: new go.Margin(5, 0, 5, 0),
                        stroke:"#fff"
                    }),
                    {
                        cursor: "pointer",
                        click: (e, obj) => {
                            let url=decodeURI(this.currentmodule.api)
                            let ip=url.substring(8,url.indexOf('/webservice'))
                            let type=getQueryString(url,'groupType1')
                            let groupArgument1=getQueryString(url,'groupArgument1')
                            this.analyze(type,ip,groupArgument1)

                        },
                    }
                )
            )
             // 后加得
      function makeLayout(horiz) {  // a Binding conversion function
        if (horiz) {
          return new go.GridLayout(
            {
              wrappingWidth: Infinity, alignment: go.GridLayout.Position,
              cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
            });
        } else {
          return new go.GridLayout(
            {
              wrappingColumn: 1, alignment: go.GridLayout.Position,
              cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
            });
        }
      }

      function defaultColor(horiz) {  // a Binding conversion function
        return horiz ? "rgba(255, 221, 51, 0.55)" : "rgba(51,211,229, 0.5)";
      }

      function defaultFont(horiz) {  // a Binding conversion function
        return horiz ? "bold 20px sans-serif" : "bold 16px sans-serif";
      }

      // this function is used to highlight a Group that the selection may be dropped into
      function highlightGroup(e, grp, show) {
        if (!grp) return;
        e.handled = true;
        if (show) {
          // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
          // instead depend on the DraggingTool.draggedParts or .copiedParts
          var tool = grp.diagram.toolManager.draggingTool;
          var map = tool.draggedParts || tool.copiedParts;  // this is a Map
          // now we can check to see if the Group will accept membership of the dragged Parts
          if (grp.canAddMembers(map.toKeySet())) {
            grp.isHighlighted = true;
            return;
          }
        }
        grp.isHighlighted = false;
      }

      // Upon a drop onto a Group, we try to add the selection as members of the Group.
      // Upon a drop onto the background, or onto a top-level Node, make selection top-level.
      // If this is OK, we're done; otherwise we cancel the operation to rollback everything.
      function finishDrop(e, grp) {
        var ok = (grp !== null
          ? grp.addMembers(grp.diagram.selection, true)
          : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
        if (!ok) e.diagram.currentTool.doCancel();
      }

            // 后加得
      this.myDiagram.groupTemplate =
        new go.Group("Auto",
          {
            background: "blue",
            ungroupable: true,
            // highlight when dragging into the Group
            mouseDragEnter: (e, grp, prev) => highlightGroup(e, grp, true),
            mouseDragLeave: (e, grp, next) => highlightGroup(e, grp, false),
            computesBoundsAfterDrag: true,
            // when the selection is dropped into a Group, add the selected Parts into that Group;
            // if it fails, cancel the tool, rolling back any changes
            mouseDrop: finishDrop,
            handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
            // Groups containing Groups lay out their members horizontally
            // layout: makeLayout(false)
          })
          .bind(new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
            go.Point.stringify
          ))
          .bind(new go.Binding('isSubGraphExpanded','expand'))
          .bind("layout", "horiz", makeLayout)
          .bind(new go.Binding("background", "isHighlighted", h => h ? "rgba(255,0,0,0.2)" : "transparent").ofObject())
          .add(new go.Shape("Rectangle",
            { contextMenu: partContextMenu },
            { fill: null, stroke: null, fill: defaultColor(false), strokeWidth: 2 })
            .bind("stroke", "stroke")
            .bind("fill", "fill", (h,node) =>{
            //   console.log('node',node.part.data)
              if(node.part.data.expand){
                // console.log('展开')
                return node.part.data.definedFill
              }else{
                // console.log('折叠',node.part.data.warnBgFill)
                return node.part.data.warnBgFill
              }
            })
            )
            // .bind("fill", "horiz", defaultColor))
          .add(
            new go.Panel("Vertical")  // title above Placeholder
              .add(new go.Panel("Horizontal",  // button next to TextBlock
                { contextMenu: partContextMenu },
                { stretch: go.GraphObject.Horizontal, background: defaultColor(false) })
                // .bind("background", "horiz", defaultColor)
                // .bind("background", "fill")
                .add(go.GraphObject.make("SubGraphExpanderButton", { alignment: go.Spot.Right, margin: 5,
                click: (e, node)=> {
                    // console.log('this.myDiagram.model.nodeDataArray',this.myDiagram.model.nodeDataArray)
                    // console.log('eee',this.currentmodule)
                    // console.log('node',node.part.data)
                    let group=node.part.data
                    let isExpand=!node.part.data.expand
                    // console.log('isExpand',isExpand)
                    this.currentmodule = node.part.data;
                    this.myDiagram.model.setDataProperty(
                      this.currentmodule,
                      "expand",
                      isExpand
                    );
                    if(!isExpand){
                    //   console.log('========折叠==========')
                      // 逻辑处理  折叠之后区块背景颜色显示报警级别较高的颜色
                      this.currentGroupColorList=[]
                      this.currentGroupKeys=[]
                      this.deepData(this.myDiagram.model.nodeDataArray,this.currentmodule.key)
                    // 连线
                      // console.log('currentGroupKeys',this.currentGroupKeys)
                      this.myDiagram.model.linkDataArray.forEach(item=>{
                        if(this.currentGroupKeys.indexOf(item.from)!==-1&&this.currentGroupKeys.indexOf(item.to)!==-1){
                          this.currentGroupColorList.push(item.warningTip)
                        }
                      })
                    //   console.log('currentGroupColorList',this.currentGroupColorList)
                      if(this.currentGroupColorList.indexOf('#ff0000')!=-1){
                        this.myDiagram.model.setDataProperty(this.currentmodule,"warnBgFill","#ff0000");
                      }else if(this.currentGroupColorList.indexOf('#ff9900')!=-1){
                        this.myDiagram.model.setDataProperty(this.currentmodule,"warnBgFill","#ff9900");
                      }else if(this.currentGroupColorList.indexOf('#ffff00')!=-1){
                        this.myDiagram.model.setDataProperty(this.currentmodule,"warnBgFill","#ffff00");
                      }else{
                        this.myDiagram.model.setDataProperty(this.currentmodule,"warnBgFill",node.part.data.definedFill);
                      }
                      this.myDiagram.model.setDataProperty(
                        this.currentmodule,
                        "fill",
                        node.part.data.warnBgFill
                      );
                      // this.myDiagram.model.updateTargetBindings(this.currentmodule)
                    }else{
                    //   console.log('========展开==========')
                      this.myDiagram.model.setDataProperty(
                        this.currentmodule,
                        "fill",
                        node.part.data.definedFill
                      );
                    }
                    // this.myDiagram.model.updateTargetBindings(this.currentmodule)
                  }
                }))
                .add(new go.TextBlock(
                  {
                    alignment: go.Spot.Left,
                    editable: true,
                    margin: 5,
                    // font: defaultFont(false),
                    // opacity: 0.95,  // allow some color to show through
                    // stroke: "#404040"
                  })
                  .bind("stroke", "titleFontColor")
                  .bind("font", "titleFontSize",function(titleFontSize){ return titleFontSize+"px sans-serif"})
                  .bind("font", "horiz", defaultFont)
                  .bind("text", "text", null, null)
                  ) // `null` as the fourth argument makes this a two-way binding
              )  // end Horizontal Panel
              .add(new go.Placeholder({ padding: 5, alignment: go.Spot.TopLeft }))
          ), // end Vertical Panel
            // 节点布局
            this.myDiagram.nodeTemplate =
            $(go.Node, "Spot",
                { locationSpot: go.Spot.Center },
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                // the main object is a Panel that surrounds a TextBlock with a Shape
                $(go.Panel, "Auto",
                    { name: "PANEL" },
                    // new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                    $(go.Shape, "RoundedRectangle",  // default figure
                        {
                            portId: "", // the default port: if no spot on link data, use closest side
                            cursor: "pointer",
                            fill: "transparent",  // default color
                            stroke:'transparent',
                            strokeWidth:2,
                            minSize:new go.Size(100, NaN),
                        },
                        new go.Binding("figure"),
                        new go.Binding("fill"),
                        new go.Binding("stroke")
                    ),
                    $(go.Panel, "Vertical",
                        $(go.Picture,
                            {row: 1,margin:2,background:"white"},
                            new go.Binding("source"),
                            new go.Binding("background","warningTip")),
                        $(go.TextBlock,
                            {
                               row: 2,
                                margin: 0,
                                maxSize: new go.Size(NaN, NaN),
                                isMultiline: true,
                                wrap: go.TextBlock.WrapFit,
                                editable: true,
                                stroke:"#333",
                                textAlign: "left"
                            },
                            new go.Binding("text").makeTwoWay(),
                            new go.Binding("stroke","titleFontColor").makeTwoWay(),
                            new go.Binding("font", "titleFontSize",function(titleFontSize){ return titleFontSize+"px sans-serif"}),
                        ),
                            $(go.Panel, "Table",
                                {
                                    defaultColumnSeparatorStrokeWidth: 1,
                                    defaultColumnSeparatorStroke: "gray",
                                    defaultSeparatorPadding: 2,
                                    defaultRowSeparatorStrokeWidth: 1,
                                    defaultRowSeparatorStroke: "gray",
                                    defaultSeparatorPadding: 2,
                                    row: 0,
                                    name: "TABLE",
                                    padding: 0,
                                    // minSize: new go.Size(NaN, NaN),
                                    defaultStretch: go.GraphObject.Horizontal,
                                    itemTemplate: fieldTemplate,
                                    background:"#fff",
                                },
                                new go.Binding("background", "tableBg").makeTwoWay(),
                                new go.Binding("itemArray", "files").makeTwoWay(),
                                new go.Binding("visible", "files",files=>(files.length>0?true:false)),
                                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(
                                    go.Size.stringify
                                ),
                            ),


                    ),
                    {
                        // this tooltip Adornment is shared by all nodes
                        // this context menu Adornment is shared by all nodes
                        contextMenu: partContextMenu
                    },
                    {
                        click: (e, obj)=>{
                        },
                    }
                )
            );

            // 连接线
            this.myDiagram.linkTemplate =
            $(go.Link,  // the whole link panel
                {
                    routing: go.Link.AvoidsNodes,
                    curve: go.Link.JumpOver,
                    corner: 5,
                    toShortLength: 4
                    },
                new go.Binding("fromSpot", "fromSpot", go.Spot.parse),
                new go.Binding("toSpot", "toSpot", go.Spot.parse),
                new go.Binding("fromShortLength", "dir", dir => dir === 2 ? 4 : 0),
                new go.Binding("toShortLength", "dir", dir => dir >= 1 ? 4 : 0),
                new go.Binding("points").makeTwoWay(),
                $(go.Shape,  // the link path shape
                { isPanelMain: true, strokeWidth: 2 },
                new go.Binding('stroke','warningTip'),
                new go.Binding("strokeWidth", "thickness"),
                new go.Binding("strokeDashArray", "dash")),
                $(go.Shape, { isPanelMain: true, stroke: "white", strokeWidth: 3, name: "PIPE",visible:false},new go.Binding("strokeDashArray", "linedash"),new go.Binding("visible", "lineVisible").makeTwoWay()),
                $(go.Shape, { fromArrow: "Backward", strokeWidth: 0, scale: 4/3, visible: false },
                new go.Binding("visible", "dir", dir => dir === 2),
                new go.Binding("fill", "warningTip"),
                new go.Binding("scale", "thickness", t => (2+t)/3)),
                $(go.Shape, { toArrow: "Standard", strokeWidth: 0, scale: 4/3 },
                new go.Binding("visible", "dir", dir => dir >= 1),
                new go.Binding("fill", "warningTip"),
                new go.Binding("scale", "thickness", t => (2+t)/3)),
                $(go.Panel, "Auto",
                {alignment: go.Spot.Center,segmentOffset: new go.Point(0,-20)},
                    $(
                        go.Shape,
                        "RoundedRectangle", // default figure
                        {
                        portId: "", // the default port: if no spot on link data, use closest side
                        cursor: "pointer",
                        fill: "white", // default color
                        stroke: "transparent",
                        strokeWidth: 2
                        },
                        new go.Binding("stroke"),
                        new go.Binding("visible", "files",files=>(files.length>0?true:false)),
                    ),
                    $(go.Panel, "Table",
                        {
                            defaultColumnSeparatorStrokeWidth: 1,
                            defaultColumnSeparatorStroke: "gray",
                            defaultSeparatorPadding: 2,
                            defaultRowSeparatorStrokeWidth: 1,
                            defaultRowSeparatorStroke: "gray",
                            defaultSeparatorPadding: 2,
                            background: "#fff",
                            segmentIndex: 0,
                            segmentOffset: new go.Point(0,-20),
                            row: 1,
                            name: "TABLE",
                            // padding: 5,
                            // minSize: new go.Size(100, 10),
                            defaultStretch: go.GraphObject.Horizontal,
                            itemTemplate: fieldTemplate
                        },
                        new go.Binding("itemArray", "files").makeTwoWay(),
                        new go.Binding("background","fill"),
                        new go.Binding("visible", "files",files=>(files.length>0?true:false)),
                    ),
                ),
                $(go.Panel, "Auto",
                    new go.Binding("visible", "isSelected").ofObject(),
                    $(go.Shape, "RoundedRectangle",  // the link shape
                    { fill: "#F8F8F8", stroke: null }),
                    $(go.TextBlock,
                    {
                    textAlign: "center",
                    font: "10pt helvetica, arial, sans-serif",
                    stroke: "#919191",
                    margin: 2,
                    minSize: new go.Size(10, NaN),
                    editable: true,
                    },
                    new go.Binding("text").makeTwoWay())
                ),
                {
                        // this tooltip Adornment is shared by all nodes
                        // this context menu Adornment is shared by all nodes
                        contextMenu: partContextMenu
                    },
            );
            var opacity = 1;
            var down = true;
            var diagram = this.myDiagram;
            function loop() {
                setTimeout(() => {
                    var oldskips = diagram.skipsUndoManager;
                    diagram.skipsUndoManager = true;
                    diagram.links.each(link => {
                    var shape = link.findObject("PIPE");
                    var off = shape.strokeDashOffset - 3;
                    // animate (move) the stroke dash
                    shape.strokeDashOffset = (off <= 0) ? 60 : off;
                    // animte (strobe) the opacity:
                    if (down) opacity = opacity - 0.01;
                    else opacity = opacity + 0.003;
                    if (opacity <= 0) { down = !down; opacity = 0; }
                    if (opacity > 1) { down = !down; opacity = 1; }
                    shape.opacity = opacity;
                    });
                    diagram.skipsUndoManager = oldskips;
                    loop();
                }, 60);
            }
            loop();  // animate some flow through the pipes
        }
    }
}
</script>

