<template>
    <div class="network-editor">
        <div class="header">
            <!-- <div class="header-left">
                <img v-on:click.stop="backToList" src="../../assets/imgs/5.png">
            </div> -->
            <!-- <div class="header-center">
                <span>{{defaultsettings.title}}</span>
            </div> -- -->
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
                style="flex-grow: 1; height: 620px; border: 1px solid black; position: relative; -webkit-tap-highlight-color: rgba(255, 255, 255, 0); cursor: auto;">
                <canvas tabindex="0" width="797" height="618"
                    style="position: absolute; top: 0px; left: 0px; z-index: 2; user-select: none; width: 797px; height: 618px; cursor: auto;">This
                    text is displayed if your browser does not support the Canvas HTML element.
                </canvas>
                <div style="position: absolute; overflow: auto; width: 797px; height: 618px; z-index: 1;">
                    <div style="position: absolute; width: 1px; height: 1px;"></div>
                </div>
            </div>
        </div>
        <div>
            <div><button id="SaveButton" @click="save" :disabled="isDisabled">Save</button>
            <!-- <button @click="load">Load</button> -->
            Diagram Model saved in JSON format:</div><textarea id="mySavedModel" style="width:100%;height:300px">
            <!-- { "class": "go.GraphLinksModel",
            "linkFromPortIdProperty": "fromPort",
            "linkToPortIdProperty": "toPort",
            "nodeDataArray": [
            ],
            "linkDataArray": [
            ]} -->
            </textarea>
        </div>
        <!-- api -->
        <!-- @postParams='getParams' :type='currentmodule.datatype' :api='currentmodule.config.api' -->
        <!-- :type='"averageValues"' -->
        <api-modal ref="refApiModal"  @postParams='getParams' v-if="showModal" :type="'averageValues'" :api='currentmodule.api' :threshold='currentmodule.threshold' :styleDataProps="currentmodule.styleData" :updateTimeProps='currentmodule.updateTime' />
        <global-setting ref="refGlobal" @globalParams="globalParams" :globalDataProps="globalData"/>
        <style-setting ref="refStyle"  @postStyle='getStyle' :styleDataProps="currentmodule.tableStyleData" />
    </div>
