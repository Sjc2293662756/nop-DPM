<template>
    <div class="network-editor">
        <div class="header">
            <!-- <div class="header-left">
                <img v-on:click.stop="backToList" src="../../assets/imgs/5.png">
            </div> -->
            <!-- <div class="header-center">
                <span>{{defaultsettings.title}}</span>
            </div> -->
            <div class="header-right">
                <div class="datamax-wrap" v-on:click="globalSetting">
                    <!-- <img src="../../assets/imgs/export.png"> -->
                    <span>属性</span>
                </div>
                <div class="datamax-wrap" v-on:click="exportJson">
                    <img src="../../assets/imgs/export.png">
                    <span>导出</span>
                </div>
                <div class="datamax-wrap">
                    <!-- v-on:click="importJson" -->
                    <!-- <img src="../../assets/imgs/save.png"> -->
                    <!-- <span>导入</span> -->
                    <el-upload
                        class="upload-demo"
                        action="#"
                        :auto-upload="false"
                        :on-change="importJson"
                        :show-file-list="false">
                        <img src="../../assets/imgs/import.png">
                        <span style="color:#fff">导入</span>
                        <!-- <el-button size="small" type="primary">导入</el-button> -->
                    </el-upload>
                </div>
                <div class="datamax-wrap" v-on:click="save">
                    <img src="../../assets/imgs/save.png">
                    <span>保存</span>
                </div>
                <!-- <div class="datamax-check" v-on:click="preView">
                    <img src="../../assets/imgs/pre.png">
                    <span>预览</span>
                </div> -->
            </div>
            <!-- header_right_end -->
        </div>
       <div style="width: 100%; display: flex; justify-content: space-between">
            <div id="myPaletteDiv"
                style="width: 241px; margin-right: 2px; background-color: white; border: 1px solid black; position: relative; -webkit-tap-highlight-color: rgba(255, 255, 255, 0); cursor: auto;">
                <canvas tabindex="0" width="180" height="618"
                    style="position: absolute; top: 0px; left: 0px; z-index: 2; user-select: none; width: 180px; height: 618px; cursor: auto;">This
                    text is displayed if your browser does not support the Canvas HTML element.
                </canvas>
                <div style="position: absolute; overflow: auto; width: 180px; height: 618px; z-index: 1;">
                    <div style="position: absolute; width: 1px; height: 1px;"></div>
                </div>
            </div>
            <div id="myDiagramDiv"
            :style="{background:globalData.bgColor?globalData.bgColor:''}"
                style="flex-grow: 1; height: calc(100vh - 48px); border: 1px solid black; position: relative; -webkit-tap-highlight-color: rgba(255, 255, 255, 0); cursor: auto;">
                <canvas tabindex="0" width="797" height="618"
                    style="position: absolute; top: 0px; left: 0px; z-index: 2; user-select: none; width: 797px; height: 618px; cursor: auto;">This
                    text is displayed if your browser does not support the Canvas HTML element.
                </canvas>
                <div style="position: absolute; overflow: auto; width: 797px; height: 618px; z-index: 1;">
                    <div style="position: absolute; width: 1px; height: 1px;"></div>
                </div>
            </div>
        </div>
        <!-- <div>
            <div><button id="SaveButton" @click="save" :disabled="isDisabled">Save</button>
            Diagram Model saved in JSON format:</div><textarea id="mySavedModel" style="width:100%;height:300px">

            </textarea>
        </div> -->
        <!-- api -->
        <!-- @postParams='getParams' :type='currentmodule.datatype' :api='currentmodule.config.api' -->
        <!-- :type='"averageValues"' -->
        <api-modal ref="refApiModal"  @postParams='getParams' v-if="showApiModal" :type="'averageValues'" :api='currentmodule.api' :threshold='currentmodule.threshold' :styleDataProps="currentmodule.styleData" :updateTimeProps='currentmodule.updateTime' />
        <global-setting ref="refGlobal" @globalParams="globalParams" :globalDataProps="globalData"/>
        <style-setting ref="refStyle"  @postStyle='getStyle' v-if="showStyleModal" :tableStyleDataProps="currentmodule.tableStyleData" :category="currentmodule.category" :borderColor='currentmodule.borderColor'/>
    </div>
