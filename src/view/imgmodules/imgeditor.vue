<template>
  <div class="datamax" @keyup.ctrl="ctrEnterUp" @keydown.ctrl="ctrEnterDowm">
    <div class="header">
      <!-- <div class="header-left">
        <img v-on:click.stop="backToList" src="../../assets/imgs/5.png">
      </div> -->
      <!-- <div class="header-center">
        <span>{{defaultsettings.title}}</span>
      </div> -->
      <div class="header-right">
        <div class="datamax-save" v-on:click="exportJson">
             <img src="../../assets/imgs/export.png">
             <span>导出</span>
        </div>
        <div class="datamax-save">
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
        <div class="datamax-save" v-on:click="saveImage">
             <img src="../../assets/imgs/save.png">
             <span>保存</span>
        </div>
        <div class="datamax-check" v-on:click="preView">
             <img src="../../assets/imgs/pre.png">
             <span>预览</span>
        </div>
        <!-- <div class="datamax-set" v-on:click="showDefaultSettings">
          <img src="../../assets/imgs/7.png">
          <span>大屏设置</span>
        </div> -->
      </div>
      <!-- header_right_end -->
    </div>
    <!-- header_end -->
    <!--
      ondragenter 当被鼠标拖动的对象进入其容器范围内时触发此事件
      ondragover 当某被拖动的对象在另一对象容器范围内拖动时触发此事件
      ondrop - 在一个拖动过程中，释放鼠标键时触发此事件
     -->
    <div class="view-container" v-on:ondragenter = "imgDragenterEnter" v-on:dragover = "imgDragenterOver" v-on:drop = "imgDragenterDrop">
      <div class="modules-key">
        <!-- 分类 -->
          <ul class="modules-key-list">
            <li :id="module.id" v-on:click="showModules(module.id)" v-for="(module,index) in modulessource" :key="index">
              <img :src="module.img">
              <span>{{module.name}}</span>
            </li>
          </ul>
           <!-- 分类下得内容 -->
          <div class="modules" :style="modules.style">
            <ul class="modules-items">
              <li  class="modules-item" v-for="item in modules.modulesource" :key="item.id">
                <div class="modules-min">
                  <img v-on:dragstart = "imgDraggable(item.type)" draggable="true" :src="item.src">
                  <span>{{item.name}}</span>
                </div>
              </li>
              <li v-if="modules.modulesource.length==0" style="color:#ececec">
                什么都没有哦！
              </li>
            </ul>
          </div>
          <!-- modules_end -->
      </div>
      <!-- modules-key-end -->
      <div id="view-profile"  :style="modules.imgstyleright" v-on:click.stop="moduleDefaultShow" @scroll.passive="getScroll($event)">
        <div id="view-imgs" ref="view-imgs" :style="modules.imgstyle"  v-on:mousedown.stop="handleMouseDown($event)">
          <div id="imgmodules">
            <!-- imgmoduleitemSelect_box-end -->
            <div class="imgmoduleitem" v-on:mousedown.stop="imgModulesMouseDown($event,item.id)" v-for="item in imgmodules" :id="item.id" :style="item.style">
              <!-- 拖拽手柄 -->
              <!-- <div class="module-drag-handle" v-on:mousedown="imgModulesMouseDown($event,item.id)"></div> -->
              <!-- 对象是图片 -->
              <div v-if="item.type=='tupian'">
                 <!-- :style="{'height':item.style.height,'width':item.style.width}" -->
                 <img :src="item.config.imgsrc" :class="item.style.animation?'animation':''" :style="{'height':(parseFloat(item.style.height.replace('px',''))-2)+'px','width':(parseFloat(item.style.width.replace('px',''))-2)+'px'}">
              </div>
              <!-- 对象是单行文本 -->
              <div class="im-dhwb" v-if="item.type=='danhangwenben'" style="display:flex;align-items:center;justify-content:center">
                <!-- <div :style="item.config.widgets.style">{{item.name}}</div> -->
                <input type="text" v-model="item.name" style="background:transparent;border:none;color:#fff;width:100%;height:100%;padding-left: 10px;padding-right: 10px" :style="item.config.widgets.style">
              </div><!-- im-dhwb_end -->
              <!-- 对象是表格 -->
              <div class="im-bg" v-if="item.type == 'biaoge'">
                <div class="im-bg-container">
                    <div class="im-bg-header table-style">
                      
                      <!-- 表格：ref + key + 延迟渲染列 -->
                      <database-runtime-table :ref="'runtime-' + item.id" v-if="isDpmRuntimeTable(item)" :item="item" :start="start" :end="end" editable @mousedown.native.stop="runtimeTableMouseDown($event, item)" @contextmenu.native.prevent.stop="runtimeTableContextMenu($event, item)" @click.native.stop />
