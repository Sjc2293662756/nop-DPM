/*
  模块的基础配置
 */
var echarts = require('echarts');
import moduledata from '@/store/module/moduledata'
import moduledefaultcolor from '@/store/module/moduledefaultcolor'
import { dpmTrendOptions, dpmScalarMaximum, dpmCompositionOptions, dpmStackOptions, dpmVerticalBarOptions } from '@/dataSources/dpm/charts'

export default {
  //横向柱状图
  Hengxiangzhuzhuangtu(params) {
    var moduledatas = params.moduledatas;
    // console.log('moduledatas', moduledatas)
    var series = [];
    for (let i = 0; i < moduledatas.x.length; i++) {

      let style = moduledatas.style.x[i] ? moduledatas.style.x[i] : moduledata.state.hengxiangzhuzhuangtu.style.x[0];
      let label = moduledatas.label[i] ? moduledatas.label[i] : "标签";
      series[i] = {
        // barWidth:style.barWidth,
        name: label,
        type: 'bar',
        data: moduledatas.x[i],
        color: {
          type: 'linear',
          colorStops: [
            {
              // offset值为0时，代表起点的颜色；值为1时，代表终点的颜色
              offset: 0,
              color: style.color[0][0]
            },
            {
              offset: 1,
              color: style.color[0][1]
            }
          ]
        },
        itemStyle: {
          normal: {
            borderWidth: style.borderWidth || 0,
            borderColor: style.borderColor || "#000",
            barBorderRadius: 0,
            // color: function (params) {
            //   // return style.color[0][0]
            //   return new echarts.graphic.LinearGradient(0, 0, 0, 1,
            //     [{
            //       offset: 0,
            //       color: style.color[0][0]
            //     },
            //     {
            //       offset: 1,
            //       color: style.color[0][1]
            //     }
            //     ]);
            // },
            label: {
              show: style.label.show, //开启显示
              position: style.label.position, //在上方显示
              textStyle: { //数值样式
                color: style.label.color,
                fontSize: style.label.fontSize
              }
            }
          }, //normal_end
        }
      }
    }
    var data = {
      // color: moduledatas.style.x[0].color[0],
      // color:moduledefaultcolor.colorList,
      // color:function(){
      //   // return style.color[0][0]
      //   return new echarts.graphic.LinearGradient(0, 0, 0, 1,
      //       [{
      //           offset: 0,
      //           color: moduledatas.style.x[0].color[0]
      //       },
      //       {
      //           offset: 1,
      //           color: moduledatas.style.x[0].color[1]
      //       }
      //   ]);
      // },
      legend: {
        show: moduledatas.legend.show,
        orient: moduledatas.legend.orient,  //垂直显示
        circle: moduledatas.legend.circle,
        x: moduledatas.legend.x,
        y: moduledatas.legend.y,
        align: moduledatas.legend.align,
        itemWidth: moduledatas.legend.itemWidth,
        itemHeight: moduledatas.legend.itemHeight,
        itemGap: moduledatas.legend.itemGap,
        textStyle: moduledatas.legend.textStyle,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          animation: true,
          animationDurationUpdate: 200,
        },
        formatter: function (params) {
          if (moduledatas.unit) {
            return params[0].name + "<br/>" + params[0].seriesName + ":" + params[0].data + moduledatas.unit
          } else {
            return params[0].name + "<br/>" + params[0].seriesName + ":" + params[0].data
          }

        }
      },
      grid: {
        top: '15%',
        left: '2%',
        right: '4%',
        bottom: '5%',
        containLabel: true
      },
      animationDuration: 1000,
      yAxis: {
        data: moduledatas.y,
        axisLine: params.yAxis.axisLine,
        axisLabel: params.yAxis.axisLabel
      },
      xAxis: {
        position: 'top',
        axisLine: params.xAxis.axisLine,
        axisLabel: {
          show: true,
          textStyle: {
            color: params.xAxis.axisLabel.color,  //更改坐标轴文字颜色
            fontSize: params.xAxis.axisLabel.fontSize     //更改坐标轴文字大小
          },
          formatter: function (value, index) {
            if (value >= 10000 && value < 10000000) {
              value = value / 10000 + "w";
            } else if (value >= 10000000) {
              value = value / 10000000 + "kw";
            } else if (value >= 1000 && value < 10000) {
              value = value / 1000 + "k";
            }
            return value;
          }
        },
        splitLine: params.xAxis.splitLine,
      },
      series: series //series_end
    }
    return data;
  },
  // 纵向柱状图
  Zongxiangzhuzhuangtu(params) {
    var moduledatas = params.moduledatas;
    var series = [];
    for (let i = 0; i < moduledatas.y.length; i++) {
      let style = moduledatas.style.y[i] ? moduledatas.style.y[i] : moduledata.state.zongxiangzhuzhuangtu.style.y[0];
      let label = moduledatas.label[i] ? moduledatas.label[i] : ["标签"];
      let unit = 'kb/s'
      series[i] = {
        // barWidth:style.barWidth,
        name: label,
        unit: unit,
        type: 'bar',
        data: moduledatas.y[i],
        color: {
          type: 'linear',
          colorStops: [
            {
              // offset值为0时，代表起点的颜色；值为1时，代表终点的颜色
              offset: 0,
              color: style.color[0][0]
            },
            {
              offset: 1,
              color: style.color[0][1]
            }
          ]
        },
        itemStyle: {
          normal: {
            borderWidth: style.borderWidth || 0,
            borderColor: style.borderColor || "#000",
            barBorderRadius: 0,
            color: function (params) {
              // return style.color[0][0]
              return new echarts.graphic.LinearGradient(0, 0, 0, 1,
                [{
                  offset: 0,
                  color: style.color[0][0]
                },
                {
                  offset: 1,
                  color: style.color[0][1]
                }
                ]);
            },
            label: {
              show: style.label.show, //开启显示
              position: style.label.position, //在上方显示
              textStyle: { //数值样式
                color: style.label.color,
                fontSize: style.label.fontSize
              }
            }
          }, //normal_end
        }
      }
    }
    var data = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          animation: true,
          animationDurationUpdate: 200,
        },
        formatter: function (params) {
          if (moduledatas.unit) {
            return params[0].name + "<br/>" + params[0].seriesName + ":" + params[0].data + moduledatas.unit
          } else {
            return params[0].name + "<br/>" + params[0].seriesName + ":" + params[0].data
          }

        }
      },
      // color:moduledefaultcolor.colorList,
      // color: moduledatas.style.y[0].color[0],
      legend: {
        show: moduledatas.legend.show,
        orient: moduledatas.legend.orient,  //垂直显示
        circle: moduledatas.legend.circle,
        x: moduledatas.legend.x,
        y: moduledatas.legend.y,
        align: moduledatas.legend.align,
        itemWidth: moduledatas.legend.itemWidth,
        itemHeight: moduledatas.legend.itemHeight,
        itemGap: moduledatas.legend.itemGap,
        textStyle: moduledatas.legend.textStyle,
        // data:moduledatas.x
      },
      grid: {
        top: '15%',
        left: '2%',
        right: '2%',
        bottom: '2%',
        containLabel: true
      },
      animationDuration: 1000,
      xAxis: {
        data: moduledatas.x,
        axisLine: params.xAxis.axisLine,
        axisLabel: params.xAxis.axisLabel
      },
      yAxis: {
        axisLine: params.yAxis.axisLine,
        axisLabel: {
          show: true,
          textStyle: {
            color: params.yAxis.axisLabel.color,  //更改坐标轴文字颜色
            fontSize: params.yAxis.axisLabel.fontSize     //更改坐标轴文字大小
          },
          formatter: function (value, index) {
            if (value >= 10000 && value < 10000000) {
              value = value / 10000 + "w";
            } else if (value >= 10000000) {
              value = value / 10000000 + "kw";
            } else if (value >= 1000 && value < 10000) {
              value = value / 1000 + "k";
            }
            return value;
          }
        },
        splitLine: params.yAxis.splitLine,
      },
      series: series //series_end
    }
    return dpmVerticalBarOptions(data, moduledatas);
  },
  // 面积图
  Mianjitu(params) {
    var moduledatas = params.moduledatas;
    var series = [];
    for (let i = 0; i < moduledatas.y.length; i++) {
      // let style = moduledatas.style.y[i]?moduledatas.style.y[i]:moduledata.state.mianjitu.style.y[0];
      let style = {}
      if (moduledatas.style.y[i]) {
        style = moduledatas.style.y[i]
      } else {
        let obj = {
          lineStyle: {
            color: moduledefaultcolor.colorList[i], //线的颜色宽度
            width: "2"
          },
          symbolSize: "4",
          itemStyle: {
            normal: {
              color: moduledefaultcolor.colorList[i],
              borderColor: moduledefaultcolor.colorList[i],//拐点圆圈的大小颜色设置
            }
          },
          style: {
            color: [
              { display: "none", top: "200px", right: "300px" },
              { display: "none", top: "200px", right: "300px" },
              { display: "none", top: "200px", right: "300px" },
              { display: "none", top: "200px", right: "300px" }
            ]
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 1, color: moduledefaultcolor.colorList[i] // 0% 处的颜色
              }, {
                offset: 0, color: moduledefaultcolor.colorList[i] // 100% 处的颜色
              }],
              global: false // 缺省为 false
            }
          }
        }
        moduledatas.style.y.push(obj)
        style = obj
      }
      let label = moduledatas.label[i] ? moduledatas.label[i] : ["标签"];
      series[i] = {
        name: moduledatas.label[i] || "",
        type: 'line',
        lineStyle: style.lineStyle,
        smooth: true,
        symbolSize: style.symbolSize,
        itemStyle: style.itemStyle,
        areaStyle: style.areaStyle,
        data: moduledatas.y[i],
        showSymbol: false,
      }
    }
    var data = {
      legend: {
        show: moduledatas.legend.show,
        orient: moduledatas.legend.orient,  //垂直显示
        circle: moduledatas.legend.circle,
        x: moduledatas.legend.x,
        y: moduledatas.legend.y,
        align: moduledatas.legend.align,
        itemWidth: moduledatas.legend.itemWidth,
        itemHeight: moduledatas.legend.itemHeight,
        itemGap: moduledatas.legend.itemGap,
        textStyle: moduledatas.legend.textStyle,

      },
      grid: {
        top: '15%',
        left: '2%',
        right: '1%',
        bottom: '5%',
        containLabel: true
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: '#6a7985'
          },
          animation: true,
          animationDurationUpdate: 200
        },
        formatter: function (params) {
          var showTipText = ''
          for (var i = 0; i < params.length; i++) {
            if (moduledatas.unit && moduledatas.unit[i]) {
              showTipText = showTipText + params[i].seriesName + ":" + params[i].data + moduledatas.unit[i] + "<br/>"
            } else {
              showTipText = showTipText + params[i].seriesName + ":" + params[i].data + "<br/>"
            }

          }
          return params[0].name + "<br/>" + showTipText
        }
      },
      toolbox: {
        feature: {
          saveImage: {}
        }
      },
      animationDuration: 1000,
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: moduledatas.x,
          axisLine: params.xAxis.axisLine,
          axisLabel: params.xAxis.axisLabel
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: params.yAxis.axisLine,
          axisLabel: {
            color: params.yAxis.axisLabel.color,
            fontSize: params.yAxis.axisLabel.fontSize,
            formatter: function (value, index) {
              if (value >= 10000 && value < 10000000) {
                value = value / 10000 + "w";
              } else if (value >= 10000000) {
                value = value / 10000000 + "kw";
              } else if (value >= 1000 && value < 10000) {
                value = value / 1000 + "k";
              }
              return value;
            }
          },
          splitLine: params.yAxis.splitLine
        }
      ],
      series: series
    }
    return dpmTrendOptions(data, moduledatas);
  },
  // 折线图
  Zhexiantu(params) {
    var moduledatas = params.moduledatas;
    var series = [];
    for (let i = 0; i < moduledatas.y.length; i++) {
      // let style = moduledatas.style.y[i]?moduledatas.style.y[i]:moduledata.state.zhexiantu.style.y[0];
      let style = {}
      if (moduledatas.style.y[i]) {
        style = moduledatas.style.y[i]
      } else {
        let obj = {
          lineStyle: {
            color: moduledefaultcolor.colorList[i], //线的颜色宽度
            width: "2"
          },
          symbolSize: "4",
          itemStyle: {
            normal: {
              color: moduledefaultcolor.colorList[i],
              borderColor: moduledefaultcolor.colorList[i],//拐点圆圈的大小颜色设置
            }
          },
          style: {
            color: [
              { display: "none", top: "200px", right: "300px" },
              { display: "none", top: "200px", right: "300px" },
              { display: "none", top: "200px", right: "300px" },
              { display: "none", top: "200px", right: "300px" }
            ]
          },
        }
        moduledatas.style.y.push(obj)
        style = obj
      }
      let label = moduledatas.label[i] ? moduledatas.label[i] : ["标签"];
      series[i] = {
        name: moduledatas.label[i] || "",
        type: 'line',
        lineStyle: style.lineStyle,
        smooth: true,
        symbolSize: style.symbolSize,
        itemStyle: style.itemStyle,
        // areaStyle:style.areaStyle,
        data: moduledatas.y[i],
        showSymbol: false,
      }
    }
    var data = {
      legend: {
        show: moduledatas.legend.show,
        orient: moduledatas.legend.orient,  //垂直显示
        circle: moduledatas.legend.circle,
        x: moduledatas.legend.x,
        y: moduledatas.legend.y,
        align: moduledatas.legend.align,
        itemWidth: moduledatas.legend.itemWidth,
        itemHeight: moduledatas.legend.itemHeight,
        itemGap: moduledatas.legend.itemGap,
        textStyle: moduledatas.legend.textStyle,
      },
      grid: {
        top: '15%',
        left: '2%',
        right: '1%',
        bottom: '5%',
        containLabel: true
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: '#6a7985'
          },
          animation: true,
          animationDurationUpdate: 200
        },
        formatter: function (params) {
          var showTipText = ''
          for (var i = 0; i < params.length; i++) {
            if (moduledatas.unit && moduledatas.unit[i]) {
              showTipText = showTipText + params[i].seriesName + ":" + params[i].data + moduledatas.unit[i] + "<br/>"
            } else {
              showTipText = showTipText + params[i].seriesName + ":" + params[i].data + "<br/>"
            }
          }
          return params[0].name + "<br/>" + showTipText
        }
      },
      toolbox: {
        feature: {
          saveImage: {}
        }
      },
      animationDuration: 1000,
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: moduledatas.x,
          axisLine: params.xAxis.axisLine,
          axisLabel: params.xAxis.axisLabel
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: params.yAxis.axisLine,
          axisLabel: {
            color: params.yAxis.axisLabel.color,
            fontSize: params.yAxis.axisLabel.fontSize,
            formatter: function (value, index) {
              if (value >= 10000 && value < 10000000) {
                value = value / 10000 + "w";
              } else if (value >= 10000000) {
                value = value / 10000000 + "kw";
              } else if (value >= 1000 && value < 10000) {
                value = value / 1000 + "k";
              }
              return value;
            }
          },
          splitLine: params.yAxis.splitLine
        }
      ],
      series: series
    }
    return dpmTrendOptions(data, moduledatas);
  },
  // 进度环图
  Jinduhuantu(params) {
    const maximum = params.dpm ? dpmScalarMaximum(params) : 100;
    const value = params.dpm ? Math.max(0, Math.min(maximum, Number(params.value))) : params.value;
    const unit = params.dpm ? (params.unit || '') : '%';
    var data = {
      animationDuration: 1000,
      series: [{
        name: 'jichuhuantu',
        type: 'pie',
        radius: [params.radius[0] + '%', params.radius[1] + '%'],
        avoidLabelOverlap: false,
        hoverAnimation: true,
        color: [params.color[0], params.color[1]],
        label: {
          normal: {
            show: true,
            position: 'center',
            formatter: '{label|' + params.value + unit + '}' + '\n\r' + '{active|' + params.name + '}',
            rich: {
              label: params.style.label,
              active: params.style.active,
            }
          }
        },
        data: [{
          value: value,
          name: params.name,
          label: {
            normal: {
              show: true
            }
          },
          itemStyle: params.style.itemStyle
        }, {
          value: maximum - value,
          name: "ss",
          label: {
            normal: {
              show: true
            }
          }
        }]
      }]
    }
    return data;
  },
  // 仪表盘
  Yibiaopan(params) {
    var colors = []
    for (var i = 0; i < params.color.length; i++) {
      colors.push(params.color[i])
    }
    var data = {
      tooltip: {
        formatter: params.name + params.value + (params.dpm ? (params.unit || '') : '')
      },
      animationDuration: 1000,
      series: [{
        name: 'yibiaopan',
        type: 'gauge',
        min: params.dpm ? Math.min(0, Number(params.value)) : 0,
        max: params.dpm ? dpmScalarMaximum(params) : 100,
        axisLine: {
          lineStyle: {
            width: 5,
            color: colors
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          // distance: 30,
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 2
          }
        },
        splitLine: {
          // distance: -30,
          length: 20,
          lineStyle: {
            color: 'auto',
            width: 3
          }
        },
        axisLabel: {
          color: 'auto',
          // distance: 40,
          fontSize: params.style.axisLabel.fontSize
        },
        title: {
          // offsetCenter: [0, '-20%'],
          fontSize: params.style.title.fontSize,
          color: params.style.title.color,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}' + (params.dpm ? (params.unit || '') : ''),
          color: 'auto',
          fontSize: params.style.label.fontSize
        },
        data: [
          {
            name: params.name,
            value: params.value,

          }
        ]
      }]
    }
    return data;
  },
  // 玫瑰图
  Meiguitu(params) {
    // console.log('params', params)
    var moduledatas = params.moduledatas;
    var series = [];
    var y = [];

    for (let i = 0; i < moduledatas.x.length; i++) {
      if (!params.color[i]) {
        params.color.push(params.color[0])
        params.style.color.push([moduledefaultcolor.colorList[i], moduledefaultcolor.colorList[i], '#ffffff', '0'])
      }
      let color = params.style.color[i] || moduledata.state.meiguitu.style.color[0];
      y[i] = {
        value: moduledatas.y[i] || 0,
        name: moduledatas.x[i],
        itemStyle: {
          borderColor: color[2],
          borderWidth: color[3],
        },
      }
    }
    series[0] = {
      name: params.label,
      type: 'pie',
      radius: [params.style.radio[0] + "%", params.style.radio[1] + "%"],
      center: ['70%', '50%'],
      // 加上玫瑰图 去掉饼图
      roseType: 'radius',
      label: {
        normal: {
          show: true,
          position: 'outside',
          formatter: '{\d}%',
          color: params.style.numStyle.numColor
        },
        emphasis: {
          show: true
        }
      },
      lableLine: {
        normal: {
          show: true
        },
        emphasis: {
          show: true
        }
      },
      itemStyle: {
        normal: {
          color: function (param) {
            var colorList = params.style.color;
            var index = param.dataIndex;
            if (param.dataIndex >= colorList.length) {
              index = param.dataIndex - colorList.length;
            }
            // if (!colorList[index]) {
            // 	colorList[index] = ['#10B9F8', '#10B9F8'];
            // }
            return new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [{
                offset: 0,
                color: colorList[index][1]
              },
              {
                offset: 1,
                color: colorList[index][0]
              }
              ]);
          }
        }
      },
      data: y
    }
    var data = {
      tooltip: {
        trigger: "item",
        formatter: moduledatas.unit ? '{a} <br/>{b} : {c}' + moduledatas.unit + '({d}%)' : '{a} <br/>{b} : {c} ({d}%)'
      },
      animationDuration: 1000,
      legend: {
        show: moduledatas.legend.show,
        orient: moduledatas.legend.orient,  //垂直显示
        circle: moduledatas.legend.circle,
        x: moduledatas.legend.x,
        y: moduledatas.legend.y,
        align: moduledatas.legend.align,
        itemWidth: moduledatas.legend.itemWidth,
        itemHeight: moduledatas.legend.itemHeight,
        itemGap: moduledatas.legend.itemGap,
        textStyle: moduledatas.legend.textStyle,
        data: moduledatas.x
      },
      series: series //series_end
    }
    return dpmCompositionOptions(data, moduledatas);
  },
  // 饼图
  Bingtu(params) {
    var moduledatas = params.moduledatas;
    var series = [];
    var y = [];

    for (let i = 0; i < moduledatas.x.length; i++) {
      if (!params.color[i]) {
        params.color.push(params.color[0])
        params.style.color.push([moduledefaultcolor.colorList[i], moduledefaultcolor.colorList[i], '#ffffff', '0'])
      }
      let color = params.style.color[i] || moduledata.state.bingtu.style.color[0];
      y[i] = {
        value: moduledatas.y[i] || 0,
        name: moduledatas.x[i],
        itemStyle: {
          borderColor: color[2],
          borderWidth: color[3],
        },
      }
    }
    series[0] = {
      name: params.label,
      type: 'pie',
      radius: [params.style.radio[0] + "%", params.style.radio[1] + "%"],
      center: ['35%', '50%'],
      // 加上玫瑰图 去掉饼图
      // roseType : 'radius',
      label: {
        normal: {
          show: true,
          position: 'outside',
          formatter: '{\d}%',
          color: params.style.numStyle.numColor
        },
        emphasis: {
          show: true
        }
      },
      lableLine: {
        normal: {
          show: true
        },
        emphasis: {
          show: true
        }
      },
      itemStyle: {
        normal: {
          color: function (param) {
            var colorList = params.style.color;
            var index = param.dataIndex;
            if (param.dataIndex >= colorList.length) {
              index = param.dataIndex - colorList.length;
            }
            // if (!colorList[index]) {
            // 	colorList[index] = ['#10B9F8', '#10B9F8','#ffffff','0'];
            // }
            return new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [{
                offset: 0,
                color: colorList[index][1]
              },
              {
                offset: 1,
                color: colorList[index][0]
              }
              ]);
          }
        }
      },
      data: y
    }
    var data = {
      tooltip: {
        trigger: "item",
        formatter: moduledatas.unit ? '{a} <br/>{b} : {c}' + moduledatas.unit + '({d}%)' : '{a} <br/>{b} : {c} ({d}%)'
      },
      animationDuration: 1000,
      legend: {
        show: moduledatas.legend.show,
        orient: moduledatas.legend.orient,  //垂直显示
        circle: moduledatas.legend.circle,
        x: moduledatas.legend.x,
        y: moduledatas.legend.y,
        align: moduledatas.legend.align,
        itemWidth: moduledatas.legend.itemWidth,
        itemHeight: moduledatas.legend.itemHeight,
        itemGap: moduledatas.legend.itemGap,
        textStyle: moduledatas.legend.textStyle,
        data: moduledatas.x
      },
      series: series //series_end
    }
    return dpmCompositionOptions(data, moduledatas);
  },
  // 实心饼图

  // 更新后的 Shixinbingtu 方法
 Shixinbingtu(params) {
    var moduledatas = params.moduledatas;
    var series = [];
    var y = [];

    for (let i = 0; i < moduledatas.x.length; i++) {
      if (!params.color[i]) {
        params.color.push(params.color[0])
        params.style.color.push([moduledefaultcolor.colorList[i], moduledefaultcolor.colorList[i], '#ffffff', '0'])
      }
      let color = params.style.color[i] || moduledata.state.shixinbingtu.style.color[0];
      y[i] = {
        value: moduledatas.y[i] || 0,
        name: moduledatas.x[i],
        itemStyle: {
          borderColor: color[2],
          borderWidth: color[3],
        },
      }
    }
    series[0] = {
      name: params.label,
      type: 'pie',
      radius: [params.style.radio[0] + "%", params.style.radio[1] + "%"],
      center: ['65%', '50%'],
      label: {
        normal: {
          show: true,
          position: 'outside',
          formatter: '{\d}%',
          color: params.style.numStyle.numColor
        },
        emphasis: {
          show: true
        }
      },
      lableLine: {
        normal: {
          show: true
        },
        emphasis: {
          show: true
        }
      },
      itemStyle: {
        normal: {
          color: function (param) {
            var colorList = params.style.color;
            var index = param.dataIndex;
            if (param.dataIndex >= colorList.length) {
              index = param.dataIndex - colorList.length;
            }
            // if (!colorList[index]) {
            // 	colorList[index] = ['#10B9F8', '#10B9F8','#ffffff','0'];
            // }
            return new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [{
                offset: 0,
                color: colorList[index][1]
              },
              {
                offset: 1,
                color: colorList[index][0]
              }
              ]);
          }
        }
      },
      data: y
    }
    var data = {
      tooltip: {
        trigger: "item",
        formatter: moduledatas.unit ? '{a} <br/>{b} : {c}' + moduledatas.unit + '({d}%)' : '{a} <br/>{b} : {c} ({d}%)'
      },
      animationDuration: 1000,
      legend: {
        show: moduledatas.legend.show,
        orient: moduledatas.legend.orient,  //垂直显示
        circle: moduledatas.legend.circle,
        x: moduledatas.legend.x,
        y: moduledatas.legend.y,
        align: moduledatas.legend.align,
        itemWidth: moduledatas.legend.itemWidth,
        itemHeight: moduledatas.legend.itemHeight,
        itemGap: moduledatas.legend.itemGap,
        textStyle: moduledatas.legend.textStyle,
        data: moduledatas.x
      },
      series: series //series_end
    }
    console.log("data-bingtu",data);
    return dpmCompositionOptions(data, moduledatas);
  },

  // Shixinbingtu(params) {
  //   var moduledatas = params.moduledatas;
  //   var series = [];
  //   var y = [];

  //   for (let i = 0; i < moduledatas.x.length; i++) {
  //     if (!params.color[i]) {
  //       params.color.push(params.color[0])
  //       params.style.color.push([moduledefaultcolor.colorList[i], moduledefaultcolor.colorList[i], '#ffffff', '0'])
  //     }
  //     let color = params.style.color[i] || moduledata.state.shixinbingtu.style.color[0];
  //     y[i] = {
  //       value: moduledatas.y[i] || 0,
  //       name: moduledatas.x[i],
  //       itemStyle: {
  //         borderColor: color[2],
  //         borderWidth: color[3],
  //       },
  //     }
  //   }
  //   series[0] = {
  //     name: params.label,
  //     type: 'pie',
  //     radius: [params.style.radio[0] + "%", params.style.radio[1] + "%"],
  //     center: ['65%', '50%'],
  //     label: {
  //       normal: {
  //         show: true,
  //         position: 'outside',
  //         formatter: '{\d}%',
  //         color: params.style.numStyle.numColor
  //       },
  //       emphasis: {
  //         show: true
  //       }
  //     },
  //     lableLine: {
  //       normal: {
  //         show: true
  //       },
  //       emphasis: {
  //         show: true
  //       }
  //     },
  //     itemStyle: {
  //       normal: {
  //         color: function (param) {
  //           var colorList = params.style.color;
  //           var index = param.dataIndex;
  //           if (param.dataIndex >= colorList.length) {
  //             index = param.dataIndex - colorList.length;
  //           }
  //           // if (!colorList[index]) {
  //           // 	colorList[index] = ['#10B9F8', '#10B9F8','#ffffff','0'];
  //           // }
  //           return new echarts.graphic.LinearGradient(0, 0, 0, 1,
  //             [{
  //               offset: 0,
  //               color: colorList[index][1]
  //             },
  //             {
  //               offset: 1,
  //               color: colorList[index][0]
  //             }
  //             ]);
  //         }
  //       }
  //     },
  //     data: y
  //   }
  //   var data = {
  //     tooltip: {
  //       trigger: "item",
  //       formatter: moduledatas.unit ? '{a} <br/>{b} : {c}' + moduledatas.unit + '({d}%)' : '{a} <br/>{b} : {c} ({d}%)'
  //     },
  //     animationDuration: 1000,
  //     legend: {
  //       show: moduledatas.legend.show,
  //       orient: moduledatas.legend.orient,  //垂直显示
  //       circle: moduledatas.legend.circle,
  //       x: moduledatas.legend.x,
  //       y: moduledatas.legend.y,
  //       align: moduledatas.legend.align,
  //       itemWidth: moduledatas.legend.itemWidth,
  //       itemHeight: moduledatas.legend.itemHeight,
  //       itemGap: moduledatas.legend.itemGap,
  //       textStyle: moduledatas.legend.textStyle,
  //       data: moduledatas.x
  //     },
  //     series: series //series_end
  //   }
  //   return data;
  // },

  // 横向堆叠柱状图
  Hengxiangduidiezhuzhuangtu(params) {
    var moduledatas = params.moduledatas;
    var series = [];
    for (let i = 0; i < moduledatas.x.length; i++) {
      // let style = moduledatas.style.x[i]?moduledatas.style.x[i]:moduledata.state.hengxiangduidiezhuzhuangtu.style.x[0];
      let style = {}
      if (moduledatas.style.x[i]) {
        style = moduledatas.style.x[i]
      } else {
        let obj = {
          // barWidth:20,
          borderColor: '#000',
          borderWidth: 0,
          borderStyle: { display: "none", top: "200px", right: "300px" },
          color: [
            [moduledefaultcolor.colorList[i], moduledefaultcolor.colorList[i]]
          ],
          style: {
            color: [[
              { display: "none", top: "200px", right: "300px" }, { display: "none", top: "200px", right: "300px" } // 分别表示填充色0-1，边框颜色
            ], [
              { display: "none", top: "200px", right: "300px" }, { display: "none", top: "200px", right: "300px" } // 分别表示填充色0-1，边框颜色
            ], [
              { display: "none", top: "200px", right: "300px" }, { display: "none", top: "200px", right: "300px" } // 分别表示填充色0-1，边框颜色
            ], [
              { display: "none", top: "200px", right: "300px" }, { display: "none", top: "200px", right: "300px" } // 分别表示填充色0-1，边框颜色
            ]]
          },
          label: {
            show: true,
            //   position:"right",
            color: '#F8B835',
            fontSize: 14,
            style: { display: "none", top: "200px", right: "300px" }
          }
        }
        moduledatas.style.x.push(obj)
        style = obj
      }
      let label = moduledatas.label[i] ? moduledatas.label[i] : "标签";
      series[i] = {
        // barWidth:style.barWidth,
        name: label,
        type: 'bar',
        stack: "堆叠",
        data: moduledatas.x[i],
        color: {
          type: 'linear',
          colorStops: [
            {
              // offset值为0时，代表起点的颜色；值为1时，代表终点的颜色
              offset: 0,
              color: style.color[0][0]
            },
            {
              offset: 1,
              color: style.color[0][1]
            }
          ]
        },
        itemStyle: {
          normal: {
            borderWidth: style.borderWidth || 0,
            borderColor: style.borderColor || "#000",
            barBorderRadius: 0,
            // color: function (params) {
            //   // return style.color[0][0]
            //   return new echarts.graphic.LinearGradient(0, 0, 0, 1,
            //     [{
            //       offset: 0,
            //       color: style.color[0][0]
            //     },
            //     {
            //       offset: 1,
            //       color: style.color[0][1]
            //     }
            //     ]);
            // },
            label: {
              // show: style.label.show, //开启显示
              position: style.label.position, //在上方显示
              textStyle: { //数值样式
                color: style.label.color,
                fontSize: style.label.fontSize
              },
              formatter: function (params) {
              }
            },
          }, //normal_end
        },

      }
    }
    var data = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          label: {
            backgroundColor: '#6a7985'
          },
          animation: true,
          animationDurationUpdate: 200
        },
        formatter: function (params) {
          var showTipText = ''
          for (var i = 0; i < params.length; i++) {
            if (moduledatas.unit && moduledatas.unit[i]) {
              showTipText = showTipText + params[i].seriesName + ":" + params[i].data + moduledatas.unit[i] + "<br/>"
            } else {
              showTipText = showTipText + params[i].seriesName + ":" + params[i].data + "<br/>"
            }
          }
          return params[0].name + "<br/>" + showTipText
        }
      },
      animationDuration: 1000,
      color: moduledefaultcolor.colorList,
      legend: {
        show: moduledatas.legend.show,
        orient: moduledatas.legend.orient,  //垂直显示
        circle: moduledatas.legend.circle,
        x: moduledatas.legend.x,
        y: moduledatas.legend.y,
        align: moduledatas.legend.align,
        itemWidth: moduledatas.legend.itemWidth,
        itemHeight: moduledatas.legend.itemHeight,
        itemGap: moduledatas.legend.itemGap,
        textStyle: moduledatas.legend.textStyle,
      },
      grid: {
        top: '15%',
        left: '2%',
        right: '4%',
        bottom: '5%',
        containLabel: true
      },
      yAxis: {
        data: moduledatas.y,
        axisLine: params.yAxis.axisLine,
        axisLabel: params.yAxis.axisLabel
      },
      xAxis: {
        position: 'top',
        axisLine: params.xAxis.axisLine,
        axisLabel: {
          show: true,
          textStyle: {
            color: params.xAxis.axisLabel.color,  //更改坐标轴文字颜色
            fontSize: params.xAxis.axisLabel.fontSize     //更改坐标轴文字大小
          },
          formatter: function (value, index) {
            if (value >= 10000 && value < 10000000) {
              value = value / 10000 + "w";
            } else if (value >= 10000000) {
              value = value / 10000000 + "kw";
            } else if (value >= 1000 && value < 10000) {
              value = value / 1000 + "k";
            }
            return value;
          }
        },
        splitLine: params.xAxis.splitLine,
      },
      series: series //series_end
    }
    return dpmStackOptions(data, moduledatas);
  },
  // 纵向堆叠柱状图
  Zongxiangduidiezhuzhuangtu(params) {
    var moduledatas = params.moduledatas;
    // console.log('moduledatas', moduledatas)
    var series = [];
    for (let i = 0; i < moduledatas.y.length; i++) {
      // let style = moduledatas.style.y[i]?moduledatas.style.y[i]:moduledata.state.zongxiangduidiezhuzhuangtu.style.y[0];
      let style = {}
      if (moduledatas.style.y[i]) {
        style = moduledatas.style.y[i]
      } else {
        let obj = {
          // barWidth:20,
          borderColor: '#000',
          borderWidth: 0,
          borderStyle: { display: "none", top: "200px", right: "300px" },
          color: [
            [moduledefaultcolor.colorList[i], moduledefaultcolor.colorList[i]]
          ],
          style: {
            color: [[
              { display: "none", top: "200px", right: "300px" }, { display: "none", top: "200px", right: "300px" } // 分别表示填充色0-1，边框颜色
            ], [
              { display: "none", top: "200px", right: "300px" }, { display: "none", top: "200px", right: "300px" } // 分别表示填充色0-1，边框颜色
            ], [
              { display: "none", top: "200px", right: "300px" }, { display: "none", top: "200px", right: "300px" } // 分别表示填充色0-1，边框颜色
            ], [
              { display: "none", top: "200px", right: "300px" }, { display: "none", top: "200px", right: "300px" } // 分别表示填充色0-1，边框颜色
            ]]
          },
          label: {
            show: true,
            position: "top",
            color: '#F8B835',
            fontSize: 14,
            style: { display: "none", top: "200px", right: "300px" }
          }
        }
        moduledatas.style.y.push(obj)
        style = obj
      }
      let label = moduledatas.label[i] ? moduledatas.label[i] : "标签";
      series[i] = {
        // barWidth:style.barWidth,
        name: label,
        type: 'bar',
        stack: "堆叠",
        data: moduledatas.y[i],
        color: {
          type: 'linear',
          colorStops: [
            {
              // offset值为0时，代表起点的颜色；值为1时，代表终点的颜色
              offset: 0,
              color: style.color[0][0]
            },
            {
              offset: 1,
              color: style.color[0][1]
            }
          ]
        },
        itemStyle: {
          normal: {
            borderWidth: style.borderWidth || 0,
            borderColor: style.borderColor || "#000",
            barBorderRadius: 0,
            color: function (params) {
              // return style.color[0][0]
              return new echarts.graphic.LinearGradient(0, 0, 0, 1,
                [{
                  offset: 0,
                  color: style.color[0][0]
                },
                {
                  offset: 1,
                  color: style.color[0][1]
                }
                ]);
            },
            label: {
              // show: style.label.show, //开启显示
              position: style.label.position, //在上方显示
              textStyle: { //数值样式
                color: style.label.color,
                fontSize: style.label.fontSize
              }
            }
          }, //normal_end
        }
      }
    }
    var data = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          label: {
            backgroundColor: '#6a7985'
          },
          animation: true,
          animationDurationUpdate: 200
        },
        formatter: function (params) {
          var showTipText = ''
          for (var i = 0; i < params.length; i++) {
            if (moduledatas.unit && moduledatas.unit[i]) {
              showTipText = showTipText + params[i].seriesName + ":" + params[i].data + moduledatas.unit[i] + "<br/>"
            } else {
              showTipText = showTipText + params[i].seriesName + ":" + params[i].data + "<br/>"
            }
          }
          return params[0].name + "<br/>" + showTipText
        }
      },
      animationDuration: 1000,
      // color: moduledefaultcolor.colorList,
      legend: {
        show: moduledatas.legend.show,
        orient: moduledatas.legend.orient,  //垂直显示
        circle: moduledatas.legend.circle,
        x: moduledatas.legend.x,
        y: moduledatas.legend.y,
        align: moduledatas.legend.align,
        itemWidth: moduledatas.legend.itemWidth,
        itemHeight: moduledatas.legend.itemHeight,
        itemGap: moduledatas.legend.itemGap,
        textStyle: moduledatas.legend.textStyle,
      },
      grid: {
        top: '15%',
        left: '2%',
        right: '2%',
        bottom: '2%',
        containLabel: true
      },
      xAxis: {
        data: moduledatas.x,
        axisLine: params.xAxis.axisLine,
        axisLabel: params.xAxis.axisLabel
      },
      yAxis: {
        axisLine: params.yAxis.axisLine,
        axisLabel: {
          show: true,
          textStyle: {
            color: params.yAxis.axisLabel.color,  //更改坐标轴文字颜色
            fontSize: params.yAxis.axisLabel.fontSize     //更改坐标轴文字大小
          },
          formatter: function (value, index) {
            if (value >= 10000 && value < 10000000) {
              value = value / 10000 + "w";
            } else if (value >= 10000000) {
              value = value / 10000000 + "kw";
            } else if (value >= 1000 && value < 10000) {
              value = value / 1000 + "k";
            }
            return value;
          }
        },
        splitLine: params.yAxis.splitLine,
      },
      series: series //series_end
    }
    return dpmStackOptions(data, moduledatas);
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
  // 日历图生成每天对应的饼图
  getPieSeries(params, chart) {
    var x = params.x;
    var y = params.y;
    var colorArr = [];
    params.style.dataColor.map(item => {
      colorArr.push(item.color || "#1e4eff");
    });
    var scatterData = this.getVirtulData(params.month);
    return echarts.util.map(scatterData, (item, index) => {
      var arr = [];
      x.map((str, num) => {
        var obj = {
          name: str,
          value: y[index][num]
        };
        arr.push(obj);
      });

      var center = chart.convertToPixel("calendar", item);
      return {
        id: index + "pie",
        type: "pie",
        color: colorArr,
        center: center,
        label: {
          normal: {
            formatter: "{c}",
            position: "inside"
          }
        },
        radius: params.cellSize / 2 - 5,
        data: arr
      };
    });
  },

}