</template>
<script>
import { mapActions } from "vuex";
import apiModal from "../imgmodules/components/ApiModal";
import globalSetting from "./components/GlobalSetting";
import styleSetting from "./components/StyleSetting";
import { exportJson, importJson } from "@/apis/module.js";
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
        api: ""
      },
      showModal: true,
      add: false,
      globalData: {
        bgColor: "rgba(255, 255, 255, 0)"
      }
    };
  },
  created() {
    if (window.parent.document.getElementById("time-date")) {
      window.parent.document.getElementById("time-date").style.display = "none";
    }
  },
  mounted() {
    this.init();
    this.moduleContent();
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
        console.log(res);
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
          // this.imgmodules = res.data;
          // console.log('imgmodules',this.imgmodules)
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
              this.myDiagram.model = go.Model.fromJson(
                JSON.parse(res.data.cfg_json)
              );
              //   console.log('this.myDiagram.model',JSON.parse(res.data.cfg_json))
              //   this.getModuleData();
            }
          } else {
            this.add = true;
          }
        }.bind(this)
      );
    },
    // 获取子组件传递得样式
    getStyle(tableStyleData) {
      console.log("tableStyleData", tableStyleData);
      this.currentmodule.tableStyleData = tableStyleData;
      this.myDiagram.model.setDataProperty(
        this.currentmodule,
        "tableBg",
        tableStyleData.bgColor
      );
      this.myDiagram.model.setDataProperty(
        this.currentmodule,
        "titleFontSize",
        tableStyleData.titleFontSize
      );
      this.myDiagram.model.setDataProperty(
        this.currentmodule,
        "tableFontSize",
        tableStyleData.tableFontSize
      );
      console.log('currentmodule111',this.currentmodule)
      // this.myDiagram.model.setDataProperty(this.currentmodule, "tableBorder", tableStyleData.borderColor)
      // this.myDiagram.model.setDataProperty(this.currentmodule, "borderRadius", tableStyleData.borderRadius)
      // this.myDiagram.model.updateTargetBindings(this.currentmodule)
      //  this.myDiagram.commit((m)=> {
      //     // alternate between lightblue and lightgreen colors
      //     m.model.set(this.currentmodule, "tableBg", tableStyleData.bgColor);
      // }, "changed shared color");
    },
    // 获取子组件传递得url
    getParams(url, thresholdData, updateTime, styleData) {
      this.showModal = false;
      this.currentmodule.api = url;
      this.currentmodule.threshold = thresholdData;
      this.currentmodule.updateTime = updateTime;
      this.currentmodule.styleData = styleData;
      console.log("currentmodule", this.currentmodule);
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

          result.forEach(element => {
            element.metricValues.forEach((item, index) => {
              let color = "transparent";
              item.value = Number(item.value);
              let findItem = thresholdData.find(findItem => {
                return findItem.category === item.metric.id;
              });
              console.log("findItem", findItem);
              if (
                findItem.Minor != "" &&
                findItem.Major != "" &&
                findItem.Critical != ""
              ) {
                findItem.Major = Number(findItem.Major);
                findItem.Minor = Number(findItem.Minor);
                findItem.Critical = Number(findItem.Critical);
                if (
                  item.value > findItem.Minor &&
                  item.value < findItem.Major
                ) {
                  color = "#ffff00";
                } else if (
                  item.value > findItem.Major &&
                  item.value < findItem.Critical
                ) {
                  color = "#ff9900";
                } else if (item.value > findItem.Critical) {
                  color = "#ff0000";
                  this.myDiagram.model.setDataProperty(
                    this.currentmodule,
                    "warningTip",
                    "red"
                  );
                } else {
                  color = "transparent";
                }
              }
              this.myDiagram.model.insertArrayItem(
                this.currentmodule.files,
                -1,
                {
                  name:
                    item.metric.label +
                    "\n" +
                    item.value.toFixed(2) +
                    item.unit,
                  value: item.value.toFixed(2) + "" + item.unit,
                  category: item.metric.id,
                  color: color,
                  figure: "Ellipse"
                }
              );
            });
          });
        }.bind(this)
      );
    },
    // 全局设置子组件参数接收
    globalParams(globalData) {
      this.globalData = globalData;
      console.log("globalData", this.globalData);
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
            console.log(err);
            reject(err);
          }
        );
      });
    },
    init() {
      if (window.goSamples) goSamples(); // init for these samples -- you don't need to call this
      var $ = go.GraphObject.make; //创建对象  // for conciseness in defining templates
      this.myDiagram = $(
        go.Diagram,
        "myDiagramDiv", // must name or refer to the DIV HTML element
        {
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
          // "initialContentAlignment": go.Spot.Center,//画布初始位置
          // "initialPosition": new go.Point(0, 0),//初始坐标
          // "draggingTool.dragsLink": true,
          // "draggingTool.isGridSnapEnabled": true,
          // "linkingTool.isUnconnectedLinkValid": true,
          // "linkingTool.portGravity": 20,
          // "relinkingTool.isUnconnectedLinkValid": true,
          // "relinkingTool.portGravity": 20,
          // "relinkingTool.fromHandleArchetype":
          // $(go.Shape, "Diamond", { segmentIndex: 0, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "tomato", stroke: "darkred" }),
          // "relinkingTool.toHandleArchetype":
          // $(go.Shape, "Diamond", { segmentIndex: -1, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "darkred", stroke: "tomato" }),
          // "linkReshapingTool.handleArchetype":
          // $(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
          validCycle: go.Diagram.CycleNotDirected,
          ModelChanged: e => {
            if (e.isTransactionFinished) {
              this.showModel();
            }
          },
          "draggingTool.isGridSnapEnabled": true,
          "rotatingTool.handleAngle": 270,
          "rotatingTool.handleDistance": 30,
          // "rotatingTool.snapAngleMultiple": 15,
          // "rotatingTool.snapAngleEpsilon": 15,
          "undoManager.isEnabled": true, //启用ctrl-z和ctrl-y
          // validCycle: go.Diagram.CycleNotDirected,  // don't allow loops
          // // draggingTool: $(FieldDraggingTool),  // use custom DraggingTool
          // // automatically update the model that is shown on this page
          // "ModelChanged": function(e) { if (e.isTransactionFinished) showModel(); },
          // "draggingTool.isGridSnapEnabled": true,
          // // have mouse wheel events zoom in and out instead of scroll up and down
          // //"toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
          // initialAutoScale: go.Diagram.Uniform,
          // "commandHandler.archetypeGroupData": { key: "Group", isGroup: true },
          // "linkingTool.direction": go.LinkingTool.Either,
          // layout: $(go.LayeredDigraphLayout, { isInitial: false, isOngoing: false, layerSpacing: 50 }),
          // "undoManager.isEnabled": true,
          ChangedSelection: e => {
            this.onSelectionChanged(e);
          }
          // "TextEdited": onTextEdited,
        }
      );
      this.myDiagram.model = $(go.GraphLinksModel, {
        copiesArrays: true,
        copiesArrayObjects: true
      });
      // when the document is modified, add a "*" to the title and enable the "Save" button
      // 内容有改动给当前页面加*启用save按钮
      console.log("this.myDiagram.model", this.myDiagram.model);
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
      // 监听缩放part文字溢出事件
      //    this.myDiagram.addDiagramListener("PartResized",(e, obj, node)=>{
      //        console.log('缩放',e)
      //         //获取part数据
      //         var partData = e.subject.part.data;
      //         //获取part大小
      //         var GraphSize = go.Point.parse(partData.size);
      //         console.log('GraphSize',GraphSize)
      //         //通过key值找到model数据
      //         var resizePart = this.myDiagram.model.findNodeDataForKey(partData.key);
      //         console.log('resizePart',resizePart)
      //         console.log('9999',go.Size.stringify(new go.Size(GraphSize.x,GraphSize.y)))
      //         //重新设置part大小
      //         // this.myDiagram.model.setDataProperty(resizePart, 'size', go.Size.stringify(new go.Size(GraphSize.x,GraphSize.y)));
      //         console.log('myDiagram111',this.myDiagram.model)
      //         // this.myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
      //         this.myDiagram.model.setDataProperty(resizePart, "width", "80");
      //       }
      //     )
      /*
        * 连线消息
        * */
      this.myDiagram.addDiagramListener("LinkDrawn", e => {
        console.log("连接线");
        e.diagram.model.setDataProperty(e.subject.data, "files", []);
        // e.diagram.model.setDataProperty(e.subject.data, "todir", 0);
        // e.diagram.model.setDataProperty(e.subject.data, "fromdir", 0);
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
            console.log("选中");
          }
        }),
        $(go.Placeholder),
        $(
          "Button",
          {
            alignment: go.Spot.TopRight,
            click: (e, node) => {
              this.showModal = true;
              this.currentmodule = node.part.data;
              this.currentmodule.type = "node";
              console.log("currentmodule", this.currentmodule);
              this.$nextTick(res => {
                this.$refs.refApiModal.openApi();
              });
            }
            //click: addNodeAndLink
          }, // this function is defined below
          new go.Binding("visible", "", function(a) {
            return !a.diagram.isReadOnly;
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
        /*new go.Binding("portId", "name"),  // this Panel is a "port"
            {
                background: "transparent",  // so this port's background can be picked by the mouse
                fromSpot: go.Spot.Right,  // links only go from the right side to the left side
                toSpot: go.Spot.Left
            },  // allow drawing links from or to this port
            */
        //
        //    $(go.Shape,
        //         { width: 5, height: 5, column: 0, strokeWidth: 2, margin: 0 },
        //         new go.Binding("figure", "figure"),
        //         new go.Binding("background", "color")),

        new go.Binding("row", "itemIndex", function(i) {
          return Math.floor(i / 2);
        }).ofObject(),
        // {separatorStroke: "black"},
        //  new go.Binding("background", "color"),
        $(
          go.TextBlock,
          {
            textAlign: "center",
            width: 160,
            height: 55,
            text: "verticalAlignment:Center",
            verticalAlignment: go.Spot.Center,
            font: "13px sans-serif"
          },
          new go.Binding("text", "name"),

          // new go.Binding("marginLeft", "itemIndex", function(i) { return i%2 === 0 ? 2 : 20 }).ofObject(),
          new go.Binding("column", "itemIndex", function(i) {
            return (i % 2) * 4 + 0;
          }).ofObject(),
          new go.Binding("background", "color"),
          new go.Binding("font", "tableFontSize"),
        )
        // $(go.TextBlock,
        //     { font: "13px sans-serif" ,textAlign: 'left',},
        //     new go.Binding("text", "value"),
        //     new go.Binding("column", "itemIndex", function(i) { return i%2*4+1 }).ofObject(),
        //     new go.Binding("background", "color"))
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
      // https://gojs.net.cn/intro/textBlocks.html

      // var fieldTemplate =
      // $(go.Panel, "Table",  // this Panel is a row in the containing Table
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
      //     // $(go.RowColumnDefinition, { column: 2, width: 4 }),
      //     $(go.TextBlock,
      //         {
      //             row: 0, column: 0,
      //             margin: new go.Margin(3, 5),
      //             // column: 1,
      //             font: "bold 13px sans-serif"
      //         },
      //         new go.Binding("text", "name")),
      //     // $(go.TextBlock,
      //     //     {
      //     //         margin: new go.Margin(3, 5),
      //     //         // column: 2,
      //     //         font: "13px sans-serif" ,
      //     //         row: 1, column: 0
      //     //         },
      //     //     new go.Binding("text", "value"))
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
        "ContextMenu",
        // makeButton("Properties",
        // 	function(e, obj) {  // OBJ is this Button
        // 		var contextmenu = obj.part;  // the Button is in the context menu Adornment
        // 		var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
        // 		// now can do something with PART, or with its data, or with the Adornment (the context menu)
        // 		if (part instanceof go.Link) alert(linkInfo(part.data));
        // 		else if (part instanceof go.Group) alert(groupInfo(contextmenu));
        // 		else alert(nodeInfo(part.data));
        // 	}),
        makeButton(
          "样式设置",
          (e, obj) => {
            console.log("obj", obj);
            // e.diagram.commandHandler.cutSelection();
            this.$refs.refStyle.openModal();
          }
          // function(o) { return o.diagram.commandHandler.canCutSelection(); }
        )
        // makeButton("Copy",
        // 	function(e, obj) { e.diagram.commandHandler.copySelection(); },
        // 	function(o) { return o.diagram.commandHandler.canCopySelection(); }),
        // makeButton("Paste",
        // 	function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.toolManager.contextMenuTool.mouseDownPoint); },
        // 	function(o) { return o.diagram.commandHandler.canPasteSelection(o.diagram.toolManager.contextMenuTool.mouseDownPoint); }),
        // makeButton("Delete",
        // 	function(e, obj) { e.diagram.commandHandler.deleteSelection(); },
        // 	function(o) { return o.diagram.commandHandler.canDeleteSelection(); }),
        // makeButton("Undo",
        // 	function(e, obj) { e.diagram.commandHandler.undo(); },
        // 	function(o) { return o.diagram.commandHandler.canUndo(); }),
        // makeButton("Redo",
        // 	function(e, obj) { e.diagram.commandHandler.redo(); },
        // 	function(o) { return o.diagram.commandHandler.canRedo(); }),
        // makeButton("Group",
        // 	function(e, obj) { e.diagram.commandHandler.groupSelection(); },
        // 	function(o) { return o.diagram.commandHandler.canGroupSelection(); }),
        // makeButton("Ungroup",
        // 	function(e, obj) { e.diagram.commandHandler.ungroupSelection(); },
        // 	function(o) { return o.diagram.commandHandler.canUngroupSelection(); })
      );
      this.myDiagram.toolManager.draggingTool.fieldTemplate = fieldTemplate;
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
        // the main object is a Panel that surrounds a TextBlock with a Shape
        $(
          go.Panel,
          "Auto",
          { name: "PANEL" },
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(
            go.Size.stringify
          ),
          $(
            go.Shape,
            "RoundedRectangle", // default figure
            {
              portId: "", // the default port: if no spot on link data, use closest side
              fromLinkable: true,
              toLinkable: true,
              cursor: "pointer",
              fill: "transparent", // default color
              // strokeWidth: 0,
              stroke: "transparent",
              strokeWidth: 2
            },
            new go.Binding("figure"),
            new go.Binding("fill"),
            new go.Binding("stroke")
          ),
          $(
            go.Panel,
            "Vertical",
            // {resizable:true,resizeObjectName:"SHAPE"},
            $(
              go.Picture,
              { row: 1, margin: 6, background: "white" },
              new go.Binding("source"),
              new go.Binding("background", "warningTip")
            ),
            // $(go.Part,"Vertical",
            $(
              go.TextBlock,
              {
                row: 2,
                font: "bold 11pt Helvetica, Arial, sans-serif",
                margin: 2,
                maxSize: new go.Size(NaN, NaN),
                isMultiline: true,
                // width:200,
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
              new go.Binding("text").makeTwoWay()
              // new go.Binding("width", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
              // new go.Binding("width",'width').makeTwoWay()
            ),
            // ),

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
                minSize: new go.Size(100, NaN),
                defaultStretch: go.GraphObject.Horizontal,
                itemTemplate: fieldTemplate,
                background: "#fff"
                // stroke:'transparent',
                // strokeWidth:2,
                // position:new go.Point(0,0)
              },
              new go.Binding("background", "tableBg").makeTwoWay(),
              // new go.Binding("font",'tableFontSize'),
              new go.Binding("itemArray", "files").makeTwoWay()
            ),
            // ),

            {
              // this tooltip Adornment is shared by all nodes
              // this context menu Adornment is shared by all nodes
              contextMenu: partContextMenu
            }
          ),
          {
            click: (e, obj) => {
              console.log("eee", e);
            }
            // selectionChanged: function(part) {
            //     var shape = part.elt(0);
            //     shape.fill = part.isSelected ? "red" : "white";
            // }
          }
        ),
        // four small named ports, one on each side:
        makePort("T", go.Spot.Top, false, true),
        makePort("L", go.Spot.Left, true, true),
        makePort("R", go.Spot.Right, true, true),
        makePort("B", go.Spot.Bottom, true, false),
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
          if (port.portId !== "") {
            // don't change the default port, which is the big shape
            port.fill = show ? "rgba(0,0,0,.3)" : null;
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
      }
      // var Colors = {
      //     "red": "#be4b15",
      //     "green": "#52ce60",
      //     "blue": "#6ea5f8",
      //     "lightred": "#fd8852",
      //     "lightblue": "#afd4fe",
      //     "lightgreen": "#b9e986",
      //     "pink": "#faadc1",
      //     "purple": "#d689ff",
      //     "orange": "#f08c00"
      // }
      // // a conversion function for translating general color names to specific colors
      // function colorFunc(colorname) {
      //     var c = Colors[colorname]
      //     if (c) return c;
      //     return "gray";
      // }
      // 连接线
      this.myDiagram.linkTemplate = $(
        go.Link, // the whole link panel
        {
          selectable: true,
          selectionAdornmentTemplate: linkSelectionAdornmentTemplate
        },
        // { relinkableFrom: true, relinkableTo: true, reshapable: true },
        // {
        //     routing: go.Link.AvoidsNodes,
        //     curve: go.Link.JumpOver,
        //     corner: 5,
        //     toShortLength: 4
        //     },
        // new go.Binding("points").makeTwoWay(),
        // $(go.Shape,  // the link path shape
        // { isPanelMain: true, strokeWidth: 2 },
        // new go.Binding('stroke','warningTip')
        // // new go.Binding("stroke","from",(f)=>{
        // //     return this.colorSet(f)
        // // })
        // ),
        // $(go.Shape,  // the arrowhead
        // { toArrow: "Standard", stroke: null },
        // new go.Binding('stroke','warningTip'),
        // new go.Binding('fill','warningTip')
        // // new go.Binding("stroke","from",(f)=>{
        // //     return this.colorSet(f)
        // // })
        // ),

        {
          // layerName: "Foreground",
          // routing: go.Link.Normal,
          // corner: 10,
          // toShortLength: 4,  // assume arrowhead at "to" end, need to avoid bad appearance when path is thick
          // relinkableFrom: true, relinkableTo: true,
          // reshapable: true, resegmentable: true,
          // curve: go.Link.Bezier,
          //
          layerName: "Foreground",
          routing: go.Link.AvoidsNodes,
          corner: 10,
          toShortLength: 4, // assume arrowhead at "to" end, need to avoid bad appearance when path is thick
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          resegmentable: true,
          curve: go.Link.None
          //     //
          //      curve: go.Link.Bezier,
          // toEndSegmentLength: 30, fromEndSegmentLength: 30
        },
        new go.Binding("fromSpot", "fromSpot", go.Spot.parse),
        new go.Binding("toSpot", "toSpot", go.Spot.parse),
        new go.Binding("fromShortLength", "dir", dir => (dir === 2 ? 4 : 0)),
        new go.Binding("toShortLength", "dir", dir => (dir >= 1 ? 4 : 0)),
        new go.Binding("points").makeTwoWay(), // TwoWay due to user reshaping with LinkReshapingTool
        $(
          go.Shape,
          { isPanelMain: true, strokeWidth: 2 },
          // new go.Binding("visible", false),
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
            visible: false
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
        // // 流动线
        // $(go.Shape, { isPanelMain: true, stroke: "gray", strokeWidth: 10 },
        // // get the default stroke color from the fromNode
        // new go.Binding("stroke", 'warningTip'),
        // // new go.Binding("stroke", "fromNode", n => go.Brush.lighten((n && Colors[n.data.color]) || "warningTip")).ofObject(),
        // // but use the link's data.color if it is set
        // // new go.Binding("stroke", "color", colorFunc)
        // ),

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
          //  new go.Binding("stroke"),
          // new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(
          //   go.Size.stringify
          // ),
          $(
            go.Shape,
            "RoundedRectangle", // default figure
            {
              portId: "", // the default port: if no spot on link data, use closest side
              fromLinkable: true,
              toLinkable: true,
              cursor: "pointer",
              fill: "white", // default color
              // strokeWidth: 0,
              stroke: "transparent",
              strokeWidth: 2
            },
            new go.Binding("stroke")
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
              // padding: 5,
              // minSize: new go.Size(100, 10),
              defaultStretch: go.GraphObject.Horizontal,
              itemTemplate: fieldTemplate
            },
            new go.Binding("itemArray", "files").makeTwoWay(),
            new go.Binding("background","fill"),
          )
        ),

        // $(go.Panel, "Auto",
        //     new go.Binding("visible", "isSelected").ofObject(),
        //     $(go.Shape, "RoundedRectangle",  // the link shape
        //     { fill: "#F8F8F8", stroke: null }),
        //     $(go.TextBlock,
        //     {
        //     textAlign: "center",
        //     font: "10pt helvetica, arial, sans-serif",
        //     stroke: "#919191",
        //     margin: 2,
        //     minSize: new go.Size(10, NaN),
        //     editable: true,
        //     },
        //     new go.Binding("text").makeTwoWay())
        // ),
        $(
          "Button",
          {
            alignment: go.Spot.TopRight,
            click: (e, node) => {
              this.showModal = true;
              this.currentmodule = node.part.data;
              this.currentmodule.type = "link";
              console.log("this.currentmodule", this.currentmodule);
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
      loop(); // animate some flow through the pipes
      // this.load();  // load an initial diagram from some JSON text
      // initialize the Palette that is on the left side of the page
      console.log("myDiagram.nodeTemplateMap", this.myDiagram.nodeTemplateMap);
      this.myPalette = $(
        go.Palette,
        "myPaletteDiv", // must name or refer to the DIV HTML element
        {
          // maxSelectionCount: 1,
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
              text: "数据块",
              fill: "transparent",
              // source: require("@/assets/imgs/network/dataBlock.png"),
              stroke: null,
              warningTip: "transparent",
              files: [],
              width: "100",
              tableBg: "transparent",
              zOrder:2
            },
            {
              text: "核心交换机",
              fill: "transparent",
              source: require("@/assets/imgs/network/u1.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
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
              source: require("@/assets/imgs/network/u10.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "WAN2",
              fill: "transparent",
              source: require("@/assets/imgs/network/u11.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "便携式",
              fill: "transparent",
              source: require("@/assets/imgs/network/u12.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "采集点2",
              fill: "transparent",
              source: require("@/assets/imgs/network/u13.png"),
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
              text: "手机端",
              fill: "transparent",
              source: require("@/assets/imgs/network/u16.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "交换机或路由器",
              fill: "transparent",
              source: require("@/assets/imgs/network/u17.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "防火墙",
              fill: "transparent",
              source: require("@/assets/imgs/network/u18.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "web服务器",
              fill: "transparent",
              source: require("@/assets/imgs/network/u19.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "网站",
              fill: "transparent",
              source: require("@/assets/imgs/network/u20.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "应用服务器",
              fill: "transparent",
              source: require("@/assets/imgs/network/u21.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "数据库服务器",
              fill: "transparent",
              source: require("@/assets/imgs/network/u22.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "负载均衡",
              fill: "transparent",
              source: require("@/assets/imgs/network/u23.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "终端",
              fill: "transparent",
              source: require("@/assets/imgs/network/u24.png"),
              warningTip: "transparent",
              files: [],
              tableBg: "transparent",
              tableBorder: "transparent",
              zOrder:2
            },
            {
              text: "桌面",
              fill: "transparent",
              source: require("@/assets/imgs/network/u25.png"),
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
            }

            // {
            //   text: "文字块",
            //   fill: "transparent",
            //   stroke: null,
            //   warningTip: "transparent",
            //   files: [],
            //   width: "100",
            //   tableBg: "white"
            // },
            // {
            //   fill: "black",
            //   stroke: null,
            //   warningTip: "transparent",
            //   files: [],
            //   width: "100",
            //   height: "100",
            //   tableBg: "white"
            // }
          ])
        }
      );
      this.myPalette.add(
        $(
          go.Part,
          { locationSpot: go.Spot.Center,zOrder:2 },
          new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
            go.Point.stringify
          ),
          {
            selectable: true,
            // selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
          },
          {
            resizable: true,
            // resizeObjectName: "TextBlock",
            resizeAdornmentTemplate: nodeResizeAdornmentTemplate
          },
          {
            rotatable: true,
            rotateAdornmentTemplate: nodeRotateAdornmentTemplate
          },
          $(
            go.TextBlock,
            "文本",
            {
              verticalAlignment: go.Spot.Center,
              row: 1,
              font: "bold 11pt Helvetica, Arial, sans-serif",
              margin: 15,
              maxSize: new go.Size(NaN, NaN),
              isMultiline: true,
              // width:200,
              wrap: go.TextBlock.WrapFit,
              editable: true,
            }

            // new go.Binding("text").makeTwoWay()
          )
        )
      );
      //   区域块
      this.myPalette.add(
        $(
          go.Part,
          { locationSpot: go.Spot.Center,zOrder:1},
          {
            selectable: true,
            // selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
          },
          {
            resizable: true,
            resizeObjectName: "SHAPE",
            resizeAdornmentTemplate: nodeResizeAdornmentTemplate
          },
          {
            rotatable: true,
            rotateAdornmentTemplate: nodeRotateAdornmentTemplate
          },
          $(go.Shape, "RoundedRectangle", {
            name: "SHAPE",
            width: 100,
            height: 40,
            margin: 4,
            fill: "black",
          })
        )
      );

      // A button-defining helper function that returns a click event handler.
      // PROPNAME is the name of the data property that should be set to the given VALUE.
      function ClickFunction(propname, value, visible, linedash) {
        return (e, obj) => {
          e.handled = true; // don't let the click bubble up
          e.diagram.model.commit(m => {
            m.set(obj.part.adornedPart.data, propname, value);
            m.set(obj.part.adornedPart.data, "lineVisible", visible);
            m.set(obj.part.adornedPart.data, "linedash", linedash);
            console.log("obj.part.adornedPart.data", obj.part.adornedPart.data);
          });
        };
        // return (e, obj) => {
        //     e.handled = true;  // don't let the click bubble up
        //     e.diagram.model.commit(m => {
        //         console.log('obj.part.adornedPart.data',obj.part.adornedPart.data)
        //         if(propname!=='animation'){
        //             m.set(obj.part.adornedPart.data, 'animation', false);
        //         }
        //         m.set(obj.part.adornedPart.data, propname, value);
        //     });
        // };
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
          click: ClickFunction(propname, dash),
          contextClick: ClickFunction(propname, dash)
        });
      }
      // Create a context menu button for setting a data property with a stroke width value.
      function ThicknessButton(sw, propname, visible, linedash) {
        if (!propname) propname = "thickness";
        if (!visible) {
          visible = false;
          linedash = null;
        } else {
          visible = true;
          linedash = [20, 40];
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
      // function AnimationLine(dash, sw){
      //     console.log('999')
      //     // if (!propname) propname = "dash";
      //     return $(go.Shape, "LineH",
      //     {
      //         width: 24, height: 16, strokeWidth: sw,
      //         strokeDashArray: dash,
      //         margin: 1, background: "transparent",
      //         mouseEnter: (e, shape) => shape.background = "dodgerblue",
      //         mouseLeave: (e, shape) => shape.background = "transparent",
      //         click: ClickFunction(propname, dash), contextClick: ClickFunction(propname, dash)
      //     });
      // }

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
              ThicknessButton(10, "", true)
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
          click: ClickFunction("dir", num),
          contextClick: ClickFunction("dir", num)
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
          click: ClickFunction(propname, color),
          contextClick: ClickFunction(propname, color)
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
      console.log("onSelectionChanged", e);
      var node = e.diagram.selection.first();
      let isLink = false;
      if (node instanceof go.Node) {
        this.currentmodule = node.part.data;
        //updateProperties(node.data);
      } else if (node instanceof go.Link) {
        let data = node.data;
        isLink = true;
        //e.diagram.model.startTransaction("update");
        e.diagram.model.setDataProperty(data, "showbtn", true);
        // e.diagram.model.setDataProperty(data, "warningTip", '#333');
        //e.diagram.model.commitTransaction("update");
        //updateProperties(node.data);
      } else {
        //updateProperties(null);
      }
      let it = e.diagram.links;
      while (it.next()) {
        let data = it.value.data;
        if (node != it.value) {
          e.diagram.model.setDataProperty(data, "showbtn", false);
        }
        //var item = it.value;
        //console.log(item)
      }
    },
    //
    showModel() {

      console.log("拖拽到画布",this.myDiagram.model);
      document.getElementById(
        "mySavedModel"
      ).textContent = this.myDiagram.model.toJson();
    },
    // 元件添加属性
    openNodeConfig(e) {
      // openConfig(e,"node")
    },
    colorSet(param) {
      console.log("param", param);
      // return 'red'
    },
    save(type) {
      this.$Spin.show();
      var node = document.getElementById("myDiagramDiv");
      domtoimage
        .toJpeg(node)
        .then(
          function(dataUrl) {
            var blobfile = this.dataURLToBlob(dataUrl);
            let file = new File([blobfile], "缩略图.png");
            var formData = new FormData();
            formData.append("file", file);
            console.log("this.$route.query.id", this.$route.query.id);
            let postData = {
              formData,
              id: this.$route.query.id
            };
            this.fileUpload(postData).then(
              function(res) {
                console.log("2222", res);
                if (res.status == "1") {
                  this.$Spin.hide();
                  this.saveDiagramProperties(); // do this first, before writing to JSON
                  document.getElementById(
                    "mySavedModel"
                  ).value = this.myDiagram.model.toJson();
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
                  // this.$router.push({
                  //   name:"imglist",
                  // })
                  this.$Message.info(res.message);
                }
              }.bind(this)
            );
          }.bind(this),
          function(err) {
            this.$Spin.hide();
            // this.$router.push({
            //   name:"imglist",
            // })
          }.bind(this)
        )
        .catch(
          function(error) {
            this.$Spin.hide();
            // this.$router.push({
            //   name:"imglist",
            // })
            console.error("oops, something went wrong!", error);
          }.bind(this)
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
    // load() {
    //     console.log('document.getElementById("mySavedModel").value',document.getElementById("mySavedModel").value)
    //     this.myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
    //     this.loadDiagramProperties();  // do this after the Model.modelData has been brought into memory
    // },
    saveDiagramProperties() {
      this.myDiagram.model.modelData.position = go.Point.stringify(
        this.myDiagram.position
      );
    }
    //     loadDiagramProperties(e) {
    //     // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
    //     var pos = this.myDiagram.model.modelData.position;
    //     console.log('pos',pos)
    //     if (pos) this.myDiagram.initialPosition = go.Point.parse(pos);
    //   }
  }
};
</script>
<style scoped lang="less">
// .network-editor{
//     width: 100%;
//     height: calc(100vh);
//     background-image:url('../../assets/images/bgImg.png');
//     background-position: center center;
//     background-repeat: no-repeat;
//     background-attachment: fixed;
//     background-size: cover;

// }
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