<el-table v-else
                        border
                        :data="item.config.widgets.y"
                        style="width: 100%;"
                        :height="item.style.height"
                        :default-sort="{ prop: 'key1', order: 'descending' }"
                        :style="{
                          fontSize: item.config.widgets.xStyle.fontSize + 'px',
                          color:    item.config.widgets.xStyle.color || '#fff'
                        }"
                        :cell-style="cellStyle"
                        @header-dragend="changeColWidth"

                        
                        :header-row-style="{
                          height:      (item.config.widgets.headerStyle && item.config.widgets.headerStyle.height) + 'px',
                          lineHeight:  (item.config.widgets.headerStyle && item.config.widgets.headerStyle.height) + 'px'
                        }"

                        
                        :header-cell-style="{
                          background:  item.config.widgets.headerStyle && item.config.widgets.headerStyle.background,
                          borderBottom: item.config.widgets.headerStyle && item.config.widgets.headerStyle.border
                                        ? (item.config.widgets.headerStyle.border.width + 'px solid ' +
                                          item.config.widgets.headerStyle.border.color)
                                        : undefined,
                          fontSize:    item.config.widgets.headerStyle && item.config.widgets.headerStyle.text
                                        ? (item.config.widgets.headerStyle.text.size + 'px')
                                        : undefined,
                          color:       item.config.widgets.headerStyle && item.config.widgets.headerStyle.text
                                        ? item.config.widgets.headerStyle.text.color
                                        : undefined,
                          fontWeight:  item.config.widgets.headerStyle && item.config.widgets.headerStyle.text
                                        ? item.config.widgets.headerStyle.text.weight
                                        : undefined
                        }"
                      >
                        <af-table-column
                          v-for="(itemheader, index) in item.config.widgets.x"
                          :key="index"
                          :prop="'key' + index"
                          :label="itemheader.key"
                          :column-key="'key' + index"
                          :width="item.config.width[index]"
                          sortable
                        />
                      </el-table>

                    </div>
                </div>
              </div><!-- im-bg_end -->
              <!-- 对象是数字图 -->
              <div class="im-szt" v-if="item.type=='shuzitu'">
                 <div class="im-szt-container" :style="item.config.widgets.style">
                    <!-- v-for="num in item.config.widgets.text.split('')" -->
                    <div class="im-szt-num" :id='item.id' :style="item.config.widgets.numBackStyle">
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
              <!-- 对象是区块组建 -->
              <div class="im-dhwb" v-if="item.type=='qukuaizujian'">
                <!-- {{item.style}} -->
              </div><!-- im-dhwb_end -->
              <!-- 对象是日期时间 -->
              <div class="im-dhwb" v-if="item.type=='riqishijian'">
                <span :style="item.config.widgets.dateStyle.style">{{filterDate('date',item.config.widgets.dateStyle.fontFormat)}}</span>
                <span :style="item.config.widgets.timeStyle.style">{{filterDate('time',item.config.widgets.timeStyle.fontFormat)}}</span>
                <span :style="item.config.widgets.dayStyle.style">{{filterDate('day',item.config.widgets.dayStyle.fontFormat)}}</span>
              </div>
            </div>
          </div>
          <!-- imgmodules_end -->
          <!-- 网格 -->
          <div id="imggrid" :style="modules.gridstype" style="width:1920px;height:1080px">
            <canvas id='imggriddraw' width="1920" height="1080"></canvas>
          </div>
          <!-- 对象拖动框 -->
          <div id="zoom-container" :class="{ 'runtime-interactive-selection': runtimeSelectionInteractive }" v-on:click.stop="zoomsHidden" v-if="(zooms.show)">
              <div  class="zoom-handles" :style="zooms.style">
                  <span class="zoom-handler handle-left" v-on:mousemove="resizeMouseMove($event)"  v-on:mousedown.stop="resizeMouseDown($event,'left')"></span>

                  <span class="zoom-handler handle-right" v-on:mousemove="resizeRightMouseMove($event)"  v-on:mousedown.stop="resizeMouseDown($event,'right')"></span>

                  <span class="zoom-handler handle-top"  v-on:mousemove="resizeBottomMouseMove($event)"  v-on:mousedown.stop="resizeMouseDown($event,'top')"></span>

                  <span class="zoom-handler handle-bottom"  v-on:mousemove="resizeBottomMouseMove($event)"  v-on:mousedown.stop="resizeMouseDown($event,'bottom')"></span>

                  <span class="zoom-handler handle-lefttop" v-on:mousemove="resizeMouseMove($event)" v-on:mousedown.stop="resizeMouseDown($event,'lefttop')"></span>

                  <span class="zoom-handler handle-leftbottom" v-on:mousemove="resizeMouseMove($event)" v-on:mousedown.stop="resizeMouseDown($event,'leftbottom')"></span>

                  <span class="zoom-handler handle-rightbottom" v-on:mousemove="resizeMouseMove($event)"  v-on:mousedown.stop="resizeMouseDown($event,'rightbottom')"></span>

                  <span class="zoom-handler handle-righttop" v-on:mousemove="resizeMouseMove($event)"  v-on:mousedown.stop="resizeMouseDown($event,'righttop')"></span>
              </div>
              <div v-if="(zooms.show)" v-on:mousemove="boardMouseMove($event)"  v-on:mousedown.stop="boardMouseDown($event)" @contextmenu.prevent=""  id="drop-board" :style="zooms.style">
                  <div class = "item-border" :style="{}"></div>
              </div>
          </div>
          <!-- zoom-container_end -->
        </div>
        <!-- 鼠标右键弹出框 -->
        <div id="view-menu" :style="defaultsettings.menustyle">
          <ul>
            <li v-on:click.stop="moduleTop(2)">置顶</li>
            <li v-on:click.stop="moduleTop(1)">置底</li>
            <li v-on:click.stop="moduleCoppy" v-if="currentmodule.type==='danhangwenben'||currentmodule.type==='qukuaizujian'||currentmodule.type==='tupian'">复制</li>
            <li v-on:click.stop="moduleDeleteShow">删除</li>
            <!-- <li v-on:click.stop="moduleDebug">调试</li> -->
          </ul>
        </div>
        <!-- view-imgs_end -->
      </div>
      <!-- view-profile_end -->
      <!-- 选中对象组件配置 -->
      <div id="view-config" :style="defaultsettings.viewconfigstyle" v-on:click="selectHidden">
          <div class="vc-title">
              组件配置
          </div>
          <div class="vc-container">
            <div class="vc-size">
              <div class="vc-sizewidth">
                <span>宽</span><input @input="handleModuleInput($event,'kuan')" v-on:change="currentmoduleSizeChange($event,'kuan')" v-model="currentmodule.width" type="text" placeholder="宽度">
              </div>
              <div class="vc-sizeheight">
                <span>高</span><input @input="handleModuleInput($event,'gao')"  v-on:change="currentmoduleSizeChange($event,'gao')" v-model="currentmodule.height" type="text" placeholder="高度">
              </div>
              <div class="vc-sizeleft">
                <span>左</span><input @input="handleModuleInput($event,'left')"  v-on:change="currentmoduleSizeChange($event,'left')" v-model="currentmodule.left" type="text" placeholder="左侧">
              </div>
              <div class="vc-sizetop">
                <span>上</span><input @input="handleModuleInput($event,'top')"  v-on:change="currentmoduleSizeChange($event,'top')" v-model="currentmodule.top" type="text" placeholder="顶部">
              </div>
            </div>
            <!-- vc-size_end -->
            <div class="vc-name">
              <span>名称</span><input @input="handleModuleInputName($event)" v-on:change="currentmoduleSizeChange($event,'name')" v-model="currentmodule.name" type="text" maxlength="50" placeholder="请输入组件名称">
            </div>
            <div class="vc-name vc-grade">
              <span>优先级 </span><input @input="handleModuleInput($event,'index')" v-on:change="currentmoduleSizeChange($event,'index')" v-model="currentmodule.zindex" type="text" maxlength="50" placeholder="请输入组件名称">
            </div>
            <div class="vc-style">
              <photoshop-picker  @click.native.stop="colorPickUpdateValue(currentmodule.borderColor)" class="vc-colorpicker" :style="currentmodule.borderColorStyle" v-model="currentmodule.borderColor" v-if="currentmodule.borderColor">
              </photoshop-picker>
              <photoshop-picker  @click.native.stop="colorPickUpdateValue(currentmodule.bgColor)" class="vc-colorpicker" :style="currentmodule.bgColorStyle" v-model="currentmodule.bgColor" v-if="currentmodule.bgColor">
              </photoshop-picker>
              <div class="vc-name">
                <span>元件边框样式 </span>
                <div :style="{'background':currentmodule.borderColor}" v-on:click.stop="colorPickShow($event,'','',100)" class="colorpicker" style="display:inline-block"></div>
              </div>
              <div class="vc-name">
                <span>元件背景颜色 </span>
                <div :style="{'background':currentmodule.bgColor}" v-on:click.stop="colorPickShow($event,'','',101)" class="colorpicker" style="display:inline-block"></div>
              </div>
              <!-- <input @input="handleModuleInput($event,'index')" v-on:change="currentmoduleSizeChange($event,'index')" v-model="currentmodule.borderColor" type="text" maxlength="50" placeholder="请输入组件名称"> -->
            </div>
            <div class="vc-name vc-grade" >
              <span>圆角 </span>
              <input @input="handleRadiusInput($event)" v-on:change="currentmoduleRadiusChange($event)" v-model="currentmodule.borderRadius" type="number" placeholder="圆角">
            </div>
            <div class="vc-name" style="display:flex" v-if="currentmodule.type=='tupian'">
                <span style="display:inline-block;width:70px">是否旋转 </span>
                <div v-if="(currentmodule.animation)" v-on:click.stop="hiddenAnimation" class="colorpicker colorpickershow"></div>
                <div v-if="(!currentmodule.animation)" v-on:click.stop="showAnimation" class="colorpicker colorpickerhidden"></div>
              </div>
            <!-- 对象是图片的配置 -->
            <div class="vc-item vc-background" v-if="(currentmodule.config.img)">
              <div class="vc-titlename">
                图片选择
              </div>
              <div class="vc-bkg-file">
                <div class="vc-bkg-img">
                  <img :src="currentmodule.config.imgsrc">
                </div>
                <input ref="referenceSrcUpload" v-on:change="imgmoduleSrcChange" type="file" accept="image/*" class="vc-upload-input" v-on:click.stop="">
                <div class="vc-bkg-file-choose" :style="defaultsettings.srcchoosestyle">
                  <i class="ivu-icon ivu-icon-ios-cloud-upload" style="font-size: 52px; color: rgb(51, 153, 255);"></i>
                  <p>点击选择图片</p>
                </div>
              </div>
            </div>

            <div class="vc-name vc-sjys" v-if="(currentmodule.config.datas)&&currentmodule.type!='qukuaizujian'">
              <div class="vc-sjys-title">
                <span v-on:click.stop="dataSetHidden" :data-before="currentmodule.config.datasetbeforecontent" class="vc-dc-title">数据样式</span>
                <span v-on:click="addDataTypeConfigGroup" v-if="(currentmodule.type=='zongxiangzhuzhuangtu'||currentmodule.type=='hengxiangzhuzhuangtu'||currentmodule.type=='hengxiangduidiezhuzhuangtu'||currentmodule.type=='zongxiangduidiezhuzhuangtu'||currentmodule.type=='mianjitu'||currentmodule.type=='zhexiantu')" class="vc-adddataconfig">添加</span>
              </div>
              <!-- 纵向柱状图 -->
              <div class="vc-sjys-datas" v-if="((currentmodule.type=='zongxiangzhuzhuangtu'||currentmodule.type=='zongxiangduidiezhuzhuangtu')&&currentmodule.config.datasetbeforecontent=='-')">
                <div class="vc-dataconfig">
                  <span class="vc-dc-title">图例</span>
                  <div class="vc-dataconfig-color">
                    <span>显示图例</span>
                    <div v-if="(currentmodule.config.params.moduledatas.legend.show)" v-on:click.stop="hiddenChartMenu" class="colorpicker colorpickershow"></div>
                    <div v-if="(!currentmodule.config.params.moduledatas.legend.show)" v-on:click.stop="showChartMenu" class="colorpicker colorpickerhidden"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text"  v-on:change="handleLegendFontSizeChange($event,'')" @input="handleLegendFontSizeInput($event,'')"  v-model="currentmodule.config.params.moduledatas.legend.textStyle.fontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-colors" v-on:click.prevent.stop="">
                     <photoshop-picker  @click.native.stop="colorPickUpdateValue(currentmodule.config.params.moduledatas.legend.textStyle.color)" class="vc-colorpicker" :style="currentmodule.config.params.moduledatas.legend.textStyle.colorStyle" v-model="currentmodule.config.params.moduledatas.legend.textStyle.color" v-if="currentmodule.config.params.moduledatas.legend.textStyle.color">
                    </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                      <span >字体颜色</span>
                      <div :style="{'background':currentmodule.config.params.moduledatas.legend.textStyle.color}" v-on:click.stop="colorPickShow($event,'','',102)" class="colorpicker"></div>
                  </div>
                </div>
                <div class="vc-dataconfig" v-for="(item,index) in currentmodule.config.params.moduledatas.style.y">
                  <span class="vc-dc-title">数组{{index+1}}</span>
                  <!-- <span v-on:click="addDataTypeConfig(index)" class="vc-adddataconfig">添加</span> -->
                  <span v-on:click="delDataTypeConfigGroup(index)" class="vc-adddataconfig vc-adddataconfig-del" v-if="index>0">删除</span>
                  <div class="vc-dataconfig-color">
                      <span >顶部字色</span>
                      <div :style="{'background':item.label.color}" v-on:click.stop="colorPickShow($event,index,'0',3)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text"  v-on:change="handleyTopFontSizeChange($event,index)" @input="handleyTopFontSizeInput($event,index)"  v-model="item.label.fontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span >边框色</span>
                    <div :style="{'background':item.borderColor}" v-on:click.stop="colorPickShow($event,index,'',2)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">边框粗细</span>
                    <input type="text" v-on:change="handleBorderWidthChange($event,index,'')" @input="handleBorderWidthInput($event,index,'')" v-model="item.borderWidth" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">柱形粗细</span>
                    <input type="text" v-on:change="handleBarWidthChange($event,index,'')" @input="handleBarWidthInput($event,index,'')" v-model="item.barWidth" placeholder="请输入数字">
                  </div>
                  <div class="vc-dp-item">
                     <!-- v-for="(itemcolor,indexcolor) in item.style.color" -->
                    <div class="vc-colors" v-on:click.prevent.stop="">
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(item.color[0][0])" class="vc-colorpicker" :style="item.style.color[0][0]" v-model="item.color[0][0]" />
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(item.color[0][1])" class="vc-colorpicker" :style="item.style.color[0][1]" v-model="item.color[0][1]" />
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(item.borderColor)" class="vc-colorpicker" :style="item.borderStyle" v-model="item.borderColor" />
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(item.label.color)" class="vc-colorpicker" :style="item.label.style" v-model="item.label.color" />
                    </div>
                    <!-- {{indexcolor+1}} -->
                    <span>项目</span>
                    <!-- <span v-on:click="delDataTypeConfig(index,indexcolor)" class="vc-adddataconfig vc-adddataconfig-del">移除</span> -->
                    <div class="vc-dp-item-config">
                      <div class="vc-dataconfig-color">
                        <span>填充色</span>
                        <div :style="{'background':item.color[0][0]}" v-on:click.stop="colorPickShow($event,index,0,0)" class="colorpicker"></div>&nbsp; — &nbsp;
                        <div :style="{'background':item.color[0][1]}" v-on:click.stop="colorPickShow($event,index,0,1)" class="colorpicker"></div>
                      </div>

                    </div>
                    <!-- vc-dp-item-config_end -->
                  </div>
                  <!-- vc-dp-item_end -->
                </div>
              </div>
              <!-- 横向堆叠柱状图  横向柱状图 -->
              <div class="vc-sjys-datas" v-if="((currentmodule.type=='hengxiangduidiezhuzhuangtu'||currentmodule.type=='hengxiangzhuzhuangtu')&&currentmodule.config.datasetbeforecontent=='-')">
                <div class="vc-dataconfig">
                  <span class="vc-dc-title">图例</span>
                  <div class="vc-dataconfig-color">
                    <span>显示图例</span>
                    <div v-if="(currentmodule.config.params.moduledatas.legend.show)" v-on:click.stop="hiddenChartMenu" class="colorpicker colorpickershow"></div>
                    <div v-if="(!currentmodule.config.params.moduledatas.legend.show)" v-on:click.stop="showChartMenu" class="colorpicker colorpickerhidden"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text"  v-on:change="handleLegendFontSizeChange($event,'')" @input="handleLegendFontSizeInput($event,'')"  v-model="currentmodule.config.params.moduledatas.legend.textStyle.fontSize" placeholder="请输入数字">
                  </div>
                   <div class="vc-colors" v-on:click.prevent.stop="">
                     <photoshop-picker  @click.native.stop="colorPickUpdateValue(currentmodule.config.params.moduledatas.legend.textStyle.color)" class="vc-colorpicker" :style="currentmodule.config.params.moduledatas.legend.textStyle.colorStyle" v-model="currentmodule.config.params.moduledatas.legend.textStyle.color" v-if="currentmodule.config.params.moduledatas.legend.textStyle.color">
                    </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                      <span >字体颜色</span>
                      <div :style="{'background':currentmodule.config.params.moduledatas.legend.textStyle.color}" v-on:click.stop="colorPickShow($event,'','',102)" class="colorpicker"></div>
                  </div>
                </div>
                <div class="vc-dataconfig" v-for="(item,index) in currentmodule.config.params.moduledatas.style.x">
                  <span class="vc-dc-title">数组{{index+1}}</span>
                  <!-- <span v-on:click="addDataTypeConfig(index)" class="vc-adddataconfig">添加</span> -->
                  <span v-on:click="delDataTypeConfigGroup(index)" class="vc-adddataconfig vc-adddataconfig-del" v-if="index>0">删除</span>
                  <div class="vc-dataconfig-color">
                      <span >顶部字色</span>
                      <div :style="{'background':item.label.color}" v-on:click.stop="colorPickShow($event,index,'0',73)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text"  v-on:change="handlexTopFontSizeChange($event,index)" @input="handlexTopFontSizeInput($event,index)"  v-model="item.label.fontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span >边框色</span>
                    <div :style="{'background':item.borderColor}" v-on:click.stop="colorPickShow($event,index,'',72)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">边框粗细</span>
                    <input type="text" v-on:change="handleBorderWidthChange($event,index,'x')" @input="handleBorderWidthInput($event,index,'x')" v-model="item.borderWidth" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">柱形粗细</span>
                    <input type="text" v-on:change="handleBarWidthChange($event,index,'x')" @input="handleBarWidthInput($event,index,'x')" v-model="item.barWidth" placeholder="请输入数字">
                  </div>
                  <div class="vc-dp-item">
                     <!-- v-for="(itemcolor,indexcolor) in item.style.color" -->
                    <div class="vc-colors" v-on:click.prevent.stop="">
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(item.color[0][0])" class="vc-colorpicker" :style="item.style.color[0][0]" v-model="item.color[0][0]" />
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(item.color[0][1])" class="vc-colorpicker" :style="item.style.color[0][1]" v-model="item.color[0][1]" />
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(item.borderColor)" class="vc-colorpicker" :style="item.borderStyle" v-model="item.borderColor" />
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(item.label.color)" class="vc-colorpicker" :style="item.label.style" v-model="item.label.color" />
                    </div>
                    <!-- {{indexcolor+1}} -->
                    <span>项目</span>
                    <!-- <span v-on:click="delDataTypeConfig(index,indexcolor)" class="vc-adddataconfig vc-adddataconfig-del">移除</span> -->
                    <div class="vc-dp-item-config">
                      <div class="vc-dataconfig-color">
                        <span>填充色</span>
                        <div :style="{'background':item.color[0][0]}" v-on:click.stop="colorPickShow($event,index,0,70)" class="colorpicker"></div>&nbsp; — &nbsp;
                        <div :style="{'background':item.color[0][1]}" v-on:click.stop="colorPickShow($event,index,0,71)" class="colorpicker"></div>
                      </div>

                    </div>
                    <!-- vc-dp-item-config_end -->
                  </div>
                  <!-- vc-dp-item_end -->
                </div>
              </div>
              <!-- 单行文本 组件配置 -->
              <div class="vc-sjys-datas" v-if="((currentmodule.type=='danhangwenben')&&currentmodule.config.datasetbeforecontent=='-')">
                <div class="vc-dataconfig">
                  <div class="vc-colors" v-on:click.prevent.stop="">
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.widgets.style.color)" class="vc-colorpicker" :style="currentmodule.config.widgets.style.colorStyle[0]" v-model="currentmodule.config.widgets.style.color">
                      </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span >字体颜色</span>
                    <div :style="{'background':currentmodule.config.widgets.style.color}" v-on:click.stop="colorPickShow($event,'','',21)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text" v-on:change="handleDanhangwenbenFontSizeChange($event)" @input="handleDanhangwenbenFontSizeInput($event)" v-model="currentmodule.config.widgets.fontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color vc-dataconfig-font-weight">
                    <span class="vc-dataconfig-border vc-dataconfig-font-weight">字体粗细</span>
                    <div   class="vc-datatypechoose" type="text">
                      <div v-if="currentmodule.config.widgets.style['font-weight']=='400'"  v-on:click.stop="showDanhangwenbenDatatypeChoose">正常</div>
                      <div v-if="currentmodule.config.widgets.style['font-weight']=='600'" v-on:click.stop="showDanhangwenbenDatatypeChoose"> 加粗</div>
                      <ul class="vc-rstchoose " :style="currentmodule.config.widgets.style.fontStyle">
                        <li v-on:click="chooseDanhangwenbenDataType(1)">加粗</li>
                        <li v-on:click="chooseDanhangwenbenDataType(2)">正常</li>
                      </ul>
                    </div>
                  </div>
                  <div class="vc-dataconfig-color vc-dataconfig-font-weight">
                    <span class="vc-dataconfig-border vc-dataconfig-font-weight">对齐方式</span>
                    <div   class="vc-datatypechoose" type="text">
                      <div v-if="currentmodule.config.widgets.style['text-align']=='left'"  v-on:click.stop="showDanhangwenbenDataAlignChoose">居左</div>
                      <div v-if="currentmodule.config.widgets.style['text-align']=='right'" v-on:click.stop="showDanhangwenbenDataAlignChoose">居右</div>
                      <div v-if="currentmodule.config.widgets.style['text-align']=='center'" v-on:click.stop="showDanhangwenbenDataAlignChoose">居中</div>
                      <ul class="vc-rstchoose " :style="currentmodule.config.widgets.style.textAlignStyle">
                        <li v-on:click="chooseDanhangwenbenDataAlign(1)">居左</li>
                        <li v-on:click="chooseDanhangwenbenDataAlign(2)">居右</li>
                        <li v-on:click="chooseDanhangwenbenDataAlign(3)">居中</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
              <!-- 日期时间 组件配置 -->
              <div class="vc-sjys-datas" v-if="((currentmodule.type=='riqishijian')&&currentmodule.config.datasetbeforecontent=='-')">
                <div class="vc-dataconfig">
                  <span class="vc-dc-title">间距</span>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">时间和日期</span>
                    <input type="text" v-on:change="handleRiqishijianMarginLeftChange($event)" @input="handleRiqishijianMarginLeftInput($event)" v-model="currentmodule.config.widgets.marginLeft" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">时间和星期</span>
                    <input type="text" v-on:change="handleRiqishijianMarginRightChange($event)" @input="handleRiqishijianMarginRightInput($event)" v-model="currentmodule.config.widgets.marginRight" placeholder="请输入数字">
                  </div>
                  <!-- 年月日 -->
                  <span class="vc-dc-title">年月日</span>
                  <div class="vc-dataconfig-color">
                    <span>是否显示</span>
                    <div v-if="currentmodule.config.widgets.isShowDate" v-on:click.stop="hiddenDateMenu" class="colorpicker colorpickershow"></div>
                    <div v-if="!currentmodule.config.widgets.isShowDate" v-on:click.stop="showDateMenu" class="colorpicker colorpickerhidden"></div>
                  </div>
                  <div class="vc-dataconfig-color vc-dataconfig-font-weight">
                    <span class="vc-dataconfig-border vc-dataconfig-font-weight">格式</span>
                    <div   class="vc-datatypechoose" type="text">
                      <div v-if="currentmodule.config.widgets.dateStyle.fontFormat==='-'" v-on:click.stop="showDateDatatypeChoose">2019-12-31</div>
                      <div v-if="currentmodule.config.widgets.dateStyle.fontFormat==='.'" v-on:click.stop="showDateDatatypeChoose">2019.12.31</div>
                      <div v-if="currentmodule.config.widgets.dateStyle.fontFormat==='年月日'" v-on:click.stop="showDateDatatypeChoose">2019年12月31日</div>
                      <ul class="vc-rstchoose " :style="currentmodule.config.widgets.dateStyle.formatStyle">
                        <li v-on:click="chooseDateDataType(1)">2019-12-31</li>
                        <li v-on:click="chooseDateDataType(2)">2019.12.31</li>
                        <li v-on:click="chooseDateDataType(3)">2019年12月31</li>
                      </ul>
                    </div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text" v-on:change="handleDateFontSizeChange($event)" @input="handleDateFontSizeInput($event)" v-model="currentmodule.config.widgets.dateFontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-colors" v-on:click.prevent.stop="">
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.widgets.dateStyle.style.color)" class="vc-colorpicker" :style="currentmodule.config.widgets.dateStyle.colorStyle[0]" v-model="currentmodule.config.widgets.dateStyle.style.color">
                      </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span >字体颜色</span>
                    <div :style="{'background':currentmodule.config.widgets.dateStyle.style.color}" v-on:click.stop="colorPickShow($event,'','',105)" class="colorpicker"></div>
                  </div>
                  <!-- 时分秒 -->
                  <span class="vc-dc-title">时分秒</span>
                  <div class="vc-dataconfig-color">
                    <span>是否显示</span>
                    <div v-if="currentmodule.config.widgets.isShowTime" v-on:click.stop="hiddenTimeMenu" class="colorpicker colorpickershow"></div>
                    <div v-if="!currentmodule.config.widgets.isShowTime" v-on:click.stop="showTimeMenu" class="colorpicker colorpickerhidden"></div>
                  </div>
                  <div class="vc-dataconfig-color vc-dataconfig-font-weight">
                    <span class="vc-dataconfig-border vc-dataconfig-font-weight">格式</span>
                    <div   class="vc-datatypechoose" type="text">
                      <div v-if="currentmodule.config.widgets.timeStyle.fontFormat===':'"  v-on:click.stop="showTimeDatatypeChoose">18:00:00</div>
                      <div v-if="currentmodule.config.widgets.timeStyle.fontFormat==='时分秒'" v-on:click.stop="showTimeDatatypeChoose">18时00分00秒</div>
                      <ul class="vc-rstchoose " :style="currentmodule.config.widgets.timeStyle.formatStyle">
                        <li v-on:click="chooseTimeDataType(1)">18:00:00</li>
                        <li v-on:click="chooseTimeDataType(2)">18时00分00秒</li>
                      </ul>
                    </div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text" v-on:change="handleTimeFontSizeChange($event)" @input="handleTimeFontSizeInput($event)" v-model="currentmodule.config.widgets.timeFontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-colors" v-on:click.prevent.stop="">
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.widgets.timeStyle.style.color)" class="vc-colorpicker" :style="currentmodule.config.widgets.timeStyle.colorStyle[0]" v-model="currentmodule.config.widgets.timeStyle.style.color">
                      </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span >字体颜色</span>
                    <div :style="{'background':currentmodule.config.widgets.timeStyle.style.color}" v-on:click.stop="colorPickShow($event,'','',106)" class="colorpicker"></div>
                  </div>
                   <!-- 星期 -->
                   <span class="vc-dc-title">星期</span>
                   <div class="vc-dataconfig-color">
                    <span>是否显示</span>
                    <div v-if="currentmodule.config.widgets.isShowDay" v-on:click.stop="hiddenDayMenu" class="colorpicker colorpickershow"></div>
                    <div v-if="!currentmodule.config.widgets.isShowDay" v-on:click.stop="showDayMenu" class="colorpicker colorpickerhidden"></div>
                  </div>
                  <div class="vc-dataconfig-color vc-dataconfig-font-weight">
                    <span class="vc-dataconfig-border vc-dataconfig-font-weight">格式</span>
                    <div   class="vc-datatypechoose" type="text">
                      <div v-if="currentmodule.config.widgets.dayStyle.fontFormat==='星期一'" v-on:click.stop="showDayDatatypeChoose">星期一</div>
                      <div v-if="currentmodule.config.widgets.dayStyle.fontFormat==='Monday'" v-on:click.stop="showDayDatatypeChoose">Monday</div>
                      <div v-if="currentmodule.config.widgets.dayStyle.fontFormat==='Mon.'" v-on:click.stop="showDayDatatypeChoose">Mon.</div>
                      <ul class="vc-rstchoose " :style="currentmodule.config.widgets.dayStyle.formatStyle">
                        <li v-on:click="chooseDayDataType(1)">星期一</li>
                        <li v-on:click="chooseDayDataType(2)">Monday</li>
                        <li v-on:click="chooseDayDataType(3)">Mon.</li>
                      </ul>
                    </div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text" v-on:change="handleDayFontSizeChange($event)" @input="handleDayFontSizeInput($event)" v-model="currentmodule.config.widgets.dayFontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-colors" v-on:click.prevent.stop="">
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.widgets.dayStyle.style.color)" class="vc-colorpicker" :style="currentmodule.config.widgets.dayStyle.colorStyle[0]" v-model="currentmodule.config.widgets.dayStyle.style.color">
                      </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span >字体颜色</span>
                    <div :style="{'background':currentmodule.config.widgets.dayStyle.style.color}" v-on:click.stop="colorPickShow($event,'','',107)" class="colorpicker"></div>
                  </div>
                </div>
              </div>
              <!-- vc-sjys-datas_end -->
              <!-- 数字图 组件配置 -->
              <div class="vc-sjys-datas" v-if="((currentmodule.type=='shuzitu')&&currentmodule.config.datasetbeforecontent=='-')">
                <div class="vc-dataconfig">
                  <div class="vc-colors" v-on:click.prevent.stop="">
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.widgets.style.color)" class="vc-colorpicker" :style="currentmodule.config.widgets.style.colorStyle[0]" v-model="currentmodule.config.widgets.style.color">
                      </photoshop-picker>
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.widgets.numBackStyle.background)" class="vc-colorpicker" :style="currentmodule.config.widgets.style.colorStyle[1]" v-model="currentmodule.config.widgets.numBackStyle.background">
                      </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span >字体颜色</span>
                    <div :style="{'background':currentmodule.config.widgets.style.color}" v-on:click.stop="colorPickShow($event,'','',21)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text" v-on:change="handleDanhangwenbenFontSizeChange($event)" @input="handleDanhangwenbenFontSizeInput($event)" v-model="currentmodule.config.widgets.fontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color vc-dataconfig-font-weight">
                    <span class="vc-dataconfig-border vc-dataconfig-font-weight">字体粗细</span>
                    <div   class="vc-datatypechoose" type="text">
                      <div v-if="currentmodule.config.widgets.style['font-weight']=='400'"  v-on:click.stop="showDanhangwenbenDatatypeChoose">正常</div>
                      <div v-if="currentmodule.config.widgets.style['font-weight']=='600'" v-on:click.stop="showDanhangwenbenDatatypeChoose"> 加粗</div>
                      <ul class="vc-rstchoose " :style="currentmodule.config.widgets.style.fontStyle">
                        <li v-on:click="chooseDanhangwenbenDataType(1)">加粗</li>
                        <li v-on:click="chooseDanhangwenbenDataType(2)">正常</li>
                      </ul>
                    </div>
                  </div>
                  <!-- vc-dataconfig-font-weight_end -->
                  <div class="vc-dataconfig-color">
                    <span >块背景色</span>
                    <div :style="{'background':currentmodule.config.widgets.numBackStyle.background}" v-on:click.stop="colorPickShow($event,'','',22)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">块左右</span>
                    <input type="text" v-on:change="handleShuzituPaddLeftChange($event)" @input="handleShuzituPaddLeftInput($event)" v-model="currentmodule.config.widgets.padding[1]" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">块上下</span>
                    <input type="text" v-on:change="handleShuzituPaddTopChange($event)" @input="handleShuzituPaddTopInput($event)" v-model="currentmodule.config.widgets.padding[0]" placeholder="请输入数字">
                  </div>
                </div>
              </div>
              <!-- vc-sjys-datas_end -->
              <!-- 面积图折线图图样式配置 -->
              <div class="vc-sjys-datas" v-if="((currentmodule.type=='mianjitu'||currentmodule.type=='zhexiantu')&&currentmodule.config.datasetbeforecontent=='-')">
                <div class="vc-dataconfig">
                  <span class="vc-dc-title">图例</span>
                  <div class="vc-dataconfig-color">
                    <span>显示图例</span>
                    <div v-if="(currentmodule.config.params.moduledatas.legend.show)" v-on:click.stop="hiddenChartMenu" class="colorpicker colorpickershow"></div>
                    <div v-if="(!currentmodule.config.params.moduledatas.legend.show)" v-on:click.stop="showChartMenu" class="colorpicker colorpickerhidden"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text"  v-on:change="handleLegendFontSizeChange($event,'')" @input="handleLegendFontSizeInput($event,'')"  v-model="currentmodule.config.params.moduledatas.legend.textStyle.fontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-colors" v-on:click.prevent.stop="">
                     <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.moduledatas.legend.textStyle.color)" class="vc-colorpicker" :style="currentmodule.config.params.moduledatas.legend.textStyle.colorStyle" v-model="currentmodule.config.params.moduledatas.legend.textStyle.color" v-if="currentmodule.config.params.moduledatas.legend.textStyle.color">
                    </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                      <span >字体颜色</span>
                      <div :style="{'background':currentmodule.config.params.moduledatas.legend.textStyle.color}" v-on:click.stop="colorPickShow($event,'','',102)" class="colorpicker"></div>
                  </div>
                </div>
                <div class="vc-dataconfig" v-for="(item,index) in currentmodule.config.params.moduledatas.style.y">
                  <div class="vc-colors" v-on:click.prevent.stop="">
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(item.areaStyle.color.colorStops[0].color)" class="vc-colorpicker" :style="item.style.color[0]" v-model="item.areaStyle.color.colorStops[0].color" v-if="currentmodule.type=='mianjitu'"/>
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(item.areaStyle.color.colorStops[1].color)" class="vc-colorpicker" :style="item.style.color[1]" v-model="item.areaStyle.color.colorStops[1].color" v-if="currentmodule.type=='mianjitu'"/>
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(item.lineStyle.color)" class="vc-colorpicker" :style="item.style.color[2]" v-model="item.lineStyle.color" />
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(item.itemStyle.normal.borderColor)" class="vc-colorpicker" :style="item.style.color[3]" v-model="item.itemStyle.normal.borderColor" />
                  </div>
                  <span class="vc-dc-title">数组{{index+1}}</span><span v-on:click="delMianjituDataTypeConfigGroup(index)" class="vc-adddataconfig vc-adddataconfig-del">删除</span>
                  <div class="vc-dataconfig-color" v-if="currentmodule.type=='mianjitu'">
                    <span>填充色</span>
                    <div :style="{'background':item.areaStyle.color.colorStops[0].color}" v-on:click.stop="colorPickShow($event,index,'',8)" class="colorpicker"></div>&nbsp; — &nbsp;
                    <div :style="{'background':item.areaStyle.color.colorStops[1].color}" v-on:click.stop="colorPickShow($event,index,'',9)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                      <span >边线色</span>
                      <div :style="{'background':item.lineStyle.color}" v-on:click.stop="colorPickShow($event,index,'0',10)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span >拐点色</span>
                    <div :style="{'background':item.itemStyle.normal.borderColor}" v-on:click.stop="colorPickShow($event,index,'',11)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">边线宽度</span>
                    <input type="text" v-on:change="handleMianjituBorderWidthChange($event,index)" @input="handleMianjituBorderWidthInput($event,index)" v-model="item.lineStyle.width" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">拐点大小</span>
                    <input type="text" v-on:change="handleMianjituBorseSizeChange($event,index)" @input="handleMianjituBorseSizeInput($event,index)" v-model="item.symbolSize" placeholder="请输入数字">
                  </div>
                  <!-- vc-dp-item_end -->
                </div>
              </div>
              <!-- vc-sjys-datas_end -->
              <!-- 进度环图 组件配置 -->
              <div class="vc-sjys-datas" v-if="(currentmodule.type=='jinduhuantu'&&currentmodule.config.datasetbeforecontent=='-')">
                <div class="vc-dataconfig">
                  <div class="vc-colors" v-on:click.prevent.stop="">
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.color[0])" class="vc-colorpicker" :style="currentmodule.config.params.style.color[0]" v-model="currentmodule.config.params.color[0]" />
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.color[1])" class="vc-colorpicker" :style="currentmodule.config.params.style.color[1]" v-model="currentmodule.config.params.color[1]" />
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.style.itemStyle.borderColor)" class="vc-colorpicker" :style="currentmodule.config.params.style.color[2]" v-model="currentmodule.config.params.style.itemStyle.borderColor" />
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.style.label.color)" class="vc-colorpicker" :style="currentmodule.config.params.style.color[3]" v-model="currentmodule.config.params.style.label.color" />
                     <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.style.active.color)" class="vc-colorpicker" :style="currentmodule.config.params.style.color[4]" v-model="currentmodule.config.params.style.active.color" />
                  </div>
                  <div class="vc-dataconfig-color">
                    <span>环1填充</span>
                    <div :style="{'background':currentmodule.config.params.color[0]}" v-on:click.stop="colorPickShow($event,'','',13)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span>环2填充</span>
                    <div :style="{'background':currentmodule.config.params.color[1]}" v-on:click.stop="colorPickShow($event,'','',14)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                      <span>边线色</span>
                      <div :style="{'background':currentmodule.config.params.style.itemStyle.borderColor}" v-on:click.stop="colorPickShow($event,'','0',15)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span >数字色</span>
                    <div :style="{'background':currentmodule.config.params.style.label.color}" v-on:click.stop="colorPickShow($event,'','',16)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span >文字色</span>
                    <div :style="{'background':currentmodule.config.params.style.active.color}" v-on:click.stop="colorPickShow($event,'','',17)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">边线宽度</span>
                    <input type="text" v-on:change="handleJinduhuantuBorderWidthChange($event,'')" @input="handleJinduhuantuBorderWidthInput($event,'')" v-model="currentmodule.config.params.style.itemStyle.borderWidth" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">数字大小</span>
                    <input type="text" v-on:change="handleJiduhuantuFontSizeChange($event,'')" @input="handleJiduhuantuFontSizeInput($event,'')" v-model="currentmodule.config.params.style.label.fontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">文字大小</span>
                    <input type="text" v-on:change="handleJiduhuantuTextFontSizeChange($event,'')" @input="handleJiduhuantuTextFontSizeInput($event,'')" v-model="currentmodule.config.params.style.active.fontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">文字行高</span>
                    <input type="text" v-on:change="handleJiduhuantuTextLineHeightChange($event,'')" @input="handleJiduhuantuTexLineHeightInput($event,'')" v-model="currentmodule.config.params.style.active.lineHeight" placeholder="请输入数字">
                  </div>
                  <!-- vc-dp-item_end -->
                </div>
              </div>
              <!-- 仪表盘 组件配置 -->
              <div class="vc-sjys-datas" v-if="(currentmodule.type=='yibiaopan'&&currentmodule.config.datasetbeforecontent=='-')">
                <div class="vc-dataconfig">
                  <span class="vc-dc-title">数组</span>
                  <span v-on:click="addDataTypeConfig()" class="vc-adddataconfig" >添加</span>
                  <!-- <div class="vc-dataconfig-color">
                    <span >数字色</span>
                    <div :style="{'background':currentmodule.config.params.style.label.color}" v-on:click.stop="colorPickShow($event,'','',60)" class="colorpicker"></div>
                  </div> -->
                  <div class="vc-dataconfig-color">
                    <span >文字色</span>
                    <div :style="{'background':currentmodule.config.params.style.title.color}" v-on:click.stop="colorPickShow($event,'','',60)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">数字大小</span>
                    <input type="text" v-on:change="handleYibiaopanFontSizeChange($event,'')" @input="handleYibiaopanFontSizeInput($event,'')" v-model="currentmodule.config.params.style.label.fontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">文字大小</span>
                    <input type="text" v-on:change="handleYibiaopanTextFontSizeChange($event,'')" @input="handleYibiaopanTextFontSizeInput($event,'')" v-model="currentmodule.config.params.style.title.fontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">刻度字体</span>
                    <input type="text" v-on:change="handleYibiaopanScaleFontSizeChange($event,'')" @input="handleYibiaopanScaleFontSizeInput($event,'')" v-model="currentmodule.config.params.style.axisLabel.fontSize" placeholder="请输入数字">
                  </div>
                  <!-- vc-dp-item_end -->
                  <div class="vc-dp-item" v-for="(itemcolor,indexcolor) in currentmodule.config.params.color">
                     <div class="vc-colors" v-on:click.prevent.stop="">
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.style.title.color)" class="vc-colorpicker" :style="currentmodule.config.params.style.title.colorStyle" v-model="currentmodule.config.params.style.title.color" />
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(itemcolor[1])" class="vc-colorpicker" :style="currentmodule.config.params.style.color[indexcolor][0]" v-model="itemcolor[1]" />
                    </div>
                    <span>项目{{indexcolor+1}}</span>
                    <span v-on:click="delDataTypeConfig(1,indexcolor)" class="vc-adddataconfig vc-adddataconfig-del">移除</span>
                    <div class="vc-dp-item-config">
                      <!-- <div class="vc-dataconfig-color">
                        <span>填充色</span>
                        <div :style="{'background':itemcolor[0]}" v-on:click.stop="colorPickShow($event,'',indexcolor,18)" class="colorpicker"></div>&nbsp; — &nbsp;
                        <div :style="{'background':itemcolor[1]}" v-on:click.stop="colorPickShow($event,'',indexcolor,19)" class="colorpicker"></div>
                      </div> -->
                      <div class="vc-dataconfig-color">
                        <span>边框色</span>
                        <div  :style="{'background':itemcolor[1]}" v-on:click.stop="colorPickShow($event,'',indexcolor,61)" class="colorpicker"></div>
                      </div>
                      <div class="vc-dataconfig-color">
                        <span class="vc-dataconfig-border">占比</span>
                        <input type="text" v-model="itemcolor[0]" v-on:change="handleYibiaopanBorderChange($event,indexcolor)" @input="handleYibiaopanBorderInput($event,indexcolor)" placeholder="请输入数字">
                      </div>
                    </div>
                    <!-- vc-dp-item-config_end -->
                  </div>
                </div>
              </div>
              <!-- vc-sjys-datas_end -->
              <!-- 玫瑰图 饼图 组件配置 -->
              <div class="vc-sjys-datas" v-if="((currentmodule.type=='meiguitu'||currentmodule.type=='shixinbingtu'||currentmodule.type=='bingtu')&&currentmodule.config.datasetbeforecontent=='-')">
                <div class="vc-dataconfig">
                  <span class="vc-dc-title">图例</span>
                  <div class="vc-dataconfig-color">
                    <span>显示图例</span>
                    <div v-if="(currentmodule.config.params.moduledatas.legend.show)" v-on:click.stop="hiddenChartMenu" class="colorpicker colorpickershow"></div>
                    <div v-if="(!currentmodule.config.params.moduledatas.legend.show)" v-on:click.stop="showChartMenu" class="colorpicker colorpickerhidden"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text"  v-on:change="handleLegendFontSizeChange($event,'')" @input="handleLegendFontSizeInput($event,'')"  v-model="currentmodule.config.params.moduledatas.legend.textStyle.fontSize" placeholder="请输入数字">
                  </div>
                  <div class="vc-colors" v-on:click.prevent.stop="">
                     <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.moduledatas.legend.textStyle.color)" class="vc-colorpicker" :style="currentmodule.config.params.moduledatas.legend.textStyle.colorStyle" v-model="currentmodule.config.params.moduledatas.legend.textStyle.color" v-if="currentmodule.config.params.moduledatas.legend.textStyle.color">
                    </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                      <span >字体颜色</span>
                      <div :style="{'background':currentmodule.config.params.moduledatas.legend.textStyle.color}" v-on:click.stop="colorPickShow($event,'','',102)" class="colorpicker"></div>
                  </div>
                </div>
                <div class="vc-dataconfig">
                  <span class="vc-dc-title">数组</span> <span v-on:click="addDataTypeConfig(index)" class="vc-adddataconfig">添加</span>
                  <div class="vc-colors" v-on:click.prevent.stop="">
                     <photoshop-picker  @click.native.stop="colorPickUpdateValue(currentmodule.config.params.style.numStyle.numColor)" class="vc-colorpicker" :style="currentmodule.config.params.style.numStyle.numColorStyle" v-model="currentmodule.config.params.style.numStyle.numColor" v-if="currentmodule.config.params.style.numStyle.numColor">
                    </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                      <span >字体颜色</span>
                      <div :style="{'background':currentmodule.config.params.style.numStyle.numColor}" v-on:click.stop="colorPickShow($event,'','',103)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">内圈粗细</span>
                    <input type="text" v-model="currentmodule.config.params.style.radio[0]" v-on:change="handleMeiguituRadioInsideChange($event)" @input="handleMeiguituRadioInsideInput($event)"placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">外圈粗细</span>
                    <input type="text" v-model="currentmodule.config.params.style.radio[1]" v-on:change="handleMeiguituRadioOutsideChange($event)" @input="handleMeiguituRadioOutsideInput($event)"placeholder="请输入数字">
                  </div>
                  <div class="vc-dp-item" v-for="(itemcolor,indexcolor) in currentmodule.config.params.style.color">
                    <span>项目{{indexcolor+1}}</span><span v-on:click="delDataTypeConfig(index,indexcolor)" class="vc-adddataconfig vc-adddataconfig-del">移除</span>
                    <div class="vc-colors" v-on:click.prevent.stop="">
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(itemcolor[0])" class="vc-colorpicker" :style="currentmodule.config.params.color[indexcolor][0]" v-model="itemcolor[0]" />
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(itemcolor[1])" class="vc-colorpicker" :style="currentmodule.config.params.color[indexcolor][1]" v-model="itemcolor[1]" />
                      <photoshop-picker @click.native.stop="colorPickUpdateValue(itemcolor[2])" class="vc-colorpicker" :style="currentmodule.config.params.color[indexcolor][2]" v-model="itemcolor[2]" />
                    </div>
                    <div class="vc-dp-item-config">
                      <div class="vc-dataconfig-color">
                        <span>填充色</span>
                        <div :style="{'background':itemcolor[0]}" v-on:click.stop="colorPickShow($event,'',indexcolor,18)" class="colorpicker"></div>&nbsp; — &nbsp;
                        <div :style="{'background':itemcolor[1]}" v-on:click.stop="colorPickShow($event,'',indexcolor,19)" class="colorpicker"></div>
                      </div>
                      <div class="vc-dataconfig-color">
                        <span>边框色</span>
                        <div  :style="{'background':itemcolor[2]}" v-on:click.stop="colorPickShow($event,'',indexcolor,20)" class="colorpicker"></div>
                      </div>
                      <div class="vc-dataconfig-color">
                        <span class="vc-dataconfig-border">边框粗细</span>
                        <input type="text" v-model="itemcolor[3]" v-on:change="handleMeiguituBorderChange($event,indexcolor)" @input="handleMeiguituBorderInput($event,indexcolor)"placeholder="请输入数字">
                      </div>
                    </div>
                    <!-- vc-dp-item-config_end -->
                  </div>
                  <!-- vc-dp-item_end -->
                </div>
              </div>
              <!-- vc-sjys-datas_end -->
              <!-- 表格 组件配置 -->
              <div class="vc-sjys-datas" v-if="(currentmodule.type=='biaoge' && currentmodule.config.datasetbeforecontent=='-')">
                <div class="vc-dataconfig">
                  <span class="vc-dc-title">表头样式</span>

                  <!-- 表头高度 -->
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">表头高度</span>
                    <input type="number"
                          v-model.number="currentmodule.config.widgets.headerStyle.height"
                          placeholder="px">
                  </div>

                  <!-- 和图例一致：有 :style，有 v-if -->
                  <div class="vc-colors" v-on:click.prevent.stop="">
                    <photoshop-picker
                      @click.native.stop="colorPickUpdateValue(currentmodule.config.widgets.headerStyle.background)"
                      class="vc-colorpicker"
                      :style="currentmodule.config.widgets.headerStyle.backgroundStyle"
                      v-model="currentmodule.config.widgets.headerStyle.background"
                      v-if="currentmodule.config.widgets.headerStyle.backgroundStyle && currentmodule.config.widgets.headerStyle.backgroundStyle.display !== 'none'">
                    </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span>表头背景色</span>
                    <div class="colorpicker"
                        :style="{'background': currentmodule.config.widgets.headerStyle.background}"
                        v-on:click.stop="colorPickShow($event,'','',201)"></div>
                  </div>
                  <div class="vc-colors" v-on:click.prevent.stop="">
                    <photoshop-picker
                      @click.native.stop="colorPickUpdateValue(currentmodule.config.widgets.headerStyle.border.color)"
                      class="vc-colorpicker"
                      :style="currentmodule.config.widgets.headerStyle.border.colorStyle"
                      v-model="currentmodule.config.widgets.headerStyle.border.color"
                      v-if="currentmodule.config.widgets.headerStyle.border && currentmodule.config.widgets.headerStyle.border.colorStyle && currentmodule.config.widgets.headerStyle.border.colorStyle.display !== 'none'">
                    </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span>表头边框颜色</span>
                    <div class="colorpicker"
                        :style="{'background': currentmodule.config.widgets.headerStyle.border.color}"
                        v-on:click.stop="colorPickShow($event,'','',202)"></div>
                  </div>

                  <!-- 表头边框粗细 -->
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">边框粗细</span>
                    <input type="number"
                          v-model.number="currentmodule.config.widgets.headerStyle.border.width"
                          placeholder="px">
                  </div>

                  <div class="vc-colors" v-on:click.prevent.stop="">
                    <photoshop-picker
                      @click.native.stop="colorPickUpdateValue(currentmodule.config.widgets.headerStyle.text.color)"
                      class="vc-colorpicker"
                      :style="currentmodule.config.widgets.headerStyle.text.colorStyle"
                      v-model="currentmodule.config.widgets.headerStyle.text.color"
                      v-if="currentmodule.config.widgets.headerStyle.text && currentmodule.config.widgets.headerStyle.text.colorStyle && currentmodule.config.widgets.headerStyle.text.colorStyle.display !== 'none'">
                    </photoshop-picker>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span>表头字体颜色</span>
                    <div class="colorpicker"
                        :style="{'background': currentmodule.config.widgets.headerStyle.text.color}"
                        v-on:click.stop="colorPickShow($event,'','',203)"></div>
                  </div>

                  <!-- 表头字体大小 -->
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">表头字体大小</span>
                    <input type="number"
                          v-model.number="currentmodule.config.widgets.headerStyle.text.size"
                          placeholder="px">
                  </div>

                  <!-- 表头字体粗细 -->
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">表头字体粗细</span>
                    <select v-model="currentmodule.config.widgets.headerStyle.text.weight">
                      <option :value="400">正常</option>
                      <option :value="600">加粗</option>
                      <option :value="700">特粗</option>
                    </select>
                  </div>

                  <span class="vc-dc-title">表格正文样式</span>

                  <!-- 正文字体大小 -->
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text"
                          v-on:change="handleBiaogeFontSizeChange($event,'')"
                          @input="handleBiaogeFontSizeInput($event,'')"
                          v-model="currentmodule.config.widgets.xStyle.fontSize"
                          placeholder="请输入数字">
                  </div>

                  <!-- 正文字体颜色（23） -->
                  <div class="vc-colors" v-on:click.prevent.stop="">
                    <photoshop-picker
                      @click.native.stop="colorPickUpdateValue(currentmodule.config.widgets.xStyle.color)"
                      class="vc-colorpicker"
                      :style="currentmodule.config.widgets.xStyle.colorStyle[0]"
                      v-model="currentmodule.config.widgets.xStyle.color" />
                  </div>
                  <div class="vc-dataconfig-color">
                    <span>字体颜色</span>
                    <div class="colorpicker"
                        :style="{'background':currentmodule.config.widgets.xStyle.color}"
                        @click.stop="colorPickShow($event,'','0',23)"></div>
                  </div>
                </div><!-- vc-dataconfig_end -->
              </div>


            </div>
            <!-- vc-sjys_end -->
            <!-- 组件X轴配置 -->
            <div class="vc-sjys vc-xaxios"  v-if="(currentmodule.type=='zongxiangzhuzhuangtu'||currentmodule.type=='hengxiangzhuzhuangtu'||currentmodule.type=='hengxiangduidiezhuzhuangtu'||currentmodule.type=='zongxiangduidiezhuzhuangtu'||currentmodule.type=='mianjitu'||currentmodule.type=='zhexiantu')">
              <div class="vc-sjys-title">
                <span v-on:click.stop="xAxisHidden" :data-before="currentmodule.config.xAxiosbeforecontent" class="vc-dc-title">x轴</span>
              </div>
              <div class="vc-sjys-datas" v-if="(currentmodule.config.xAxiosbeforecontent=='-'&&currentmodule.config.datas)">
                  <div class="vc-colors" v-on:click.prevent.stop="">
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.xAxis.axisLabel.color)" class="vc-colorpicker" :style="currentmodule.config.params.xAxis.labelStyle" v-model="currentmodule.config.params.xAxis.axisLabel.color" />
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.xAxis.axisLine.lineStyle.color)" class="vc-colorpicker" :style="currentmodule.config.params.xAxis.lineStyle" v-model="currentmodule.config.params.xAxis.axisLine.lineStyle.color" />
                  </div>
                  <div class="vc-dataconfig-color">
                      <span >轴线色</span>
                      <div :style="{'background':currentmodule.config.params.xAxis.axisLine.lineStyle.color}" v-on:click.stop="colorPickShow($event,'','0',4)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">轴线粗细</span>
                    <input type="text" v-on:change="handlexAxiaWidthChange($event,'')" @input="handlexAxiaWidthInput($event,'')" v-model="currentmodule.config.params.xAxis.axisLine.lineStyle.width" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                      <span >字色</span>
                      <div :style="{'background':currentmodule.config.params.xAxis.axisLabel.color}" v-on:click.stop="colorPickShow($event,'','0',5)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text"  v-on:change="handlexAxisFontSizeChange($event,'')" @input="handlexAxisFontSizeInput($event,'')"  v-model="currentmodule.config.params.xAxis.axisLabel.fontSize" placeholder="请输入数字">
                  </div>
              </div>
              <!-- vc-sjys-datas_end -->
            </div>
            <!-- 组件Y轴配置 -->
            <div class="vc-sjys vc-xaxios" v-if="(currentmodule.type=='zongxiangzhuzhuangtu'||currentmodule.type=='hengxiangzhuzhuangtu'||currentmodule.type=='hengxiangduidiezhuzhuangtu'||currentmodule.type=='zongxiangduidiezhuzhuangtu'||currentmodule.type=='mianjitu'||currentmodule.type=='zhexiantu')">
              <div class="vc-sjys-title">
                <span v-on:click.stop="yAxisHidden" :data-before="currentmodule.config.yAxiosbeforecontent" class="vc-dc-title">y轴</span>
              </div>
              <div class="vc-sjys-datas" v-if="(currentmodule.config.yAxiosbeforecontent=='-'&&currentmodule.config.datas)">
                  <div class="vc-colors" v-on:click.prevent.stop="">
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.yAxis.axisLabel.color)" class="vc-colorpicker" :style="currentmodule.config.params.yAxis.labelStyle" v-model="currentmodule.config.params.yAxis.axisLabel.color" />
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.yAxis.axisLine.lineStyle.color)" class="vc-colorpicker" :style="currentmodule.config.params.yAxis.lineStyle" v-model="currentmodule.config.params.yAxis.axisLine.lineStyle.color" />
                    <photoshop-picker @click.native.stop="colorPickUpdateValue(currentmodule.config.params.yAxis.splitLine.lineStyle.color)" class="vc-colorpicker" :style="currentmodule.config.params.yAxis.spliteStyle" v-model="currentmodule.config.params.yAxis.splitLine.lineStyle.color" />
                  </div>
                  <div class="vc-dataconfig-color">
                      <span >轴线色</span>
                      <div :style="{'background':currentmodule.config.params.yAxis.axisLine.lineStyle.color}" v-on:click.stop="colorPickShow($event,'','0',6)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">轴线粗细</span>
                    <input type="text"  v-on:change="handleyAxiaWidthChange($event,'')" @input="handleyAxiaWidthInput($event,'')" v-model="currentmodule.config.params.yAxis.axisLine.lineStyle.width" placeholder="请输入数字">
                  </div>
                  <div class="vc-dataconfig-color">
                      <span >字色</span>
                      <div :style="{'background':currentmodule.config.params.yAxis.axisLabel.color}" v-on:click.stop="colorPickShow($event,'','0',7)" class="colorpicker"></div>
                  </div>
                  <div class="vc-dataconfig-color">
                    <span class="vc-dataconfig-border">字体大小</span>
                    <input type="text" v-on:change="handleyAxisFontSizeChange($event,'')" @input="handleyAxisFontSizeInput($event,'')" v-model="currentmodule.config.params.yAxis.axisLabel.fontSize" placeholder="请输入数字">
                  </div>
                  <!-- <div class="vc-dataconfig-color">
                      <span >分割线色</span>
                      <div :style="{'background':currentmodule.config.params.yAxis.splitLine.lineStyle.color}" v-on:click.stop="colorPickShow($event,'','0',12)" class="colorpicker"></div>
                  </div> -->
              </div>
              <!-- vc-sjys-datas_end -->
            </div>
            <!-- 数据类型 配置 -->
            <div class="vc-datatype" v-if="(currentmodule.config.datas)">
              <!-- <span>数据类型</span><div v-on:click.stop="showDatatypeChoose" class="vc-datatypechoose" type="text">{{defaultsettings.datatypestyle.name}}</div>
              <ul class="vc-rstchoose" :style="defaultsettings.datatypestyle.style">
                <li v-on:click="chooseDataType(1)">静态数据</li>
                <li v-on:click="chooseDataType(2)">API</li>
              </ul>
              <div class="vc-data" v-if="(currentmodule.config.datastype=='default')">
                <editor  @init="editorInit"  :config = "currentmodule.editorconfig"  @input= "aceChange" v-model="currentmodule.config.widgetdata" lang="json" theme="monokai" width="100%" height="300"></editor>
              </div> -->
              <div class="vc-data-api" v-if="(currentmodule.config.datastype=='api'&&currentmodule.type!='danhangwenben'&&currentmodule.type!='qukuaizujian'&&currentmodule.type!='riqishijian')">
                <div class="vc-dp-item" v-if="currentmodule.type=='jinduhuantu'">
                  <span>数值类型</span>
                   <RadioGroup @click.stop.native="" class="vc-dp-itemauto" v-model="currentmodule.config.numtype">
                      <Radio label="正向" ></Radio>
                      <Radio label="负向" ></Radio>
                  </RadioGroup>
                </div>
                <div class="vc-dp-item">
                  <span>维度和指标</span><input class="apiInput"  @click="apiClick" readonly @input="apiInput($event)" v-on:change="apiChange($event)" v-model="currentmodule.config.api"  type="text" placeholder="选择维度和指标">
                </div>
                <div class="vc-dp-item" v-if="currentmodule.type=='shuzitu'||currentmodule.type=='jinduhuantu'||currentmodule.type=='biaoge'">
                  <span>阈值设置</span>
                  <span @click="thresholdSettings" class="pointer" style="color:#10B9F8">设置</span>
                </div>
                <!-- <div class="vc-dp-item vc-dp-itemreqt">
                  <span>请求方式</span>
                  <div class="vc-dp-rqt"  v-on:click.stop="showAPItypeChoose">{{currentmodule.config.apitypeselect}}</div>
                  <ul class="vc-dp-rqt-choose" :style="currentmodule.apitype">
                    <li v-on:click="chooseAPIType(1)">GET</li>
                    <li v-on:click="chooseAPIType(2)">POST</li>
                  </ul>
                </div> -->
                <div class="vc-dp-item">
                  <span>自动更新</span>
                   <RadioGroup v-on:on-change="autoDataChange" @click.stop.native="" class="vc-dp-itemauto" v-model="currentmodule.config.autodata">
                      <Radio label="开启"></Radio>
                      <Radio label="关闭"></Radio>
                  </RadioGroup>
                </div>
                <div class="vc-dp-item">
                  <span>更新时间</span><input @input="updateTimeInput($event)" v-on:change="updateTimeChange($event)" v-model="currentmodule.config.autodatatime" type="text" placeholder="单位/s" style="width: 20%; float: left">
                  <span style="margin-left: 5px">秒</span>
                </div>

                <!-- <div class="vc-dp-item" >
                  <span>颜色选取</span>
                  <div class="colorpicker"></div>
                  <photoshop-picker class="vc-colorpicker" style="" v-model="colors" />
                </div> -->

              </div>
            </div>
          </div>
          <!-- vc-container_end -->
      </div>
      <!-- view-config_end -->
      <!-- 可视化页面底部缩放 -->
      <div id="view-bottom">
          <Slider v-on:on-input="sliderChange" :min="1" class="view-slider" v-model="modules.radiodata" :tip-format="radioFormat"></Slider>
      </div>
      <!-- view-bottom_end -->
      <!-- 可视化界面整体配置 -->
      <!-- <div id="datasetting" :style="defaultsettings.style" v-on:click="defaultHidden">
          <div class="ds-item ds-title">
            <div class="ds-titlename">
              大屏标题
            </div>
            <div class="ds-titlecontent">
              <input maxlength="50" @input="titleInput($event)" v-on:change="titleChange($event)" v-model="defaultsettings.title" type="text" placeholder="请在此输入大屏标题">
            </div>
          </div>
          <div class="ds-item ds-size">
            <div class="ds-titlename">
              大屏尺寸
            </div>
            <div class="ds-sizewidth">
              <span>宽度</span><input v-model="modules.defaulestyle.width" @input="handleWidthInput($event)"  type="text" placeholder="大屏宽度">
            </div>
            <div class="ds-sizeheight">
              <span>高度</span><input v-model="modules.defaulestyle.height"  @input="handleHeightInput($event)" type="text"  placeholder="大屏高度">
            </div>
          </div>
          <div class="ds-item ds-resizetype">
            <div class="ds-titlename">
              缩放方式
            </div>
            <div class="ds-titlecontent" v-on:click.stop="showResizeType">
                {{defaultsettings.resizetypename}}
            </div>
            <ul class="ds-rstchoose" :style="defaultsettings.resizetypestyle">
              <li v-on:click="chooseResizeType(0)">全屏等比缩放(大屏/PC)</li>
              <li v-on:click="chooseResizeType(1)">按高度适配(横向滚动)</li>
              <li v-on:click="chooseResizeType(2)">按宽度适配(移动端)</li>
            </ul>
          </div>
          <div class="ds-item ds-background">
            <div class="ds-titlename">
              大屏背景
            </div>
            <div class="ds-bkg-file">
              <div class="ds-bkg-img">
                <img :src="defaultsettings.src">
              </div>
              <input ref="referenceUpload" v-on:change="backGroundChange" type="file" accept="image/*" class="ds-upload-input">
              <div class="ds-bkg-file-choose" :style="defaultsettings.choosestyle">
                <i class="ivu-icon ivu-icon-ios-cloud-upload" style="font-size: 52px; color: rgb(51, 153, 255);"></i>
                <p>点击选择背景图片</p>
              </div>
              <div class="ds-bkg-clearn" v-on:click="clearnBackGround" :style="defaultsettings.clearnstyle">
                 <i class="ivu-icon ivu-icon-md-brush" style="font-size: 52px; color: rgb(51, 153, 255);"></i>
                <p>删除背景</p>
              </div>
            </div>
          </div>
      </div> -->
      <!-- datasetting_end -->
    </div>
    <!-- view-container_end -->
    <!-- 删除组件 -->
    <div class="message-confirm" :style="message.style">
        <div class="message-container">
          <h3>删除组件</h3>
          <p>确定要删除吗？</p>
          <div class="confirm">
            <span v-on:click="moduleDelete">确定</span>
            <span v-on:click="moduleDeleteCancel">取消</span>
          </div>
        </div>
    </div>
    <!-- api -->
    <api-modal ref="refApiModal" @postParams='getParams' :type='currentmodule.datatype' :api='currentmodule.config.api' :imgtype="currentmodule.type"/>
    <!-- 阈值设置弹窗 -->
    <threshold-settings ref="threshold" :api='currentmodule.config.api' :threshold='currentmodule.config.threshold' @threshold='thresholdFun'/>
  </div>
</template>
<script>
import DatabaseRuntimeTable from '@/components/DatabaseRuntimeTable.vue';
import { isDpmRuntimeTable, refreshDpmRuntimeTable } from '@/dataSources/dpm/runtime';

import { dpmChartData } from "@/dataSources/dpm/normalize";
import { setDpmScalar, prepareDpmWidgetResult, showDpmWidgetError, refreshDpmVerticalBar, resetDpmVerticalBar } from "@/dataSources/dpm/charts";
import { syncDpmUrl, isDpmUrl } from "@/dataSources/dpm/query";

var echarts = require("echarts");
// 引入柱状图
require("echarts/lib/chart/bar");
// 引入提示框和标题组件
require("echarts/lib/component/tooltip");
require("echarts/lib/component/title");

