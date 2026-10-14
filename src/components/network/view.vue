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
import {changeURLArg} from "@/lib/common.js"
export default {
    data(){
        return{
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
            timer:null,
            globalData:{
                bgColor:'rgba(255, 255, 255, 0)'
            }

        }
    },
    mounted(){
        this.init()
        this.moduleContent()
        let vm=this
        window.getNewDate=vm.getNewDate
        this.$nextTick(()=>{
            this.start=parent.startTimeUnix
            this.end=parent.endTimeUnix
            // this.start='1649907720'
            // this.end='1649994120'
        })
    },
    destroyed(){
        clearInterval(this.timer)
    },
    methods:{
        // 重新获取父页面的时间
        getNewDate(){
            clearInterval(this.timer)
            console.log('重新获取时间')
            this.start=parent.startTimeUnix
            this.end=parent.endTimeUnix
            // this.start='1649907720'
            // this.end='1649994120'
            // 根据选择的时间渲染图表数据
            this.moduleContent()
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
                        this.myDiagram.model = go.Model.fromJson(this.jsonData);
                        console.log('this.jsonData',this.jsonData)
                        //   this.getModuleData();
                        // 自动获取
                        this.autoData()
                    }
                }else{
                this.add=true
                }
            }.bind(this))
        },
        async autoData(){
            this.jsonData.linkDataArray.forEach(async (item,index)=>{
                // await this.autoGetData(item)
                if(item.updateTime&&item.api){
                    item.updateTime=Number(item.updateTime)
                    this.timer=setInterval(async function(){
                        // this.myDiagram.model.clear()
                        // this.myDiagram && (this.myDiagram.div = null);
                        // this.myDiagram && this.myDiagram.model && this.myDiagram.model.clear();
                        // this.myDiagram && this.myDiagram.clear();
                        await this.autoGetData(item)
                    }.bind(this),item.updateTime*1000)
                }
            })
            this.jsonData.nodeDataArray.forEach(async (item,index)=>{
                // await this.autoGetData(item)
                if(item.updateTime&&item.api){
                    item.updateTime=Number(item.updateTime)
                    this.timer=setInterval(async function(){
                        // this.myDiagram.model.clear()
                        // this.myDiagram && (this.myDiagram.div = null);
                        // this.myDiagram && this.myDiagram.model && this.myDiagram.model.clear();
                        // this.myDiagram && this.myDiagram.clear();
                        await this.autoGetData(item)
                    }.bind(this),item.updateTime*1000)
                }
            })
            console.log('jsonData',this.jsonData)

        },
        async autoGetData(item){
            // this.myDiagram.div=null
            // if(item.api){
                var param ={
                    // url: currentmodule.config.api,
                    url:changeURLArg(item.api,[{'key':'start',value:this.start},{'key':'end',value:this.end}]),
                }
                let result = await this.ajaxs(param)
                if(result.length>0){
                    // 根据阈值判断color值
                    let array=[]
                    result.forEach(element => {
                        element.metricValues.forEach((metricItem,metricIndex)=>{
                            let color="#ffffff"
                            metricItem.value=Number(metricItem.value)
                            let findItem = item.threshold.find(findItem=>{return findItem.category===metricItem.metric.id})
                            if(findItem.Minor!=''&&findItem.Major!=''&&findItem.Critical!=''){
                                findItem.Major=Number(findItem.Major)
                                findItem.Minor=Number(findItem.Minor)
                                findItem.Critical=Number(findItem.Critical)
                                if(metricItem.value>findItem.Minor&&metricItem.value<findItem.Major){
                                    color='#ffff00'
                                }else if(metricItem.value>findItem.Major&&metricItem.value<findItem.Critical){
                                    color='#ff9900'
                                }else if(metricItem.value>findItem.Critical){
                                    color='#ff0000'
                                    // this.myDiagram.model.setDataProperty(item, "warningTip", "red");
                                    item.warningTip='red'
                                }else{
                                    color='#ffffff'
                                }
                            }
                            array.push({category:metricItem.metric.id,color:color,figure:"Ellipse",name:metricItem.metric.label+'\n'+(metricItem.value).toFixed(2)+metricItem.unit,value:(metricItem.value).toFixed(2)+""+metricItem.unit})
                            // this.myDiagram.model.insertArrayItem(item.files,-1,
                            // {name: metricItem.metric.label, value: (metricItem.value).toFixed(2)+""+metricItem.unit,category:metricItem.metric.id, color: color, figure: "Ellipse"});
                        })
                    });
                    // console.log('array',array)
                    item.files=array
                }
                // this.myDiagram.model = go.Model.fromJson(this.jsonData);
                this.myDiagram.model.updateTargetBindings(item)
            // }
        },
        //
        ajaxs(params){
            return new Promise((resolve, reject) => {
            this.ajax({params}).then(function(res){
                resolve(res)
            },function(err){
                console.log(err);
                reject(err)
            })
            })
        },
        init(){
            if (window.goSamples) goSamples();
            var $ = go.GraphObject.make;//创建对象  // for conciseness in defining templates
            this.myDiagram =$(go.Diagram, "myDiagramDiv",
            {
                allowHorizontalScroll: false,
                // "toolManager.mouseWheelBehavior": go.ToolManager.WheelNone,
                isReadOnly: true,//只读
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
            // {separatorStroke: "black"},
            //  new go.Binding("background", "color"),
            $(go.TextBlock,
                { textAlign: 'center',width:160,height:55,verticalAlignment:go.Spot.Center},
                new go.Binding("text", "name"),
                new go.Binding("font", "tableFontSize",function(tableFontSize){ return tableFontSize+"px sans-serif"}),
                // new go.Binding("marginLeft", "itemIndex", function(i) { return i%2 === 0 ? 2 : 20 }).ofObject(),
                new go.Binding("column", "itemIndex", function(i) { return  i%2*4+0 }).ofObject(),
                new go.Binding("background", "color")
                ),
            )
            // 节点布局
            this.myDiagram.nodeTemplate =
            $(go.Node, "Spot",
                { locationSpot: go.Spot.Center },
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                // the main object is a Panel that surrounds a TextBlock with a Shape
                $(go.Panel, "Auto",
                    { name: "PANEL" },
                    new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                    $(go.Shape, "RoundedRectangle",  // default figure
                        {
                            portId: "", // the default port: if no spot on link data, use closest side
                            // fromLinkable: true,
                            // toLinkable: true,
                            cursor: "pointer",
                            fill: "transparent",  // default color
                            // strokeWidth: 0,
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
                            {row: 1,margin:6,background:"white"},
                            new go.Binding("source"),
                            new go.Binding("background","warningTip")),
                        $(go.TextBlock,
                            {
                                row: 2,
                                // font: "bold 11pt Helvetica, Arial, sans-serif",
                                margin: 2,
                                maxSize: new go.Size(160, NaN),
                                wrap: go.TextBlock.WrapFit,
                                editable: true,
                                stroke:"#333",
                                textAlign: "left"
                            },
                            new go.Binding("text").makeTwoWay(),
                            new go.Binding("stroke","titleFontColor").makeTwoWay(),
                            new go.Binding("font", "titleFontSize",function(titleFontSize){ return titleFontSize+"px sans-serif"}),
                        ),
                        // $(go.Panel,'Position',
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
                                    padding: 2,
                                    // minSize: new go.Size(NaN, NaN),
                                    defaultStretch: go.GraphObject.Horizontal,
                                    itemTemplate: fieldTemplate,
                                    background:"#fff",
                                    // position:new go.Point(0,0)
                                },
                                new go.Binding("background", "tableBg").makeTwoWay(),
                                new go.Binding("itemArray", "files").makeTwoWay(),
                                new go.Binding("visible", "files",files=>(files.length>0?true:false)),
                            ),
                        // ),


                    ),
                    {
                        click: (e, obj)=>{
                            console.log('eee',e)
                        },
                        // selectionChanged: function(part) {
                        //     var shape = part.elt(0);
                        //     shape.fill = part.isSelected ? "red" : "white";
                        // }
                    }
                )
            );
            // 连接线
            this.myDiagram.linkTemplate =
            $(go.Link,  // the whole link panel
                // { relinkableFrom: true, relinkableTo: true, reshapable: true },
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
                        new go.Binding("itemArray", "files").makeTwoWay()
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
                )
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