</template>
<script>
import { mapActions } from "vuex";
import apiModal from "@/components/ApiModal";
import globalSetting from "@/components/GlobalSetting";
import styleSetting from "@/components/StyleSetting";
import { exportJson, importJson } from "@/apis/module.js";
import {replace_disp_str,replace_disp_str2,replace_unit,num_to_fixed,canvasDataURL} from "@/lib/common.js"
// 截图上传已经修改了toPng的源码，加入了scale的判断
import domtoimage from "dom-to-image";
export default {
  components: {
    apiModal,
    globalSetting,
    styleSetting
  },
  data() {
    return {
      pageName: this.$route.query.pageName,
      id: this.$route.query.id,
      myDiagram: {},
      myPalette: "",
      isDisabled: true,
      currentmodule: {
        threshold: [],
        api: "",
        tableStyleData:{
          bgColor:"#ffffff",
          borderColor:"#ffffff",
          titleFontSize:'14',
          tableFontSize:'14',
          titleFontColor:'#333333'
        }
      },
      showApiModal: true,
      showStyleModal:true,
      add: false,
      globalData: {
        bgColor: "rgba(255, 255, 255, 0)"
      },
      linedashSize:null,
      dashVisible:false,
      currentGroupColorList:[],  //当前点击区块下元素报警颜色集合
      currentGroupKeys:[],  //当前点击区块下元素key的集合
    };
  },
  created() {
    if (window.parent.document.getElementById("time-date")) {
      window.parent.document.getElementById("time-date").style.display = "none";
    }
  },
  mounted() {
    this.moduleContent();
    this.$nextTick(()=>{
      this.init();
    })
  },
  methods: {
    ...mapActions([
      "moduleMessage",
      "fileUpload",
      "editModule",
      "addModule",
      "ajax"
    ]),
    //   导入
    importJson(item) {
      if (this.add) {
        // await this.save('export')
        let datas = JSON.parse(this.myDiagram.model.toJson());
        datas.globalData = this.globalData;
        var params = {
          id: this.$route.query.id,
          // title:"未设置标题",
          // resizetype:1,
          datas: JSON.stringify(datas)
        };
        this.addModule({ params }).then(
          function(res) {
            this.importJsonFun(item);
          }.bind(this)
        );
      } else {
        this.importJsonFun(item);
      }
    },
    importJsonFun(item) {
      let formData = new FormData();
      let file = item.raw;
      formData.append("file", file);
      let postData = {
        formData,
        file_id: this.id
      };
      importJson(postData).then(res => {
        if (res.data.status === 1) {
          this.$Message.success(res.data.message);
          this.moduleContent();
        } else {
          this.$Message.error(res.data.message);
        }
      });
    },
    // 导出
    exportJson() {
      let postData = {
        file_id: this.id
      };
      exportJson(postData).then(res => {
        if (res.data.status === undefined) {
          let json = JSON.stringify(res.data);
          let a = document.createElement("a");
          let blob = new Blob([json], { type: "text/plain" });
          a.download = this.pageName + ".json";
          a.href = URL.createObjectURL(blob);
          a.click();
        } else {
          this.$Message.warning("此页面为空页面，无导出数据！");
        }
      });
    },
    // 全局设置
    globalSetting() {
      this.$refs.refGlobal.openModal();
    },
    // 获取大屏详情
    moduleContent() {
      this.add = false;
      let params = {
        id: this.id
      };
      if (!this.id) {
        return;
      }
      this.moduleMessage({ params }).then(
        function(res) {
          if (res.status == "1") {
            var data = res.data;
            if (!res.data) {
              return;
            }
            if (res.data.cfg_json) {
              if (JSON.parse(res.data.cfg_json).globalData) {
                this.globalData = JSON.parse(res.data.cfg_json).globalData;
              }
              this.myDiagram.animationManager.initialAnimationStyle = go.AnimationManager.None;
              this.myDiagram.model = go.Model.fromJson(
                JSON.parse(res.data.cfg_json)
              );
            }
          } else {
            this.add = true;
          }
        }.bind(this)
      );
    },
    // 获取子组件传递得样式
    getStyle(tableStyleData) {
      this.showStyleModal=false
      this.currentmodule.tableStyleData = tableStyleData;
      // 元件是区块组建和文组块得样式设置
      if(this.currentmodule.noLink){
        this.myDiagram.model.setDataProperty(
          this.currentmodule,
          "definedFill",
          tableStyleData.bgColor
        );
        this.myDiagram.model.setDataProperty(
          this.currentmodule,
          "warnBgFill",
          tableStyleData.bgColor
        );
        this.myDiagram.model.setDataProperty(
          this.currentmodule,
          "fill",
          tableStyleData.bgColor
        );
        this.myDiagram.model.setDataProperty(
            this.currentmodule,
            "stroke",
            tableStyleData.borderColor
          );
      }else{
        this.myDiagram.model.setDataProperty(
          this.currentmodule,
          "tableBg",
          tableStyleData.bgColor
        );
        for(var i=0;i< this.currentmodule.files.length;i++){
          this.myDiagram.model.setDataProperty(
            this.currentmodule.files[i],
            "tableFontSize",
            tableStyleData.tableFontSize
          );
        }
      }
      this.myDiagram.model.setDataProperty(
            this.currentmodule,
            "titleFontColor",
            tableStyleData.titleFontColor
          );
      this.myDiagram.model.setDataProperty(
          this.currentmodule,
          "titleFontSize",
          tableStyleData.titleFontSize
        );
    },
    // 获取子组件传递得url
    getParams(url, thresholdData, updateTime, styleData) {
      this.showApiModal = false;
      this.currentmodule.api = url;
      this.currentmodule.threshold = thresholdData;
      this.currentmodule.updateTime = updateTime;
      this.currentmodule.styleData = styleData;
      var param = {
        url: url
      };
      this.ajaxs(param).then(
        function(res) {
          let result = res;
          if (result.length <= 0) {
            return;
          }
          if (this.currentmodule.type === "node") {
            this.myDiagram.model.setDataProperty(
              this.currentmodule,
              "warningTip",
              "transparent"
            );
          } else if (this.currentmodule.type === "link") {
            this.myDiagram.model.setDataProperty(
              this.currentmodule,
              "warningTip",
              "#333"
            );
          }
          this.myDiagram.model.setDataProperty(
            this.currentmodule,
            "threshold",
            thresholdData
          );
          this.myDiagram.model.setDataProperty(this.currentmodule, "api", url);
          this.myDiagram.model.setDataProperty(
            this.currentmodule,
            "updateTime",
            updateTime
          );
          this.myDiagram.model.setDataProperty(
            this.currentmodule,
            "fill",
            styleData.bgColor
          );
          this.myDiagram.model.setDataProperty(
            this.currentmodule,
            "stroke",
            styleData.borderColor
          );
          // 删除旧数据
          const len = this.currentmodule.files.length;
          for (let j = 0; j < len; j++) {
            this.myDiagram.model.removeArrayItem(this.currentmodule.files);
          }
          // 根据阈值判断color值
          let colorList=[]
          result.forEach(element => {
            element.metricValues.forEach((item, index) => {
              let color = "transparent";
              item.value = parseFloat(item.value);
              let findItem = thresholdData.find(findItem => {
                return findItem.category === item.metric.id;
              });
              findItem.Major?findItem.Major = parseFloat(findItem.Major):findItem.Major='';
              findItem.Minor?findItem.Minor = parseFloat(findItem.Minor):findItem.Minor='';
              findItem.Critical?findItem.Critical = parseFloat(findItem.Critical):findItem.Critical='';
              // Critical 紧急   Major重大    Minor轻微
              if (findItem.Minor &&findItem.Major&&findItem.Critical) {
                if(findItem.symbol==='>'||findItem.symbol==='>='){
                  if (item.value > findItem.Minor && item.value < findItem.Major) {
                    color = "#ffff00";
                  } else if (item.value > findItem.Major && item.value < findItem.Critical) {
                    color = "#ff9900";
                  } else if (item.value > findItem.Critical) {
                    color = "#ff0000";
                  } else {
                    color = "transparent";
                  }
                }else{
                  if (item.value < findItem.Minor && item.value > findItem.Major) {
                    color = "#ffff00";
                  } else if (item.value < findItem.Major && item.value > findItem.Critical) {
                    color = "#ff9900";
                  } else if (item.value < findItem.Critical) {
                    color = "#ff0000";
                  } else {
                    color = "transparent";
                  }
                }
                
              }else if (findItem.Minor &&findItem.Major&&!findItem.Critical) {
                if(findItem.symbol==='>'||findItem.symbol==='>='){
                  if (item.value > findItem.Minor && item.value < findItem.Major) {
                    color = "#ffff00";
                  } else if (item.value > findItem.Major) {
                    color = "#ff9900";
                  }else {
                    color = "transparent";
                  }
                }else{
                  if (item.value < findItem.Minor && item.value > findItem.Major) {
                    color = "#ffff00";
                  } else if (item.value < findItem.Major) {
                    color = "#ff9900";
                  }else {
                    color = "transparent";
                  }
                }
                
              }else if (findItem.Minor&&!findItem.Major&&findItem.Critical) {
                if(findItem.symbol==='>'||findItem.symbol==='>='){
                  if (item.value > findItem.Minor && item.value < findItem.Critical) {
                    color = "#ffff00";
                  } else if (item.value > findItem.Critical) {
                    color = "#ff0000";
                  }else {
                    color = "transparent";
                  }
                }else{
                  if (item.value < findItem.Minor && item.value > findItem.Critical) {
                    color = "#ffff00";
                  } else if (item.value < findItem.Critical) {
                    color = "#ff0000";
                  }else {
                    color = "transparent";
                  }
                }
                
              }else if (!findItem.Minor&&findItem.Major&&findItem.Critical) {
                if(findItem.symbol==='>'||findItem.symbol==='>='){
                  if (item.value > findItem.Major && item.value < findItem.Critical) {
                    color = "#ff9900";
                  } else if (item.value > findItem.Critical) {
                    color = "#ff0000";
                  }else {
                    color = "transparent";
                  }
                }else{
                  if (item.value < findItem.Major && item.value > findItem.Critical) {
                    color = "#ff9900";
                  } else if (item.value < findItem.Critical) {
                    color = "#ff0000";
                  }else {
                    color = "transparent";
                  }
                }
                
              }else if (findItem.Minor&&!findItem.Major&&!findItem.Critical) {
                if(findItem.symbol==='>'||findItem.symbol==='>='){
                  if (item.value > findItem.Minor) {
                    color = "#ffff00";
                  }else {
                    color = "transparent";
                  }
                }else{
                  if (item.value < findItem.Minor) {
                    color = "#ffff00";
                  }else {
                    color = "transparent";
                  }
                }
                
              }else if (!findItem.Minor&&findItem.Major&&!findItem.Critical) {
                if(findItem.symbol==='>'||findItem.symbol==='>='){
                  if (item.value > findItem.Major) {
                    color = "#ff9900";
                  }else {
                    color = "transparent";
                  }
                }else{
                  if (item.value < findItem.Major) {
                    color = "#ff9900";
                  }else {
                    color = "transparent";
                  }
                }
                
              }else if (!findItem.Minor&&!findItem.Major&&findItem.Critical) {
                if(findItem.symbol==='>'||findItem.symbol==='>='){
                  if (item.value > findItem.Critical) {
                    color = "#ff0000";
                  }else {
                    color = "transparent";
                  }
                }else{
                  if (item.value < findItem.Critical) {
                    color = "#ff0000";
                  }else {
                    color = "transparent";
                  }
                }
                
              }
              if(item.unit==='kb/sec'){
                item.value=item.value/1000
              }
              this.myDiagram.model.insertArrayItem(
                this.currentmodule.files,
                -1,
                {
                  name:
                    replace_disp_str2(item.metric.label) +
                    "\n" +
                    num_to_fixed(item.value,3) +
                    replace_unit(item),
                  value: num_to_fixed(item.value,3) + "" + replace_unit(item),
                  category: item.metric.id,
                  color: color,
                  figure: "Ellipse"
                }
              );
              colorList.push(color)
            });

          });
          if(colorList.indexOf('#ff0000')!=-1){
            this.myDiagram.model.setDataProperty(this.currentmodule,"warningTip","#ff0000");
          }else if(colorList.indexOf('#ff9900')!=-1){
            this.myDiagram.model.setDataProperty(this.currentmodule,"warningTip","#ff9900");
          }else if(colorList.indexOf('#ffff00')!=-1){
            this.myDiagram.model.setDataProperty(this.currentmodule,"warningTip","#ffff00");
          }
           this.myDiagram.model.updateTargetBindings(this.currentmodule)
        }.bind(this)
      );
    },
    // 全局设置子组件参数接收
    globalParams(globalData) {
      this.globalData = globalData;
      this.$forceUpdate();
    },
    //
    ajaxs(params) {
      return new Promise((resolve, reject) => {
        this.ajax({ params }).then(
          function(res) {
            resolve(res);
          },
          function(err) {
            reject(err);
          }
        );
      });
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
    init() {
      var vm=this
      if (window.goSamples) goSamples(); // init for these samples -- you don't need to call this
      var $ = go.GraphObject.make; //创建对象  // for conciseness in defining templates
      this.myDiagram = $(
        go.Diagram,
        "myDiagramDiv", // must name or refer to the DIV HTML element
        {
          mouseDrop: e => finishDrop(e, null),
          // layout:  // Diagram has simple horizontal layout
          //   new go.GridLayout(
          //     { wrappingWidth: Infinity, alignment: go.GridLayout.Position, cellSize: new go.Size(1, 1) }),
          // "commandHandler.archetypeGroupData": { isGroup: true, text: "Group", horiz: false },
          // Panel是指该节点的布局方式
          grid: $(
            go.Panel,
            "Grid", //画板元素Grid网格布局
            $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
            $(go.Shape, "LineH", {
              stroke: "gray",
              strokeWidth: 0.5,
              interval: 10
            }),
            $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 }),
            $(go.Shape, "LineV", {
              stroke: "gray",
              strokeWidth: 0.5,
              interval: 10
            })
          ),
          validCycle: go.Diagram.CycleNotDirected,
          "resizingTool.isGridSnapEnabled": true,
          "draggingTool.isGridSnapEnabled": true,
          "rotatingTool.handleAngle": 270,
          "rotatingTool.handleDistance": 30,
          "undoManager.isEnabled": true, //启用ctrl-z和ctrl-y
          ChangedSelection: e => {
            this.onSelectionChanged(e);
          }
        }
      );
      this.myDiagram.model = $(go.GraphLinksModel, {
        copiesArrays: true,
        copiesArrayObjects: true
      });
      // when the document is modified, add a "*" to the title and enable the "Save" button
      // 内容有改动给当前页面加*启用save按钮
      this.myDiagram.addDiagramListener("Modified", e => {
        var button = document.getElementById("SaveButton");
        if (button) {
          this.isDisabled = !this.myDiagram.isModified;
        }
        var idx = document.title.indexOf("*");
        if (this.myDiagram.isModified) {
          if (idx < 0) document.title += "*";
        } else {
          if (idx >= 0) document.title = document.title.substr(0, idx);
        }
      });
      /*
        * 连线消息
        * */
      this.myDiagram.addDiagramListener("LinkDrawn", e => {
        e.diagram.model.setDataProperty(e.subject.data, "files", []);
      });
      // Define a function for creating a "port" that is normally transparent.
      // The "name" is used as the GraphObject.portId, the "spot" is used to control how links connect
      // and where the port is positioned on the node, and the boolean "output" and "input" arguments
      // control whether the user can draw links from or to the port.
      // 元素上节点连线点上下左右四个点 鼠标放上显示点
      // makePort("T", go.Spot.Top, false, true),
      function makePort(name, spot, output, input) {
        // the port is basically just a small transparent square
        return $(go.Shape, "Circle", {
          fill: null, // not seen, by default; set to a translucent gray by showSmallPorts, defined below
          stroke: null,
          desiredSize: new go.Size(7, 7),
          alignment: spot, // align the port on the main Shape
          alignmentFocus: spot, // just inside the Shape
          portId: name, // declare this object to be a "port"
          fromSpot: spot,
          toSpot: spot, // declare where links may connect at this port
          fromLinkable: output,
          toLinkable: input, // declare whether the user may draw links to/from here
          cursor: "pointer" // show a different cursor to indicate potential link point
        });
      }
      // 选中元素框的虚线
      var nodeSelectionAdornmentTemplate = $(
        go.Adornment,
        "Auto",
        $(go.Shape, {
          fill: null,
          stroke: "deepskyblue",
          strokeWidth: 1.5,
          strokeDashArray: [4, 2],
          click: e => {
          }
        }),
        $(go.Placeholder),
        $(
          "Button",
          {
            alignment: go.Spot.TopRight,
            click: (e, node) => {
              this.showApiModal = true;
              this.currentmodule = node.part.data;
              this.currentmodule.type = "node";
              this.$nextTick(res => {
                this.$refs.refApiModal.openApi();
              });
            }
            //click: addNodeAndLink
          }, // this function is defined below
          new go.Binding("visible", "", function(node) {
            // return !a.diagram.isReadOnly;
            if(!node.part.data.noLink){
              return true
            }else{
              return false
            }
          }).ofObject(),
          $(go.Shape, "PlusLine", { desiredSize: new go.Size(6, 6) })
        )
      );
      // 选中框的位置点
      var nodeResizeAdornmentTemplate = $(
        go.Adornment,
        "Spot",
        { locationSpot: go.Spot.Right },
        $(go.Placeholder),
        $(go.Shape, {
          alignment: go.Spot.TopLeft,
          cursor: "nw-resize",
          desiredSize: new go.Size(6, 6),
          fill: "lightblue",
          stroke: "deepskyblue"
        }),
        $(go.Shape, {
          alignment: go.Spot.Top,
          cursor: "n-resize",
          desiredSize: new go.Size(6, 6),
          fill: "lightblue",
          stroke: "deepskyblue"
        }),
        $(go.Shape, {
          alignment: go.Spot.TopRight,
          cursor: "ne-resize",
          desiredSize: new go.Size(6, 6),
          fill: "lightblue",
          stroke: "deepskyblue"
        }),
        $(go.Shape, {
          alignment: go.Spot.Left,
          cursor: "w-resize",
          desiredSize: new go.Size(6, 6),
          fill: "lightblue",
          stroke: "deepskyblue"
        }),
        $(go.Shape, {
          alignment: go.Spot.Right,
          cursor: "e-resize",
          desiredSize: new go.Size(6, 6),
          fill: "lightblue",
          stroke: "deepskyblue"
        }),
        $(go.Shape, {
          alignment: go.Spot.BottomLeft,
          cursor: "se-resize",
          desiredSize: new go.Size(6, 6),
          fill: "lightblue",
          stroke: "deepskyblue"
        }),
        $(go.Shape, {
          alignment: go.Spot.Bottom,
          cursor: "s-resize",
          desiredSize: new go.Size(6, 6),
          fill: "lightblue",
          stroke: "deepskyblue"
        }),
        $(go.Shape, {
          alignment: go.Spot.BottomRight,
          cursor: "sw-resize",
          desiredSize: new go.Size(6, 6),
          fill: "lightblue",
          stroke: "deepskyblue"
        })
      );
      // 选中元素的旋转点
      var nodeRotateAdornmentTemplate = $(
        go.Adornment,
        { locationSpot: go.Spot.Center, locationObjectName: "CIRCLE" },
        $(go.Shape, "Circle", {
          name: "CIRCLE",
          cursor: "pointer",
          desiredSize: new go.Size(7, 7),
          fill: "lightblue",
          stroke: "deepskyblue"
        }),
        $(go.Shape, {
          geometryString: "M3.5 7 L3.5 30",
          isGeometryPositioned: true,
          stroke: "deepskyblue",
          strokeWidth: 1.5,
          strokeDashArray: [4, 2]
        })
      );
      // 一行两列显示
      var fieldTemplate = $(
        go.Panel,
        "TableRow", // this Panel is a row in the containing Table
        new go.Binding("row", "itemIndex", function(i) {
          return Math.floor(i / 2);
        }).ofObject(),
        $(
          go.TextBlock,
          {
            textAlign: "center",
            width: 160,
            height: 45,
            verticalAlignment: go.Spot.Center,
          },
          new go.Binding("text", "name").makeTwoWay(),
          new go.Binding("font", "tableFontSize",function(tableFontSize){ return tableFontSize+"px sans-serif"}),
          new go.Binding("column", "itemIndex", function(i) {
            return (i % 2) * 4 + 0;
          }).ofObject(),
          new go.Binding("background", "color"),

        )
      );
      // 一行一列显示
      // var fieldTemplate =
      // $(go.Panel, "TableRow",  // this Panel is a row in the containing Table
      //     /*new go.Binding("portId", "name"),  // this Panel is a "port"
      //     {
      //         background: "transparent",  // so this port's background can be picked by the mouse
      //         fromSpot: go.Spot.Right,  // links only go from the right side to the left side
      //         toSpot: go.Spot.Left
      //     },  // allow drawing links from or to this port
      //     */
      //    new go.Binding("background", "color"),
      // //    $(go.Shape,
      // //         { width: 5, height: 5, column: 0, strokeWidth: 2, margin: 0 },
      // //         new go.Binding("figure", "figure"),
      // //         new go.Binding("background", "color")),

      //     $(go.TextBlock,
      //         { margin: new go.Margin(3, 5), column: 1, font: "bold 13px sans-serif" },
      //         new go.Binding("text", "name")),
      //     $(go.TextBlock,
      //         { margin: new go.Margin(3, 5), column: 2, font: "13px sans-serif" },
      //         new go.Binding("text", "value"))
      // );
      function makeButton(text, action, visiblePredicate) {
        return $(
          "ContextMenuButton",
          $(go.TextBlock, text),
          { click: action },
          // don't bother with binding GraphObject.visible if there's no predicate
          visiblePredicate
            ? new go.Binding("visible", "", function(o, e) {
                return o.diagram ? visiblePredicate(o, e) : false;
              }).ofObject()
            : {}
        );
      }
      var partContextMenu = $(
        "ContextMenu","Vertical",
         {
            background: "transparent",
            width: 100,
            margin: new go.Margin(10, 10, 10, 10),
        },
        $("ContextMenuButton",
            {
                "ButtonBorder.fill": "#45ad2a",
                "ButtonBorder.stroke": "#45ad2a",
                "ButtonBorder.strokeWidth": 3,
                "_buttonFillOver": "#9bc690",
                "_buttonStrokeOver": "#9bc690",
                "_buttonStrokePressed": "#9bc690",
                "_buttonFillPressed": "#9bc690",
                visible: true,
                margin: new go.Margin(10, 0, 10, 0),
            },
            $(go.TextBlock, {
                text: "样式设置",
                margin: new go.Margin(5, 0, 5, 0),
                stroke:"#fff"
            }),
            {
                cursor: "pointer",
                click: (e, obj) => {
                  this.showStyleModal=true
                  this.$nextTick(()=>{
                    this.$refs.refStyle.openModal();
                  })
                },
            }
        ),
      );
      this.myDiagram.toolManager.draggingTool.fieldTemplate = fieldTemplate;

      // 后加得
      this.myDiagram.groupTemplate =
        new go.Group("Auto",
        //  $(
        //   go.Picture,
        //   { row: 1, margin: 2, background: "white" },
        //   new go.Binding("source"),
        //   new go.Binding("background", "warningTip")
        // ),
        // { locationSpot: go.Spot.Center },
        // new go.Binding("zOrder"),
        // new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
        //   go.Point.stringify
        // ),
        // {
        //   selectable: true,
        //   selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
        // },
        // {
        //   resizable: true,
        //   resizeObjectName: "TABLE",
        //   resizeAdornmentTemplate: nodeResizeAdornmentTemplate
        // },
        // {
        //   rotatable: true,
        //   rotateAdornmentTemplate: nodeRotateAdornmentTemplate
        // },
        // new go.Binding("angle").makeTwoWay(),
          
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
              // console.log('node',node.part.data)
              if(node.part.data.expand){
                // console.log('展开')
                return node.part.data.definedFill
              }else{
                // console.log('折叠',node.part.data.warnBgFill)
                return node.part.data.warnBgFill
              }
              
            }))
            // .bind("fill", "horiz", defaultColor))
          .add(
            new go.Panel("Vertical")  // title above Placeholder
              .add(new go.Panel("Horizontal",  // button next to TextBlock
                { contextMenu: partContextMenu },
                { stretch: go.GraphObject.Horizontal, background: defaultColor(false) })
                // .bind("background", "horiz", defaultColor)
                // .bind("background", "fill")
                .add(go.GraphObject.make("SubGraphExpanderButton", { alignment: go.Spot.Right, margin: 5 ,
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
                      // console.log('========折叠==========')
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
                      // console.log('currentGroupColorList',this.currentGroupColorList)
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
                      // console.log('========展开==========')
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
                    // stroke: "#333"
                  })
                  .bind("stroke", "titleFontColor")
                  .bind("font", "titleFontSize",function(titleFontSize){ return titleFontSize+"px sans-serif"})
                  .bind("font", "horiz", defaultFont)
                  .bind("text", "text", null, null)) // `null` as the fourth argument makes this a two-way binding
              )  // end Horizontal Panel
              .add(new go.Placeholder({ padding:0, alignment: go.Spot.Center }))
          ), // end Vertical Panel
      // 节点布局
      this.myDiagram.nodeTemplate = $(
        go.Node,
        "Spot",
        { locationSpot: go.Spot.Center },
        new go.Binding("zOrder"),
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
          go.Point.stringify
        ),
        {
          selectable: true,
          selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
        },
        {
          resizable: true,
          resizeObjectName: "TABLE",
          resizeAdornmentTemplate: nodeResizeAdornmentTemplate
        },
        {
          rotatable: true,
          rotateAdornmentTemplate: nodeRotateAdornmentTemplate
        },
        new go.Binding("angle").makeTwoWay(),
        $(
          go.Panel,
          "Auto",
          { name: "PANEL" },
          $(
            go.Shape,
            "RoundedRectangle", // default figure
            {
              portId: "", // the default port: if no spot on link data, use closest side
              cursor: "pointer",
              fill: "transparent", // default color
              stroke: "transparent",
              strokeWidth: 2,
              minSize:new go.Size(100, NaN),
            },
            new go.Binding("figure"),
            new go.Binding("fill"),
            new go.Binding("stroke")
          ),
          $(
            go.Panel,
            "Vertical",
            $(
              go.Picture,
              { row: 1, margin: 2, background: "white" },
              new go.Binding("source"),
              new go.Binding("background", "warningTip")
            ),
            $(
              go.TextBlock,
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

            $(
              go.Panel,
              "Table",
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
                // minSize: new go.Size(100, NaN),
                defaultStretch: go.GraphObject.Horizontal,
                itemTemplate: fieldTemplate,
                background: "#fff",
              },
              new go.Binding("background", "tableBg").makeTwoWay(),
              // new go.Binding("font",'tableFontSize'),
              new go.Binding("itemArray", "files").makeTwoWay(),
              new go.Binding("visible", "files",files=>(files.length>0?true:false)),
              new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(
                go.Size.stringify
              ),
            ),
            // ),
          ),
          {
            // this tooltip Adornment is shared by all nodes
            // this context menu Adornment is shared by all nodes
            contextMenu: partContextMenu
          },
          {
            click: (e, obj) => {
            }
          }
        ),

        // four small named ports, one on each side:
        makePort("T", go.Spot.Top, true, true),
        makePort("L", go.Spot.Left, true, true),
        makePort("R", go.Spot.Right, true, true),
        makePort("B", go.Spot.Bottom, true, true),
        {
          // handle mouse enter/leave events to show/hide the ports
          mouseEnter: function(e, node) {
            showSmallPorts(node, true);
          },
          mouseLeave: function(e, node) {
            showSmallPorts(node, false);
          }
        }
      );
      
          
      function showSmallPorts(node, show) {
        node.ports.each(function(port) {
          if(!node.part.data.noLink){
            if (port.portId !== "") {
              // don't change the default port, which is the big shape
              port.fill = show ? "rgba(0,0,0,.3)" : null;
            }
          }

        });
      }
      // 连接线得选中颜色
      var linkSelectionAdornmentTemplate = $(
        go.Adornment,
        "Link",
        $(
          go.Shape,
          // isPanelMain declares that this Shape shares the Link.geometry
          {
            isPanelMain: true,
            fill: null,
            stroke: "deepskyblue",
            strokeWidth: 0
          }
        ) // use selection object's strokeWidth
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
            if (shape) {
              var off = shape.strokeDashOffset
                ? shape.strokeDashOffset - 3
                : "";
              // animate (move) the stroke dash
              shape.strokeDashOffset = off <= 0 ? 60 : off;
              // animte (strobe) the opacity:
              if (down) opacity = opacity - 0.01;
              else opacity = opacity + 0.003;
              if (opacity <= 0) {
                down = !down;
                opacity = 0;
              }
              if (opacity > 1) {
                down = !down;
                opacity = 1;
              }
              shape.opacity = opacity;
            }
          });
          diagram.skipsUndoManager = oldskips;
          loop();
        }, 60);
      };
      loop(); // animate some flow through the pipes
      // 连接线
      this.myDiagram.linkTemplate = $(
        go.Link, // the whole link panel
        {
          selectable: true,
          selectionAdornmentTemplate: linkSelectionAdornmentTemplate
        },
        {
          layerName: "Foreground",
          routing: go.Link.AvoidsNodes,
          corner: 10,
          toShortLength: 4, // assume arrowhead at "to" end, need to avoid bad appearance when path is thick
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          resegmentable: true,
          curve: go.Link.None
        },
        new go.Binding("fromSpot", "fromSpot", go.Spot.parse),
        new go.Binding("toSpot", "toSpot", go.Spot.parse),
        new go.Binding("fromShortLength", "dir", dir => (dir === 2 ? 4 : 0)),
        new go.Binding("toShortLength", "dir", dir => (dir >= 1 ? 4 : 0)),
        new go.Binding("points").makeTwoWay(), // TwoWay due to user reshaping with LinkReshapingTool
        $(
          go.Shape,
          { isPanelMain: true, strokeWidth: 2 },
          new go.Binding("stroke", "warningTip"),
          new go.Binding("strokeWidth", "thickness"),
          new go.Binding("strokeDashArray", "dash")
        ),
        $(
          go.Shape,
          {
            isPanelMain: true,
            stroke: "white",
            strokeWidth: 3,
            name: "PIPE",
            visible: false
          },
          new go.Binding("strokeDashArray", "linedash"),
          new go.Binding("visible", "lineVisible").makeTwoWay()
        ),
        $(
          go.Shape,
          {
            fromArrow: "Backward",
            strokeWidth: 0,
            scale: 4 / 3,
            visible: false,
            margin:new go.Margin(2,2,2,-20)
          },
          new go.Binding("visible", "dir", dir => dir === 2),
          new go.Binding("fill", "warningTip"),
          new go.Binding("scale", "thickness", t => (2 + t) / 3)
        ),
        $(
          go.Shape,
          { toArrow: "Standard", strokeWidth: 0, scale: 4 / 3 },
          new go.Binding("visible", "dir", dir => dir >= 1),
          new go.Binding("fill", "warningTip"),
          new go.Binding("scale", "thickness", t => (2 + t) / 3)
        ),
        //
        $(
          go.TextBlock,
          { alignmentFocus: new go.Spot(0, 1, -4, 0), editable: true },
          new go.Binding("text").makeTwoWay(), // TwoWay due to user editing with TextEditingTool
          new go.Binding("stroke", "warningTip")
        ),
        $(
          go.Panel,
          "Auto",
          { alignment: go.Spot.Center, segmentOffset: new go.Point(0, -20) },
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
          $(
            go.Panel,
            "Table",
            {
              defaultColumnSeparatorStrokeWidth: 1,
              defaultColumnSeparatorStroke: "gray",
              defaultSeparatorPadding: 2,
              defaultRowSeparatorStrokeWidth: 1,
              defaultRowSeparatorStroke: "gray",
              defaultSeparatorPadding: 2,
              background: "#fff",
              segmentIndex: 0,
              segmentOffset: new go.Point(0, -20),
              row: 1,
              name: "TABLE",
              defaultStretch: go.GraphObject.Horizontal,
              itemTemplate: fieldTemplate
            },
            new go.Binding("itemArray", "files").makeTwoWay(),
            new go.Binding("background","fill"),
            new go.Binding("visible", "files",files=>(files.length>0?true:false)),
          )
        ),
        $(
          "Button",
          {
            alignment: go.Spot.TopRight,
            click: (e, node) => {
              this.showApiModal = true;
              this.currentmodule = node.part.data;
              this.currentmodule.type = "link";
              this.$nextTick(res => {
                this.$refs.refApiModal.openApi();
              });
            }
            //click: addNodeAndLink
          }, // this function is defined below
          new go.Binding("visible", "showbtn"),
          $(go.Shape, "PlusLine", { desiredSize: new go.Size(6, 6) })
        )
      );
      this.myPalette = $(
        go.Palette,
        "myPaletteDiv", // must name or refer to the DIV HTML element
        {
          // maxSelectionCount: 1,
          groupTemplateMap: this.myDiagram.groupTemplateMap,
          nodeTemplateMap: this.myDiagram.nodeTemplateMap, // share the templates used by myDiagram
          // simplify the link template, just in this Palette
          linkTemplate: $(
            go.Link,
            {
              // because the GridLayout.alignment is Location and the nodes have locationSpot == Spot.Center,
              // to line up the Link in the same manner we have to pretend the Link has the same location spot
              locationSpot: go.Spot.Center,
              selectionAdornmentTemplate: $(
                go.Adornment,
                "Link",
                { locationSpot: go.Spot.Center },
                $(go.Shape, {
                  isPanelMain: true,
                  fill: null,
                  stroke: "deepskyblue",
                  strokeWidth: 0
                }),
                $(
                  go.Shape, // the arrowhead
                  { toArrow: "Standard", stroke: null }
                )
              )
            },
            {
              routing: go.Link.AvoidsNodes,
              curve: go.Link.JumpOver,
              corner: 5,
              toShortLength: 4
            },
            new go.Binding("points"),
            $(
              go.Shape, // the link path shape
              { isPanelMain: true, strokeWidth: 2 }
            ),
            $(
              go.Shape, // the arrowhead
              { toArrow: "Standard", stroke: null }
            )
          ),
          model: new go.GraphLinksModel([
            // specify the contents of the Palette
            
            {
              text: "文本",
              fill: "transparent",
              stroke: null,
              warningTip: "transparent",
              files: [],
              tableBg: "white",
              noLink:true,
              category:'textBlock',
              zOrder:2,
              borderColor:true
            },{
              text: "数据块",
              fill: "transparent",
              stroke: null,
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              zOrder:2,
              resizeObjectName:'TABLE'
            },
            {
              text: "区块",
              fill: "#fff",
              definedFill: "#fff", //自定义背景颜色
              warnBgFill: "#fff",  //折叠之后如果有报警显示报警级别最高得背景颜色
              source: require("@/assets/imgs/network/u2.png"),
              stroke: "#333",
              warningTip: "transparent",
              files: [],
              tableBg: "white",
              zOrder:2,
              isGroup: true,
              noLink:true,
              category:'textBlock',
              expand:true,
              borderColor:true
            },
            {
              text: "核心交换机",
              fill: "transparent",
              source: require("@/assets/imgs/network/u1.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2,
              resizeObjectName:'TABLE'
            },
            {
              text: "汇聚交换机",
              fill: "transparent",
              source: require("@/assets/imgs/network/u2.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "路由器",
              fill: "transparent",
              source: require("@/assets/imgs/network/u3.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "防火墙",
              fill: "transparent",
              source: require("@/assets/imgs/network/u4.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "IPS",
              fill: "transparent",
              source: require("@/assets/imgs/network/u5.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "VPN",
              fill: "transparent",
              source: require("@/assets/imgs/network/u6.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },

            {
              text: "通用服务器",
              fill: "transparent",
              source: require("@/assets/imgs/network/simpleServer.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },{
              text: "Web服务器",
              fill: "transparent",
              source: require("@/assets/imgs/network/webServer.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },{
              text: "文件服务器",
              fill: "transparent",
              source: require("@/assets/imgs/network/fileServer.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },{
              text: "磁盘阵列",
              fill: "transparent",
              source: require("@/assets/imgs/network/u8.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "采集点",
              fill: "transparent",
              source: require("@/assets/imgs/network/u9.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "无线网卡",
              fill: "transparent",
              source: require("@/assets/imgs/network/u7.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },

            {
              text: "WAN",
              fill: "transparent",
              source: require("@/assets/imgs/network/u11.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },

            {
              text: "城市",
              fill: "transparent",
              source: require("@/assets/imgs/network/u14.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "住宅",
              fill: "transparent",
              source: require("@/assets/imgs/network/u15.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "1U设备",
              fill: "transparent",
              source: require("@/assets/imgs/network/u26.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "2U设备",
              fill: "transparent",
              source: require("@/assets/imgs/network/u27.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "4U设备",
              fill: "transparent",
              source: require("@/assets/imgs/network/u28.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
          ])
        }
      );
      // A button-defining helper function that returns a click event handler.
      // PROPNAME is the name of the data property that should be set to the given VALUE.
      function ClickFunction(propname, value, visible, linedash) {
        return (e, obj) => {
          if(propname=='dash'||propname=='thickness'){
            vm.dashVisible=visible
            vm.linedashSize=linedash
          }
          // console.log('dashVisible',vm.dashVisible)
          e.handled = true; // don't let the click bubble up
          e.diagram.model.commit(m => {
            m.set(obj.part.adornedPart.data, propname, value);
            m.set(obj.part.adornedPart.data, "lineVisible", vm.dashVisible);
            m.set(obj.part.adornedPart.data, "linedash", vm.linedashSize);
          });
        };
      }
      // Create a context menu button for setting a data property with a stroke dash Array value.
      function DashButton(dash, propname) {
        if (!propname) propname = "dash";
        return $(go.Shape, "LineH", {
          width: 24,
          height: 16,
          strokeWidth: 2,
          strokeDashArray: dash,
          margin: 1,
          background: "transparent",
          mouseEnter: (e, shape) => (shape.background = "dodgerblue"),
          mouseLeave: (e, shape) => (shape.background = "transparent"),
          click: ClickFunction(propname, dash,false,null),
          contextClick: ClickFunction(propname, dash,false,null)
        });
      }
      // Create a context menu button for setting a data property with a stroke width value.
      function ThicknessButton(sw, propname, visible, linedash) {
        if (!propname) propname = "thickness";
        if (!visible) {
          visible = false;
          linedash = null;
          vm.dashVisible=false
          vm.linedashSize=null
        } else {
          visible = true;
          linedash = [20, 40];
          vm.dashVisible=true
          vm.linedashSize=[20, 40];
        }
        return $(go.Shape, "LineH", {
          width: 16,
          height: 16,
          strokeWidth: sw,
          margin: 1,
          background: "transparent",
          strokeDashArray: linedash,
          mouseEnter: (e, shape) => (shape.background = "dodgerblue"),
          mouseLeave: (e, shape) => (shape.background = "transparent"),
          click: ClickFunction(propname, sw, visible, linedash),
          contextClick: ClickFunction(propname, sw, visible, linedash)
        });
      }
      function StrokeOptionsButtons() {
        // used by multiple context menus
        return [
          $(
            "ContextMenuButton",
            $(
              go.Panel,
              "Horizontal",
              ThicknessButton(1),
              ThicknessButton(2),
              ThicknessButton(3),
              ThicknessButton(4)
            )
          ),
          $(
            "ContextMenuButton",
            $(
              go.Panel,
              "Horizontal",
              DashButton(null),
              DashButton([2, 4]),
              DashButton([4, 4])
            )
          ),
          $(
            "ContextMenuButton",
            $(
              go.Panel,
              "Horizontal",
              // AnimationLine(null,10)
              ThicknessButton(6, "", true)
            )
          )
        ];
      }
      function ArrowButton(num) {
        
        var geo = "M0 0 M16 16 M0 8 L16 8  M12 11 L16 8 L12 5";
        if (num === 0) {
          geo = "M0 0 M16 16 M0 8 L16 8";
        } else if (num === 2) {
          geo = "M0 0 M16 16 M0 8 L16 8  M12 11 L16 8 L12 5  M4 11 L0 8 L4 5";
        }
        return $(go.Shape, {
          geometryString: geo,
          margin: 2,
          background: "transparent",
          mouseEnter: (e, shape) => (shape.background = "dodgerblue"),
          mouseLeave: (e, shape) => (shape.background = "transparent"),
          click: ClickFunction("dir", num,vm.dashVisible,vm.linedashSize),
          contextClick: ClickFunction("dir", num,vm.dashVisible,vm.linedashSize)
        });
      }
      // Create a context menu button for setting a data property with a color value.
      function ColorButton(color, propname) {
        if (!propname) propname = "warningTip";
        return $(go.Shape, {
          width: 16,
          height: 16,
          stroke: "lightgray",
          fill: color,
          margin: 1,
          background: "transparent",
          mouseEnter: (e, shape) => (shape.stroke = "dodgerblue"),
          mouseLeave: (e, shape) => (shape.stroke = "lightgray"),
          click: ClickFunction(propname, color,vm.dashVisible,vm.linedashSize),
          contextClick: ClickFunction(propname, color,vm.dashVisible,vm.linedashSize)
        });
      }
      function DarkColorButtons() {
        // used by multiple context menus
        return [
          $(
            "ContextMenuButton",
            $(
              go.Panel,
              "Horizontal",
              ColorButton("black"),
              ColorButton("green"),
              ColorButton("blue"),
              ColorButton("red")
            )
          ),
          $(
            "ContextMenuButton",
            $(
              go.Panel,
              "Horizontal",
              ColorButton("brown"),
              ColorButton("magenta"),
              ColorButton("purple"),
              ColorButton("orange")
            )
          )
        ];
      }

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

      this.myDiagram.linkTemplate.contextMenu = $(
        "ContextMenu",
        StrokeOptionsButtons(),
        DarkColorButtons(),
        $(
          "ContextMenuButton",
          $(
            go.Panel,
            "Horizontal",
            ArrowButton(0),
            ArrowButton(1),
            ArrowButton(2)
          )
        )
      );
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
      } else {
      }
      let it = e.diagram.links;
      while (it.next()) {
        let data = it.value.data;
        if (node != it.value) {
          e.diagram.model.setDataProperty(data, "showbtn", false);
        }
      }
    },
    save(type) {
      this.$Spin.show();
      var node = document.getElementById("myDiagramDiv");
      domtoimage
        .toJpeg(node)
        .then(
          (dataUrl)=> {
            canvasDataURL(dataUrl,{quality:0.2},(base64)=>{
              var blobfile = this.dataURLToBlob(base64);
              let file = new File([blobfile], "缩略图.png");
              var formData = new FormData();
              formData.append("file", file);
              let postData = {
                formData,
                id: this.$route.query.id
              };
               this.fileUpload(postData).then((res)=> {
                if (res.status == "1") {
                  this.$Spin.hide();
                  this.saveDiagramProperties(); // do this first, before writing to JSON
                  // document.getElementById(
                  //   "mySavedModel"
                  // ).value = this.myDiagram.model.toJson();
                  let datas = JSON.parse(this.myDiagram.model.toJson());
                  datas.globalData = this.globalData;
                  this.myDiagram.isModified = false;
                  var params = {
                    id: this.$route.query.id,
                    title: "未设置标题",
                    resizetype: 1,
                    datas: JSON.stringify(datas)
                  };
                  if (!this.add) {
                    this.editModule({ params }).then(
                      function(res) {
                        this.$Message.success("保存成功！");
                        this.moduleContent();
                      }.bind(this)
                    );
                  } else {
                    this.addModule({ params }).then(
                      function(res) {
                        this.$Message.success("保存成功！");
                        this.moduleContent();
                      }.bind(this)
                    );
                  }
                } else {
                  this.$Spin.hide();
                  this.$Message.info(res.message);
                }
              });
            })
          }
        ).catch(
          (error)=>{
            this.$Spin.hide();
          }
        );

    },
    //图片转换格式为Blob文件
    dataURLToBlob(dataurl) {
      let arr = dataurl.split(",");
      let mime = arr[0].match(/:(.*?);/)[1];
      let bstr = atob(arr[1]);
      let n = bstr.length;
      let u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },
    saveDiagramProperties() {
      this.myDiagram.model.modelData.position = go.Point.stringify(
        this.myDiagram.position
      );
    }
  }
};
</script>
<style scoped lang="less">
.network-editor {
  .header {
    width: 100%;
    padding: 5px;
    height: 48px;
    background: #092819;
    .header-left {
      position: absolute;
      top: 7px;
      left: 10px;
      text-align: center;
      img {
        cursor: pointer;
        height: 28px;
        margin-top: 3px;
      }
    }
    .header-right {
      color: #fff;
      position: absolute;
      right: 10px;
      top: 12px;
      .datamax-check:hover,
      .datamax-set:hover,
      .datamax-wrap:hover {
        color: #ebebeb;
      }
      .datamax-check,
      .datamax-set,
      .datamax-wrap {
        float: left;
        vertical-align: middle;
        cursor: pointer;
        -webkit-transition: 0.3s;
        -moz-transition: 0.3s;
        transition: 0.3s;
        margin-right: 10px;
        text-align: center;
        display: inline-block;
        img {
          margin: auto;
          float: left;
          height: 18px;
          margin-top: 3px;
          margin-right: 5px;
        }
        span {
          margin: 2px auto auto auto;
          float: right;
          font-size: 14px;
        }
      }
    }
    .header-center {
      margin-top: 7px;
      margin-left: auto;
      margin-right: auto;
      color: #fff;
      max-width: 500px;
      text-align: center;
    }
  }
}
</style>