var editors = require("vue2-ace-editor");
import "echarts/map/js/china";
import { Sketch } from "vue-color";
import { mapActions } from "vuex";
import moduledata from "@/store/module/moduledata";
import moduledefault from "@/store/module/moduledefault";
import config from "@/config";
import apiModal from "@/components/ApiModal";
import thresholdSettings from "./components/ThresholdSettings";
import {
  ascCompare,
  descCompare,
  replace_disp_str,
  replace_disp_str2,
  replace_unit,
  replace_unit2,
  num_to_fixed,
  canvasDataURL,
  getQueryString
} from "@/lib/common.js";
import { exportJson, importJson } from "@/apis/module.js";
import moduledefaultcolor from "@/store/module/moduledefaultcolor";
import CountUp from "vue-countup-v2";
import $ from "jquery";

// 截图上传已经修改了toPng的源码，加入了scale的判断
import domtoimage from "dom-to-image";
import {
  isHaveChinese,
  clearSpace,
  checkApi,
  isStrEmpty
} from "@/lib/commonUtil";
import { format } from "url";

export default {
  name: "imgeditor",
  components: { DatabaseRuntimeTable,
    editor: editors,
    "photoshop-picker": Sketch,
    apiModal,
    thresholdSettings,
    CountUp
  },
  data() {
    return {
      
      pageName: this.$route.query.pageName,
      cityList: [{ value: "山西省", label: "山西省" }],
      province: "",
      city: "",
      homepng: require("../../assets/imgs/29.png"),
      logout: require("../../assets/imgs/30.png"),
      moduledata: moduledata,
      colors: "#fff",
      msg: "",
      imgtype: "",
      config: config,
      message: {
        style: {
          display: "none"
        }
      },
      currentmodule: {
        datatypeset: {
          //数据样式保存当前点击的哪个颜色块
          index: "",
          indexcolor: "",
          num: ""
        },
        content: "", //编辑器数据内容
        type: "", //组件类型
        datatype: "", //组件数据类型
        apitype: {
          display: "none" //api下拉框是否展开
        },
        config: {
          imgsrc: "",
          chart: false, //是否是百度地图组件
          img: true, //是否是图片组件
          datas: false, //是否需要数据支撑
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: {},
          defaultdata: "",
          numtype: "正向"
        },
        editorconfig: {
          //编辑器配置
          theme: "monokai",
          lang: "json",
          enableEmmet: true
        },
        id: "",
        name: "",
        width: "",
        height: "",
        left: "",
        top: "",
        zindex: "",
        borderColor: "transparent",
        borderColorStyle: { display: "none", right: "300px", top: "200px" },
        bgColor: "transparent",
        bgColorStyle: { display: "none", right: "300px", top: "200px" },
        borderRadius: 0,
        animation: false
      },
      // 大屏设置
      defaultsettings: {
        style: {
          width: "",
          height: "",
          display: "none"
        },
        // 菜单样式
        menustyle: {
          left: "10px",
          top: "10px",
          display: "none"
        },
        title: "",
        viewconfigstyle: {
          display: "none"
        },
        filename: "",
        src: "", //背景图
        asyncSrc: "", //上传之后接口返回的图片路径，防止多次删除上传之后，图片显示问题
        headimg: "", //缩略图
        resizetype: 1,
        resizetypename: "全屏等比缩放(大屏/PC)",
        // 清除背景图
        clearnstyle: {
          display: "none"
        },
        // 图片选择
        srcchoosestyle: {
          display: ""
        },
        // 缩放方式选择
        resizetypestyle: {
          display: "none"
        },
        // 数据请求方式
        datatypestyle: {
          style: {
            display: "none"
          },
          name: "API"
        },
        // 选择背景图
        choosestyle: {
          display: ""
        }
      },
      // 可供选择的选项
      modules: {
        radiodata: 100,
        radio: 1,
        // 大屏默认宽高
        defaulestyle: {
          width: "",
          height: ""
        },
        moduleid: "",
        imgstyleright: {
          right: "0px"
        },
        // 缩放的比例
        imgstyle: {
          "background-size": "100% 100%",
          "background-repeat": "no-repeat",
          "background-image": "",
          top: "0",
          left: "0",
          right: "0px"
        },
        // canvas栅格样式
        gridstype: {
          display: "none",
          opacity: 0.3
        },
        style: {
          display: "none"
        },
        modulesource: []
      },
      // 所有的组件选项
      modulessource: [
        {
          id: "jichu",
          type: "",
          img: require("../../assets/imgs/3.png"),
          name: "统计组件",
          modules: [
            {
              type: "zongxiangzhuzhuangtu",
              datatype: "topValues",
              name: "纵向柱状图",
              id: "1",
              src: require("../../assets/imgs/15.png"),
              data: {}
            },
            {
              type: "hengxiangzhuzhuangtu",
              datatype: "topValues",
              name: "横向柱状图",
              id: "17",
              src: require("../../assets/imgs/40.png"),
              data: {}
            },
            {
              type: "mianjitu",
              datatype: "timeValues",
              name: "面积图",
              id: "3",
              src: require("../../assets/imgs/41.png"),
              data: {}
            },
            {
              type: "zhexiantu",
              datatype: "timeValues",
              name: "折线图",
              id: "18",
              src: require("../../assets/imgs/16.png"),
              data: {}
            },
            {
              type: "tupian",
              name: "图片",
              id: "4",
              src: require("../../assets/imgs/13.png"),
              data: {}
            },
            {
              type: "jinduhuantu",
              datatype: "averageValues",
              name: "进度环图",
              id: "5",
              src: require("../../assets/imgs/1.png"),
              data: {}
            },
            {
              type: "yibiaopan",
              datatype: "averageValues",
              name: "仪表盘",
              id: "20",
              src: require("../../assets/imgs/44.png"),
              data: {}
            },
            {
              type: "meiguitu",
              datatype: "topValues",
              name: "玫瑰图",
              id: "6",
              src: require("../../assets/imgs/17.png"),
              data: {}
            },
            {
              type: "bingtu",
              datatype: "topValues",
              name: "饼图",
              id: "19",
              src: require("../../assets/imgs/43.png"),
              data: {}
            },
            {
              type: "shixinbingtu",
              datatype: "topValues",
              name: "实心饼图",
              id: "22",
              src: require("../../assets/imgs/26.png"),
              data: {}
            },
            {
              type: "hengxiangduidiezhuzhuangtu",
              datatype: "topValues",
              name: "横向堆叠柱状图",
              id: "11",
              src: require("../../assets/imgs/42.png"),
              data: {}
            },
            {
              type: "zongxiangduidiezhuzhuangtu",
              datatype: "topValues",
              name: "纵向堆叠柱状图",
              id: "21",
              src: require("../../assets/imgs/24.png"),
              data: {}
            }
          ]
        },
        {
          id: "wenzi",
          type: "wenzi",
          img: require("../../assets/imgs/19.png"),
          name: "文字组件",
          modules: [
            {
              type: "danhangwenben",
              name: "单行文本",
              id: "8",
              src: require("../../assets/imgs/18.png"),
              data: {}
            },
            {
              type: "biaoge",
              datatype: "topValues",
              name: "表格",
              id: "9",
              src: require("../../assets/imgs/21.png"),
              data: {}
            },
            {
              type: "shuzitu",
              datatype: "averageValues",
              name: "数字图",
              id: "10",
              src: require("../../assets/imgs/22.png"),
              data: {}
            },
            {
              type: "qukuaizujian",
              name: "区块组建",
              id: "11",
              src: require("../../assets/imgs/23.png"),
              data: {}
            },
            {
              type: "riqishijian",
              name: "日期时间",
              id: "12",
              src: require("../../assets/imgs/23.png"),
              data: {}
            }
          ]
        }
      ],
      imgmodules: [], //保存每个组件的信息，包括id等
      zooms: {
        show: false, //是否展示遮罩拖拽层
        resize: false, //是否缩放，缩放模式，防止点击事件和mousedown事件冲突
        ctrenter: false, //ctr按键是否按下,多选模式
        type: "", //拖拽缩放时候的类型，总共8个，left,top,right,bottom...
        style: {
          width: "",
          height: "",
          top: "",
          left: ""
        } //拖拽组件的样式保存
      },
      add: false, //false修改  true新增
      scrollLeft: 0,
      scrollTop: 0,
      biaogeCurrentmodule: {},
      delay: 1000,
      startVal: 0,
      options1: {
        useEasing: true,
        useGrouping: true,
        separator: "",
        decimalPlaces: 3
      },
      options2: {
        useEasing: true,
        useGrouping: true,
        separator: "",
        decimalPlaces: 0
      },
      color: "#63b670",
      // 鼠标拖动选中
      start_x: 0,
      start_y: 0,
      end_x: 0,
      end_y: 0,
      isLiving: false,
      year:'',
      month:'',
      date:'',
      hour:'',
      minute:'',
      second:'',
    };
  },
  created() {
    if (window.parent.document.getElementById("time-date")) {
      window.parent.document.getElementById("time-date").style.display = "none";
    }
    var _self = this;
    document.onkeydown = function(e) {
      var key = window.event.keyCode;
      if (key == 17) {
        _self.ctrEnterDowm();
      }
    };
    document.onkeyup = function(e) {
      var key = window.event.keyCode;
      if (key == 17) {
        _self.ctrEnterUp();
      } else if (key == 8) {
        if (e.target.tagName === "BODY") {
          _self.moduleDelete();
        }
      }
    };
  },
  computed: {
    runtimeSelectionInteractive() {
      const selected = this.imgmodules.filter(item => item.selects);
      return selected.length === 1 && isDpmRuntimeTable(selected[0]);
    }
  },
  mounted: function() {
    let moduleid = this.$route.query.id || "";
    this.modules.moduleid = moduleid;
    this.moduleContent();
    this.drawGrid("#eee", 1920, 1080);
    window.onresize = () => {
      this.changeWindow();
    };
    window.oncontextmenu = function() {
      return false;
    };
    this.showtime()
  },
  // destroyed(){
  //   for (let i = 0; i < this.imgmodules.length; i++) {
  //     clearInterval(this.imgmodules[i].config.time);
  //   }
  // },

 

  methods: { isDpmRuntimeTable,

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

    handleMouseDown(event) {
      event.preventDefault();
      this.isLiving = false;
      this.moduleListHidden();
      this.menuHidden();
      this.hiddenModuleConfig();
      // console.log("=====鼠标按下========");
      this.start_x = event.clientX;
      this.start_y = event.clientY;
      this.end_x = event.clientX;
      this.end_y = event.clientY;
      if (event.target.className == "item-border") {
        return;
      } else {
        this.zooms.show = false;
      }
      document.body.addEventListener("mousemove", this.handleMouseMove);
      document.body.addEventListener("mouseup", this.handleMouseUp);
    },
    handleMouseMove(event) {
      event.preventDefault();
      this.isLiving = true;
      this.zooms.show = true;
      // console.log("=====鼠标移动========");
      this.end_x = event.clientX;
      this.end_y = event.clientY;
      // 从左往右画矩形
      if (this.start_x < this.end_x) {
        this.zooms.style.width = this.end_x - this.start_x + "px";
        this.zooms.style.height =
          (this.start_y > this.end_y > 0
            ? this.start_y - this.end_y
            : this.end_y - this.start_y) + "px";
        this.zooms.style.left = this.start_x + "px";
        this.zooms.style.right = this.end_x + "px";
        // 从下往上
        if (this.start_y > this.end_y) {
          this.zooms.style.top = this.end_y + "px";
          this.zooms.style.bottom = this.start_y + "px";
        } else {
          this.zooms.style.top = this.start_y + "px";
          this.zooms.style.bottom = this.end_y + "px";
        }
      } else {
        this.zooms.style.width = this.start_x - this.end_x + "px";
        this.zooms.style.height =
          (this.start_y > this.end_y > 0
            ? this.start_y - this.end_y
            : this.end_y - this.start_y) + "px";
        this.zooms.style.left = this.end_x + "px";
        this.zooms.style.right = this.start_x + "px";
        // 从下往上
        if (this.start_y > this.end_y) {
          this.zooms.style.top = this.end_y + "px";
          this.zooms.style.bottom = this.start_y + "px";
        } else {
          this.zooms.style.top = this.start_y + "px";
          this.zooms.style.bottom = this.end_y + "px";
        }
      }
    },
    handleMouseUp(event) {
      event.preventDefault();
      document.body.removeEventListener("mousemove", this.handleMouseMove);
      document.body.removeEventListener("mouseup", this.handleMouseUp);
      // console.log("=====鼠标抬起========");
      this.end_x = event.clientX;
      this.end_y = event.clientY;
      if (this.isLiving) {
        for (let i = 0; i < this.imgmodules.length; i++) {
          // this.imgmodules[i].selects = true
          let imgmodules = this.imgmodules[i];
          var sl =
            parseInt(imgmodules.style.width) + parseInt(imgmodules.style.left);
          var st =
            parseInt(imgmodules.style.height) + parseInt(imgmodules.style.top);
          var zl = parseInt(this.zooms.style.left);
          var zt = parseInt(this.zooms.style.top);
          if (
            sl > zl &&
            st > zt &&
            parseInt(imgmodules.style.left) <
              zl + parseInt(this.zooms.style.width) &&
            parseInt(imgmodules.style.top) <
              zt + parseInt(this.zooms.style.height)
          ) {
            imgmodules.selects = true;
          } else {
            imgmodules.selects = false;
          }
        }
        this.resizeShow();
      } else {
        for (let i = 0; i < this.imgmodules.length; i++) {
          this.imgmodules[i].selects = false;
        }
      }
    },
    ...mapActions([
      "moduleMessage",
      "fileUpload",
      "editModule",
      "addModule",
      "ajax"
    ]),
    // 改变列宽
    changeColWidth(newWidth, oldWidth, column, event) {
      for (var i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == this.currentmodule.id) {
          for (var j = 0; j < this.imgmodules[i].config.widgets.x.length; j++) {
            if (this.imgmodules[i].config.widgets.x[j].key == column.label) {
              this.imgmodules[i].config.width[j] = newWidth;
            }
          }
        }
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (row["bg" + columnIndex]) {
        if (row["bg" + columnIndex] == "Minor") {
          return "background-color:#ffff00!important";
        } else if (row["bg" + columnIndex] == "Major") {
          return "background-color:#ff9900!important";
        } else if (row["bg" + columnIndex] == "Critical") {
          return "background-color:#ff0000!important";
        } else {
          return "background-color:trasparent";
        }
      }
    },
    
  // 兼容老 Babel：不用 ??
  get(obj, path, defVal = null) {
    try {
      const val = path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
      return val !== undefined ? val : defVal;
    } catch (e) {
      return defVal;
    }
  },
    // 单行文本复制
    moduleCoppy() {
      // return
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == this.currentmodule.id) {
          let item = JSON.parse(JSON.stringify(this.imgmodules[i]));
          item.id = new Date().valueOf();
          item.selects = false;
          item.style.top =
            parseFloat(item.style.top.replace("px", "")) - 60 + "px";
          this.imgmodules.push(item);
        }
      }
      this.defaultsettings.menustyle.display = "none";
    },
    //导入
    importJson(item) {
      let formData = new FormData();
      let file = item.raw;
      formData.append("file", file);
      let postData = {
        formData,
        file_id: this.modules.moduleid
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
        file_id: this.modules.moduleid
      };
      exportJson(postData).then(res => {
        if (res.data.length > 0) {
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

    getScroll(event) {
      // 获取滚动条滚动的距离
      this.scrollLeft = event.target.scrollLeft;
      this.scrollTop = event.target.scrollTop;
    },
    hiddenChartMenu() {
      this.currentmodule.config.params.moduledatas.legend.show = false;
      this.reJichuzhuzhuangtuChart();
    },
    showChartMenu() {
      this.currentmodule.config.params.moduledatas.legend.show = true;
      this.reJichuzhuzhuangtuChart();
    },
    // 日期是否显示
    hiddenDateMenu() {
      this.currentmodule.config.widgets.isShowDate = false
      this.currentmodule.config.widgets.dateStyle.style.display = 'none'
    },
    showDateMenu() {
      this.currentmodule.config.widgets.isShowDate = true
      this.currentmodule.config.widgets.dateStyle.style.display = 'inline-block'
    },
    // 时间是否显示
    hiddenTimeMenu() {
      this.currentmodule.config.widgets.isShowTime = false
      this.currentmodule.config.widgets.timeStyle.style.display = 'none'
    },
    showTimeMenu() {
      this.currentmodule.config.widgets.isShowTime = true
      this.currentmodule.config.widgets.timeStyle.style.display = 'inline-block'
    },
    // 星期是否显示
    hiddenDayMenu() {
      this.currentmodule.config.widgets.isShowDay = false
      this.currentmodule.config.widgets.dayStyle.style.display = 'none'
    },
    showDayMenu() {
      this.currentmodule.config.widgets.isShowDay = true
      this.currentmodule.config.widgets.dayStyle.style.display = 'inline-block'
    },
    hiddenAnimation() {
      this.currentmodule.animation = false;
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == this.currentmodule.id) {
          this.imgmodules[i].style.animation = this.currentmodule.animation;
        }
      }
    },
    showAnimation() {
      this.currentmodule.animation = true;
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == this.currentmodule.id) {
          this.imgmodules[i].style.animation = this.currentmodule.animation;
        }
      }
    },
    yAxisHidden() {
      if (this.currentmodule.config.yAxiosbeforecontent == "+") {
        this.currentmodule.config.yAxiosbeforecontent = "-";
      } else {
        this.currentmodule.config.yAxiosbeforecontent = "+";
      }
    },
    xAxisHidden() {
      if (this.currentmodule.config.xAxiosbeforecontent == "+") {
        this.currentmodule.config.xAxiosbeforecontent = "-";
      } else {
        this.currentmodule.config.xAxiosbeforecontent = "+";
      }
    },
    dataSetHidden() {
      if (this.currentmodule.config.datasetbeforecontent == "+") {
        this.currentmodule.config.datasetbeforecontent = "-";
      } else {
        this.currentmodule.config.datasetbeforecontent = "+";
      }
    },
    // 新的分组里头另外增加组件
    addDataTypeConfig(index) {
      if (this.currentmodule.type == "zongxiangzhuzhuangtu") {
        var currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        var ystyle = JSON.parse(
          JSON.stringify(this.moduledata.state.zongxiangzhuzhuangtu)
        );
        currenty.color.push(ystyle.style.y[0].color[0]);
        currenty.style.color.push(ystyle.style.y[0].style.color[0]);
        this.reJichuzhuzhuangtuChart();
      }
      if (this.currentmodule.type == "hengxiangzhuzhuangtu") {
        var currentx = this.currentmodule.config.params.moduledatas.style.x[
          index
        ];
        var xstyle = JSON.parse(
          JSON.stringify(this.moduledata.state.hengxiangzhuzhuangtu)
        );
        currentx.color.push(xstyle.style.x[0].color[0]);
        currentx.style.color.push(xstyle.style.x[0].style.color[0]);
        this.reJichuzhuzhuangtuChart();
      }
      if (this.currentmodule.type == "meiguitu") {
        var params = this.currentmodule.config.params;
        var meiguitu = JSON.parse(
          JSON.stringify(this.moduledata.state.meiguitu)
        );
        params.style.color.push(meiguitu.style.color[0]);
        params.color.push(meiguitu.color[0]);
        this.reJichuzhuzhuangtuChart();
      }
      if (this.currentmodule.type == "bingtu") {
        var params = this.currentmodule.config.params;
        var bingtu = JSON.parse(JSON.stringify(this.moduledata.state.bingtu));
        params.style.color.push(bingtu.style.color[0]);
        params.color.push(bingtu.color[0]);
        this.reJichuzhuzhuangtuChart();
      }
      if (this.currentmodule.type == "shixinbingtu") {
        var params = this.currentmodule.config.params;
        var shixinbingtu = JSON.parse(
          JSON.stringify(this.moduledata.state.shixinbingtu)
        );
        params.style.color.push(bingtu.style.color[0]);
        params.color.push(shixinbingtu.color[0]);
        this.reJichuzhuzhuangtuChart();
      }
      if (this.currentmodule.type == "hengxiangduidiezhuzhuangtu") {
        var currentx = this.currentmodule.config.params.moduledatas.style.x[
          index
        ];
        var xstyle = JSON.parse(
          JSON.stringify(this.moduledata.state.hengxiangduidiezhuzhuangtu)
        );
        currentx.color.push(xstyle.style.x[0].color[0]);
        currentx.style.color.push(xstyle.style.x[0].style.color[0]);
        this.reJichuzhuzhuangtuChart();
      }
      if (this.currentmodule.type == "zongxiangduidiezhuzhuangtu") {
        var currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        var ystyle = JSON.parse(
          JSON.stringify(this.moduledata.state.zongxiangduidiezhuzhuangtu)
        );
        currenty.color.push(ystyle.style.y[0].color[0]);
        currenty.style.color.push(ystyle.style.y[0].style.color[0]);
        this.reJichuzhuzhuangtuChart();
      }
      if (this.currentmodule.type == "yibiaopan") {
        var params = this.currentmodule.config.params;
        var yibiaopan = JSON.parse(
          JSON.stringify(this.moduledata.state.yibiaopan)
        );
        params.color.push([
          1,
          moduledefaultcolor.colorList[
            this.currentmodule.config.params.color.length
          ]
        ]);
        params.style.color.push(
          yibiaopan.style.color[yibiaopan.style.color.length - 1]
        );
        this.reJichuzhuzhuangtuChart();
      }
    },
    // 日历图删除样式
    delDataCalenderTypeConfig(indexcolor) {},
    // 新的分组里头另外删除组件
    delDataTypeConfig(index, indexcolor) {
      if (
        this.currentmodule.type == "zongxiangzhuzhuangtu" ||
        this.currentmodule.type == "zongxiangduidiezhuzhuangtu"
      ) {
        var currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.color.splice(indexcolor, 1);
        currenty.style.color.splice(indexcolor, 1);
        this.reJichuzhuzhuangtuChart();
      }
      if (
        this.currentmodule.type == "hengxiangduidiezhuzhuangtu" ||
        this.currentmodule.type == "hengxiangzhuzhuangtu"
      ) {
        var currentx = this.currentmodule.config.params.moduledatas.style.x[
          index
        ];
        currentx.color.splice(indexcolor, 1);
        currentx.style.color.splice(indexcolor, 1);
        this.reJichuzhuzhuangtuChart();
      }
      if (
        this.currentmodule.type == "meiguitu" ||
        this.currentmodule.type == "bingtu" ||
        this.currentmodule.type == "shixinbingtu"
      ) {
        var currenty = this.currentmodule.config.params.style;
        currenty.color.splice(indexcolor, 1);
        this.currentmodule.config.params.color.splice(indexcolor, 1);
        this.reJichuzhuzhuangtuChart();
      }
      if (this.currentmodule.type == "yibiaopan") {
        var currenty = this.currentmodule.config.params.style;
        var colortype = this.currentmodule.config.params.color;
        currenty.color.splice(indexcolor, 1);
        colortype.splice(indexcolor, 1);
        this.reJichuzhuzhuangtuChart();
      }
    },
    delMianjituDataTypeConfigGroup(index) {
      var currenty = this.currentmodule.config.params.moduledatas.style.y;
      currenty.splice(index, 1);
      this.reJichuzhuzhuangtuChart();
    },
    // 删除数组分组
    delDataTypeConfigGroup(index) {
      if (
        this.currentmodule.type == "zongxiangzhuzhuangtu" ||
        this.currentmodule.type == "zongxiangduidiezhuzhuangtu"
      ) {
        var currenty = this.currentmodule.config.params.moduledatas.style.y;
        currenty.splice(index, 1);
        this.reJichuzhuzhuangtuChart();
      }
      if (
        this.currentmodule.type == "hengxiangduidiezhuzhuangtu" ||
        this.currentmodule.type == "hengxiangzhuzhuangtu"
      ) {
        var currentx = this.currentmodule.config.params.moduledatas.style.x;
        currentx.splice(index, 1);
        this.reJichuzhuzhuangtuChart();
      }
    },
    // 添加新的分组
    addDataTypeConfigGroup() {
      this.currentmodule.config.datasetbeforecontent = "-";
      if (this.currentmodule.type == "zongxiangzhuzhuangtu") {
        var ystyle = JSON.parse(
          JSON.stringify(this.moduledata.state.zongxiangzhuzhuangtu)
        );
        this.currentmodule.config.params.moduledatas.style.y.push(
          ystyle.style.y[0]
        );
        this.reJichuzhuzhuangtuChart();
      } else if (this.currentmodule.type == "hengxiangzhuzhuangtu") {
        var xstyle = JSON.parse(
          JSON.stringify(this.moduledata.state.hengxiangzhuzhuangtu)
        );
        this.currentmodule.config.params.moduledatas.style.x.push(
          xstyle.style.x[0]
        );
        this.reJichuzhuzhuangtuChart();
      } else if (this.currentmodule.type == "mianjitu") {
        var ystyle = JSON.parse(JSON.stringify(this.moduledata.state.mianjitu));
        this.currentmodule.config.params.moduledatas.style.y.push(
          ystyle.style.y[0]
        );
        this.reJichuzhuzhuangtuChart();
      } else if (this.currentmodule.type == "zhexiantu") {
        var ystyle = JSON.parse(
          JSON.stringify(this.moduledata.state.zhexiantu)
        );
        this.currentmodule.config.params.moduledatas.style.y.push(
          ystyle.style.y[0]
        );
        this.reJichuzhuzhuangtuChart();
      } else if (this.currentmodule.type == "hengxiangduidiezhuzhuangtu") {
        var xstyle = JSON.parse(
          JSON.stringify(this.moduledata.state.hengxiangduidiezhuzhuangtu)
        );
        this.currentmodule.config.params.moduledatas.style.x.push(
          xstyle.style.x[0]
        );
        this.reJichuzhuzhuangtuChart();
      } else if (this.currentmodule.type == "zongxiangduidiezhuzhuangtu") {
        var ystyle = JSON.parse(
          JSON.stringify(this.moduledata.state.zongxiangduidiezhuzhuangtu)
        );
        this.currentmodule.config.params.moduledatas.style.y.push(
          ystyle.style.y[0]
        );
        this.reJichuzhuzhuangtuChart();
      }
    },
    colorPickUpdateValue(val) {
        // ① 颜色值统一成字符串
        const color = typeof val === 'string' ? val : (val && (val.hex8 || val.hex)) || '';

        // ② 取当前模块 / widgets / headerStyle（保持响应式）
        const cm = this.currentmodule;
        const widgets = cm && cm.config ? (cm.config.widgets || (cm.config.widgets = {})) : {};
        const hs = widgets.headerStyle || (widgets.headerStyle = {});

        // ③ 防御：确保子对象存在（否则 this.$set(hs.border, ...) 会报错）
        if (!hs.border) this.$set(hs, 'border', { color: '', width: 1 });
        if (!hs.text)   this.$set(hs, 'text',   { color: '', size: 14, weight: 400 });

        // ④ 从 activeColorKey（或你已有逻辑里存的 key）取编号
        const key = this.activeColorKey;

        switch (key) {
          case 201: this.$set(hs, 'background', color); break;           // 表头背景
          case 202: this.$set(hs.border, 'color', color); break;         // 表头边框色
          case 203: this.$set(hs.text,   'color', color); break;         // 表头字体色

          case 23:
            if (!widgets.xStyle) this.$set(widgets, 'xStyle', {});
            this.$set(widgets.xStyle, 'color', color);                   // 正文字体色
            break;

          default:
            break;
        }
        
        // 选择颜色后隐藏颜色选择器
        this.hiddenColorPicker();

      console.log('val',val)
      if(!val.rgba)return
      let index = this.currentmodule.datatypeset.index;
      let indexcolor = this.currentmodule.datatypeset.indexcolor;
      let num = this.currentmodule.datatypeset.num;
      let value =
        "rgba(" +
        val.rgba.r +
        "," +
        val.rgba.g +
        "," +
        val.rgba.b +
        "," +
        val.rgba.a +
        ")";

      if (num == 0) {
        let currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.color[indexcolor][0] = value;
      } else if (num == 1) {
        let currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.color[indexcolor][1] = value;
      } else if (num == 2) {
        let currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.borderColor = value;
      } else if (num == 3) {
        let currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.label.color = value;
      } else if (num == 4) {
        let currentxAxis = this.currentmodule.config.params.xAxis;
        currentxAxis.axisLine.lineStyle.color = value;
      } else if (num == 5) {
        let currentxAxis = this.currentmodule.config.params.xAxis;
        currentxAxis.axisLabel.color = value;
      } else if (num == 6) {
        let currentyAxis = this.currentmodule.config.params.yAxis;
        currentyAxis.axisLine.lineStyle.color = value;
      } else if (num == 7) {
        let currentyAxis = this.currentmodule.config.params.yAxis;
        currentyAxis.axisLabel.color = value;
      } else if (num == 8) {
        let currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.areaStyle.color.colorStops[0].color = value;
      } else if (num == 9) {
        let currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.areaStyle.color.colorStops[1].color = value;
      } else if (num == 10) {
        let currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.lineStyle.color = value;
        currenty.itemStyle.normal.color = value;
      } else if (num == 11) {
        let currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.itemStyle.normal.borderColor = value;
      } else if (num == 12) {
        let currentyAxis = this.currentmodule.config.params.yAxis;
        currentyAxis.splitLine.lineStyle.color = value;
      } else if (num == 13) {
        this.currentmodule.config.params.color[0] = value;
      } else if (num == 14) {
        this.currentmodule.config.params.color[1] = value;
      } else if (num == 15) {
        this.currentmodule.config.params.style.itemStyle.borderColor = value;
      } else if (num == 16) {
        this.currentmodule.config.params.style.label.color = value;
      } else if (num == 17) {
        this.currentmodule.config.params.style.active.color = value;
      } else if (num == 18) {
        this.currentmodule.config.params.style.color[indexcolor][0] = value;
      } else if (num == 19) {
        this.currentmodule.config.params.style.color[indexcolor][1] = value;
      } else if (num == 20) {
        this.currentmodule.config.params.style.color[indexcolor][2] = value;
      } else if (num == 21) {
        this.currentmodule.config.widgets.style.color = value;
      } else if (num == 105) {
        this.currentmodule.config.widgets.dateStyle.style.color = value;
      } else if (num == 106) {
        this.currentmodule.config.widgets.timeStyle.style.color = value;
      } else if (num == 107) {
        this.currentmodule.config.widgets.dayStyle.style.color = value;
      } else if (num == 22) {
        this.currentmodule.config.widgets.numBackStyle.background = value;
      } else if (num == 23) {
        this.currentmodule.config.widgets.xStyle.color = value;
      } else if (num == 24) {
        this.currentmodule.config.params.style.map.itemStyle.normal.areaColor = value;
      } else if (num == 25) {
        this.currentmodule.config.params.style.map.itemStyle.normal.borderColor = value;
      } else if (num == 26) {
        this.currentmodule.config.params.style.effectScatter.label.normal.color = value;
      } else if (num == 27) {
        this.currentmodule.config.params.style.effectScatter.itemStyle.normal.color = value;
      } else if (num == 28) {
        this.currentmodule.config.params.style.effectScatter.itemStyle.normal.shadowColor = value;
      } else if (num == 29) {
        this.currentmodule.config.params.style.scatter.itemStyle.normal.color = value;
      } else if (num == 30) {
        this.currentmodule.config.params.style[index].color[
          indexcolor
        ][0] = value;
      } else if (num == 31) {
        this.currentmodule.config.params.style[index].color[
          indexcolor
        ][1] = value;
      } else if (num == 32) {
        this.currentmodule.config.params.style[index].color[
          indexcolor
        ][2] = value;
      } else if (num == 33) {
        this.currentmodule.config.widgets.angleAxis.axisLine.lineStyle.color = value;
      } else if (num == 34) {
        this.currentmodule.config.widgets.radiusAxis.axisLine.lineStyle.color = value;
      } else if (num == 35) {
        this.currentmodule.config.widgets.angleAxis.splitLine.lineStyle.color = value;
      } else if (num == 50) {
        this.currentmodule.config.params.style.dataColor[index].color = value;
      } else if (num == 51) {
        this.currentmodule.config.params.style.bgColor = value;
      } else if (num == 52) {
        this.currentmodule.config.params.style.dayColor = value;
      } else if (num == 53) {
        this.currentmodule.config.params.style.calendarBorderColor = value;
      } else if (num == 54) {
        this.currentmodule.config.params.style.weekColor = value;
      } else if (num == 60) {
        this.currentmodule.config.params.style.title.color = value;
      } else if (num == 61) {
        this.currentmodule.config.params.color[indexcolor][1] = value;
      } else if (num == 70) {
        let currentx = this.currentmodule.config.params.moduledatas.style.x[
          index
        ];
        currentx.color[indexcolor][0] = value;
      } else if (num == 71) {
        let currentx = this.currentmodule.config.params.moduledatas.style.x[
          index
        ];
        currentx.color[indexcolor][1] = value;
      } else if (num == 72) {
        let currentx = this.currentmodule.config.params.moduledatas.style.x[
          index
        ];
        currentx.borderColor = value;
      } else if (num == 73) {
        let currentx = this.currentmodule.config.params.moduledatas.style.x[
          index
        ];
        currentx.label.color = value;
      } 
      else if (num == 100) {
        this.currentmodule.borderColor = value;
        for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id == this.currentmodule.id) {
            this.imgmodules[i].style.border =
              "1px solid " + this.currentmodule.borderColor;
            $(
              "#" +
                this.currentmodule.id +
                " .el-table th.el-table__cell.is-leaf"
            ).css(
              "borderBottom",
              "1px solid " + this.currentmodule.borderColor
            );
            $("#" + this.currentmodule.id + " .el-table td.el-table__cell").css(
              "borderBottom",
              "1px solid " + this.currentmodule.borderColor
            );
            $(
              "#" +
                this.currentmodule.id +
                " .el-table.el-table--border .el-table__cell"
            ).css("borderRight", "1px solid " + this.currentmodule.borderColor);
            $("#" + this.currentmodule.id + " .el-table.el-table--border").css(
              "border",
              "1px solid " + this.currentmodule.borderColor
            );
          }
        }
      } else if (num == 101) {
        this.currentmodule.bgColor = value;
        for (let i = 0; i < this.imgmodules.length; i++) {
          if (this.imgmodules[i].id == this.currentmodule.id) {
            this.imgmodules[i].style.background = this.currentmodule.bgColor;
          }
        }
      } else if (num == 102) {
        this.currentmodule.config.params.moduledatas.legend.textStyle.color = value;
      } else if (num == 103) {
        this.currentmodule.config.params.style.numStyle.numColor = value;
      }
      if (num != 100 && num != 101) {
        this.reJichuzhuzhuangtuChart();
      }   
    },
    // 刷新页面数据以及样式
    reJichuzhuzhuangtuChart() {
      if (this.currentmodule.type == "zongxiangzhuzhuangtu") {
        //纵向柱状图
        this.reZongxiangzhuzhuangtu("", this.currentmodule.id);
      } else if (this.currentmodule.type == "hengxiangzhuzhuangtu") {
        //横向柱状图
        this.reHengxiangzhuzhuangtu("", this.currentmodule.id);
      } else if (this.currentmodule.type == "hengxiangduidiezhuzhuangtu") {
        //横向堆叠柱状图
        this.reHengxiangduidiezhuzhuangtu("", this.currentmodule.id);
      } else if (this.currentmodule.type == "zongxiangduidiezhuzhuangtu") {
        //纵向堆叠柱状图
        this.reZongxiangduidiezhuzhuangtu("", this.currentmodule.id);
      } else if (this.currentmodule.type == "mianjitu") {
        //面积图
        this.reMianjitu("", this.currentmodule.id);
      } else if (this.currentmodule.type == "zhexiantu") {
        //折线图
        this.reZhexiantu("", this.currentmodule.id);
      } else if (this.currentmodule.type == "jinduhuantu") {
        //进度环图
        this.reJinduhuantu("", this.currentmodule.id);
      } else if (this.currentmodule.type == "yibiaopan") {
        //仪表盘
        this.reYibiaopan("", this.currentmodule.id);
      } else if (this.currentmodule.type == "meiguitu") {
        //玫瑰图
        this.reMeiGuitu("", this.currentmodule.id);
      } else if (this.currentmodule.type == "bingtu") {
        //饼图
        this.reBingtu("", this.currentmodule.id);
      } else if (this.currentmodule.type == "shixinbingtu") {
        //实心饼图
        this.reShixinbingtu("", this.currentmodule.id);
      } else if (this.currentmodule.type == "danhangwenben") {
        //单行文本
        this.reDanhangwenben("", this.currentmodule.id);
      } else if (this.currentmodule.type == "shuzitu") {
        //数字图
        this.reShuzitu("", this.currentmodule.id);
      }
      this.$nextTick(() => {
        if (
          this.currentmodule.config.datas &&
          this.currentmodule.config.chart &&
          this.currentmodule.type != "danhangwenben"
        ) {
          var myChart = echarts.init(
            document.getElementById(this.currentmodule.id)
          );
          this.currentmodule.chart = myChart;
          myChart.setOption(this.currentmodule.config.widgets, true);
          myChart.resize();
        }
      });
    },
    // 玫瑰图外圈大小改变
    handleMeiguituRadioOutsideChange(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currenty = this.currentmodule.config.params;
      // currenty.style.radio[1] = (val >= 100000||val <= 0)  ? 50 : val;
      currenty.style.radio[1] = val;
      this.reJichuzhuzhuangtuChart();
    },
    handleMeiguituRadioOutsideInput(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      // val = val.replace(/^[0]+/, '')
      var currenty = this.currentmodule.config.params;
      // currenty.style.radio[1] = (val >= 100000||val <= 0)  ? 50 : val;
      currenty.style.radio[1] = val;
    },
    // 玫瑰图外圈大小改变
    handleMeiguituRadioInsideChange(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currenty = this.currentmodule.config.params;
      currenty.style.radio[0] = val;
      // currenty.style.radio[0] = (val >= 100000||val <= 0)  ? 50 : val;
      this.reJichuzhuzhuangtuChart();
    },
    handleMeiguituRadioInsideInput(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      // val=val.replace(/^[0]+/, '')
      var currenty = this.currentmodule.config.params;
      currenty.style.radio[0] = val;
      // currenty.style.radio[0] = (val >= 100000||val <= 0)  ? 50 : val;
    },
    handleMeiguituBorderChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currenty = this.currentmodule.config.params;
      currenty.style.color[index][3] = val >= 10000 || val <= 0 ? 0 : val;
      this.reJichuzhuzhuangtuChart();
    },
    handleMeiguituBorderInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var currenty = this.currentmodule.config.params;
      currenty.style.color[index][3] = val >= 10000 || val <= 0 ? 0 : val;
    },
    // 仪表盘输入
    handleYibiaopanBorderChange(e, index) {
      // var val = e.target.value.replace(/[^\d]/g,'');
      var val = e.target.value;
      var currenty = this.currentmodule.config.params;
      currenty.color[index][0] = val > 1 || val < 0 ? 1 : val;
      this.reJichuzhuzhuangtuChart();
    },
    handleYibiaopanBorderInput(e, index) {
      var val = e.target.value;
      // var val = e.target.value.replace(/[^\d]/g,'');
      //  val = val.replace(/^[0]+/, '')
      var currenty = this.currentmodule.config.params;
      currenty.color[index][0] = val > 1 || val < 0 ? 1 : val;
    },
    handleQiantaobingtuBorderChange(e, index, indexcolor) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currenty = this.currentmodule.config.params;
      currenty.style[index].color[indexcolor][3] =
        val >= 10000 || val <= 0 ? 0 : val;
      this.reJichuzhuzhuangtuChart();
    },
    handleQiantaobingtuBorderInput(e, index, indexcolor) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currenty = this.currentmodule.config.params;
      currenty.style[index].color[indexcolor][3] =
        val >= 10000 || val <= 0 ? 0 : val;
    },
    // 柱状图柱子宽度修改
    handleBarWidthChange(e, index, type) {
      var val = e.target.value.replace(/[^\d]/g, "");
      if (type === "x") {
        var currentx = this.currentmodule.config.params.moduledatas.style.x[
          index
        ];
        currentx.barWidth = val >= 10000 || val <= 0 ? 50 : val;
      } else {
        var currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.barWidth = val >= 10000 || val <= 0 ? 50 : val;
      }
      this.reJichuzhuzhuangtuChart();
    },
    handleJiduhuantuTextLineHeightChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.params.style;
      style.active.lineHeight = val >= 10000 || val <= 0 ? 0 : val;
      this.reJichuzhuzhuangtuChart();
    },
    handleJiduhuantuTexLineHeightInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.params.style;
      style.active.lineHeight = val >= 10000 || val <= 0 ? 0 : val;
    },
    handleBiaogeFontSizeChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.widgets.xStyle;
      style.fontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    handleBiaogeFontSizeInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.widgets.xStyle;
      style.fontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // 进度环图文字字体大小设置
    handleJiduhuantuTextFontSizeChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.params.style;
      style.active.fontSize = val >= 10000 || val <= 0 ? 16 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // 进度环图字体大小设置
    handleJiduhuantuFontSizeChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.params.style;
      style.label.fontSize = val >= 10000 || val <= 0 ? 16 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // 仪表盘字体大小设置
    handleYibiaopanFontSizeInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.params.style;
      style.label.fontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // 仪表盘字体大小设置
    handleYibiaopanFontSizeChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.params.style;
      style.label.fontSize = val >= 10000 || val <= 0 ? 16 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // 仪表盘文字字体大小设置
    handleYibiaopanTextFontSizeChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var title = this.currentmodule.config.params.style.title;
      title.fontSize = val >= 10000 || val <= 0 ? 16 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // 进度环图数字大小设置输入
    handleYibiaopanTextFontSizeInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var title = this.currentmodule.config.params.style.title;
      title.fontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // 仪表盘刻度字体大小
    handleYibiaopanScaleFontSizeChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var scale = this.currentmodule.config.params.style.axisLabel;
      scale.fontSize = val >= 10000 || val <= 0 ? 16 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // 仪表盘刻度字体大小设置输入
    handleYibiaopanScaleFontSizeInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var scale = this.currentmodule.config.params.style.axisLabel;
      scale.fontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    handleShuzituPaddTopChange(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.widgets;
      style.padding[0] = val >= 10000 || val <= 0 ? 0 : val;
      style.numBackStyle.padding =
        style.padding[0] +
        "px " +
        style.padding[1] +
        "px " +
        style.padding[0] +
        "px " +
        style.padding[1] +
        "px ";
      this.reJichuzhuzhuangtuChart();
    },
    handleShuzituPaddTopInput(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.widgets;
      style.padding[0] = val >= 10000 || val <= 0 ? 0 : val;
      style.numBackStyle.padding =
        style.padding[0] +
        "px " +
        style.padding[1] +
        "px " +
        style.padding[0] +
        "px " +
        style.padding[1] +
        "px ";
    },
    handleShuzituPaddLeftChange(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.widgets;
      style.padding[1] = val >= 10000 || val <= 0 ? 0 : val;
      style.numBackStyle.padding =
        style.padding[0] +
        "px " +
        style.padding[1] +
        "px " +
        style.padding[0] +
        "px " +
        style.padding[1] +
        "px ";
      this.reJichuzhuzhuangtuChart();
    },
    handleShuzituPaddLeftInput(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.widgets;
      style.padding[1] = val >= 10000 || val <= 0 ? 0 : val;
      style.numBackStyle.padding =
        style.padding[0] +
        "px " +
        style.padding[1] +
        "px " +
        style.padding[0] +
        "px " +
        style.padding[1] +
        "px ";
    },
    handleDanhangwenbenFontSizeChange(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.widgets;
      style.fontSize = val >= 10000 || val <= 0 ? 16 : val;
      style.style["font-size"] = val + "px";
      this.reJichuzhuzhuangtuChart();
    },
    handleDanhangwenbenFontSizeInput(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.widgets;
      style.fontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // 日期字体大小
    handleDateFontSizeChange(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.widgets;
      style.dateFontSize = val >= 10000 || val <= 0 ? 16 : val;
      style.dateStyle.style["font-size"] = val + "px";
    },
    handleDateFontSizeInput(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.widgets;
      style.dateFontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // 时间字体大小
    handleTimeFontSizeChange(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.widgets;
      style.timeFontSize = val >= 10000 || val <= 0 ? 16 : val;
      style.timeStyle.style["font-size"] = val + "px";
    },
    handleTimeFontSizeInput(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.widgets;
      style.timeFontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // 星期字体大小
    handleDayFontSizeChange(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.widgets;
      style.dayFontSize = val >= 10000 || val <= 0 ? 16 : val;
      style.dayStyle.style["font-size"] = val + "px";
    },
    handleDayFontSizeInput(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.widgets;
      style.dayFontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // 时间和日期间距
    handleRiqishijianMarginLeftChange(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.widgets;
      style.marginLeft = val >= 10000 || val <= 0 ? 16 : val;
      style.timeStyle.style["margin-left"] = val + "px";
    },
    handleRiqishijianMarginLeftInput(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.widgets;
      style.marginLeft = val >= 10000 || val <= 0 ? 16 : val;
    },
    // 时间和星期间距
    handleRiqishijianMarginRightChange(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.widgets;
      style.marginRight = val >= 10000 || val <= 0 ? 16 : val;
      style.timeStyle.style["margin-right"] = val + "px";
    },
    handleRiqishijianMarginRightInput(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.widgets;
      style.marginRight = val >= 10000 || val <= 0 ? 16 : val;
    },
    // 进度环图边线宽度设置
    handleJinduhuantuBorderWidthChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.params.style;
      style.itemStyle.borderWidth = val >= 10000 || val <= 0 ? 0 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // 条形图拐点大小修改
    handleMianjituBorseSizeInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var currenty = this.currentmodule.config.params.moduledatas.style.y[
        index
      ];
      currenty.symbolSize = val >= 10000 || val <= 0 ? 0 : val;
    },
    // 条形图拐点大小修改
    handleMianjituBorseSizeChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currenty = this.currentmodule.config.params.moduledatas.style.y[
        index
      ];
      currenty.symbolSize = val >= 10000 || val < 0 ? 0 : val;
      this.reJichuzhuzhuangtuChart();
    },
    handleDuoyzhouBorderWidthChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currenty = this.currentmodule.config.params.moduledatas.style.y[
        index
      ];
      currenty.lineStyle.width = val >= 10000 ? 0 : val;
      this.reJichuzhuzhuangtuChart();
    },
    handleDuoyzhouBorderWidthInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var currenty = this.currentmodule.config.params.moduledatas.style.y[
        index
      ];
      currenty.lineStyle.width = val >= 10000 || val <= 0 ? 0 : val;
      this.reJichuzhuzhuangtuChart();
    },
    handleMianjituBorderWidthChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currenty = this.currentmodule.config.params.moduledatas.style.y[
        index
      ];
      currenty.lineStyle.width = val >= 10000 ? 0 : val;
      this.reJichuzhuzhuangtuChart();
    },
    handleMianjituBorderWidthInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var currenty = this.currentmodule.config.params.moduledatas.style.y[
        index
      ];
      currenty.lineStyle.width = val >= 10000 || val <= 0 ? 0 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // 柱状图柱子边宽度修改
    handleBorderWidthChange(e, index, type) {
      if (type === "x") {
        var val = e.target.value.replace(/[^\d]/g, "");
        var currentx = this.currentmodule.config.params.moduledatas.style.x[
          index
        ];
        currentx.borderWidth = val >= 10000 ? 0 : val;
      } else {
        var val = e.target.value.replace(/[^\d]/g, "");
        var currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.borderWidth = val >= 10000 ? 0 : val;
      }
      this.reJichuzhuzhuangtuChart();
    },
    // y轴宽度修改
    handleyAxiaWidthChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currentyAxis = this.currentmodule.config.params.yAxis;
      currentyAxis.axisLine.lineStyle.width = val >= 10000 || val < 0 ? 1 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // 进度环图边线宽度设置输入
    handleJiduhuantuTextLineHeightInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var style = this.currentmodule.config.params.style;
      style.active.lineHeight = val >= 10000 || val <= 0 ? 0 : val;
    },
    // 进度环图数字大小设置输入
    handleJiduhuantuTextFontSizeInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.params.style;
      style.active.fontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // 进度环图边线宽度设置输入
    handleJiduhuantuFontSizeInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.params.style;
      style.label.fontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // 进度环图边线宽度设置输入
    handleJinduhuantuBorderWidthInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var style = this.currentmodule.config.params.style;
      style.itemStyle.borderWidth = val >= 10000 || val <= 0 ? 0 : val;
    },
    // y轴宽度输入防止输入非数字
    handleyAxiaWidthInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var currentyAxis = this.currentmodule.config.params.yAxis;
      currentyAxis.axisLine.lineStyle.width =
        val >= 10000 || val < 0 ? 1 : val == 0 ? 0 : val;
    },
    // y轴数字大小修改
    handleyAxisFontSizeChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currentyAxis = this.currentmodule.config.params.yAxis;
      currentyAxis.axisLabel.fontSize = val >= 10000 || val <= 0 ? 16 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // x轴数字大小修改
    handlexAxisFontSizeChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currentxAxis = this.currentmodule.config.params.xAxis;
      currentxAxis.axisLabel.fontSize = val >= 10000 || val <= 0 ? 16 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // x轴宽大小修改
    handlexAxiaWidthChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currentxAxis = this.currentmodule.config.params.xAxis;
      currentxAxis.axisLine.lineStyle.width = val >= 10000 || val < 0 ? 1 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // y轴字体大小输入防止输入非数字
    handleyAxisFontSizeInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var currentyAxis = this.currentmodule.config.params.yAxis;
      currentyAxis.axisLabel.fontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // x轴字体大小输入防止输入非数字
    handlexAxisFontSizeInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var currentxAxis = this.currentmodule.config.params.xAxis;
      currentxAxis.axisLabel.fontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // x轴线宽度输入,防止输入非数字
    handlexAxiaWidthInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var currentxAxis = this.currentmodule.config.params.xAxis;
      currentxAxis.axisLine.lineStyle.width =
        val >= 10000 || val < 0 ? 1 : val == 0 ? 0 : val;
    },
    // 纵向柱状图顶部字体大小
    handleyTopFontSizeChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currentTop = this.currentmodule.config.params.moduledatas.style.y[
        index
      ];
      currentTop.label.fontSize = val >= 10000 || val <= 0 ? 16 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // 纵向柱状图顶部字体大小输入防止输入非数字
    handleyTopFontSizeInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var currentTop = this.currentmodule.config.params.moduledatas.style.y[
        index
      ];
      currentTop.label.fontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // 横向柱状图顶部字体大小
    handlexTopFontSizeChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currentTop = this.currentmodule.config.params.moduledatas.style.x[
        index
      ];
      currentTop.label.fontSize = val >= 10000 || val <= 0 ? 16 : val;
      this.reJichuzhuzhuangtuChart();
    },
    // 横向柱状图顶部字体大小输入防止输入非数字
    handlexTopFontSizeInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var currentTop = this.currentmodule.config.params.moduledatas.style.x[
        index
      ];
      currentTop.label.fontSize = val >= 10000 || val <= 0 ? 16 : val;
    },
    // legend文字大小
    handleLegendFontSizeChange(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      var currentLegend = this.currentmodule.config.params.moduledatas;
      currentLegend.legend.textStyle.fontSize =
        val >= 10000 || val <= 0 ? 16 : val;
      currentLegend.legend.itemWidth =
        currentLegend.legend.textStyle.fontSize * 2;
      currentLegend.legend.itemHeight = currentLegend.legend.textStyle.fontSize;
      this.reJichuzhuzhuangtuChart();
    },
    // legend文字大小输入防止输入非数字
    handleLegendFontSizeInput(e, index) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      var currentLegend = this.currentmodule.config.params.moduledatas;
      currentLegend.legend.textStyle.fontSize =
        val >= 10000 || val <= 0 ? 16 : val;
    },
    // 柱子宽度输入变化，防止输入非数字
    handleBarWidthInput(e, index, type) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      if (type === "x") {
        var currentx = this.currentmodule.config.params.moduledatas.style.x[
          index
        ];
        currentx.barWidth = val >= 10000 || val <= 0 ? 50 : val;
      } else {
        var currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.barWidth = val >= 10000 || val <= 0 ? 50 : val;
      }
    },
    // 柱子边宽输入变化，防止输入非数字
    handleBorderWidthInput(e, index, type) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      if (type === "x") {
        var currentx = this.currentmodule.config.params.moduledatas.style.x[
          index
        ];
        currentx.borderWidth = val >= 10000 || val <= 0 ? 0 : val;
      } else {
        var currenty = this.currentmodule.config.params.moduledatas.style.y[
          index
        ];
        currenty.borderWidth = val >= 10000 || val <= 0 ? 0 : val;
      }
    },
    colorPickShow(e, index, indexColor, j) {
      //保存当前点击的哪个组件
      this.currentmodule.datatypeset.index = index;
      this.currentmodule.datatypeset.indexcolor = indexColor;
      this.currentmodule.datatypeset.num = j;
      // console.log("currentmodule", this.currentmodule);
      this.hiddenColorPicker();
      let currentClientX = e.clientX;

      // 表头背景色（201）
      if (j == 201) {
        console.log('=== 显示表头背景色选择器 ===');
        this.currentmodule.config.widgets.headerStyle.backgroundStyle = {
          display: "",
          left:  currentClientX - 280 + "px",
          top:   "200px"
        };
        // 可选：把当前色送入取色器
        this.activeColorKey = 201;  // 与100/101一致：仅标记key
        console.log('=== 调用 _bindOutsideClickOnce ===');
        this._bindOutsideClickOnce();
        return;
      }

      // 表头边框颜色（202）
      if (j == 202) {
        console.log('=== 显示表头边框颜色选择器 ===');
        // 防御：确保对象已存在（不改变你的数据结构）
        this.currentmodule.config.widgets.headerStyle.border =
          this.currentmodule.config.widgets.headerStyle.border || {};
        this.currentmodule.config.widgets.headerStyle.border.colorStyle = {
          display: "",
          left:  currentClientX - 280 + "px",
          top:   "200px"
        };
        this.activeColorKey = 202;  // 与100/101一致
        console.log('=== 调用 _bindOutsideClickOnce ===');
        this._bindOutsideClickOnce();
        return;
      }

      // 表头字体颜色（203）
      if (j == 203) {
        console.log('=== 显示表头字体颜色选择器 ===');
        this.currentmodule.config.widgets.headerStyle.text =
          this.currentmodule.config.widgets.headerStyle.text || {};
        this.currentmodule.config.widgets.headerStyle.text.colorStyle = {
          display: "",
          left:  currentClientX - 280 + "px",
          top:   "200px"
        };
        this.activeColorKey = 203;
        console.log('=== 调用 _bindOutsideClickOnce ===');
        this._bindOutsideClickOnce();
        return;
      }

      // —— 100: 元件边框色 —— //
      if (j == 100) {
          this.currentmodule.borderColorStyle = {
            display: "",
            left: (currentClientX - 280) + "px",
            top: "200px"
          };
          this.activeColorKey = 100;   // 给 colorPickUpdateValue 用
          return;
        }

      // —— 101: 元件背景色 —— //
      if (j == 101) {
        this.currentmodule.bgColorStyle = {
          display: "",
          left: (currentClientX - 280) + "px",
          top: "200px"
        };
        this.activeColorKey = 101;
        return;
      }

      
      // legend字体颜色
      if (j == 102) {
        this.currentmodule.config.params.moduledatas.legend.textStyle.colorStyle = {
          display: "",
          left: currentClientX - 280 + "px",
          top: "200px"
        };
        return;
      }
      if (j == 103) {
        this.currentmodule.config.params.style.numStyle.numColorStyle = {
          display: "",
          left: currentClientX - 280 + "px",
          top: "200px"
        };
        return;
      }

      // 日历图组件颜色设置 50是几个工作的颜色控制，51是背景颜色的控制 52是日期的颜色控制
      if (j == 50) {
        var currenty = this.currentmodule.config.params.style.colorSelect;
        currenty[index].display = "";
        currenty[index].left = currentClientX - 280 + "px";
        currenty[index].top = "200px";
        return;
      }
      if (j == 51) {
        this.currentmodule.config.params.style.defaultStyle[0].display = "";
        return;
      }
      if (j == 52) {
        this.currentmodule.config.params.style.defaultStyle[1].display = "";
        return;
      }
      if (j == 53) {
        this.currentmodule.config.params.style.defaultStyle[2].display = "";
        return;
      }
      if (j == 54) {
        this.currentmodule.config.params.style.defaultStyle[3].display = "";
        return;
      }
      // 极坐标轴线颜色
      if (j == 33) {
        this.currentmodule.config.params.colorStyle[0].display = "";
        this.currentmodule.config.params.colorStyle[0].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.colorStyle[0].top = "200px";
        return;
      }
      // 极坐标圈线颜色
      if (j == 34) {
        this.currentmodule.config.params.colorStyle[1].display = "";
        this.currentmodule.config.params.colorStyle[1].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.colorStyle[1].top = "200px";
        return;
      }
      // 极坐标圈线颜色
      if (j == 35) {
        this.currentmodule.config.params.colorStyle[2].display = "";
        this.currentmodule.config.params.colorStyle[2].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.colorStyle[2].top = "200px";
        return;
      }

      // 玫瑰图边框色
      if (j == 32) {
        this.currentmodule.config.params.color[index][indexColor][2].display =
          "";
        this.currentmodule.config.params.color[index][indexColor][2].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.color[index][indexColor][2].top =
          "200px";
        return;
      }
      // 玫瑰图填充色1
      if (j == 31) {
        this.currentmodule.config.params.color[index][indexColor][1].display =
          "";
        this.currentmodule.config.params.color[index][indexColor][1].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.color[index][indexColor][1].top =
          "200px";
        return;
      }

      if (j == 30) {
        this.currentmodule.config.params.color[index][indexColor][0].display =
          "";
        this.currentmodule.config.params.color[index][indexColor][0].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.color[index][indexColor][0].top =
          "200px";
        return;
      }

      // 地图组件边界色
      if (j == 29) {
        this.currentmodule.config.params.style.color[5].display = "";
        this.currentmodule.config.params.style.color[5].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.color[5].top = "200px";
        return;
      }
      // 地图组件边界色
      if (j == 28) {
        this.currentmodule.config.params.style.color[4].display = "";
        this.currentmodule.config.params.style.color[4].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.color[4].top = "200px";
        return;
      }
      // 地图组件边界色
      if (j == 27) {
        this.currentmodule.config.params.style.color[3].display = "";
        this.currentmodule.config.params.style.color[3].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.color[3].top = "200px";
        return;
      }
      // 地图组件边界色
      if (j == 26) {
        this.currentmodule.config.params.style.color[2].display = "";
        this.currentmodule.config.params.style.color[2].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.color[2].top = "200px";
        return;
      }
      // 地图组件边界色
      if (j == 25) {
        this.currentmodule.config.params.style.color[1].display = "";
        this.currentmodule.config.params.style.color[1].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.color[1].top = "200px";
        return;
      }
      // 地图组件背景色
      if (j == 24) {
        this.currentmodule.config.params.style.color[0].display = "";
        this.currentmodule.config.params.style.color[0].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.color[0].top = "200px";
        return;
      }

      // 单行文本和数字图字体颜色
      if (j == 23) {
        this.currentmodule.config.widgets.xStyle.colorStyle[0].display = "";
        this.currentmodule.config.widgets.xStyle.colorStyle[0].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.widgets.xStyle.colorStyle[0].top = "200px";
        return;
      }
      // 单行文本和数字图字体颜色
      if (j == 21) {
        this.currentmodule.config.widgets.style.colorStyle[0].display = "";
        this.currentmodule.config.widgets.style.colorStyle[0].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.widgets.style.colorStyle[0].top = "200px";
        return;
      }

      // 日期时间-日期字体颜色
      if (j == 105) {
        this.currentmodule.config.widgets.dateStyle.colorStyle[0].display = "";
        this.currentmodule.config.widgets.dateStyle.colorStyle[0].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.widgets.dateStyle.colorStyle[0].top = "200px";
        return;
      }
      // 日期时间-时间字体颜色
      if (j == 106) {
        this.currentmodule.config.widgets.timeStyle.colorStyle[0].display = "";
        this.currentmodule.config.widgets.timeStyle.colorStyle[0].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.widgets.timeStyle.colorStyle[0].top = "200px";
        return;
      }
      // 日期时间-星期字体颜色
      if (j == 107) {
        this.currentmodule.config.widgets.dayStyle.colorStyle[0].display = "";
        this.currentmodule.config.widgets.dayStyle.colorStyle[0].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.widgets.dayStyle.colorStyle[0].top = "200px";
        return;
      }
      // 数字图块背景色
      if (j == 22) {
        this.currentmodule.config.widgets.style.colorStyle[1].display = "";
        this.currentmodule.config.widgets.style.colorStyle[1].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.widgets.style.colorStyle[1].top = "200px";
        return;
      }
      // 玫瑰图填充色0
      if (j == 18) {
        this.currentmodule.config.params.color[indexColor][0].display = "";
        this.currentmodule.config.params.color[indexColor][0].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.color[indexColor][0].top = "200px";
        return;
      }
      // 玫瑰图填充色1
      if (j == 19) {
        this.currentmodule.config.params.color[indexColor][1].display = "";
        this.currentmodule.config.params.color[indexColor][1].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.color[indexColor][1].top = "200px";
        return;
      }
      // 玫瑰图边框色
      if (j == 20) {
        this.currentmodule.config.params.color[indexColor][2].display = "";
        this.currentmodule.config.params.color[indexColor][2].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.color[indexColor][2].top = "200px";
        return;
      }
      // 进度环图颜色设置
      if (j == 13) {
        this.currentmodule.config.params.style.color[0].display = "";
        this.currentmodule.config.params.style.color[0].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.color[0].top = "200px";
        return;
      }
      // 进度环图颜色设置
      if (j == 14) {
        this.currentmodule.config.params.style.color[1].display = "";
        this.currentmodule.config.params.style.color[1].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.color[1].top = "200px";
        return;
      }
      // 进度环图颜色设置
      if (j == 15) {
        this.currentmodule.config.params.style.color[2].display = "";
        this.currentmodule.config.params.style.color[2].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.color[2].top = "200px";
        return;
      }
      // 进度环图颜色设置
      if (j == 16) {
        this.currentmodule.config.params.style.color[3].display = "";
        this.currentmodule.config.params.style.color[3].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.color[3].top = "200px";
        return;
      }
      // 进度环图颜色设置
      if (j == 17) {
        this.currentmodule.config.params.style.color[4].display = "";
        this.currentmodule.config.params.style.color[4].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.color[4].top = "200px";
        return;
      }
      // 条形图填充色0
      if (j == 8) {
        var currenty = this.currentmodule.config.params.moduledatas.style.y;
        currenty[index].style.color[0].display = "";
        currenty[index].style.color[0].left = currentClientX - 280 + "px";
        currenty[index].style.color[0].top = "200px";
        return;
      }
      // 条形图填充色1
      if (j == 9) {
        var currenty = this.currentmodule.config.params.moduledatas.style.y;
        currenty[index].style.color[1].display = "";
        currenty[index].style.color[1].left = currentClientX - 280 + "px";
        currenty[index].style.color[1].top = "200px";
        return;
      }
      // 条形图边线的颜色
      if (j == 10) {
        var currenty = this.currentmodule.config.params.moduledatas.style.y;
        currenty[index].style.color[2].display = "";
        currenty[index].style.color[2].left = currentClientX - 280 + "px";
        currenty[index].style.color[2].top = "200px";
        return;
      }
      // 条形图拐点的颜色
      if (j == 11) {
        var currenty = this.currentmodule.config.params.moduledatas.style.y;
        currenty[index].style.color[3].display = "";
        currenty[index].style.color[3].left = currentClientX - 280 + "px";
        currenty[index].style.color[3].top = "200px";
        return;
      }
      // 条形图拐点的颜色
      if (j == 12) {
        var currentyAxios = this.currentmodule.config.params.yAxis;
        currentyAxios.spliteStyle.display = "";
        currentyAxios.spliteStyle.left = currentClientX - 280 + "px";
        currentyAxios.spliteStyle.top = "200px";
        return;
      }
      // x轴轴线颜色
      if (j == 4) {
        var currentxAxios = this.currentmodule.config.params.xAxis;
        currentxAxios.lineStyle.display = "";
        currentxAxios.lineStyle.left = currentClientX - 280 + "px";
        currentxAxios.lineStyle.top = "200px";
        return;
      }
      // x轴字体颜色
      if (j == 5) {
        var currentxAxios = this.currentmodule.config.params.xAxis;
        currentxAxios.labelStyle.display = "";
        currentxAxios.labelStyle.left = currentClientX - 280 + "px";
        currentxAxios.labelStyle.top = "200px";
        return;
      }
      // y轴轴线颜色
      if (j == 6) {
        var currentyAxios = this.currentmodule.config.params.yAxis;
        currentyAxios.lineStyle.display = "";
        currentyAxios.lineStyle.left = currentClientX - 280 + "px";
        currentyAxios.lineStyle.top = "200px";
        return;
      }
      // y轴字体颜色
      if (j == 7) {
        var currentyAxios = this.currentmodule.config.params.yAxis;
        currentyAxios.labelStyle.display = "";
        currentyAxios.labelStyle.left = currentClientX - 280 + "px";
        currentyAxios.labelStyle.top = "200px";
        return;
      }
      // 边框色
      if (j == 3) {
        var currenty = this.currentmodule.config.params.moduledatas.style.y;
        currenty[index].label.style.display = "";
        currenty[index].label.style.left = currentClientX - 280 + "px";
        currenty[index].label.style.top = "200px";
        return;
      }
      // 顶部字色
      if (j == 2) {
        var currenty = this.currentmodule.config.params.moduledatas.style.y;
        currenty[index].borderStyle.display = "";
        currenty[index].borderStyle.left = currentClientX - 280 + "px";
        currenty[index].borderStyle.top = "200px";
        return;
      }
      // 仪表盘文字颜色
      if (j == 60) {
        this.currentmodule.config.params.style.title.colorStyle[0].display = "";
        this.currentmodule.config.params.style.title.colorStyle[0].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.title.colorStyle[0].top =
          "200px";
        return;
      }
      // 仪表盘数组颜色
      if (j == 61) {
        this.currentmodule.config.params.style.color[indexColor][0].display =
          "";
        this.currentmodule.config.params.style.color[indexColor][0].left =
          currentClientX - 280 + "px";
        this.currentmodule.config.params.style.color[indexColor][0].top =
          "200px";
        return;
      }
      // 横向柱状图
      // 边框色
      if (j == 73) {
        var currentx = this.currentmodule.config.params.moduledatas.style.x;
        currentx[index].label.style.display = "";
        currentx[index].label.style.left = currentClientX - 280 + "px";
        currentx[index].label.style.top = "200px";
        return;
      }
      // 顶部字色
      if (j == 72) {
        var currentx = this.currentmodule.config.params.moduledatas.style.x;
        currentx[index].borderStyle.display = "";
        currentx[index].borderStyle.left = currentClientX - 280 + "px";
        currentx[index].borderStyle.top = "200px";
        return;
      }
      if (j == 70 || j == 71) {
        var currentx = this.currentmodule.config.params.moduledatas.style.x;
        currentx[index].style.color[indexColor][j == 70 ? 0 : 1].display = "";
        currentx[index].style.color[indexColor][j == 70 ? 0 : 1].left =
          currentClientX - 280 + "px";
        currentx[index].style.color[indexColor][j == 70 ? 0 : 1].top = "200px";
        return;
      }
      // 柱状图底色1和0
      var currenty = this.currentmodule.config.params.moduledatas.style.y;
      currenty[index].style.color[indexColor][j].display = "";
      currenty[index].style.color[indexColor][j].left =
        currentClientX - 280 + "px";
      currenty[index].style.color[indexColor][j].top = "200px";
    },


    hiddenColorPicker() {
  // 统一弹层隐藏（保留你现有逻辑）
  this.activeColorKey = null;
  this.colorPickerStyle = { ...this.colorPickerStyle, display: "none" };

  // 通用（你的原有写法）
  if (this.currentmodule) {
    if (this.currentmodule.bgColorStyle)
      this.currentmodule.bgColorStyle.display = "none";
    if (this.currentmodule.borderColorStyle)
      this.currentmodule.borderColorStyle.display = "none";
    if (this.currentmodule.textColorStyle)
      this.currentmodule.textColorStyle.display = "none";
  }

  // ✅ 表格：headerStyle 的三个取色器（201/202/203）
  // ✅ 表格：headerStyle 的三个取色器（201/202/203）
var cm = this.currentmodule;
console.log('=== hiddenColorPicker 被调用，currentmodule:', cm);
if (cm && cm.config && cm.config.widgets && cm.config.widgets.headerStyle) {
  var hs = cm.config.widgets.headerStyle;
  console.log('=== 表头颜色选择器样式对象:', hs);
  if (hs.backgroundStyle) {
    console.log('=== 隐藏表头背景色选择器 ===');
    hs.backgroundStyle.display = "none";           // 201
  }
  if (hs.border && hs.border.colorStyle) {
    console.log('=== 隐藏表头边框颜色选择器 ===');
    hs.border.colorStyle.display = "none";         // 202
  }
  if (hs.text && hs.text.colorStyle) {
    console.log('=== 隐藏表头字体颜色选择器 ===');
    hs.text.colorStyle.display = "none";           // 203
  }
} else {
  console.log('=== 表头颜色选择器样式对象不存在 ===');
}


  // ✅ 图表：和你已有组件一致的两个（102/103）
  // ✅ 图表（102/103）
var md = cm && cm.config && cm.config.params && cm.config.params.moduledatas;
if (md && md.legend && md.legend.textStyle && md.legend.textStyle.colorStyle) {
  md.legend.textStyle.colorStyle.display = "none";   // 102
}
var st = cm && cm.config && cm.config.params && cm.config.params.style;
if (st && st.numStyle && st.numStyle.numColorStyle) {
  st.numStyle.numColorStyle.display = "none";        // 103
}

  // 解绑外部点击（保留）
  this._unbindOutsideClick && this._unbindOutsideClick();
},

    
_bindOutsideClickOnce() {
  console.log('=== _bindOutsideClickOnce 被调用 ===');
  const onClick = (evt) => {
    console.log('=== 点击事件被触发 ===');
    console.log('点击目标:', evt.target);
    
    // 检查是否点击了传统颜色选择器
    const pop = document.querySelector('.colorpicker-pop');
    const clickedOnPop = pop && pop.contains(evt.target);
    console.log('点击了传统颜色选择器:', clickedOnPop);
    
    // 检查是否点击了表头颜色选择器
    const tableColorPickers = document.querySelectorAll('.vc-colorpicker, .photoshop-picker, .vc-colors');
    const clickedOnTableColorPicker = Array.from(tableColorPickers).some(picker => picker.contains(evt.target));
    console.log('点击了表头颜色选择器:', clickedOnTableColorPicker);
    
    // 检查是否点击了颜色选择器触发按钮
    const colorPickerTriggers = document.querySelectorAll('.colorpicker');
    const clickedOnColorPickerTrigger = Array.from(colorPickerTriggers).some(trigger => trigger.contains(evt.target));
    console.log('点击了颜色选择器触发按钮:', clickedOnColorPickerTrigger);
    
    // 如果没有点击任何颜色选择器或触发按钮，则隐藏颜色选择器
    if (!clickedOnPop && !clickedOnTableColorPicker && !clickedOnColorPickerTrigger) {
      console.log('=== 点击了空白处，隐藏颜色选择器 ===');
      this.hiddenColorPicker();
    } else {
      console.log('=== 点击了颜色选择器内部或触发按钮，不隐藏 ===');
    }
  };
  document.addEventListener('click', onClick);
  this._unbindOutsideClick = () => {
    console.log('=== 解绑点击事件 ===');
    document.removeEventListener('click', onClick);
  };
},


    // 显示之前先将所有的色彩选择块隐藏
    hiddenColorPicker() {
      console.log('000')
      // 元件border颜色控件
      this.currentmodule.borderColorStyle = {
        display: "none"
      };
      this.currentmodule.bgColorStyle = {
        display: "none"
      };
      if (
        this.currentmodule.type == "zongxiangzhuzhuangtu" ||
        this.currentmodule.type == "hengxiangzhuzhuangtu" ||
        this.currentmodule.type == "hengxiangduidiezhuzhuangtu" ||
        this.currentmodule.type == "zongxiangduidiezhuzhuangtu" ||
        this.currentmodule.type == "mianjitu" ||
        this.currentmodule.type == "zhexiantu"
      ) {
        this.currentmodule.config.params.moduledatas.legend.textStyle.colorStyle.display =
          "none";
        if (
          this.currentmodule.type == "hengxiangduidiezhuzhuangtu" ||
          this.currentmodule.type == "hengxiangzhuzhuangtu"
        ) {
          var currenty =
            this.currentmodule.config.params.moduledatas.style.x || [];
        } else {
          var currenty =
            this.currentmodule.config.params.moduledatas.style.y || [];
        }
        for (var i = 0; i < currenty.length; i++) {
          if (
            this.currentmodule.type == "zongxiangzhuzhuangtu" ||
            this.currentmodule.type == "hengxiangzhuzhuangtu" ||
            this.currentmodule.type == "hengxiangduidiezhuzhuangtu" ||
            this.currentmodule.type == "zongxiangduidiezhuzhuangtu"
          ) {
            for (var k = 0; k < currenty[i].style.color.length; k++) {
              currenty[i].style.color[k][0].display = "none";
              currenty[i].style.color[k][1].display = "none";
            }
            currenty[i].label.style.display = "none";
            currenty[i].borderStyle.display = "none";
          } else if (
            this.currentmodule.type == "mianjitu" ||
            this.currentmodule.type == "zhexiantu"
          ) {
            currenty[i].style.color[0].display = "none";
            currenty[i].style.color[1].display = "none";
            currenty[i].style.color[2].display = "none";
            currenty[i].style.color[3].display = "none";
          }
        }
      }
      if (
        this.currentmodule.type == "meiguitu" ||
        this.currentmodule.type == "bingtu" ||
        this.currentmodule.type == "shixinbingtu"
      ) {
        this.currentmodule.config.params.style.numStyle.numColorStyle.display =
          "none";
        this.currentmodule.config.params.moduledatas.legend.textStyle.colorStyle.display =
          "none";
        var colorStyle = this.currentmodule.config.params.color;
        for (let i = 0; i < colorStyle.length; i++) {
          colorStyle[i][0].display = "none";
          colorStyle[i][1].display = "none";
          colorStyle[i][2].display = "none";
        }
      }
      if (this.currentmodule.type == "jinduhuantu") {
        var color = this.currentmodule.config.params.style.color;
        color[0].display = "none";
        color[1].display = "none";
        color[2].display = "none";
        color[3].display = "none";
        color[4].display = "none";
      }
      // 仪表盘色彩选择块隐藏
      if (this.currentmodule.type == "yibiaopan") {
        this.currentmodule.config.params.style.title.colorStyle[0].display =
          "none";
        var colorStyle = this.currentmodule.config.params.style.color;
        for (let i = 0; i < colorStyle.length; i++) {
          for (var j = 0; j < colorStyle[i].length; j++) {
            colorStyle[i][j].display = "none";
          }
        }
      }
      if (this.currentmodule.type == "danhangwenben") {
        var style = this.currentmodule.config.widgets.style;
        style.colorStyle[0].display = "none";
      }
      if (this.currentmodule.type == "riqishijian") {
        var style = this.currentmodule.config.widgets;
        style.dateStyle.colorStyle[0].display = "none";
        style.timeStyle.colorStyle[0].display = "none";
        style.dayStyle.colorStyle[0].display = "none";
      }
      if (this.currentmodule.type == "shuzitu") {
        var style = this.currentmodule.config.widgets.style;
        style.colorStyle[0].display = "none";
        style.colorStyle[1].display = "none";
      }

      if (this.currentmodule.type == "biaoge") {
        var style = this.currentmodule.config.widgets.xStyle;
        style.colorStyle[0].display = "none";
        
        // 表头颜色选择器隐藏
        var headerStyle = this.currentmodule.config.widgets.headerStyle;
        if (headerStyle) {
          if (headerStyle.backgroundStyle) {
            headerStyle.backgroundStyle.display = "none";
          }
          if (headerStyle.border && headerStyle.border.colorStyle) {
            headerStyle.border.colorStyle.display = "none";
          }
          if (headerStyle.text && headerStyle.text.colorStyle) {
            headerStyle.text.colorStyle.display = "none";
          }
        }
      }

      if (
        this.currentmodule.config.params &&
        this.currentmodule.config.params.xAxis
      ) {
        var currentxAxis = this.currentmodule.config.params.xAxis;
        currentxAxis.labelStyle.display = "none";
        currentxAxis.lineStyle.display = "none";
      }
      if (
        this.currentmodule.config.params &&
        this.currentmodule.config.params.yAxis
      ) {
        var currentyAxis = this.currentmodule.config.params.yAxis;
        currentyAxis.labelStyle.display = "none";
        currentyAxis.lineStyle.display = "none";
        currentyAxis.spliteStyle.display = "none";
      }
    },
    // 获取大屏详情
    moduleContent() {
      this.add = false;
      let params = {
        id: this.modules.moduleid
      };
      if (!this.modules.moduleid) {
        return;
      }
      this.moduleMessage({ params }).then(
        function(res) {
          if (res.status == "1") {
            var data = res.data;
            if (res.data.cfg_json) {
              const mods = JSON.parse(res.data.cfg_json) || [];

              mods.forEach(mod => {
                if (!mod || mod.type !== 'biaoge') return;
                const widgets = mod.config.widgets || (mod.config.widgets = {});
                const hs = widgets.headerStyle || (widgets.headerStyle = {});

                // 子对象兜底
                hs.border = Object.assign({ color: '#243041', width: 1 }, hs.border || {});
                hs.text   = Object.assign({ size: 14, color: '#A6B2C0', weight: 600 }, hs.text || {});
                if (hs.height == null) hs.height = 44;
                if (!hs.background) hs.background = '#0F1C29';
              });

              this.imgmodules = mods;
              this.$nextTick(() => {
                this.imgmodules.forEach(m => {
                  if (m && m.type === 'biaoge') m._columnsReady = true;
                });
                this.getModuleData();
              });
            }

          } else {
            this.add = true;
          }
        }.bind(this)
      );
    },
    // 更新大屏信息
    editModules(preview, isSave) {
      if (!this.modules.moduleid) {
        return;
      }
      let imgmodule = [];
      // Object.assign(imgmodule,this.imgmodules);
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].style.display !== "none") {
          delete this.imgmodules[i].config.widgetdata
          // ★ 和 xStyle 同路处理：保存前把 headerStyle “拷贝成普通对象”，保证可枚举可序列化
          if (this.imgmodules[i].type === 'biaoge') {
            const cfg = this.imgmodules[i].config || (this.imgmodules[i].config = {})
            const widgets = cfg.widgets || (cfg.widgets = {})
            if (widgets.headerStyle) {
              // 强制落为纯对象，避免被 JSON.stringify 跳过（和 xStyle 同效果） 
              widgets.headerStyle = JSON.parse(JSON.stringify(widgets.headerStyle))
            } else {
              // 老数据兜底（和你新建时一致）
              widgets.headerStyle = {
                height: 44,
                background: '#0F1C29',
                border: { color: '#243041', width: 1 },
                text: { size: 14, color: '#A6B2C0', weight: 600 }
              }
            }
          }

          let data = {
            id: this.imgmodules[i].id,
            type: this.imgmodules[i].type,
            datatype: this.imgmodules[i].datatype,
            selects: false,
            name: this.imgmodules[i].name,
            config: this.imgmodules[i].config,
            style: this.imgmodules[i].style
          }; /*data_end*/
          imgmodule.push(data);
        }
      }
      var params = {
        id: this.modules.moduleid,
        // title:clearSpace(this.defaultsettings.title)||"未设置标题",
        title: "未设置标题",
        width: this.modules.defaulestyle.width,
        height: this.modules.defaulestyle.height,
        resizetype: this.defaultsettings.resizetype,
        coverimg: this.defaultsettings.asyncSrc,
        headimg: this.defaultsettings.headimg,
        datas: imgmodule.length > 0 ? JSON.stringify(imgmodule) : ""
      };
      // console.log('imgmodule',imgmodule)
      if (!this.add) {
        this.editModule({ params }).then(
          function(res) {
            if (preview) {
              this.$Spin.hide();
              this.$router.push({
                name: "preview",
                query: {
                  id: this.modules.moduleid
                }
              });
            }
            if (isSave) {
              this.$Message.success("保存成功！");
              this.moduleContent();
            }
          }.bind(this)
        );
      } else {
        this.addModule({ params }).then(
          function(res) {
            if (preview) {
              this.$Spin.hide();
              this.$router.resolve({
                name: "preview",
                query: {
                  id: this.modules.moduleid
                }
              });
            }
            if (isSave) {
              this.$Message.success("保存成功！");
              this.moduleContent();
            }
          }.bind(this)
        );
      }
    },
    titleInput(e) {
      let val = e.target.value.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]+/g, "");
      let flag = isHaveChinese(val);
      if (flag) {
        this.defaultsettings.title = val.substr(0, 25);
      } else {
        this.defaultsettings.title = val;
      }
      this.editModules();
    },
    titleChange(e) {
      this.defaultsettings.title = e.target.value;
      this.editModules();
    },
    preView(openUrl) {
      this.editModules(true);
      this.$Spin.show();
    },
    handleModuleInput(e, type) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      if (type == "kuan") {
        this.currentmodule.width = val > 9600 ? 9600 : val == 0 ? 0 : val;
      } else if (type == "gao") {
        this.currentmodule.height = val > 9600 ? 9600 : val == 0 ? 0 : val;
      } else if (type == "left") {
        this.currentmodule.left = val > 9600 ? 9600 : val == 0 ? 0 : val;
      } else if (type == "top") {
        this.currentmodule.top = val > 9600 ? 9600 : val == 0 ? 0 : val;
      } else if (type == "index") {
        if (val <= 0) {
          this.currentmodule.zindex = 1;
          return;
        }
        this.currentmodule.zindex = val > 999 ? 999 : val;
      }
    },
    handleModuleInputName(e) {
      let val = e.target.value.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]+/g, "");
      let flag = isHaveChinese(val);
      if (flag) {
        this.currentmodule.name = val.substr(0, 25);
      } else {
        this.currentmodule.name = val;
      }
    },
    // 区块组件圆角设置
    handleRadiusInput(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      // val = val.replace(/^[0]+/, "");
      this.currentmodule.borderRadius = val;
    },
    currentmoduleRadiusChange(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      this.currentmodule.borderRadius = val;
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == this.currentmodule.id) {
          this.imgmodules[i].style["border-radius"] =
            this.currentmodule.borderRadius + "px";
        }
      }
    },
    autoDataChange(val) {
      if (val == "开启") {
        let type = this.currentmodule.type;
        let id = this.currentmodule.id;
        // clearInterval(this.currentmodule.config.time);
        this.autoGetData(type, id);
        // this.currentmodule.config.time = setInterval(function()
        // {
        //   for (let i = 0; i < this.imgmodules.length; i++) {
        //     if (this.imgmodules[i].id==id&&this.imgmodules[i].config.autodata=="开启"&&this.imgmodules[i].style.display!="none") {
        //       this.autoGetData(this.imgmodules[i].type,this.imgmodules[i].id);
        //     }
        //   }
        // }.bind(this),(this.currentmodule.config.autodatatime||10)*1000);
      }
      // else if(val=="关闭"){
      //     clearInterval(this.currentmodule.config.time);
      // }
    },
    // 获取基础数据并渲染，判断是否定时获取，判断是否api获取等
    getModuleData() {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (
          this.imgmodules[i].type == "zongxiangzhuzhuangtu" ||
          this.imgmodules[i].type == "hengxiangzhuzhuangtu" ||
          this.imgmodules[i].type == "meiguitu" ||
          this.imgmodules[i].type == "bingtu" ||
          this.imgmodules[i].type == "shixinbingtu" ||
          this.imgmodules[i].type == "mianjitu" ||
          this.imgmodules[i].type == "zhexiantu" ||
          this.imgmodules[i].type == "jinduhuantu" ||
          this.imgmodules[i].type == "yibiaopan" ||
          this.imgmodules[i].type == "danhangwenben" ||
          this.imgmodules[i].type == "shuzitu" ||
          this.imgmodules[i].type == "biaoge" ||
          this.imgmodules[i].type == "hengxiangduidiezhuzhuangtu" ||
          this.imgmodules[i].type == "zongxiangduidiezhuzhuangtu"
        ) {
          this.autoGetData(this.imgmodules[i].type, this.imgmodules[i].id);
          // if(this.imgmodules[i].config.datastype=="api"&&this.imgmodules[i].config.autodata=="开启"){
          //   let type = this.imgmodules[i].type;
          //   let id = this.imgmodules[i].id;
          //   let time = setInterval(function(){
          //       if (this.imgmodules[i].config.datastype=="api"&&this.imgmodules[i].config.autodata=="开启"&&this.imgmodules[i].style.display!="none") {
          //         this.autoGetData(type,id);
          //       }
          //   }.bind(this),(this.imgmodules[i].config.autodatatime||10)*1000);
          //   this.imgmodules[i].config.time = time;
          // }
        }
      } //for_end
    },
    autoGetData(type, id) {
      // 非当前页面
      if (this.$route.path != "/imgeditor") {
        return;
      }
      if (type == "zongxiangzhuzhuangtu") {
        this.reZongxiangzhuzhuangtu("", id);
      } else if (type == "hengxiangzhuzhuangtu") {
        this.reHengxiangzhuzhuangtu("", id);
      } else if (type == "hengxiangduidiezhuzhuangtu") {
        this.reHengxiangduidiezhuzhuangtu("", id);
      } else if (type == "zongxiangduidiezhuzhuangtu") {
        this.reZongxiangduidiezhuzhuangtu("", id);
      } else if (type == "meiguitu") {
        this.reMeiGuitu("", id);
      } else if (type == "bingtu") {
        this.reBingtu("", id);
      } else if (type == "shixinbingtu") {
        this.reShixinbingtu("", id);
      } else if (type == "mianjitu") {
        this.reMianjitu("", id);
      } else if (type == "zhexiantu") {
        this.reZhexiantu("", id);
      } else if (type == "jinduhuantu") {
        this.reJinduhuantu("", id);
      } else if (type == "yibiaopan") {
        this.reYibiaopan("", id);
      } else if (type == "danhangwenben") {
        this.reDanhangwenben("", id);
      } else if (type == "shuzitu") {
        this.reShuzitu("", id);
      } else if (type == "biaoge") {
        this.reBiaoge("", id);
      }
    },
    // 自动更新时间
    updateTimeInput(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      val = val.replace(/^[0]+/, "");
      // if (val <= 10) {
      //   val = 10;
      // }
      // if(val >=99999){
      //   val = 99999;
      // }
      this.currentmodule.config.autodatatime = val;
    },
    // 自动更新时间变化
    updateTimeChange(e) {
      var val = e.target.value.replace(/[^\d]/g, "");
      // if (val <= 10) {
      //   val = 10;
      // }
      // if(val >=99999){
      //   val = 99999;
      // }
      this.currentmodule.config.autodatatime = val;
    },
    // 组件宽度高度改变
    currentmoduleSizeChange(e, type) {
      var val = e.target.value.replace(/[^\d]/g, "");
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == this.currentmodule.id) {
          switch (type) {
            case "kuan":
              this.imgmodules[i].style.width = val + "px";
              break;
            case "gao":
              this.imgmodules[i].style.height = val + "px";
              break;
            case "left":
              this.imgmodules[i].style.left = val + "px";
              break;
            case "top":
              this.imgmodules[i].style.top = val + "px";
              break;
            case "name":
              this.imgmodules[i].name = clearSpace(e.target.value);
              break;
            case "index":
              this.imgmodules[i].style["z-index"] = e.target.value;
              break;
          }
          // 组件重新渲染宽高
          this.$nextTick(() => {
            if (this.imgmodules[i].chart) {
              this.imgmodules[i].chart.resize();
            }
          });
          this.resizeShow();
        }
      }
    },
    // 置顶组件
    moduleTop(zindex) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].selects == true) {
          this.imgmodules[i].style["z-index"] = zindex;
        }
      }
      this.defaultsettings.menustyle.display = "none";
      this.zooms.show = false;
    },
    moduleDeleteCancel() {
      this.message.style.display = "none";
    },
    // 删除组件，并非真正的删除，而是不显示了
    moduleDelete() {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].selects == true) {
          this.imgmodules[i].style.display = "none";
        }
      }
      this.message.style.display = "none";
      this.zooms.show = false;
    },
    // 显示删除确认组件
    moduleDeleteShow() {
      this.menuHidden();
      this.hiddenModuleConfig();
      this.message.style.display = "";
    },
    // // 调试
    // moduleDebug(){

    // },
    // 显示大屏设置
    moduleDefaultShow() {
      this.moduleListHidden();
      if (this.zooms.resize) {
        return;
      }
      this.hiddenModuleConfig();
      this.zooms.resize = false; //取消缩放模式
      this.defaultsettings.style.display = "";
      this.defaultsettings.resizetypestyle.display = "none";
    },
    // 大屏宽度高度改变,只允许输入数字
    handleWidthInput(e) {
      var valwidth = e.target.value.replace(/[^\d]/g, "");
      if (!valwidth || valwidth <= 0) {
        valwidth = 1920;
      }
      this.modules.defaulestyle.width = valwidth > 9600 ? 9600 : valwidth;
      this.modules.imgstyle["width"] = this.modules.defaulestyle.width + "px";
      this.editModules();
    },
    handleHeightInput(e) {
      var valheight = e.target.value.replace(/[^\d]/g, "");
      if (!valheight || valheight <= 0) {
        valheight = 1080;
      }
      this.modules.defaulestyle.height = valheight > 9600 ? 9600 : valheight;
      this.modules.imgstyle["height"] = this.modules.defaulestyle.height + "px";
      this.editModules();
    },
    // 隐藏默认设置
    defaultHidden() {
      this.defaultsettings.resizetypestyle.display = "none";
    },
    // 显示菜单
    menuShow(Ce) {
      let currentClientX = Ce.clientX;
      let currentClientY = Ce.clientY;
      this.defaultsettings.menustyle.display = "";
      this.defaultsettings.menustyle.left =
        currentClientX - 80 + this.scrollLeft + "px";
      this.defaultsettings.menustyle.top =
        currentClientY - 48 + this.scrollTop + "px";
    },
    menuHidden(Ce) {
      this.defaultsettings.menustyle.display = "none";
    },
    // 隐藏组件设置的下拉框
    selectHidden(e) {
      console.log('eee',e)
      e.preventDefault();
      if (this.currentmodule.config.widgets.style) {
        this.currentmodule.config.widgets.style.fontStyle.display = "none";
      }
      if (this.currentmodule.apitype) {
        this.currentmodule.apitype.display = "none";
      }
      if (this.defaultsettings.datatypestyle) {
        this.defaultsettings.datatypestyle.style.display = "none";
      }
      this.hiddenColorPicker();
      
    },
    // 文本类型   1=>加粗  2=>正常
    chooseDanhangwenbenDataType(type) {
      this.currentmodule.config.widgets.style.fontStyle.display = "none";
      if (type == "1") {
        this.currentmodule.config.widgets.style["font-weight"] = "600";
      } else {
        this.currentmodule.config.widgets.style["font-weight"] = "400";
      }
    },
    // 文本对齐方式 1居左 2居右 3居中 
    chooseDanhangwenbenDataAlign(type) {
      this.currentmodule.config.widgets.style.textAlignStyle.display = "none";
      if (type == "1") {
        this.currentmodule.config.widgets.style["text-align"] = "left";
      } else if(type == '2'){
        this.currentmodule.config.widgets.style["text-align"] = "right";
      }else {
        this.currentmodule.config.widgets.style["text-align"] = "center";
      }
    },
    // 获取子组件传递得参数
    getParams(data) {
      console.log('9999',data)
      this.currentmodule.config.api = data;
      this.autoGetData(this.currentmodule.type, this.currentmodule.id);
    },
    // 文本粗细
    showDanhangwenbenDatatypeChoose(e) {
      e.preventDefault();
      if (this.currentmodule.config.widgets.style.fontStyle.display == "none") {
        this.currentmodule.config.widgets.style.fontStyle.display = "";
      } else {
        this.currentmodule.config.widgets.style.fontStyle.display = "none";
      }
    },
    // 文本对齐方式
    showDanhangwenbenDataAlignChoose(e) {
      e.preventDefault();
      if (this.currentmodule.config.widgets.style.textAlignStyle.display == "none") {
        this.currentmodule.config.widgets.style.textAlignStyle.display = "";
      } else {
        this.currentmodule.config.widgets.style.textAlignStyle.display = "none";
      }
    },
    // 年月日格式
    showDateDatatypeChoose(e) {
      e.preventDefault();
      if (this.currentmodule.config.widgets.dateStyle.formatStyle.display == "none") {
        this.currentmodule.config.widgets.dateStyle.formatStyle.display = "";
      } else {
        this.currentmodule.config.widgets.dateStyle.formatStyle.display = "none";
      }
    },
    chooseDateDataType(type) {
      this.currentmodule.config.widgets.dateStyle.formatStyle.display = "none";
      if (type == "1") {
        this.currentmodule.config.widgets.dateStyle.fontFormat = "-";
      } else if(type == '2'){
        this.currentmodule.config.widgets.dateStyle.fontFormat = ".";
      }else {
        this.currentmodule.config.widgets.dateStyle.fontFormat = "年月日";
      }
    },
    // 时间格式
    showTimeDatatypeChoose(e) {
      e.preventDefault();
      if (this.currentmodule.config.widgets.timeStyle.formatStyle.display == "none") {
        this.currentmodule.config.widgets.timeStyle.formatStyle.display = "";
      } else {
        this.currentmodule.config.widgets.timeStyle.formatStyle.display = "none";
      }
    },
    chooseTimeDataType(type) {
      this.currentmodule.config.widgets.timeStyle.formatStyle.display = "none";
      if (type == "1") {
        this.currentmodule.config.widgets.timeStyle.fontFormat = ":";
      } else if(type == '2'){
        this.currentmodule.config.widgets.timeStyle.fontFormat = "时分秒";
      }
    },
    // 星期格式
    showDayDatatypeChoose(e) {
      e.preventDefault();
      if (this.currentmodule.config.widgets.dayStyle.formatStyle.display == "none") {
        this.currentmodule.config.widgets.dayStyle.formatStyle.display = "";
      } else {
        this.currentmodule.config.widgets.dayStyle.formatStyle.display = "none";
      }
    },
    chooseDayDataType(type) {
      this.currentmodule.config.widgets.dayStyle.formatStyle.display = "none";
      if (type == "1") {
        this.currentmodule.config.widgets.dayStyle.fontFormat = "星期一";
      } else if(type == '2'){
        this.currentmodule.config.widgets.dayStyle.fontFormat = "Monday";
      } else if(type == '3') {
        this.currentmodule.config.widgets.dayStyle.fontFormat = "Mon.";
      }
    },
    // 显示组件设置
    showModuleConfig() {
      this.modules.imgstyleright.right = "300px";
      this.defaultsettings.style.display = "none";
      this.defaultsettings.viewconfigstyle.display = "";
    },
    // 隐藏组件设置
    hiddenModuleConfig() {
      this.modules.imgstyleright.right = "0px";
      this.defaultsettings.viewconfigstyle.display = "none";
    },
    // 基础设置展示
    showDefaultSettings() {
      this.hiddenModuleConfig();
      if (this.defaultsettings.style.display == "none") {
        this.defaultsettings.style.display = "";
      } else {
        this.defaultsettings.style.display = "none";
      }
    },
    // 缩放方式选择展示隐藏
    showResizeType() {
      if (this.defaultsettings.resizetypestyle.display == "none") {
        this.defaultsettings.resizetypestyle.display = "";
      } else {
        this.defaultsettings.resizetypestyle.display = "none";
      }
    },
    // 缩放方式选择
    chooseResizeType(type) {
      this.defaultsettings.resizetypestyle.display = "none";
      switch (type) {
        case 0:
          this.defaultsettings.resizetype = "0";
          this.defaultsettings.resizetypename = "全屏等比缩放(大屏/PC)";
          break;
        case 1:
          this.defaultsettings.resizetype = "1";
          this.defaultsettings.resizetypename = "按高度适配(横向滚动)";
          break;
        case 2:
          this.defaultsettings.resizetype = "2";
          this.defaultsettings.resizetypename = "按宽度适配(移动端)";
          break;
      }
      this.editModules();
    },
    // 图片组件的图片选择变化
    imgmoduleSrcChange(e) {
      this.defaultsettings.filename = e.target.files[0].name;
      var files = e.target.files;
      if (window.FileReader) {
        var fr = new FileReader();
        fr.onloadend = function(ef) {
          // this.currentmodule.config.imgsrc已经绑定到当前组件的src上，所以同时改变
          this.currentmodule.config.imgsrc = ef.target.result;
          let newImg = new Image();
          newImg.src = ef.target.result;
          newImg.onload = () => {
            this.currentmodule.width = newImg.width;
            this.currentmodule.height = newImg.height;
            this.zooms.style.width = newImg.width + "px";
            this.zooms.style.height = newImg.height + "px";
            for (let i = 0; i < this.imgmodules.length; i++) {
              if (this.imgmodules[i].selects == true) {
                this.imgmodules[i].style.width =
                  this.currentmodule.width + "px";
                this.imgmodules[i].style.height =
                  this.currentmodule.height + "px";
              }
            }
          };
        }.bind(this);
        fr.readAsDataURL(e.target.files[0]);
      }
    },
    // 图片变化
    backGroundChange(e) {
      this.defaultsettings.filename = e.target.files[0].name;
      var files = e.target.files;
      if (window.FileReader) {
        var fr = new FileReader();
        fr.onloadend = function(ef) {
          this.defaultsettings.src = ef.target.result;
          this.modules.imgstyle["background-image"] =
            "url(" + ef.target.result + ")";
          this.defaultsettings.choosestyle.display = "none";
          this.defaultsettings.clearnstyle.display = "";
        }.bind(this);
        fr.readAsDataURL(e.target.files[0]);
      }
      var formData = new window.FormData();
      formData.append("file", e.target.files[0]);
      this.fileUpload(formData).then(
        function(res) {
          if (res.code == "1") {
            this.defaultsettings.asyncSrc = res.data.url;
            this.editModules();
          } else {
            this.$Message.info(res.message);
          }
        }.bind(this)
      );
    },
    // 清除背景图片
    clearnBackGround() {
      this.$refs.referenceUpload.value = "";
      this.modules.imgstyle["background-image"] = "";
      this.defaultsettings.src = "";
      this.defaultsettings.asyncSrc = "";
      this.defaultsettings.choosestyle.display = "";
      this.defaultsettings.clearnstyle.display = "none";
    },
    // 滑块变动
    sliderChange(val) {
      if (val == 0) {
        return;
      }
      this.modules.radio = val / 100;
      this.changeWindow(this.modules.radio);
    },
    radioFormat(val) {
      return "缩放: " + val + "%";
    },
    changeWindow(val) {
      if (val === undefined) return;
      let imgModulesHight = document.body.clientHeight - 110;
      let scaleRadio = num_to_fixed(
        imgModulesHight / this.modules.defaulestyle.height,
        3
      );
      this.modules.radiodata = scaleRadio * 100;
      if (!val) {
        this.modules.radio = scaleRadio;
      } else {
        this.modules.radio = val;
      }
      this.modules.imgstyle["width"] = this.modules.defaulestyle.width + "px";
      this.modules.imgstyle["height"] = this.modules.defaulestyle.height + "px";
      this.modules.imgstyle["transform"] = "scale(" + this.modules.radio + ")";
    },
    // 显示拖拽组件
    showModules(id) {
      for (let i = 0; i < this.modulessource.length; i++) {
        if (this.modulessource[i].id == id) {
          this.modules.modulesource = this.modulessource[i].modules;
        }
      }
      this.modules.style.display = "";
    },
    imgDraggable(type) {
      this.imgtype = type;
    },
    imgDragenterEnter(e) {
      e.preventDefault();
    },
    imgDragenterOver(e) {
      e.preventDefault();
    },
    moduleListHidden() {
      this.modules.style.display = "none";
    },
    zoomsHidden(e) {
      // console.log("=======隐藏========");
      e.preventDefault();
      this.moduleListHidden();
      this.menuHidden();

      // 当点击拖拽区时不用隐藏
      if (e.target.className == "item-border") {
        return;
      }
      if (this.zooms.resize) {
        return;
      }
      // 隐藏组件设置
      this.hiddenModuleConfig();
      // 显示大屏设置
      this.defaultsettings.style.display = "";
      this.defaultsettings.resizetypestyle.display = "none";
      this.zooms.resize = false; //取消缩放模式
      this.zooms.show = false;
      // 设置所有组件为不选中
      for (let i = 0; i < this.imgmodules.length; i++) {
        this.imgmodules[i].selects = false;
        if (this.imgmodules[i].id == this.currentmodule.id) {
          this.imgmodules[i].style.border =
            "1px solid " + this.currentmodule.borderColor;
          this.imgmodules[i].style.background = this.currentmodule.bgColor;
          this.imgmodules[i].style.animation = this.currentmodule.animation;
          this.imgmodules[i].style["border-radius"] =
            this.currentmodule.borderRadius + "px";
          this.imgmodules[i].style.width = this.currentmodule.width + "px";
          this.imgmodules[i].style.height = this.currentmodule.height + "px";
        }
      }
    },
    // ctr按键按下可以多选
    ctrEnterDowm(e) {
      this.zooms.ctrenter = true;
    },
    // ctr按键放开取消多选
    ctrEnterUp(e) {
      this.zooms.ctrenter = false;
    },
    /*
        选中组件和移动组件时候更新拖拽组件的位置以及宽度和高度
       */
    resizeShow() {
      this.zooms.show = true;
      let moveLeft = 100000000; //拖拽遮盖组件距离左侧的浮动距离默认0;
      let moveWidth = 0; //拖拽遮盖组件的宽度，宽度等于选中元素组件里右边距离左侧边界最远的一个
      let moveTop = 100000000; //拖拽遮盖组件距离顶部的浮动距离默认0;
      let moveHeight = 0; //拖拽遮盖组件高度，等于选中元素组件里右边距离顶部边界最远的一个
      // 根据选中组件的宽度高度以及左侧和顶部的距离计算新的遮罩脱妆位置
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].selects == true) {
          // 重新计算遮罩层的宽度和高度
          let itemLeft = parseFloat(
            this.imgmodules[i].style.left.replace("px", "")
          );
          let itemTop = parseFloat(
            this.imgmodules[i].style.top.replace("px", "")
          );
          let itemWidth = parseFloat(
            this.imgmodules[i].style.width.replace("px", "")
          );
          let itemHeight = parseFloat(
            this.imgmodules[i].style.height.replace("px", "")
          );
          if (itemLeft < moveLeft) {
            moveLeft = itemLeft;
          }
          if (itemTop < moveTop) {
            moveTop = itemTop;
          }
          if (Math.abs(itemLeft) + itemWidth > moveWidth) {
            moveWidth = itemLeft + itemWidth;
          }
          if (Math.abs(itemTop) + itemHeight > moveHeight) {
            moveHeight = itemTop + itemHeight;
          }
          this.zooms.style.width = parseFloat(moveWidth - moveLeft) + "px";
          this.zooms.style.height = parseFloat(moveHeight - moveTop) + "px";
          this.zooms.style.top = moveTop + "px";
          this.zooms.style.left = moveLeft + "px";
        }
      } /*for_end*/
    },
    // 缩放时候只是重新计算宽度
    resizeWidth() {
      this.zooms.show = true;
      this.zooms.style.width = Ce.target.width + "px";
    },
    // 缩放时候只是重新计算高度
    resizeHeight() {
      this.zooms.show = true;
      this.zooms.style.height = Ce.target.height + "px";
    },
    // 缩放时候重新计算高度和宽度
    resizeRightBottom(left, top) {
      this.zooms.show = true;
      // X轴,Y轴缩小的比例
      let widthRadio =
        left / parseFloat(this.zooms.style.width.replace("px", ""));
      let heightRadio =
        top / parseFloat(this.zooms.style.height.replace("px", ""));
      // 先变更遮罩层的宽高
      this.zooms.style.width =
        parseFloat(this.zooms.style.width.replace("px", "")) + left + "px";
      this.zooms.style.height =
        parseFloat(this.zooms.style.height.replace("px", "")) + top + "px";
      //拖动和缩放已经选中的组件
      this.reSizeHeightAndWidthModules(widthRadio, heightRadio);
    },
    resizeBottomMouseMove(e) {
      e.preventDefault();
    },
    resizeMouseMove(e) {
      e.preventDefault();
    },
    resizeRightMouseMove(e) {
      e.preventDefault();
    },
    boardMouseMove(e) {
      // e.stopPropagation()
      e.preventDefault();
    },
    /*
          缩放鼠标按下,右下角rightbottom缩放按钮
       */
    resizeMouseDown(e, type) {
      let currentClientX = e.clientX;
      let currentClientY = e.clientY;
      this.zooms.type = type;
      document.onmousemove = e => {
        this.modules.gridstype.display = "";
        let left = (e.clientX - currentClientX) / this.modules.radio; //左右移动的距离
        let top = (e.clientY - currentClientY) / this.modules.radio; //上下移动的距离
        currentClientX = e.clientX;
        currentClientY = e.clientY; //重新保存鼠标状态防止再次触发移动事件
        // 重新计算宽度高度以及左侧和顶部距离
        if (this.zooms.type == "rightbottom") {
          this.resizeRightBottom(left, top);
        } else if (this.zooms.type == "right") {
          this.resizeRight(left, top);
        } else if (this.zooms.type == "bottom") {
          this.resizeBottom(left, top);
        } else if (this.zooms.type == "leftbottom") {
          this.resizeLeftBottom(left, top);
        } else if (this.zooms.type == "left") {
          this.resizeLeft(left, top);
        } else if (this.zooms.type == "lefttop") {
          this.resizeLeftTop(left, top);
        } else if (this.zooms.type == "top") {
          this.resizeTop(left, top);
        } else if (this.zooms.type == "righttop") {
          this.resizeRightTop(left, top);
        }
      };
      document.onmouseup = e => {
        this.modules.gridstype.display = "none";
        this.zooms.resize = true; //设置模式为缩放模式
        // 事件執行順序 mousedown >> mouseup >> click，因為mouseup與click事件會衝突，所以先執行up，
        // 但是不想讓click事件执行，因此300毫秒以后再把click事件放开，这样300毫秒内click事件已经判断完毕resize了
        setTimeout(
          function() {
            this.zooms.resize = false;
          }.bind(this),
          300
        );
        this.currentModuleMoveResize();
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },
    /*
        遮罩层按下是拖动
       */
    boardMouseDown(Ce) {
      Ce.preventDefault();
      this.showModuleConfig();
      //保存鼠标当前位置
      let currentClientX = Ce.clientX;
      let currentClientY = Ce.clientY;
      document.onmousemove = Ce => {
        // 栅格显示
        this.modules.gridstype.display = "";
        //鼠标按下并移动的事件
        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = (Ce.clientX - currentClientX) / this.modules.radio; //左右移动的距离
        let top = (Ce.clientY - currentClientY) / this.modules.radio; //上下移动的距离
        currentClientX = Ce.clientX;
        currentClientY = Ce.clientY; //重新保存鼠标状态防止再次触发移动事件
        this.moveModules(Ce, left, top);
      };
      document.onmouseup = Ce => {
        this.zooms.resize = true; //设置模式为缩放模式
        // 但是不想讓click事件执行，因此300毫秒以后再把click事件放开，这样300毫秒内click事件已经判断完毕resize了
        setTimeout(
          function() {
            this.zooms.resize = false;
          }.bind(this),
          300
        );

        if (Ce.button == 2) {
          this.menuShow(Ce);
        } else {
          this.menuHidden();
        }
        // 栅格消失
        this.modules.gridstype.display = "none";
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },
    //拖动已经选中的组件,重新更新所有已选中的组件的位置
    moveModules(Ce, left, top) {
      // 先更新每个组件的位置
      for (let j = 0; j < this.imgmodules.length; j++) {
        if (this.imgmodules[j].selects) {
          let disX = parseFloat(
            this.imgmodules[j].style.left.replace("px", "")
          );
          let disY = parseFloat(this.imgmodules[j].style.top.replace("px", ""));
          this.imgmodules[j].style.left = left + disX + "px";
          this.imgmodules[j].style.top = top + disY + "px";
        }
      }
      // 然后再更新拖拽组件的位置
      this.resizeShow();
      this.currentModuleMoveResize();
    },
    // 向右拉动时候只计算宽度
    resizeRight(left, top) {
      this.zooms.show = true;
      // X轴,Y轴缩小的比例
      let widthRadio =
        left / parseFloat(this.zooms.style.width.replace("px", ""));
      // 先变更遮罩层的宽高
      this.zooms.style.width =
        parseFloat(this.zooms.style.width.replace("px", "")) + left + "px";
      //拖动和缩放已经选中的组件
      this.reSizeWidthModules(widthRadio);
    },
    // 向下拉动时候只计算宽度
    resizeBottom(left, top) {
      this.zooms.show = true;
      // X轴,Y轴缩小的比例
      let heightRadio =
        top / parseFloat(this.zooms.style.height.replace("px", ""));
      // 先变更遮罩层的宽高
      this.zooms.style.height =
        parseFloat(this.zooms.style.height.replace("px", "")) + top + "px";
      //拖动和缩放已经选中的组件
      this.reSizeHeightModules(heightRadio);
    },
    /*
        向左拉动只需要计算宽度和左侧距离
       */
    resizeLeft(left, top) {
      this.zooms.show = true;
      // X轴,Y轴缩小的比例
      let widthRadio =
        left / parseFloat(this.zooms.style.width.replace("px", ""));
      let oldZoomLeft = parseFloat(this.zooms.style.left.replace("px", ""));
      let newZoomLeft = oldZoomLeft + left;
      // 先变更遮罩层的宽高
      this.zooms.style.width =
        parseFloat(this.zooms.style.width.replace("px", "")) - left + "px";
      this.zooms.style.left = newZoomLeft + "px";
      //拖动和缩放已经选中的组件
      this.reSizeLeftModules(widthRadio, oldZoomLeft, newZoomLeft);
    },
    reSizeLeftModules(widthRadio, oldZoomLeft, newZoomLeft) {
      let styleLeft = parseFloat(this.zooms.style.left.replace("px", ""));
      for (let j = 0; j < this.imgmodules.length; j++) {
        if (this.imgmodules[j].selects) {
          let disX = parseFloat(
            this.imgmodules[j].style.width.replace("px", "")
          );
          let disLeft = parseFloat(
            this.imgmodules[j].style.left.replace("px", "")
          );
          this.imgmodules[j].style.width = disX - disX * widthRadio + "px";
          this.imgmodules[j].style.left =
            newZoomLeft + (disLeft - oldZoomLeft) * (1 - widthRadio) + "px";
          if (this.imgmodules[j].chart) {
            this.imgmodules[j].chart.resize();
          }
        }
      }
    },
    resizeRightTop(left, top) {
      this.zooms.show = true;
      // X轴,Y轴缩小的比例
      let widthRadio =
        left / parseFloat(this.zooms.style.width.replace("px", ""));
      let heightRadio =
        top / parseFloat(this.zooms.style.height.replace("px", ""));
      let oldZoomLeft = parseFloat(this.zooms.style.left.replace("px", ""));
      let oldZoomTop = parseFloat(this.zooms.style.top.replace("px", ""));
      let newZoomTop = oldZoomTop + top;
      // 先变更遮罩层的宽高
      this.zooms.style.width =
        parseFloat(this.zooms.style.width.replace("px", "")) + left + "px";
      this.zooms.style.height =
        parseFloat(this.zooms.style.height.replace("px", "")) - top + "px";
      this.zooms.style.top = newZoomTop + "px";
      //拖动和缩放已经选中的组件
      this.reSizeRightTopModules(
        widthRadio,
        heightRadio,
        oldZoomLeft,
        oldZoomTop,
        newZoomTop
      );
    },
    reSizeRightTopModules(
      widthRadio,
      heightRadio,
      oldZoomLeft,
      oldZoomTop,
      newZoomTop
    ) {
      let styleLeft = parseFloat(this.zooms.style.left.replace("px", ""));
      let styleTop = parseFloat(this.zooms.style.top.replace("px", ""));
      for (let j = 0; j < this.imgmodules.length; j++) {
        if (this.imgmodules[j].selects) {
          let disX = parseFloat(
            this.imgmodules[j].style.width.replace("px", "")
          );
          let disY = parseFloat(
            this.imgmodules[j].style.height.replace("px", "")
          );
          let disLeft = parseFloat(
            this.imgmodules[j].style.left.replace("px", "")
          );
          let disTop = parseFloat(
            this.imgmodules[j].style.top.replace("px", "")
          );
          this.imgmodules[j].style.width = disX + disX * widthRadio + "px";
          this.imgmodules[j].style.height = disY - disY * heightRadio + "px";
          this.imgmodules[j].style.left =
            oldZoomLeft + (disLeft - oldZoomLeft) * (1 + widthRadio) + "px";
          this.imgmodules[j].style.top =
            newZoomTop + (disTop - oldZoomTop) * (1 - heightRadio) + "px";
          if (this.imgmodules[j].chart) {
            this.imgmodules[j].chart.resize();
          }
        }
      }
    },
    resizeTop(left, top) {
      this.zooms.show = true;
      // X轴,Y轴缩小的比例
      let heightRadio =
        top / parseFloat(this.zooms.style.height.replace("px", ""));
      let oldZoomTop = parseFloat(this.zooms.style.top.replace("px", ""));
      let newZoomTop = oldZoomTop + top;
      // 先变更遮罩层的宽高
      this.zooms.style.height =
        parseFloat(this.zooms.style.height.replace("px", "")) - top + "px";
      this.zooms.style.top = newZoomTop + "px";
      //拖动和缩放已经选中的组件
      this.reSizeTopModules(heightRadio, oldZoomTop, newZoomTop);
    },
    reSizeTopModules(heightRadio, oldZoomTop, newZoomTop) {
      let styleTop = parseFloat(this.zooms.style.top.replace("px", ""));
      for (let j = 0; j < this.imgmodules.length; j++) {
        if (this.imgmodules[j].selects) {
          let disY = parseFloat(
            this.imgmodules[j].style.height.replace("px", "")
          );
          let disTop = parseFloat(
            this.imgmodules[j].style.top.replace("px", "")
          );
          this.imgmodules[j].style.height = disY - disY * heightRadio + "px";
          this.imgmodules[j].style.top =
            newZoomTop + (disTop - oldZoomTop) * (1 - heightRadio) + "px";
          if (this.imgmodules[j].chart) {
            this.imgmodules[j].chart.resize();
          }
        }
      }
    },
    resizeLeftTop(left, top) {
      this.zooms.show = true;
      // X轴,Y轴缩小的比例
      let widthRadio =
        left / parseFloat(this.zooms.style.width.replace("px", ""));
      let heightRadio =
        top / parseFloat(this.zooms.style.height.replace("px", ""));
      let oldZoomLeft = parseFloat(this.zooms.style.left.replace("px", ""));
      let oldZoomTop = parseFloat(this.zooms.style.top.replace("px", ""));
      let newZoomLeft = oldZoomLeft + left;
      let newZoomTop = oldZoomTop + top;
      // 先变更遮罩层的宽高

      this.zooms.style.width =
        parseFloat(this.zooms.style.width.replace("px", "")) - left + "px";
      this.zooms.style.height =
        parseFloat(this.zooms.style.height.replace("px", "")) - top + "px";
      this.zooms.style.left = newZoomLeft + "px";
      this.zooms.style.top = newZoomTop + "px";
      //拖动和缩放已经选中的组件
      this.reSizeLeftTopModules(
        widthRadio,
        heightRadio,
        oldZoomLeft,
        newZoomLeft,
        oldZoomTop,
        newZoomTop
      );
    },
    reSizeLeftTopModules(
      widthRadio,
      heightRadio,
      oldZoomLeft,
      newZoomLeft,
      oldZoomTop,
      newZoomTop
    ) {
      let styleLeft = parseFloat(this.zooms.style.left.replace("px", ""));
      let styleTop = parseFloat(this.zooms.style.top.replace("px", ""));
      for (let j = 0; j < this.imgmodules.length; j++) {
        if (this.imgmodules[j].selects) {
          let disX = parseFloat(
            this.imgmodules[j].style.width.replace("px", "")
          );
          let disY = parseFloat(
            this.imgmodules[j].style.height.replace("px", "")
          );
          let disLeft = parseFloat(
            this.imgmodules[j].style.left.replace("px", "")
          );
          let disTop = parseFloat(
            this.imgmodules[j].style.top.replace("px", "")
          );
          this.imgmodules[j].style.width = disX - disX * widthRadio + "px";
          this.imgmodules[j].style.height = disY - disY * heightRadio + "px";
          this.imgmodules[j].style.left =
            newZoomLeft + (disLeft - oldZoomLeft) * (1 - widthRadio) + "px";
          this.imgmodules[j].style.top =
            newZoomTop + (disTop - oldZoomTop) * (1 - heightRadio) + "px";
          if (this.imgmodules[j].chart) {
            this.imgmodules[j].chart.resize();
          }
        }
      }
    },
    /*
           左下角拉动需要计算宽高以及左侧顶部的距离
      */
    resizeLeftBottom(left, top) {
      this.zooms.show = true;
      // X轴,Y轴缩小的比例
      let widthRadio =
        left / parseFloat(this.zooms.style.width.replace("px", ""));
      let heightRadio =
        top / parseFloat(this.zooms.style.height.replace("px", ""));
      let oldZoomLeft = parseFloat(this.zooms.style.left.replace("px", ""));
      let newZoomLeft = oldZoomLeft + left;
      // 先变更遮罩层的宽高
      this.zooms.style.width =
        parseFloat(this.zooms.style.width.replace("px", "")) - left + "px";
      this.zooms.style.left = newZoomLeft + "px";
      this.zooms.style.height =
        parseFloat(this.zooms.style.height.replace("px", "")) + top + "px";
      //拖动和缩放已经选中的组件
      this.reSizeLeftBottomModules(
        widthRadio,
        heightRadio,
        oldZoomLeft,
        newZoomLeft
      );
    },
    reSizeLeftBottomModules(widthRadio, heightRadio, oldZoomLeft, newZoomLeft) {
      let styleLeft = parseFloat(this.zooms.style.left.replace("px", ""));
      let styleTop = parseFloat(this.zooms.style.top.replace("px", ""));
      for (let j = 0; j < this.imgmodules.length; j++) {
        if (this.imgmodules[j].selects) {
          let disX = parseFloat(
            this.imgmodules[j].style.width.replace("px", "")
          );
          let disY = parseFloat(
            this.imgmodules[j].style.height.replace("px", "")
          );
          let disLeft = parseFloat(
            this.imgmodules[j].style.left.replace("px", "")
          );
          let disTop = parseFloat(
            this.imgmodules[j].style.top.replace("px", "")
          );
          this.imgmodules[j].style.width = disX - disX * widthRadio + "px";
          this.imgmodules[j].style.height = disY + disY * heightRadio + "px";
          this.imgmodules[j].style.left =
            newZoomLeft + (disLeft - oldZoomLeft) * (1 - widthRadio) + "px";
          this.imgmodules[j].style.top =
            disTop + (disTop - styleTop) * heightRadio + "px";
          if (this.imgmodules[j].chart) {
            this.imgmodules[j].chart.resize();
          }
        }
      }
    },
    /*
        向下缩放时，重新计算宽度和高度以及左侧和顶上的距离
       */
    reSizeHeightModules(heightRadio) {
      let styleTop = parseFloat(this.zooms.style.top.replace("px", ""));
      for (let j = 0; j < this.imgmodules.length; j++) {
        if (this.imgmodules[j].selects) {
          let disY = parseFloat(
            this.imgmodules[j].style.height.replace("px", "")
          );
          let disTop = parseFloat(
            this.imgmodules[j].style.top.replace("px", "")
          );
          this.imgmodules[j].style.height = disY + disY * heightRadio + "px";
          this.imgmodules[j].style.top =
            disTop + (disTop - styleTop) * heightRadio + "px";
          if (this.imgmodules[j].chart) {
            this.imgmodules[j].chart.resize();
          }
        }
      }
    },
    /*
        右下角缩放时，重新计算宽度和高度以及左侧和顶上的距离
       */
    reSizeWidthModules(widthRadio) {
      let styleLeft = parseFloat(this.zooms.style.left.replace("px", ""));
      for (let j = 0; j < this.imgmodules.length; j++) {
        if (this.imgmodules[j].selects) {
          let disX = parseFloat(
            this.imgmodules[j].style.width.replace("px", "")
          );
          let disLeft = parseFloat(
            this.imgmodules[j].style.left.replace("px", "")
          );
          this.imgmodules[j].style.width = disX + disX * widthRadio + "px";
          this.imgmodules[j].style.left =
            disLeft + (disLeft - styleLeft) * widthRadio + "px";
          if (this.imgmodules[j].chart) {
            this.imgmodules[j].chart.resize();
          }
        }
      }
    },
    /*
        右下角缩放时，重新计算宽度和高度以及左侧和顶上的距离
       */
    reSizeHeightAndWidthModules(widthRadio, heightRadio) {
      let styleLeft = parseFloat(this.zooms.style.left.replace("px", ""));
      let styleTop = parseFloat(this.zooms.style.top.replace("px", ""));
      for (let j = 0; j < this.imgmodules.length; j++) {
        if (this.imgmodules[j].selects) {
          let disX = parseFloat(
            this.imgmodules[j].style.width.replace("px", "")
          );
          let disY = parseFloat(
            this.imgmodules[j].style.height.replace("px", "")
          );
          let disLeft = parseFloat(
            this.imgmodules[j].style.left.replace("px", "")
          );
          let disTop = parseFloat(
            this.imgmodules[j].style.top.replace("px", "")
          );
          this.imgmodules[j].style.width = disX + disX * widthRadio + "px";
          this.imgmodules[j].style.height = disY + disY * heightRadio + "px";
          this.imgmodules[j].style.left =
            disLeft + (disLeft - styleLeft) * widthRadio + "px";
          this.imgmodules[j].style.top =
            disTop + (disTop - styleTop) * heightRadio + "px";
          if (this.imgmodules[j].chart) {
            this.imgmodules[j].chart.resize();
          }
        }
      }
    },
    /*
         按下组件移动，并重新显示拖拽样式
       */
    runtimeTableMouseDown(event, item) {
      const target = event.target;
      const control = target.closest('button, a, input, textarea, select, .el-table__header, .el-table__column-resize-proxy');
      const moveArea = target.closest('.runtime-toolbar, .el-table__body td');
      const interacting = event.button !== 0 || !!control || !moveArea;
      if (event.button === 0) this.menuHidden();
      this.imgModulesMouseDown(event, item.id, interacting);
    },
    runtimeTableContextMenu(event, item) {
      this.imgModulesMouseDown(event, item.id, true);
      this.menuShow(event);
    },
    imgModulesMouseDown(Ce, id, interacting = false) {
      // 判断点击的是否是表头区域或列宽调整手柄
      const target = Ce.target;
      const isTableHeader = target.closest('.el-table__header');
      const isResizeHandle = target.closest('.el-table__column-resize-proxy');

      // 如果点在表头或列宽调整手柄，直接退出
      if (!interacting && (isTableHeader || isResizeHandle)) {
        return;
      }

      this.showModuleConfig();
      this.moduleListHidden();
      var num = 0;
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          this.imgmodules[i].selects = true; //设置当前组件为选中
          this.imgmodules[i].style.border =
            "1px solid " + this.imgmodules[i].style.border.split(" ")[2];
          num = i;
        } else {
          if (!this.zooms.ctrenter) {
            //如果没有按下ctr按键，则不把其他的组件设置为不选中
            this.imgmodules[i].selects = false;
            this.imgmodules[i].style.border =
              "1px solid " + this.imgmodules[i].style.border.split(" ")[2];
          }
        }
      }

      // 重新计算这招组件的位置宽度
      this.resizeShow();
      //算出鼠标相对元素的位置
      let disX = parseFloat(this.imgmodules[num].style.left.replace("px", ""));
      let disY = parseFloat(this.imgmodules[num].style.top.replace("px", ""));
      let currentClientX = Ce.clientX;
      let currentClientY = Ce.clientY;
      this.currentmodule.id = id;
      this.currentmodule.zindex = this.imgmodules[num].style["z-index"];
      this.currentmodule.name = this.imgmodules[num].name;
      this.currentmodule.type = this.imgmodules[num].type;
      this.currentmodule.config = this.imgmodules[num].config;
      this.currentmodule.datatype = this.imgmodules[num].datatype;
      this.currentmodule.borderColor = this.imgmodules[num].style.border.split(
        " "
      )[2];
      this.currentmodule.bgColor = this.imgmodules[num].style.background;
      this.currentmodule.animation = this.imgmodules[num].style.animation;
      this.currentmodule.borderRadius = this.imgmodules[num].style[
        "border-radius"
      ].replace("px", "");
      if (this.currentmodule.config.datastype == "default") {
        this.defaultsettings.datatypestyle.name = "静态数据";
      } else {
        this.defaultsettings.datatypestyle.name = "API";
      }

      this.defaultsettings.choosestyle.display = "";
      this.defaultsettings.srcchoosestyle.display = "";
      this.defaultsettings.clearnstyle.display = "none";
      this.reCurrentSizeShow(
        disX,
        disY,
        this.imgmodules[num].style.width.replace("px", ""),
        this.imgmodules[num].style.height.replace("px", "")
      );
      // Select the runtime table without installing canvas drag listeners on its controls.
      if (interacting) return;
      document.onmousemove = Ce => {
        // 栅格显示
        this.modules.gridstype.display = "";
        //鼠标按下并移动的事件
        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = (Ce.clientX - currentClientX) / this.modules.radio; //左右移动的距离
        let top = (Ce.clientY - currentClientY) / this.modules.radio; //上下移动的距离
        this.imgmodules[num].style.left = left + disX + "px";
        this.imgmodules[num].style.top = top + disY + "px";
        //移动元素
        this.resizeShow();
        this.currentModuleMoveResize();
      };
      document.onmouseup = Ce => {
        if (Ce.button == 2) {
          this.menuShow(Ce);
        } else {
          this.menuHidden();
        }
        this.zooms.resize = true; //设置模式为缩放模式
        // 但是不想讓click事件执行，因此300毫秒以后再把click事件放开，这样300毫秒内click事件已经判断完毕resize了
        setTimeout(
          function() {
            this.zooms.resize = false;
          }.bind(this),
          300
        );
        // 栅格消失
        this.modules.gridstype.display = "none";
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },
    // 当前组件移动，放大缩小时候重新计算选中组件的位置
    currentModuleMoveResize() {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == this.currentmodule.id) {
          let left = this.imgmodules[i].style.left.replace("px", "");
          let top = this.imgmodules[i].style.top.replace("px", "");
          let width = this.imgmodules[i].style.width.replace("px", "");
          let height = this.imgmodules[i].style.height.replace("px", "");
          this.reCurrentSizeShow(left, top, width, height);
        }
      }
    },
    // 重新计算当前选中组件的宽高
    reCurrentSizeShow(left, top, width, height) {
      this.currentmodule.left = Math.round(left);
      this.currentmodule.top = Math.round(top);
      this.currentmodule.width = Math.round(width);
      this.currentmodule.height = Math.round(height);
    },
    imgModulesMouseUp(e) {
      e.preventDefault();
    },
    imgModulesMouseMove(e) {
      e.preventDefault();
    },
    // 释放鼠标得时候触发，既拖动完成
    imgDragenterDrop(e) {
      e.preventDefault();
      if (this.imgtype === "hengxiangzhuzhuangtu") {
        this.moduleHengxiangzhuzhuangtu(e);
      } else if (this.imgtype === "mianjitu") {
        this.moduleMianjitu(e);
      } else if (this.imgtype === "zhexiantu") {
        this.moduleZhexiantu(e);
      } else if (this.imgtype === "tupian") {
        this.moduleTupian(e);
      } else if (this.imgtype === "zongxiangzhuzhuangtu") {
        this.moduleZongxiangzhuzhuangtu(e);
      } else if (this.imgtype === "hengxiangduidiezhuzhuangtu") {
        this.moduleHengxiangduidiezhuzhuangtu(e);
      } else if (this.imgtype === "zongxiangduidiezhuzhuangtu") {
        this.moduleZongxiangduidiezhuzhuangtu(e);
      } else if (this.imgtype === "jinduhuantu") {
        this.moduleJinDuhuantu(e);
      } else if (this.imgtype === "yibiaopan") {
        this.moduleYibiaopan(e);
      } else if (this.imgtype === "meiguitu") {
        this.moduleMeiguitu(e);
      } else if (this.imgtype === "bingtu") {
        this.moduleBingtu(e);
      } else if (this.imgtype === "shixinbingtu") {
        this.moduleShixinbingtu(e);
      } else if (this.imgtype === "danhangwenben") {
        this.moduleDanhangwenben(e);
      } else if (this.imgtype === "biaoge") {
        this.moduleBiaoge(e);
      } else if (this.imgtype === "shuzitu") {
        this.moduleShuzitu(e);
      } else if (this.imgtype === "qukuaizujian") {
        this.moduleQukuaizujian(e);
      } else if (this.imgtype === "riqishijian") {
        this.moduleRiQiShiJian(e);
      }
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

    /*保存图片的方法（即按钮点击触发的方法）
          第一个参数为需要保存的div的id名
          第二个参数为保存图片的名称 */
    saveImage(divText) {
      // this.editModules(false, true);
      this.$Spin.show();
      var node = document.getElementById("view-profile");
      domtoimage
        .toJpeg(node)
        .then(
          function(dataUrl) {
            canvasDataURL(dataUrl, { quality: 0.2 }, base64 => {
              var blobfile = this.dataURLToBlob(base64);
              let file = new File([blobfile], "缩略图.png");
              var formData = new FormData();
              formData.append("file", file);
              let postData = {
                formData,
                id: this.$route.query.id
              };
              this.fileUpload(postData).then(
                function(res) {
                  if (res.status == "1") {
                    this.$Spin.hide();
                    this.editModules(false, true);
                  } else {
                    this.$Spin.hide();
                    this.$Message.info(res.message);
                  }
                }.bind(this)
              );
            });
          }.bind(this),
          function(err) {
            this.$Spin.hide();
          }.bind(this)
        )
        .catch(
          function(error) {
            this.$Spin.hide();
          }.bind(this)
        );
    },
    // 绘画网格
    drawGrid(color, stepx, stepy) {
      var c_canvas = document.getElementById("imggriddraw");
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
    // 纵向柱状图
    moduleZongxiangzhuzhuangtu(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.zongxiangzhuzhuangtu.datas)
      );
      var zongxiangzhuzhuangtu = JSON.parse(
        JSON.stringify(this.moduledata.state.zongxiangzhuzhuangtu)
      );
      var params = {
        xAxis: zongxiangzhuzhuangtu.xAxis,
        yAxis: zongxiangzhuzhuangtu.yAxis,
        moduledatas: {
          x: zongxiangzhuzhuangtu.x,
          y: zongxiangzhuzhuangtu.y,
          label: zongxiangzhuzhuangtu.label,
          style: zongxiangzhuzhuangtu.style,
          legend: zongxiangzhuzhuangtu.legend
        }
      };
      var widgets = moduledefault.Zongxiangzhuzhuangtu(params);
      var data = {
        id: new Date().valueOf(),
        type: "zongxiangzhuzhuangtu",
        datatype: "topValues",
        selects: false,
        name: "基础柱状图",
        config: {
          imgsrc: "",
          chart: true, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          datasetbeforecontent: "+", //数据样式的before是+还是-
          xAxiosbeforecontent: "+",
          yAxiosbeforecontent: "+",
          widgetdata: moduledatas,
          params: params,
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: widgets,
          defaultdata: ""
        },
        style: {
          width: "500px",
          height: "300px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 130 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
      this.$nextTick(() => {
        var myChart = echarts.init(document.getElementById(data.id));
        data.chart = myChart;
        myChart.setOption(data.config.widgets, true);
        myChart.resize();
      });
    },
    // 横向堆叠柱状图
    moduleHengxiangduidiezhuzhuangtu(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.hengxiangduidiezhuzhuangtu.datas)
      );
      var hengxiangduidiezhuzhuangtu = JSON.parse(
        JSON.stringify(this.moduledata.state.hengxiangduidiezhuzhuangtu)
      );
      var params = {
        xAxis: hengxiangduidiezhuzhuangtu.xAxis,
        yAxis: hengxiangduidiezhuzhuangtu.yAxis,
        moduledatas: {
          x: hengxiangduidiezhuzhuangtu.x,
          y: hengxiangduidiezhuzhuangtu.y,
          label: hengxiangduidiezhuzhuangtu.label,
          style: hengxiangduidiezhuzhuangtu.style,
          legend: hengxiangduidiezhuzhuangtu.legend
        }
      };
      var widgets = moduledefault.Hengxiangduidiezhuzhuangtu(params);
      var data = {
        id: new Date().valueOf(),
        type: "hengxiangduidiezhuzhuangtu",
        datatype: "topValues",
        selects: false,
        name: "横向堆叠柱状图",
        config: {
          imgsrc: "",
          chart: true, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          datasetbeforecontent: "+", //数据样式的before是+还是-
          xAxiosbeforecontent: "+",
          yAxiosbeforecontent: "+",
          widgetdata: moduledatas,
          params: params,
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: widgets,
          defaultdata: ""
        },
        style: {
          width: "500px",
          height: "300px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 130 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
      this.$nextTick(() => {
        var myChart = echarts.init(document.getElementById(data.id));
        data.chart = myChart;
        myChart.setOption(data.config.widgets, true);
        myChart.resize();
      });
    },
    // 纵向堆叠柱状图
    moduleZongxiangduidiezhuzhuangtu(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.zongxiangduidiezhuzhuangtu.datas)
      );
      var zongxiangduidiezhuzhuangtu = JSON.parse(
        JSON.stringify(this.moduledata.state.zongxiangduidiezhuzhuangtu)
      );
      var params = {
        xAxis: zongxiangduidiezhuzhuangtu.xAxis,
        yAxis: zongxiangduidiezhuzhuangtu.yAxis,
        moduledatas: {
          x: zongxiangduidiezhuzhuangtu.x,
          y: zongxiangduidiezhuzhuangtu.y,
          label: zongxiangduidiezhuzhuangtu.label,
          style: zongxiangduidiezhuzhuangtu.style,
          legend: zongxiangduidiezhuzhuangtu.legend
        }
      };
      var widgets = moduledefault.Zongxiangduidiezhuzhuangtu(params);
      var data = {
        id: new Date().valueOf(),
        type: "zongxiangduidiezhuzhuangtu",
        datatype: "topValues",
        selects: false,
        name: "纵向堆叠柱状图",
        config: {
          imgsrc: "",
          chart: true, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          datasetbeforecontent: "+", //数据样式的before是+还是-
          xAxiosbeforecontent: "+",
          yAxiosbeforecontent: "+",
          widgetdata: moduledatas,
          params: params,
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: widgets,
          defaultdata: ""
        },
        style: {
          width: "500px",
          height: "300px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 130 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
      this.$nextTick(() => {
        var myChart = echarts.init(document.getElementById(data.id));
        data.chart = myChart;
        myChart.setOption(data.config.widgets, true);
        myChart.resize();
      });
    },
    // 玫瑰图
    moduleMeiguitu(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.meiguitu.datas)
      );
      var meiguitu = JSON.parse(JSON.stringify(this.moduledata.state.meiguitu));
      var params = {
        color: meiguitu.color,
        style: meiguitu.style,
        label: meiguitu.label,
        moduledatas: {
          x: meiguitu.x,
          y: meiguitu.y,
          label: meiguitu.label,
          legend: meiguitu.legend
        }
      };
      var widgets = moduledefault.Meiguitu(params);
      var data = {
        id: new Date().valueOf(),
        type: "meiguitu",
        datatype: "topValues",
        selects: false,
        name: "玫瑰图",
        config: {
          imgsrc: "",
          chart: true, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          datasetbeforecontent: "+", //数据样式的before是+还是-
          widgetdata: moduledatas,
          params: params,
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: widgets,
          defaultdata: ""
        },
        style: {
          width: "500px",
          height: "300px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 130 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
      this.$nextTick(() => {
        var myChart = echarts.init(document.getElementById(data.id));
        data.chart = myChart;
        myChart.clear();
        myChart.setOption(data.config.widgets, true);
        myChart.resize();
      });
    },
    // 饼图
    moduleShixinbingtu(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.shixinbingtu.datas)
      );
      var shixinbingtu = JSON.parse(
        JSON.stringify(this.moduledata.state.shixinbingtu)
      );
      var params = {
        color: shixinbingtu.color,
        style: shixinbingtu.style,
        label: shixinbingtu.label,
        moduledatas: {
          x: shixinbingtu.x,
          y: shixinbingtu.y,
          label: shixinbingtu.label,
          legend: shixinbingtu.legend
        }
      };
      var widgets = moduledefault.Shixinbingtu(params);
      var data = {
        id: new Date().valueOf(),
        type: "shixinbingtu",
        datatype: "topValues",
        selects: false,
        name: "实心饼图",
        config: {
          imgsrc: "",
          chart: true, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          datasetbeforecontent: "+", //数据样式的before是+还是-
          widgetdata: moduledatas,
          params: params,
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: widgets,
          defaultdata: ""
        },
        style: {
          width: "500px",
          height: "300px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 130 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
      this.$nextTick(() => {
        var myChart = echarts.init(document.getElementById(data.id));
        data.chart = myChart;
        myChart.clear();
        myChart.setOption(data.config.widgets, true);
        myChart.resize();
      });
    },
    // 饼图
    moduleBingtu(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.bingtu.datas)
      );
      var bingtu = JSON.parse(JSON.stringify(this.moduledata.state.bingtu));
      var params = {
        color: bingtu.color,
        style: bingtu.style,
        label: bingtu.label,
        moduledatas: {
          x: bingtu.x,
          y: bingtu.y,
          label: bingtu.label,
          legend: bingtu.legend
        }
      };
      var widgets = moduledefault.Bingtu(params);
      var data = {
        id: new Date().valueOf(),
        type: "bingtu",
        datatype: "topValues",
        selects: false,
        name: "饼图",
        config: {
          imgsrc: "",
          chart: true, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          datasetbeforecontent: "+", //数据样式的before是+还是-
          widgetdata: moduledatas,
          params: params,
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: widgets,
          defaultdata: ""
        },
        style: {
          width: "500px",
          height: "300px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 130 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
      this.$nextTick(() => {
        var myChart = echarts.init(document.getElementById(data.id));
        data.chart = myChart;
        myChart.clear();
        myChart.setOption(data.config.widgets, false);
        myChart.resize();
      });
    },
    // 进度环图
    moduleJinDuhuantu(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.jinduhuantu.datas)
      );
      var jinduhuantu = JSON.parse(
        JSON.stringify(this.moduledata.state.jinduhuantu)
      );
      var params = {
        value: jinduhuantu.value,
        name: jinduhuantu.name,
        radius: jinduhuantu.radius,
        color: jinduhuantu.color,
        style: jinduhuantu.style
      };
      var widgets = moduledefault.Jinduhuantu(params);
      var data = {
        id: new Date().valueOf(),
        type: "jinduhuantu",
        datatype: "averageValues",
        selects: false,
        name: "进度环图",
        config: {
          imgsrc: "",
          chart: true, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          autodatatime: "10",
          datasetbeforecontent: "+", //数据样式的before是+还是-
          params: params,
          widgetdata: moduledatas,
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: widgets,
          defaultdata: "",
          numtype: "正向"
        },
        style: {
          width: "200px",
          height: "200px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 130 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
      this.$nextTick(() => {
        var myChart = echarts.init(document.getElementById(data.id));
        data.chart = myChart;
        myChart.clear();
        myChart.setOption(data.config.widgets, true);
        myChart.resize();
      });
    },
    // 仪表盘
    moduleYibiaopan(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.yibiaopan.datas)
      );
      var yibiaopan = JSON.parse(
        JSON.stringify(this.moduledata.state.yibiaopan)
      );
      var params = {
        value: yibiaopan.value,
        name: yibiaopan.name,
        color: yibiaopan.color,
        style: yibiaopan.style
      };
      var widgets = moduledefault.Yibiaopan(params);
      var data = {
        id: new Date().valueOf(),
        type: "yibiaopan",
        datatype: "averageValues",
        selects: false,
        name: "仪表盘",
        config: {
          imgsrc: "",
          chart: true, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          autodatatime: "10",
          datasetbeforecontent: "+", //数据样式的before是+还是-
          params: params,
          widgetdata: moduledatas,
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: widgets,
          defaultdata: ""
        },
        style: {
          width: "300px",
          height: "300px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 130 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
      this.$nextTick(() => {
        var myChart = echarts.init(document.getElementById(data.id));
        data.chart = myChart;
        myChart.clear();
        myChart.setOption(data.config.widgets, true);
        myChart.resize();
      });
    },
    //横向柱状图组件
    moduleHengxiangzhuzhuangtu(e) {
      // JSON.parse(JSON.stringify 深度复制，防止之后新建的时候数据污染
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.hengxiangzhuzhuangtu.datas)
      );
      var hengxiangzhuzhuangtu = JSON.parse(
        JSON.stringify(this.moduledata.state.hengxiangzhuzhuangtu)
      );
      var params = {
        xAxis: hengxiangzhuzhuangtu.xAxis,
        yAxis: hengxiangzhuzhuangtu.yAxis,
        moduledatas: {
          x: hengxiangzhuzhuangtu.x,
          y: hengxiangzhuzhuangtu.y,
          label: hengxiangzhuzhuangtu.label,
          style: hengxiangzhuzhuangtu.style,
          legend: hengxiangzhuzhuangtu.legend
        }
      };
      var widgets = moduledefault.Hengxiangzhuzhuangtu(params);
      var data = {
        id: new Date().valueOf(),
        type: "hengxiangzhuzhuangtu",
        datatype: "topValues",
        selects: false,
        name: "横向柱状图",
        config: {
          imgsrc: "",
          chart: true, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          datasetbeforecontent: "+", //数据样式的before是+还是-
          xAxiosbeforecontent: "+",
          yAxiosbeforecontent: "+",
          widgetdata: moduledatas,
          params: params,
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: widgets,
          defaultdata: ""
        },
        style: {
          width: "500px",
          height: "300px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 130 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
      this.$nextTick(() => {
        var myChart = echarts.init(document.getElementById(data.id));
        data.chart = myChart;
        myChart.setOption(data.config.widgets, true);
        myChart.resize();
      });
    },
    // 新增面积图组件
    moduleMianjitu(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.mianjitu.datas)
      );
      var mianjitu = JSON.parse(JSON.stringify(this.moduledata.state.mianjitu));
      var params = {
        xAxis: mianjitu.xAxis,
        yAxis: mianjitu.yAxis,
        moduledatas: {
          x: mianjitu.x,
          y: mianjitu.y,
          label: mianjitu.label,
          style: mianjitu.style,
          legend: mianjitu.legend
        }
      };
      var widgets = moduledefault.Mianjitu(params);
      var data = {
        id: new Date().valueOf(),
        type: "mianjitu",
        datatype: "timeValues",
        selects: false,
        name: "面积图",
        config: {
          imgsrc: "",
          chart: true, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          datasetbeforecontent: "+", //数据样式的before是+还是-
          xAxiosbeforecontent: "+",
          yAxiosbeforecontent: "+",
          widgetdata: moduledatas,
          params: params,
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: widgets,
          defaultdata: ""
        },
        style: {
          width: "500px",
          height: "300px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 130 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
      this.$nextTick(() => {
        var myChart = echarts.init(document.getElementById(data.id));

        data.chart = myChart;
        var symbolSize = 20;
        var datas = [[15, 0], [-50, 10], [-56.5, 20], [-46.5, 30], [-22.1, 40]];
        myChart.clear();
        myChart.setOption(data.config.widgets, true);
        myChart.resize();
      }); /*next_tick_end*/
    },
    // 新增折线图组件
    moduleZhexiantu(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.zhexiantu.datas)
      );
      var zhexiantu = JSON.parse(
        JSON.stringify(this.moduledata.state.zhexiantu)
      );
      var params = {
        xAxis: zhexiantu.xAxis,
        yAxis: zhexiantu.yAxis,
        moduledatas: {
          x: zhexiantu.x,
          y: zhexiantu.y,
          label: zhexiantu.label,
          style: zhexiantu.style,
          legend: zhexiantu.legend
        }
      };
      var widgets = moduledefault.Zhexiantu(params);
      var data = {
        id: new Date().valueOf(),
        type: "zhexiantu",
        datatype: "timeValues",
        selects: false,
        name: "折线图",
        config: {
          imgsrc: "",
          chart: true, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          datasetbeforecontent: "+", //数据样式的before是+还是-
          xAxiosbeforecontent: "+",
          yAxiosbeforecontent: "+",
          widgetdata: moduledatas,
          params: params,
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: widgets,
          defaultdata: ""
        },
        style: {
          width: "500px",
          height: "300px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 130 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
      this.$nextTick(() => {
        var myChart = echarts.init(document.getElementById(data.id));

        data.chart = myChart;
        var symbolSize = 20;
        var datas = [[15, 0], [-50, 10], [-56.5, 20], [-46.5, 30], [-22.1, 40]];
        myChart.clear();
        myChart.setOption(data.config.widgets, true);
        myChart.resize();
      }); /*next_tick_end*/
    },
    // 图片
    moduleTupian(e) {
      var data = {
        id: new Date().valueOf(),
        type: "tupian",
        selects: false,
        name: "图片",
        config: {
          imgsrc: require("../../assets/imgs/13.png"),
          chart: false, //是否是百度地图组件
          img: true, //是否是图片组件
          datas: false, //是否需要数据支撑
          widgetdata: "",
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: {},
          defaultdata: ""
        },
        style: {
          width: "178px",
          height: "110px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 90 + this.scrollTop / this.modules.radio + "px",
          "z-index": "0",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
    },
    // 表格
    // 表格
moduleBiaoge(e) {
  var moduledatas = JSON.parse(JSON.stringify(this.moduledata.state.biaoge.datas));
  var biaoge = JSON.parse(JSON.stringify(this.moduledata.state.biaoge));

  var data = {
    id: new Date().valueOf(),
    type: "biaoge",
    _columnsReady: false,
    datatype: "topValues",
    selects: false,
    name: "表格",
    config: {
      imgsrc: "",
      chart: false,
      img: false,
      datas: true,
      widgetdata: moduledatas,
      datasetbeforecontent: "+",
      datastype: "api",
      autodata: "关闭",
      autodatatime: "10",
      apitypeselect: "POST",
      api: "",
      // ✅ 与其它组件一致：只用这一行
      widgets: biaoge.config,
      defaultdata: "",
      width: []
    },
    style: {
      width: "500px",
      height: "250px",
      left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
      top: e.clientY - 90 + this.scrollTop / this.modules.radio + "px",
      "z-index": "1",
      border: "1px solid transparent",
      position: "absolute",
      display: "",
      "border-radius": "0px",
      background: "transparent"
    }
  };
  this.imgmodules.push(data);
  this.imgtype = "";
},


    // 数字图
    moduleShuzitu(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.shuzitu.datas)
      );
      var shuzitu = JSON.parse(JSON.stringify(this.moduledata.state.shuzitu));
      var data = {
        id: new Date().valueOf(),
        type: "shuzitu",
        datatype: "averageValues",
        selects: false,
        name: "数字图",
        config: {
          imgsrc: "",
          chart: false, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          widgetdata: moduledatas,
          datasetbeforecontent: "+", //数据样式的before是+还是-
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: shuzitu.config,
          defaultdata: ""
        },
        style: {
          width: "151px",
          height: "65px",
          "white-space": "nowrap",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 90 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
    },
    // 单行文本
    moduleDanhangwenben(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.danhangwenben.datas)
      );
      var danhangwenben = JSON.parse(
        JSON.stringify(this.moduledata.state.danhangwenben)
      );
      var data = {
        id: new Date().valueOf(),
        type: "danhangwenben",
        selects: false,
        name: "单行文本",
        config: {
          imgsrc: "",
          chart: false, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          widgetdata: moduledatas,
          datasetbeforecontent: "+", //数据样式的before是+还是-
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: danhangwenben.config,
          defaultdata: ""
        },
        style: {
          width: "200px",
          height: "40px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 90 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          background: "transparent",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
    },
    // 区块组建
    moduleQukuaizujian(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.qukuaizujian.datas)
      );
      var qukuaizujian = JSON.parse(
        JSON.stringify(this.moduledata.state.qukuaizujian)
      );
      var data = {
        id: new Date().valueOf(),
        type: "qukuaizujian",
        selects: false,
        name: "区块组建",
        config: {
          imgsrc: "",
          chart: false, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          widgetdata: moduledatas,
          datasetbeforecontent: "+", //数据样式的before是+还是-
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: qukuaizujian.config,
          defaultdata: ""
        },
        style: {
          width: "400px",
          height: "200px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 90 + this.scrollTop / this.modules.radio + "px",
          "z-index": "0",
          border: "1px solid #fff",
          position: "absolute",
          background: "#000000",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
    },
    // 日期时间组件
    moduleRiQiShiJian(e) {
      var moduledatas = JSON.parse(
        JSON.stringify(this.moduledata.state.riqishijian.datas)
      );
      var riqishijian = JSON.parse(
        JSON.stringify(this.moduledata.state.riqishijian)
      );
      var data = {
        id: new Date().valueOf(),
        type: "riqishijian",
        selects: false,
        name: "日期时间",
        config: {
          imgsrc: "",
          chart: false, //是否是百度地图组件
          img: false, //是否是图片组件
          datas: true, //是否需要数据支撑
          widgetdata: moduledatas,
          datasetbeforecontent: "+", //数据样式的before是+还是-
          datastype: "api", //获取数据类型 default和api两种
          autodata: "关闭",
          autodatatime: "10",
          apitypeselect: "POST", //默认显示post
          api: "",
          widgets: riqishijian.config,
          defaultdata: ""
        },
        style: {
          width: "240px",
          height: "40px",
          "line-height": "40px",
          left: e.clientX - 100 + this.scrollLeft / this.modules.radio + "px",
          top: e.clientY - 90 + this.scrollTop / this.modules.radio + "px",
          "z-index": "1",
          border: "1px solid transparent",
          position: "absolute",
          background: "transparent",
          display: "",
          "border-radius": "0px",
          background: "transparent"
        }
      }; /*data_end*/
      this.imgmodules.push(data);
      this.imgtype = "";
    },
    // 重新设置横向柱状图的样式
    reHengxiangzhuzhuangtu(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          // 如果是静态数据
          if (
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "default") ||
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "api" &&
              !currentmodule.config.api)
          ) {
            var params = currentmodule.config.params;
            var widgets = moduledefault.Hengxiangzhuzhuangtu(params);
            currentmodule.config.widgets = widgets;
            this.$nextTick(() => {
              if (currentmodule.config.datas && currentmodule.config.chart) {
                if (currentmodule.chart) {
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                } else {
                  var myChart = echarts.init(document.getElementById(id));
                  currentmodule.chart = myChart;
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                }
              }
            });
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api"
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      let result = res;
                      var params = currentmodule.config.params;
                      let x = [],
                        y = [],
                        label = [],
                        sortArray = [],
                        unit = "";
                      if (result && result.length > 0) {
                        result.forEach((item, index) => {
                          if (item.metricValues[0].unit === "kb/sec") {
                            item.metricValues[0].value =
                              item.metricValues[0].value / 1000;
                          }
                          sortArray.push({
                            argument: item.group.argument || item.group.label,
                            value: item.metricValues[0].value
                          });
                          if (index === 0) {
                            item.metricValues[0].metric.label = replace_disp_str(
                              item.metricValues[0].metric.label
                            );
                            label.push(item.metricValues[0].metric.label);
                            unit = replace_unit(item.metricValues[0]);
                          }
                        });
                        sortArray.sort(ascCompare("value"));
                        sortArray.forEach((item, index) => {
                          if ((result[0].metricValues[0].metric.dpm && item.value !== null) || num_to_fixed(item.value, 3) != 0) {
                            y.push(item.argument);
                            x.push(result[0].metricValues[0].metric.dpm ? item.value : num_to_fixed(item.value, 3));
                          }
                        });
                      }
                      params.moduledatas.x = [x] || [];
                      params.moduledatas.y = y || [];
                      params.moduledatas.label = label || [];
                      params.moduledatas.unit = unit || "";
                      var data = {
                        x: params.moduledatas.x,
                        y: params.moduledatas.y,
                        label: params.moduledatas.label
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                      var widgets = moduledefault.Hengxiangzhuzhuangtu(params);
                      currentmodule.config.widgets = widgets;
                      this.$nextTick(() => {
                        if (
                          currentmodule.config.datas &&
                          currentmodule.config.chart
                        ) {
                          if (currentmodule.chart) {
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          } else {
                            var myChart = echarts.init(
                              document.getElementById(id)
                            );
                            currentmodule.chart = myChart;
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          }
                        }
                      });
                    }.bind(this)
                  );
                }
              }
            }
          }
        } //if_end
      }
    },
    // 重新设置横向堆叠柱状图的样式
    reHengxiangduidiezhuzhuangtu(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          // 如果是静态数据
          if (
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "default") ||
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "api" &&
              !currentmodule.config.api)
          ) {
            var params = currentmodule.config.params;
              params.moduledatas.dpmComposition = false;
              params.moduledatas.dpmStackSingle = false;
            var widgets = moduledefault.Hengxiangduidiezhuzhuangtu(params);
            currentmodule.config.widgets = widgets;
            this.$nextTick(() => {
              if (currentmodule.config.datas && currentmodule.config.chart) {
                if (currentmodule.chart) {
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                } else {
                  var myChart = echarts.init(document.getElementById(id));
                  currentmodule.chart = myChart;
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                }
              }
            });
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api"
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      let result = res;
                      var params = currentmodule.config.params;
                      let x = [],
                        y = [],
                        label = [],
                        sortArray = [],
                        unit = [];
                      if (result && result.length > 0) {
                        // 处理数据
                        for (var i = 0; i < result.length; i++) {
                          sortArray.push({
                            argument:
                              result[i].group.argument || result[i].group.label
                          });
                          let itemvalue = [];
                          for (
                            var j = 0;
                            j < result[i].metricValues.length;
                            j++
                          ) {
                            if (i === 0) {
                              result[0].metricValues[
                                j
                              ].metric.label = replace_disp_str2(
                                result[0].metricValues[j].metric.label
                              );
                              label.push(
                                result[0].metricValues[j].metric.label
                              );
                            }
                            if (!result[i].metricValues[j].metric.dpm && result[i].metricValues[j].unit === "kb/sec") {
                              result[i].metricValues[j].value = num_to_fixed(
                                result[i].metricValues[j].value / 1000,
                                3
                              );
                            } else if (
                              !result[i].metricValues[j].metric.dpm && result[i].metricValues[j].unit === "msec"
                            ) {
                              result[i].metricValues[j].value = num_to_fixed(
                                result[i].metricValues[j].value / 1000,
                                4
                              );
                            } else if (!result[i].metricValues[j].metric.dpm) {
                              result[i].metricValues[j].value = num_to_fixed(
                                result[i].metricValues[j].value,
                                3
                              );
                            }
                            unit.push(replace_unit2(result[0].metricValues[j]));
                            itemvalue.push(
                              (result[i].metricValues[j].metric.dpm ? result[i].metricValues[j].value : parseFloat(result[i].metricValues[j].value))
                            );
                          }
                          sortArray[i].value = itemvalue;
                          sortArray[i].valueSum = itemvalue.reduce(
                            (n, m) => n + m
                          );
                        }
                        // 排序
                        sortArray.sort(ascCompare("valueSum"));
                        for (var z = 0; z < sortArray[0].value.length; z++) {
                          x.push([]);
                        }
                        for (var i = 0; i < sortArray.length; i++) {
                          if (result[0].metricValues[0].metric.dpm || sortArray[i].valueSum != 0) {
                            y.push(sortArray[i].argument);
                            for (
                              var j = 0;
                              j < sortArray[i].value.length;
                              j++
                            ) {
                              x[j].push(sortArray[i].value[j]);
                            }
                          }
                        }
                      }

                      params.moduledatas.x = x || [];
                      params.moduledatas.y = y || [];
                      params.moduledatas.label = label || [];
                      params.moduledatas.unit = unit || [];
                      params.moduledatas.style.x =
                        params.moduledatas.style.x.length >
                        params.moduledatas.x.length
                          ? params.moduledatas.style.x.slice(
                              0,
                              params.moduledatas.x
                            )
                          : params.moduledatas.style.x;
                      var data = {
                        x: params.moduledatas.x,
                        y: params.moduledatas.y,
                        label: params.moduledatas.label
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                      var widgets = moduledefault.Hengxiangduidiezhuzhuangtu(
                        params
                      );
                      currentmodule.config.widgets = widgets;
                      this.$nextTick(() => {
                        if (
                          currentmodule.config.datas &&
                          currentmodule.config.chart
                        ) {
                          if (currentmodule.chart) {
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          } else {
                            var myChart = echarts.init(
                              document.getElementById(id)
                            );
                            currentmodule.chart = myChart;
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          }
                        }
                      });
                    }.bind(this)
                  );
                }
              }
            }
          }
        } //if_end
      }
    },
    // 重新设置纵向堆叠柱状图的样式
    reZongxiangduidiezhuzhuangtu(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          // 如果是静态数据
          if (
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "default") ||
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "api" &&
              !currentmodule.config.api)
          ) {
            var params = currentmodule.config.params;
              params.moduledatas.dpmComposition = false;
              params.moduledatas.dpmStackSingle = false;
            var widgets = moduledefault.Zongxiangduidiezhuzhuangtu(params);
            currentmodule.config.widgets = widgets;
            this.$nextTick(() => {
              if (currentmodule.config.datas && currentmodule.config.chart) {
                if (currentmodule.chart) {
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                } else {
                  var myChart = echarts.init(document.getElementById(id));
                  currentmodule.chart = myChart;
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                }
              }
            });
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api"
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      let result = res;
                      var params = currentmodule.config.params;
                      let x = [],
                        y = [],
                        label = [],
                        sortArray = [],
                        unit = [];
                      if (result && result.length > 0) {
                        // 处理数据
                        for (var i = 0; i < result.length; i++) {
                          sortArray.push({
                            argument:
                              result[i].group.argument || result[i].group.label
                          });
                          let itemvalue = [];
                          for (
                            var j = 0;
                            j < result[i].metricValues.length;
                            j++
                          ) {
                            if (i === 0) {
                              result[0].metricValues[
                                j
                              ].metric.label = replace_disp_str2(
                                result[0].metricValues[j].metric.label
                              );
                              label.push(
                                result[0].metricValues[j].metric.label
                              );
                            }
                            if (!result[i].metricValues[j].metric.dpm && result[i].metricValues[j].unit === "kb/sec") {
                              result[i].metricValues[j].value = num_to_fixed(
                                result[i].metricValues[j].value / 1000,
                                3
                              );
                            } else if (
                              !result[i].metricValues[j].metric.dpm && result[i].metricValues[j].unit === "msec"
                            ) {
                              result[i].metricValues[j].value = num_to_fixed(
                                result[i].metricValues[j].value / 1000,
                                4
                              );
                            } else if (!result[i].metricValues[j].metric.dpm) {
                              result[i].metricValues[j].value = num_to_fixed(
                                result[i].metricValues[j].value,
                                3
                              );
                            }
                            unit.push(replace_unit2(result[0].metricValues[j]));
                            itemvalue.push(
                              (result[i].metricValues[j].metric.dpm ? result[i].metricValues[j].value : parseFloat(result[i].metricValues[j].value))
                            );
                          }
                          sortArray[i].value = itemvalue;
                          sortArray[i].valueSum = itemvalue.reduce(
                            (n, m) => n + m
                          );
                        }
                        // 排序
                        sortArray.sort(descCompare("valueSum"));
                        for (var z = 0; z < sortArray[0].value.length; z++) {
                          y.push([]);
                        }
                        for (var i = 0; i < sortArray.length; i++) {
                          if (result[0].metricValues[0].metric.dpm || sortArray[i].valueSum != 0) {
                            x.push(sortArray[i].argument);
                            for (
                              var j = 0;
                              j < sortArray[i].value.length;
                              j++
                            ) {
                              y[j].push(sortArray[i].value[j]);
                            }
                          }
                        }
                      }

                      params.moduledatas.x = x || [];
                      params.moduledatas.y = y || [];
                      params.moduledatas.label = label || [];
                      params.moduledatas.unit = unit || [];
                      params.moduledatas.style.y =
                        params.moduledatas.style.y.length >
                        params.moduledatas.y.length
                          ? params.moduledatas.style.y.slice(
                              0,
                              params.moduledatas.y
                            )
                          : params.moduledatas.style.y;
                      var data = {
                        x: params.moduledatas.x,
                        y: params.moduledatas.y,
                        label: params.moduledatas.label
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                      var widgets = moduledefault.Zongxiangduidiezhuzhuangtu(
                        params
                      );
                      currentmodule.config.widgets = widgets;
                      this.$nextTick(() => {
                        if (
                          currentmodule.config.datas &&
                          currentmodule.config.chart
                        ) {
                          if (currentmodule.chart) {
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          } else {
                            var myChart = echarts.init(
                              document.getElementById(id)
                            );
                            currentmodule.chart = myChart;
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          }
                        }
                      });
                    }.bind(this)
                  );
                }
              }
            }
          }
        } //if_end
      }
    },
    // 重新设置玫瑰图的样式，涉及到函数
    reMeiGuitu(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          // 如果是静态数据
          if (
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "default") ||
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "api" &&
              !currentmodule.config.api)
          ) {
            var params = currentmodule.config.params;
              params.moduledatas.dpmComposition = false;
              params.moduledatas.dpmStackSingle = false;
            var widgets = moduledefault.Meiguitu(params);
            currentmodule.config.widgets = widgets;
            this.$nextTick(() => {
              if (currentmodule.config.datas && currentmodule.config.chart) {
                if (currentmodule.chart) {
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                } else {
                  var myChart = echarts.init(document.getElementById(id));
                  currentmodule.chart = myChart;
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                }
              }
            });
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api"
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      let result = res;
                      var params = currentmodule.config.params;
                      let x = [],
                        y = [],
                        unit = "",
                        label = "";
                      if (result && result.length > 0) {
                        for (var i = 0; i < result.length; i++) {
                          if (result[i].metricValues[0].unit === "kb/sec") {
                            result[i].metricValues[0].value =
                              result[i].metricValues[0].value / 1000;
                          }
                          if (
                            (result[i].metricValues[0].metric.dpm && result[i].metricValues[0].value !== null) || (result[i].metricValues[0].metric.dpm ? result[i].metricValues[0].value : num_to_fixed(result[i].metricValues[0].value, 3)) != 0
                          ) {
                            x.push(
                              result[i].group.argument || result[i].group.label
                            );
                            y.push(
                              (result[i].metricValues[0].metric.dpm ? result[i].metricValues[0].value : num_to_fixed(result[i].metricValues[0].value, 3))
                            );
                          }
                          // if (i == 0) {
                          //   unit = replace_unit(result[0].metricValues[0]);
                          //   label = replace_disp_str(
                          //     result[0].metricValues[0].metric.label
                          //   );
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
                      params.color =
                        params.color.length > x.length
                          ? params.color.slice(0, x.length)
                          : params.color;
                      params.style.color =
                        params.style.color.length > x.length
                          ? params.style.color.slice(0, x.length)
                          : params.style.color;
                      var data = {
                        x: params.moduledatas.x,
                        y: params.moduledatas.y,
                        label: params.moduledatas.label
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                      var widgets = moduledefault.Meiguitu(params);
                      currentmodule.config.widgets = widgets;
                      this.$nextTick(() => {
                        if (
                          currentmodule.config.datas &&
                          currentmodule.config.chart
                        ) {
                          if (currentmodule.chart) {
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          } else {
                            var myChart = echarts.init(
                              document.getElementById(id)
                            );
                            currentmodule.chart = myChart;
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          }
                        }
                      });
                    }.bind(this)
                  );
                }
              }
            }
          }
        } //if_end
      } //for_end
    },
    // 重新设置饼图的样式，涉及到函数
    reBingtu(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          // 如果是静态数据
          if (
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "default") ||
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "api" &&
              !currentmodule.config.api)
          ) {
            var params = currentmodule.config.params;
              params.moduledatas.dpmComposition = false;
              params.moduledatas.dpmStackSingle = false;
            var widgets = moduledefault.Bingtu(params);
            currentmodule.config.widgets = widgets;
            this.$nextTick(() => {
              if (currentmodule.config.datas && currentmodule.config.chart) {
                if (currentmodule.chart) {
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                } else {
                  var myChart = echarts.init(document.getElementById(id));
                  currentmodule.chart = myChart;
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                }
              }
            });
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api"
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      let result = res;
                      var params = currentmodule.config.params;
                      let x = [],
                        y = [],
                        unit = "",
                        label = "";
                      if (result && result.length > 0) {
                        for (var i = 0; i < result.length; i++) {
                          if (result[0].metricValues[0].unit === "kb/sec") {
                            result[i].metricValues[0].value =
                              result[i].metricValues[0].value / 1000;
                          }
                          if (
                            (result[i].metricValues[0].metric.dpm && result[i].metricValues[0].value !== null) || (result[i].metricValues[0].metric.dpm ? result[i].metricValues[0].value : num_to_fixed(result[i].metricValues[0].value, 3)) != 0
                          ) {
                            x.push(
                              result[i].group.argument || result[i].group.label
                            );
                            y.push(
                              (result[i].metricValues[0].metric.dpm ? result[i].metricValues[0].value : num_to_fixed(result[i].metricValues[0].value, 3))
                            );
                          }
                          // if (i == 0) {
                          //   unit = replace_unit(result[0].metricValues[0]);
                          //   label = replace_disp_str(
                          //     result[0].metricValues[0].metric.label
                          //   );
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
                      params.color =
                        params.color.length > x.length
                          ? params.color.slice(0, x.length)
                          : params.color;
                      params.style.color =
                        params.style.color.length > x.length
                          ? params.style.color.slice(0, x.length)
                          : params.style.color;
                      var data = {
                        x: params.moduledatas.x,
                        y: params.moduledatas.y,
                        label: params.moduledatas.label
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                      var widgets = moduledefault.Bingtu(params);
                      currentmodule.config.widgets = widgets;
                      this.$nextTick(() => {
                        if (
                          currentmodule.config.datas &&
                          currentmodule.config.chart
                        ) {
                          if (currentmodule.chart) {
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          } else {
                            var myChart = echarts.init(
                              document.getElementById(id)
                            );
                            currentmodule.chart = myChart;
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            // currentmodule.chart.resize();
                          }
                        }
                      });
                    }.bind(this)
                  );
                }
              }
            }
          }
        } //if_end
      } //for_end
    },
    // 重新设置饼图的样式，涉及到函数
    reShixinbingtu(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          // 如果是静态数据
          if (
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "default") ||
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "api" &&
              !currentmodule.config.api)
          ) {
            var params = currentmodule.config.params;
              params.moduledatas.dpmComposition = false;
              params.moduledatas.dpmStackSingle = false;
            var widgets = moduledefault.Shixinbingtu(params);
            currentmodule.config.widgets = widgets;
            this.$nextTick(() => {
              if (currentmodule.config.datas && currentmodule.config.chart) {
                if (currentmodule.chart) {
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                } else {
                  var myChart = echarts.init(document.getElementById(id));
                  currentmodule.chart = myChart;
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                }
              }
            });
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api"
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      let result = res;
                      console.log('result',result)
                      var params = currentmodule.config.params;
                      let x = [],
                        y = [],
                        unit = "",
                        label = "";
                      if (result && result.length > 0) {
                        for (var i = 0; i < result.length; i++) {
                          if (result[i].metricValues[0].unit === "kb/sec") {
                            result[i].metricValues[0].value =
                              result[i].metricValues[0].value / 1000;
                          }
                          if (
                            (result[i].metricValues[0].metric.dpm && result[i].metricValues[0].value !== null) || (result[i].metricValues[0].metric.dpm ? result[i].metricValues[0].value : num_to_fixed(result[i].metricValues[0].value, 3)) != 0
                          ) {
                            x.push(
                              result[i].group.argument || result[i].group.label
                            );
                            y.push(
                              (result[i].metricValues[0].metric.dpm ? result[i].metricValues[0].value : num_to_fixed(result[i].metricValues[0].value, 3))
                            );
                          }
                          
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
                      params.color =
                        params.color.length > x.length
                          ? params.color.slice(0, x.length)
                          : params.color;
                      params.style.color =
                        params.style.color.length > x.length
                          ? params.style.color.slice(0, x.length)
                          : params.style.color;
                      var data = {
                        x: params.moduledatas.x,
                        y: params.moduledatas.y,
                        label: params.moduledatas.label
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                      var widgets = moduledefault.Shixinbingtu(params);
                      console.log("widgets",widgets)
                                            console.log("widgets-params",params)
                      currentmodule.config.widgets = widgets;
                      this.$nextTick(() => {
                        if (
                          currentmodule.config.datas &&
                          currentmodule.config.chart
                        ) {
                          if (currentmodule.chart) {
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          } else {
                            var myChart = echarts.init(
                              document.getElementById(id)
                            );
                            currentmodule.chart = myChart;
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          }
                        }
                      });
                    }.bind(this)
                  );
                }
              }
            }
          }
        } //if_end
      } //for_end
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

    timeToSeconds(timeStr) {
      const parts = timeStr.split(':');
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parseInt(parts[2]);
      return hours * 3600+ minutes * 60+ seconds;
    },
    // 重新设置表格
    reBiaoge(j, id) {
 const runtimeItem = this.imgmodules.find(item => item.id == id);
 if (isDpmRuntimeTable(runtimeItem)) { refreshDpmRuntimeTable(this, runtimeItem); return; }

  console.log("biao====")
  for (let i = 0; i < this.imgmodules.length; i++) {
    if (this.imgmodules[i].id == id) {
      this.biaogeCurrentmodule = JSON.parse(JSON.stringify(this.imgmodules[i]));
      var currentmodule = this.imgmodules[i];

      // 确保 widgets/x/y 存在
      const widgets = currentmodule.config.widgets || (currentmodule.config.widgets = {});
      if (!Array.isArray(widgets.x)) this.$set(widgets, 'x', []);
      if (!Array.isArray(widgets.y)) this.$set(widgets, 'y', []);

      // 保证 headerStyle（仅缺省时补）
      if (!widgets.headerStyle) {
        this.$set(widgets, 'headerStyle', {
          height: 44,
          background: '#0F1C29',
          border: { color: '#243041', width: 1 },
          text: { size: 14, color: '#A6B2C0', weight: 600 }
        });
      }

      // 先关列渲染，等表格先挂载；下一帧再打开
      if (currentmodule._columnsReady !== false) {
        this.$set(currentmodule, '_columnsReady', false);
      }
      this.$nextTick(() => {
        this.$set(currentmodule, '_columnsReady', true);
      });

      // 第一次渲染后：若没用 headerStyle.border，则用 jQuery 给 th 画底边
      this.$nextTick(() => {
        const hs = (currentmodule.config && currentmodule.config.widgets && currentmodule.config.widgets.headerStyle) || {};
        if (!(hs.border && hs.border.color && (hs.border.width || hs.border.width === 0))) {
          $("#" + currentmodule.id + " .el-table th.el-table__cell.is-leaf").css("borderBottom", currentmodule.style.border);
        }
        $("#" + currentmodule.id + " .el-table td.el-table__cell").css("borderBottom", currentmodule.style.border);
        $("#" + currentmodule.id + " .el-table.el-table--border .el-table__cell").css("borderRight", currentmodule.style.border);
        // 移除表格的外边框，只保留内部边框
        $("#" + currentmodule.id + " .el-table.el-table--border").css("border", "none");
      });

      // 静态/接口数据
      if (currentmodule.config.datas && currentmodule.config.datastype == "default") {
        // 保留你的原逻辑
      } else if (currentmodule.config.datas && currentmodule.config.datastype == "api") {
        if (currentmodule.config.api) {
          var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
          var objExp = new RegExp(Expression);
          if (objExp.test(currentmodule.config.api) === true) {
            let newUrl = currentmodule.config.api.indexOf("/NetInside/") !== -1
              ? '/NetInside/' + currentmodule.config.api.split("/NetInside/")[1]
              : currentmodule.config.api;

            currentmodule.config.widgets.y = [];
            this.ajaxs({ url: newUrl, widget: currentmodule.type, componentId: currentmodule.id }).then(function (res) {
              let result = res;
              var widgets = currentmodule.config.widgets;

              let x = [], y = [];
              if (result && result.length > 0) {
                x.push({});
                this.$set(x[0], "key",
                  result[0].group.label == "Unknown" ? "名称"
                    : (result[0].group.label == "已知应用" || result[0].group.label == "未知应用") ? "应用"
                    : result[0].group.label
                );

                for (var i = 0; i < result[0].metricValues.length; i++) {
                  result[0].metricValues[i].metric.label = replace_disp_str2(result[0].metricValues[i].metric.label);
                  x.push({
                    key: replace_unit(result[0].metricValues[i])
                      ? (result[0].metricValues[i].metric.label + "[" + replace_unit(result[0].metricValues[i]) + "]")
                      : result[0].metricValues[i].metric.label,
                    value: result[0].metricValues[i].metric.id
                  });
                }

                for (var i = 0; i < result.length; i++) {
                  for (var j = 0; j < result[i].metricValues.length; j++) {
                    if (j == 0) {
                      y.push({ key0: result[i].group.argument || result[i].group.label });
                    }
                    if (result[i].metricValues[j].unit && result[i].metricValues[j].value !== null && !result[i].metricValues[j].metric.dpm) {
                      if (result[i].metricValues[j].unit === "kb/sec") {
                        result[i].metricValues[j].value = num_to_fixed(result[i].metricValues[j].value / 1000, 3);
                      } else if (result[i].metricValues[j].unit === "msec") {
                        result[i].metricValues[j].value = num_to_fixed(result[i].metricValues[j].value, 4);
                      } else {
                        result[i].metricValues[j].value = num_to_fixed(result[i].metricValues[j].value, 3);
                      }
                    }

                    // 阈值（保持你的原逻辑）……
                    // y[i]["bg"+(j+1)] = ...
                    y[i]["key" + (j + 1)] = result[i].metricValues[j].value;
                  }
                }
              }

              widgets.x = x || [];
              widgets.y = y || [];
              currentmodule.config.widgetdata = JSON.stringify({ x: widgets.x, y: widgets.y }, null, 2);

              // ★ 数据刷新后：强制重建列（避免 tableId/$refs 空）
              this.$nextTick(() => {
                this.$set(currentmodule, '_columnsReady', false);
                this.$nextTick(() => {
                  this.$set(currentmodule, '_columnsReady', true);
                });
              });

              // ★ 同步边框（依旧保留“表头双描边”判断）
              this.$nextTick(() => {
                const hs = (currentmodule.config && currentmodule.config.widgets && currentmodule.config.widgets.headerStyle) || {};
                if (!(hs.border && hs.border.color && (hs.border.width || hs.border.width === 0))) {
                  $("#" + currentmodule.id + " .el-table th.el-table__cell.is-leaf").css("borderBottom", currentmodule.style.border);
                }
                $("#" + currentmodule.id + " .el-table td.el-table__cell").css("borderBottom", currentmodule.style.border);
                $("#" + currentmodule.id + " .el-table.el-table--border .el-table__cell").css("borderRight", currentmodule.style.border);
                // 移除表格的外边框，只保留内部边框
                $("#" + currentmodule.id + " .el-table.el-table--border").css("border", "none");
              });
            }.bind(this));
          }
        }
      }
    } // if_end
  } // for_end
},


    formatter1(text){
        return text.toFixed(3)
    },
    formatter2(text){
        return text.toFixed(0)
    },
    // 重新设置数字图
    async reShuzitu(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          // 如果是静态数据
          if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "default"
          ) {
            // var widgets = currentmodule.config.widgets;
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api"
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  await this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      let result = res;
                      var widgets = currentmodule.config.widgets;
                      //  if (result.length<=0) {
                      //    return;
                      //  }
                      let text = "",
                        unit = "";
                      if (result && result.length > 0) {
                        result.forEach((item, index) => {
                          if (item.metricValues[0].unit === "kb/sec") {
                            item.metricValues[0].value =
                              item.metricValues[0].value / 1000;
                          }
                          text = num_to_fixed(item.metricValues[0].value, 3);
                          unit = replace_unit(item.metricValues[0]);
                        });
                        // this.$refs[id][0].start()
                        if (currentmodule.config.threshold) {
                          currentmodule.config.threshold[0].Minor
                            ? (currentmodule.config.threshold[0].Minor = parseFloat(
                                currentmodule.config.threshold[0].Minor
                              ))
                            : (currentmodule.config.threshold[0].Minor = "");
                          currentmodule.config.threshold[0].Major
                            ? (currentmodule.config.threshold[0].Major = parseFloat(
                                currentmodule.config.threshold[0].Major
                              ))
                            : (currentmodule.config.threshold[0].Major = "");
                          currentmodule.config.threshold[0].Critical
                            ? (currentmodule.config.threshold[0].Critical = parseFloat(
                                currentmodule.config.threshold[0].Critical
                              ))
                            : (currentmodule.config.threshold[0].Critical = "");
                          if (
                            currentmodule.config.threshold[0].Minor &&
                            currentmodule.config.threshold[0].Major &&
                            currentmodule.config.threshold[0].Critical
                          ) {
                            // console.log('currentmodule.config.widgets.style.color',currentmodule.config.widgets.style.color)
                            // currentmodule.config.widgets.style.color =
                            //   "#ffffff";
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                text >
                                  currentmodule.config.threshold[0].Minor &&
                                text < currentmodule.config.threshold[0].Major
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ffff00";
                              } else if (
                                text >
                                  currentmodule.config.threshold[0].Major &&
                                text <
                                  currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff9900";
                              } else if (
                                text >
                                currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff0000";
                              }
                            } else {
                              if (
                                text <
                                  currentmodule.config.threshold[0].Minor &&
                                text > currentmodule.config.threshold[0].Major
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ffff00";
                              } else if (
                                text <
                                  currentmodule.config.threshold[0].Major &&
                                text >
                                  currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff9900";
                              } else if (
                                text <
                                currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff0000";
                              }
                            }
                          } else if (
                            currentmodule.config.threshold[0].Minor &&
                            currentmodule.config.threshold[0].Major &&
                            !currentmodule.config.threshold[0].Critical
                          ) {
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                text >
                                  currentmodule.config.threshold[0].Minor &&
                                text < currentmodule.config.threshold[0].Major
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ffff00";
                              } else if (
                                text > currentmodule.config.threshold[0].Major
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff9900";
                              }
                            } else {
                              if (
                                text <
                                  currentmodule.config.threshold[0].Minor &&
                                text > currentmodule.config.threshold[0].Major
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ffff00";
                              } else if (
                                text < currentmodule.config.threshold[0].Major
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff9900";
                              }
                            }
                          } else if (
                            currentmodule.config.threshold[0].Minor &&
                            !currentmodule.config.threshold[0].Major &&
                            currentmodule.config.threshold[0].Critical
                          ) {
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                text >
                                  currentmodule.config.threshold[0].Minor &&
                                text <
                                  currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ffff00";
                              } else if (
                                text >
                                currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff0000";
                              }
                            } else {
                              if (
                                text <
                                  currentmodule.config.threshold[0].Minor &&
                                text >
                                  currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ffff00";
                              } else if (
                                text <
                                currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff0000";
                              }
                            }
                          } else if (
                            !currentmodule.config.threshold[0].Minor &&
                            currentmodule.config.threshold[0].Major &&
                            currentmodule.config.threshold[0].Critical
                          ) {
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                text >
                                  currentmodule.config.threshold[0].Major &&
                                text <
                                  currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff9900";
                              } else if (
                                text >
                                currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff0000";
                              }
                            } else {
                              if (
                                text <
                                  currentmodule.config.threshold[0].Major &&
                                text >
                                  currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff9900";
                              } else if (
                                text <
                                currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff0000";
                              }
                            }
                          } else if (
                            currentmodule.config.threshold[0].Minor &&
                            !currentmodule.config.threshold[0].Major &&
                            !currentmodule.config.threshold[0].Critical
                          ) {
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                text > currentmodule.config.threshold[0].Minor
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ffff00";
                              }
                            } else {
                              if (
                                text < currentmodule.config.threshold[0].Minor
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ffff00";
                              }
                            }
                          } else if (
                            !currentmodule.config.threshold[0].Minor &&
                            currentmodule.config.threshold[0].Major &&
                            !currentmodule.config.threshold[0].Critical
                          ) {
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                text > currentmodule.config.threshold[0].Major
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff9900";
                              }
                            } else {
                              if (
                                text < currentmodule.config.threshold[0].Major
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff9900";
                              }
                            }
                          } else if (
                            !currentmodule.config.threshold[0].Minor &&
                            !currentmodule.config.threshold[0].Major &&
                            currentmodule.config.threshold[0].Critical
                          ) {
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                text >
                                currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff0000";
                              }
                            } else {
                              if (
                                text <
                                currentmodule.config.threshold[0].Critical
                              ) {
                                currentmodule.config.widgets.style.color =
                                  "#ff0000";
                              }
                            }
                          }
                        }
                      }

                      widgets.text = text || "";
                      widgets.unit = unit || "";
                      var data = {
                        text: widgets.text,
                        unit: widgets.unit
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                    }.bind(this)
                  );
                }
              }
            }
          }
        } //if_end
      } //for_end
    },
    // 重新设置单行文本
    reDanhangwenben(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          // 如果是静态数据
          if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "default"
          ) {
            // var widgets = currentmodule.config.widgets;
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api"
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      var widgets = currentmodule.config.widgets;
                      if (res.length <= 0) {
                        return;
                      }
                      //  if(!JSON.parse(res.data).text){
                      //    return;
                      //  }
                      let text = "";
                      res.forEach((item, index) => {
                        text = item.metricValues[0].value;
                      });
                      widgets.text = text || "";
                      var data = {
                        text: widgets.text
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                    }.bind(this)
                  );
                }
              }
            }
          }
        } //if_end
      } //for_end
    },
    // 重新设置进度环图
    reJinduhuantu(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          // 如果是静态数据
          if (
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "default") ||
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "api" &&
              !currentmodule.config.api)
          ) {
            var params = currentmodule.config.params;
              params.dpm = false;
            var widgets = moduledefault.Jinduhuantu(params);
            currentmodule.config.widgets = widgets;
            this.$nextTick(() => {
              if (currentmodule.config.datas && currentmodule.config.chart) {
                if (currentmodule.chart) {
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                } else {
                  var myChart = echarts.init(document.getElementById(id));
                  currentmodule.chart = myChart;
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                }
              }
            });
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api"
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      let result = res;
                      var params = currentmodule.config.params;
                      let value = "",
                        name = "",
                        unit = "";
                      if (result && result.length > 0) {
                        result.forEach((item, index) => {
                          if (item.metricValues[0].unit === "kb/sec") {
                            item.metricValues[0].value =
                              item.metricValues[0].value / 1000;
                          }
                          if (currentmodule.config.numtype === "负向" && !item.metricValues[0].metric.dpm) {
                            value =
                              100 -
                              Number(
                                num_to_fixed(item.metricValues[0].value, 2)
                              );
                          } else {
                            value = Number(
                              num_to_fixed(item.metricValues[0].value, 2)
                            );
                          }

                          name = replace_disp_str(
                            item.metricValues[0].metric.label
                          );
                        });
                        if (currentmodule.config.threshold) {
                          currentmodule.config.threshold[0].Minor
                            ? (currentmodule.config.threshold[0].Minor = parseFloat(
                                currentmodule.config.threshold[0].Minor
                              ))
                            : (currentmodule.config.threshold[0].Minor = "");
                          currentmodule.config.threshold[0].Major
                            ? (currentmodule.config.threshold[0].Major = parseFloat(
                                currentmodule.config.threshold[0].Major
                              ))
                            : (currentmodule.config.threshold[0].Major = "");
                          currentmodule.config.threshold[0].Critical
                            ? (currentmodule.config.threshold[0].Critical = parseFloat(
                                currentmodule.config.threshold[0].Critical
                              ))
                            : (currentmodule.config.threshold[0].Critical = "");
                          if (
                            currentmodule.config.threshold[0].Minor &&
                            currentmodule.config.threshold[0].Major &&
                            currentmodule.config.threshold[0].Critical
                          ) {
                            params.color[0] = "#ffffff";
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                value >
                                  currentmodule.config.threshold[0].Minor &&
                                value < currentmodule.config.threshold[0].Major
                              ) {
                                params.color[0] = "#ffff00";
                              } else if (
                                value >
                                  currentmodule.config.threshold[0].Major &&
                                value <
                                  currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ff9900";
                              } else if (
                                value >
                                currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ff0000";
                              }
                            } else {
                              if (
                                value <
                                  currentmodule.config.threshold[0].Minor &&
                                value > currentmodule.config.threshold[0].Major
                              ) {
                                params.color[0] = "#ffff00";
                              } else if (
                                value <
                                  currentmodule.config.threshold[0].Major &&
                                value >
                                  currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ff9900";
                              } else if (
                                value <
                                currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ff0000";
                              }
                            }
                          } else if (
                            currentmodule.config.threshold[0].Minor &&
                            currentmodule.config.threshold[0].Major &&
                            !currentmodule.config.threshold[0].Critical
                          ) {
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                value >
                                  currentmodule.config.threshold[0].Minor &&
                                value < currentmodule.config.threshold[0].Major
                              ) {
                                params.color[0] = "#ffff00";
                              } else if (
                                value > currentmodule.config.threshold[0].Major
                              ) {
                                params.color[0] = "#ff9900";
                              }
                            } else {
                              if (
                                value <
                                  currentmodule.config.threshold[0].Minor &&
                                value > currentmodule.config.threshold[0].Major
                              ) {
                                params.color[0] = "#ffff00";
                              } else if (
                                value < currentmodule.config.threshold[0].Major
                              ) {
                                params.color[0] = "#ff9900";
                              }
                            }
                          } else if (
                            currentmodule.config.threshold[0].Minor &&
                            !currentmodule.config.threshold[0].Major &&
                            currentmodule.config.threshold[0].Critical
                          ) {
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                value >
                                  currentmodule.config.threshold[0].Minor &&
                                value <
                                  currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ffff00";
                              } else if (
                                value >
                                currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ff0000";
                              }
                            } else {
                              if (
                                value <
                                  currentmodule.config.threshold[0].Minor &&
                                value >
                                  currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ffff00";
                              } else if (
                                value <
                                currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ff0000";
                              }
                            }
                          } else if (
                            !currentmodule.config.threshold[0].Minor &&
                            currentmodule.config.threshold[0].Major &&
                            currentmodule.config.threshold[0].Critical
                          ) {
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                value >
                                  currentmodule.config.threshold[0].Major &&
                                value <
                                  currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ff9900";
                              } else if (
                                value >
                                currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ff0000";
                              }
                            } else {
                              if (
                                value <
                                  currentmodule.config.threshold[0].Major &&
                                value >
                                  currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ff9900";
                              } else if (
                                value <
                                currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ff0000";
                              }
                            }
                          } else if (
                            currentmodule.config.threshold[0].Minor &&
                            !currentmodule.config.threshold[0].Major &&
                            !currentmodule.config.threshold[0].Critical
                          ) {
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                value > currentmodule.config.threshold[0].Minor
                              ) {
                                params.color[0] = "#ffff00";
                              }
                            } else {
                              if (
                                value < currentmodule.config.threshold[0].Minor
                              ) {
                                params.color[0] = "#ffff00";
                              }
                            }
                          } else if (
                            !currentmodule.config.threshold[0].Minor &&
                            currentmodule.config.threshold[0].Major &&
                            !currentmodule.config.threshold[0].Critical
                          ) {
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                value > currentmodule.config.threshold[0].Major
                              ) {
                                params.color[0] = "#ff9900";
                              }
                            } else {
                              if (
                                value < currentmodule.config.threshold[0].Major
                              ) {
                                params.color[0] = "#ff9900";
                              }
                            }
                          } else if (
                            !currentmodule.config.threshold[0].Minor &&
                            !currentmodule.config.threshold[0].Major &&
                            currentmodule.config.threshold[0].Critical
                          ) {
                            if (
                              currentmodule.config.threshold[0].symbol ===
                                ">" ||
                              currentmodule.config.threshold[0].symbol === ">="
                            ) {
                              if (
                                value >
                                currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ff0000";
                              }
                            } else {
                              if (
                                value <
                                currentmodule.config.threshold[0].Critical
                              ) {
                                params.color[0] = "#ff0000";
                              }
                            }
                          }
                        }
                      }
                      params.value = value || "0";
                      params.name = name || "百分比";
                      params.unit = unit;
                      setDpmScalar(params, result, currentmodule.config.api);
                      var data = {
                        value: params.value,
                        name: params.name
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                      var widgets = moduledefault.Jinduhuantu(params);
                      currentmodule.config.widgets = widgets;
                      this.$nextTick(() => {
                        if (
                          currentmodule.config.datas &&
                          currentmodule.config.chart
                        ) {
                          if (currentmodule.chart) {
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          } else {
                            var myChart = echarts.init(
                              document.getElementById(id)
                            );
                            currentmodule.chart = myChart;
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          }
                        }
                      });
                    }.bind(this)
                  );
                }
              }
            }
          }
        } //if_end
      } //for_end
    },
    // 重新设置仪表盘
    reYibiaopan(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          // 如果是静态数据
          if (
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "default") ||
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "api" &&
              !currentmodule.config.api)
          ) {
            var params = currentmodule.config.params;
              params.dpm = false;
            var widgets = moduledefault.Yibiaopan(params);
            currentmodule.config.widgets = widgets;
            this.$nextTick(() => {
              if (currentmodule.config.datas && currentmodule.config.chart) {
                if (currentmodule.chart) {
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                } else {
                  var myChart = echarts.init(document.getElementById(id));
                  currentmodule.chart = myChart;
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                }
              }
            });
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api"
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      let result = res;
                      var params = currentmodule.config.params;
                      let value = "",
                        name = "";
                      if (result && result.length > 0) {
                        result.forEach((item, index) => {
                          if (item.metricValues[0].unit === "kb/sec") {
                            item.metricValues[0].value =
                              item.metricValues[0].value / 1000;
                          }
                          value = num_to_fixed(item.metricValues[0].value, 2);
                          name = replace_disp_str(
                            item.metricValues[0].metric.label
                          );
                        });
                      }
                      params.value = value || "0";
                      params.name = name || "流向";
                      setDpmScalar(params, result, currentmodule.config.api);
                      var data = {
                        value: params.value,
                        name: params.name
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                      var widgets = moduledefault.Yibiaopan(params);
                      currentmodule.config.widgets = widgets;
                      this.$nextTick(() => {
                        if (
                          currentmodule.config.datas &&
                          currentmodule.config.chart
                        ) {
                          if (currentmodule.chart) {
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          } else {
                            var myChart = echarts.init(
                              document.getElementById(id)
                            );
                            currentmodule.chart = myChart;
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          }
                        }
                      });
                    }.bind(this)
                  );
                }
              }
            }
          }
        } //if_end
      } //for_end
    },
    // 面积图重新绘制
    reMianjitu(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          // 如果是静态数据
          if (
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "default") ||
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "api" &&
              !currentmodule.config.api)
          ) {
            var params = currentmodule.config.params;
              params.moduledatas.dpm = false;
            var widgets = moduledefault.Mianjitu(params);
            currentmodule.config.widgets = widgets;
            this.$nextTick(() => {
              if (currentmodule.config.datas && currentmodule.config.chart) {
                if (currentmodule.chart) {
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                } else {
                  var myChart = echarts.init(document.getElementById(id));
                  currentmodule.chart = myChart;
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                }
              }
            });
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api"
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      let result = res;
                      var params = currentmodule.config.params;
                      let x = [],
                        y = [],
                        label = [],
                        unit = [];
                      params.moduledatas.dpm = false;
                      if (result && result.provider === 'dpm') {
                        const data = dpmChartData(result, time => this.$moment(time * 1000).format('MM-DD HH:mm:ss'));
                        Object.assign(params.moduledatas, data);
                        x = data.x; y = data.y; label = data.label; unit = data.unit;
                      } else if (result) {
                        for (var i = 0; i < result.metricValues.length; i++) {
                          result.metricValues[
                            i
                          ].metric.label = replace_disp_str2(
                            result.metricValues[i].metric.label
                          );
                          label.push(result.metricValues[i].metric.label);
                          unit.push(replace_unit2(result.metricValues[i]));
                          // 千比特每秒转换成兆比特每秒,毫秒转化成秒
                          if (result.metricValues[i].unit == "kb/sec") {
                            for (
                              var j = 0;
                              j < result.metricValues[i].values.length;
                              j++
                            ) {
                              result.metricValues[i].values[j] = num_to_fixed(
                                result.metricValues[i].values[j] / 1000,
                                3
                              );
                            }
                          } else if (result.metricValues[i].unit == "msec") {
                            result.metricValues[i].values[j] = num_to_fixed(
                              result.metricValues[i].values[j] / 1000,
                              4
                            );
                          } else {
                            for (
                              var j = 0;
                              j < result.metricValues[i].values.length;
                              j++
                            ) {
                              result.metricValues[i].values[j] = num_to_fixed(
                                result.metricValues[i].values[j],
                                3
                              );
                            }
                          }
                          y.push(result.metricValues[i].values);
                        }
                        var granularity =
                          (result.interval.end - result.interval.start) /
                          y[0].length;
                        var time = result.interval.start;
                        for (i = 0; i < y[0].length; i++) {
                          time = i > 0 ? time + granularity : time;
                          x.push(
                            this.$moment(parseInt(time) * 1000).format("MM-DD hh:mm")
                          );
                        }
                      }
                      params.moduledatas.x = x || [];
                      params.moduledatas.y = y || [];
                      params.moduledatas.label = label || [];
                      params.moduledatas.unit = unit || [];
                      params.moduledatas.style.y =
                        params.moduledatas.style.y.length >
                        params.moduledatas.y.length
                          ? params.moduledatas.style.y.slice(
                              0,
                              params.moduledatas.y.length
                            )
                          : params.moduledatas.style.y;
                      var data = {
                        x: params.moduledatas.x,
                        y: params.moduledatas.y,
                        label: params.moduledatas.label
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                      var widgets = moduledefault.Mianjitu(params);
                      currentmodule.config.widgets = widgets;
                      this.$nextTick(() => {
                        if (
                          currentmodule.config.datas &&
                          currentmodule.config.chart
                        ) {
                          if (currentmodule.chart) {
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          } else {
                            var myChart = echarts.init(
                              document.getElementById(id)
                            );

                            currentmodule.chart = myChart;
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          }
                        }
                      });
                    }.bind(this)
                  );
                }
              }
            }
          }
        } //if_end
      }
    },
    // 折线图重新绘制
    reZhexiantu(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          // 如果是静态数据
          if (
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "default") ||
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "api" &&
              !currentmodule.config.api)
          ) {
            var params = currentmodule.config.params;
              params.moduledatas.dpm = false;
            var widgets = moduledefault.Zhexiantu(params);
            currentmodule.config.widgets = widgets;
            this.$nextTick(() => {
              if (currentmodule.config.datas && currentmodule.config.chart) {
                if (currentmodule.chart) {
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                } else {
                  var myChart = echarts.init(document.getElementById(id));
                  currentmodule.chart = myChart;
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                }
              }
            });
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api"
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      let result = res;
                      var params = currentmodule.config.params;
                      let x = [],
                        y = [],
                        label = [],
                        unit = [];
                      params.moduledatas.dpm = false;
                      if (result && result.provider === 'dpm') {
                        const data = dpmChartData(result, time => this.$moment(time * 1000).format('MM-DD HH:mm:ss'));
                        Object.assign(params.moduledatas, data);
                        x = data.x; y = data.y; label = data.label; unit = data.unit;
                      } else if (result) {
                        for (var i = 0; i < result.metricValues.length; i++) {
                          result.metricValues[
                            i
                          ].metric.label = replace_disp_str2(
                            result.metricValues[i].metric.label
                          );
                          label.push(result.metricValues[i].metric.label);
                          unit.push(replace_unit2(result.metricValues[i]));
                          if (result.metricValues[i].unit == "kb/sec") {
                            for (
                              var j = 0;
                              j < result.metricValues[i].values.length;
                              j++
                            ) {
                              result.metricValues[i].values[j] = num_to_fixed(
                                result.metricValues[i].values[j] / 1000,
                                3
                              );
                            }
                          } else if (result.metricValues[i].unit == "msec") {
                            for (
                              var j = 0;
                              j < result.metricValues[i].values.length;
                              j++
                            ) {
                              result.metricValues[i].values[j] = num_to_fixed(
                                result.metricValues[i].values[j] / 1000,
                                4
                              );
                            }
                          } else {
                            for (
                              var j = 0;
                              j < result.metricValues[i].values.length;
                              j++
                            ) {
                              result.metricValues[i].values[j] = num_to_fixed(
                                result.metricValues[i].values[j],
                                3
                              );
                            }
                          }
                          y.push(result.metricValues[i].values);
                        }
                        var granularity =
                          (result.interval.end - result.interval.start) /
                          y[0].length;
                        var time = result.interval.start;
                        for (i = 0; i < y[0].length; i++) {
                          time = i > 0 ? time + granularity : time;
                          x.push(
                            this.$moment(parseInt(time) * 1000).format(
                              "MM-DD HH:mm"
                            )
                          );
                        }
                      }

                      params.moduledatas.x = x || [];
                      params.moduledatas.y = y || [];
                      params.moduledatas.label = label || [];
                      params.moduledatas.unit = unit || [];
                      params.moduledatas.style.y =
                        params.moduledatas.style.y.length >
                        params.moduledatas.y.length
                          ? params.moduledatas.style.y.slice(
                              0,
                              params.moduledatas.y.length
                            )
                          : params.moduledatas.style.y;
                      var data = {
                        x: params.moduledatas.x,
                        y: params.moduledatas.y,
                        label: params.moduledatas.label
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                      var widgets = moduledefault.Zhexiantu(params);
                      currentmodule.config.widgets = widgets;
                      this.$nextTick(() => {
                        if (
                          currentmodule.config.datas &&
                          currentmodule.config.chart
                        ) {
                          if (currentmodule.chart) {
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          } else {
                            var myChart = echarts.init(
                              document.getElementById(id)
                            );
                            currentmodule.chart = myChart;
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          }
                        }
                      });
                    }.bind(this)
                  );
                }
              }
            }
          }
        } //if_end
      }
    },
    // 根据开始时间结束时间生成间隔相等的时间点数组
    getDateArray(startDate, endDate, space) {
      space = space * 1000;
    },
    // 基础柱状图数据重新编排页面样式
    reZongxiangzhuzhuangtu(j, id) {
      for (let i = 0; i < this.imgmodules.length; i++) {
        if (this.imgmodules[i].id == id) {
          var currentmodule = this.imgmodules[i];
          if (currentmodule.config.datas && currentmodule.config.datastype === "api" && isDpmUrl(currentmodule.config.api)) {
            refreshDpmVerticalBar(this, currentmodule, moduledefault.Zongxiangzhuzhuangtu, () => echarts.init(document.getElementById(id)));
            continue;
          }
          resetDpmVerticalBar(currentmodule);
          // 如果是静态数据
          if (
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "default") ||
            (currentmodule.config.datas &&
              currentmodule.config.datastype == "api" &&
              !currentmodule.config.api)
          ) {
            var params = currentmodule.config.params;
            params.x = JSON.parse(currentmodule.config.widgetdata).x;
            params.y = JSON.parse(currentmodule.config.widgetdata).y;
            params.moduledatas.y = JSON.parse(
              currentmodule.config.widgetdata
            ).y;
            params.moduledatas.x = JSON.parse(
              currentmodule.config.widgetdata
            ).x;
            var widgets = moduledefault.Zongxiangzhuzhuangtu(params);
            currentmodule.config.widgets = widgets;
            this.$nextTick(() => {
              if (currentmodule.config.datas && currentmodule.config.chart) {
                if (currentmodule.chart) {
                  currentmodule.chart.clear();
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                } else {
                  var myChart = echarts.init(document.getElementById(id));
                  currentmodule.chart = myChart;
                  currentmodule.chart.setOption(currentmodule.config.widgets, {
                    lazyUpdate: true
                  });
                  //currentmodule.chart.resize();
                }
              }
            });
            // 如果是api请求数据
          } else if (
            currentmodule.config.datas &&
            currentmodule.config.datastype == "api" &&
            currentmodule.config.api
          ) {
            if (
              currentmodule.config.datas &&
              currentmodule.config.datastype == "api"
            ) {
              if (currentmodule.config.api) {
                var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                var objExp = new RegExp(Expression);
                if (objExp.test(currentmodule.config.api) == true) {
                  let newUrl = ''
                  if(currentmodule.config.api.indexOf("/NetInside/")!==-1){
                    newUrl = '/NetInside/'+currentmodule.config.api.split("/NetInside/")[1]
                  }else{
                    newUrl = currentmodule.config.api
                  }
                  console.log('newUrl',newUrl)
                  var param = {
                    url: newUrl
                  };
                  this.ajaxs(Object.assign({}, param, { widget: currentmodule.type, componentId: currentmodule.id })).then(
                    function(res) {
                      let result = res;
                      var params = currentmodule.config.params;
                      let x = [],
                        y = [],
                        label = [],
                        sortArray = [],
                        unit = "";
                      if (result && result.length > 0) {
                        result.forEach((item, index) => {
                          if (item.metricValues[0].unit === "kb/sec") {
                            item.metricValues[0].value =
                              item.metricValues[0].value / 1000;
                          }
                          sortArray.push({
                            argument: item.group.argument || item.group.label,
                            value: item.metricValues[0].value,
                            unit: item.metricValues[0].unit
                          });
                          if (index === 0) {
                            item.metricValues[0].metric.label = replace_disp_str(
                              item.metricValues[0].metric.label
                            );
                            label.push(item.metricValues[0].metric.label);
                            unit = replace_unit(item.metricValues[0]);
                          }
                        });
                        sortArray.sort(descCompare("value"));
                        sortArray.forEach((item, index) => {
                          if ((result[0].metricValues[0].metric.dpm && item.value !== null) || num_to_fixed(item.value, 3) != 0) {
                            x.push(item.argument);
                            y.push(result[0].metricValues[0].metric.dpm ? item.value : num_to_fixed(item.value, 3));
                          }
                        });
                      }
                      params.moduledatas.x = x || [];
                      params.moduledatas.y = [y] || [];
                      params.moduledatas.label = label || [];
                      params.moduledatas.unit = unit || "";
                      var data = {
                        x: params.moduledatas.x,
                        y: params.moduledatas.y,
                        label: params.moduledatas.label
                      };
                      currentmodule.config.widgetdata = JSON.stringify(
                        data,
                        null,
                        2
                      );
                      var widgets = moduledefault.Zongxiangzhuzhuangtu(params);
                      currentmodule.config.widgets = widgets;
                      this.$nextTick(() => {
                        if (
                          currentmodule.config.datas &&
                          currentmodule.config.chart
                        ) {
                          if (currentmodule.chart) {
                            currentmodule.chart.clear();
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          } else {
                            var myChart = echarts.init(
                              document.getElementById(id)
                            );
                            currentmodule.chart = myChart;
                            currentmodule.chart.setOption(
                              currentmodule.config.widgets,
                              { lazyUpdate: true }
                            );
                            //currentmodule.chart.resize();
                          }
                        }
                      });
                    }.bind(this)
                  );
                } // if(objExp.test(currentmodule.config.api)==true)
              } // if (currentmodule.config.api)_end
            }
          }
        } //if_end
      }
    }, // reZongxiangzhuzhuangtu_end
    // api地址
    apiClick() {
      this.$refs.refApiModal.openApi();
    },
    apiInput(e) {
      var api = e.target.value.replace(/\s+/g, "");
      this.currentmodule.config.api = api;
    },
    apiChange(e) {
      var api = e.target.value;
      try {
        api = syncDpmUrl(api);
        this.currentmodule.config.api = api;
      } catch (error) {
        this.$Message.error(error.message);
        return;
      }
      var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
      var objExp = new RegExp(Expression);
      if (objExp.test(api) == true) {
        this.autoGetData(this.currentmodule.type, this.currentmodule.id);
      } else {
        this.$Message.info("维度和指标错误！");
      }
    },
    // 阈值设置
    thresholdSettings() {
      this.$refs.threshold.openModal();
    },
    // 阈值设置数据
    thresholdFun(val) {
      this.currentmodule.config.threshold = val;
      this.autoGetData(this.currentmodule.type, this.currentmodule.id);
    },
    ajaxs(params) {
      return new Promise((resolve, reject) => {
        this.ajax({ params }).then(
          (res) => {
            const item = this.imgmodules.find(item => item.id === params.componentId);
            if (item) prepareDpmWidgetResult(item, params.url, res);
            resolve(res);
          },
          (err) => {
            showDpmWidgetError(this.imgmodules.find(item => item.id === params.componentId), err);
            reject(err);
          }
        );
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import "../../assets/less/style.less";
.animation {
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
li {
  list-style-type: none;
}

/* 拖拽手柄样式 */
.module-drag-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: rgba(0, 0, 0, 0.2);
  cursor: move;
  z-index: 10;
}

/* 确保表格内容不被拖拽手柄遮挡 */
.imgmoduleitem {
  position: relative;
}

/* 移除表格内容的上边距，让表格紧贴着拖拽手柄 */
.imgmoduleitem > div:not(.module-drag-handle) {
  margin-top: 0;
}

.datamax {
  .view-container {
    position: absolute;
    top: 48px;
    width: 100%;
    bottom: 0px;
    cursor: default;
    // background: rgba(5, 48, 57, 1);
    // background-image:url('../../assets/images/bgImg.png');
    #view-profile {
      position: absolute;
      transform-origin: 0 0;
      left: 80px;
      top: 0px;
      bottom: 40px;
      overflow: auto;
      background-image: url("../../assets/images/bgImg.png");
      background-size: 100% 100%;
      background-repeat: no-repeat;
      #view-menu {
        position: absolute;
        width: 85px;
        background: #202020;
        z-index: 3002;
        ul {
          width: 100%;
          li {
            text-align: center;
            color: #868686;
            cursor: pointer;
            transition: 0.3s;
            padding: 5px;
          }
          li:hover {
            color: #ececec;
            background: #505050;
          }
        }
      }
      #view-imgs {
        position: absolute;
        transform-origin: 0 0;
        /* left: 10px; */
        /* top: 20px; */
        width: 100%;
        height: 100%;
        // background:url('../../assets/images/bgImg.png') no-repeat;
        #imggrid {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;
          #imggriddraw {
            width: 100%;
            height: 100%;
          }
        }
        #imgmodules,
        #zoom-container {
          position: absolute;
          left: 0px;
          width: 100%;
          height: 100%;
        }
        #zoom-container {
          .zoom-handles {
            border: 1px solid rgba(0, 0, 0, 0);
            position: absolute;
            z-index: 1000;
            .handle-left {
              cursor: w-resize;
              top: 50%;
              left: -8px;
              margin-top: -8px;
              z-index: 1001;
            }
            .handle-right {
              cursor: e-resize;
              top: 50%;
              right: -8px;
              margin-top: -8px;
              z-index: 1001;
            }
            .handle-top {
              cursor: n-resize;
              top: -8px;
              left: 50%;
              margin-left: -8px;
              z-index: 1001;
            }
            .handle-bottom {
              cursor: s-resize;
              left: 50%;
              bottom: -8px;
              margin-left: -8px;
              z-index: 1001;
            }
            .handle-leftbottom {
              cursor: sw-resize;
              bottom: -6px;
              left: -8px;
              z-index: 1001;
            }
            .handle-lefttop {
              cursor: nw-resize;
              top: -8px;
              left: -8px;
              z-index: 1001;
            }
            .handle-righttop {
              cursor: ne-resize;
              top: -8px;
              right: -8px;
              z-index: 1001;
            }
            .handle-rightbottom {
              cursor: se-resize;
              bottom: -8px;
              right: -8px;
              z-index: 1001;
            }
          }
        }
      }
      /* #view-imgs_end */
    }
    /* #view-profile_end */
  }
}
#drop-board {
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  -moz-box-sizing: border-box; /* Firefox */
  -webkit-box-sizing: border-box; /* Safari */
  border: 1px solid rgba(35, 195, 18, 1);
  z-index: 1000;
  .item-border {
    position: absolute;
    cursor: move;
    width: 100%;
    height: 100%;
  }
}
// Runtime tables receive their own clicks; resize handles retain pointer-events: auto.
#zoom-container.runtime-interactive-selection {
  pointer-events: none;
  #drop-board {
    pointer-events: none;
  }
}
.imgmoduleitem {
  box-sizing: border-box;
  -moz-box-sizing: border-box; /* Firefox */
  -webkit-box-sizing: border-box; /* Safari */
}
.zoom-handler {
  z-index: 3001;
  width: 16px;
  height: 16px;
  position: absolute;
  pointer-events: auto;
}
.zoom-handler:after {
  background: #fff;
  z-index: 3001;
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  top: 4px;
  left: 4px;
}
.imgmoduleitem {
  box-sizing: border-box;
  -moz-box-sizing: border-box; /* Firefox */
  -webkit-box-sizing: border-box; /* Safari */

  .imgmoduleitem_time {
    color: #fff;
    .imgmoduleitem_time_span {
      margin-right: 20px;
    }
  }
}
.imgmoduleitemSelect_box {
  display: flex;
  justify-content: center;

  .imgmoduleitem_time {
    color: #fff;
    display: flex;
    align-items: center;
    margin-right: 100px;
    .imgmoduleitem_time_span {
      margin-right: 15px;
    }

    .time_box {
      width: 160px;
      height: 35px;
      position: relative;
      margin-right: 20px;

      .time_box_p {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
        padding-right: 5px;
        border: 1px solid #0e6a99;
        background: rgba(12, 49, 95, 0.7);
        box-shadow: 0 0 5px #0e6a99 inset;
        input {
          width: 90%;
          height: 100%;
          border: none;
          background: transparent;
          color: #fff;
          padding-left: 5px;
          &::placeholder {
            color: #fff;
          }
        }
      }
      .imgmoduleitem_select {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
      }
      .sheng_select {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
        opacity: 0;
        option {
          width: 100%;
          height: 35px;
          background: rgba(12, 49, 95, 1);
          color: #fff;
        }
      }
    }
  }
  .pointer {
    cursor: pointer;
  }
}
.pl0 {
  padding-left: 0 !important;
}
input[type="button"]:before {
  content: attr(placeholder); //强制给placeholder属性
  color: #aaa; //修改一下placeholder颜色
}
</style>
