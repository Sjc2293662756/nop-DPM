import { readDpmUrl, buildDpmUrl } from '@/dataSources/dpm/query'

// Respect an explicit dashboard interval; standalone previews follow the last hour.
export function getDashboardRange(start, end, now = Math.floor(Date.now() / 1000)) {
  if (start !== '' && start != null && end !== '' && end != null &&
      Number.isFinite(Number(start)) && Number.isFinite(Number(end)) && Number(start) < Number(end)) {
    return { start: String(start), end: String(end) }
  }
  return { start: String(now - 3600), end: String(now) }
}

export function getQueryString(str,name) {
  let search=str.replace(/\?/,'&')
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  let r = search.match(reg);
  if (r != null) {
    return unescape(r[2]);
  };
  return null;
}
// json数组根据指定字段排序 降序
export function descCompare(sortName){
  return function(obj1,obj2){
    var val1=obj1[sortName]
    var val2=obj2[sortName]
    if(val2<val1){
      return -1;
    }else if(val2>val1){
      return 1;
    }else{
      return 0;
    }
  }
}
// json数组根据指定字段排序 升序
export function ascCompare(sortName){
  return function(obj1,obj2){
    var val1=obj1[sortName]
    var val2=obj2[sortName]
    if(val2<val1){
      return 1;
    }else if(val2>val1){
      return -1;
    }else{
      return 0;
    }
  }
}

// 修改url参数中指定字段的值
export function changeURLArg(url,arr) {
  // Database configuration lives in a fragment and must survive time refreshes.
  if (url.indexOf('#nop-dpm-v1=') !== -1) {
    const saved = readDpmUrl(url)
    arr.forEach(item => {
      if (saved.config.timeMode !== 'fixed' && (item.key === 'start' || item.key === 'end')) saved[item.key] = item.value
    })
    // Rebuild from structured data, since old topology readers decodeURI(api).
    return buildDpmUrl(saved.baseUrl, saved.config, saved.start, saved.end)
  }
  arr.map((item) => {
    if (getQueryString(url,item.key) != null) {
      let re = eval('/(' + item.key + '=)([^&]*)/gi');
      url = url.replace(re, item.key + '=' + item.value);
    } else {
      if (url.indexOf("?") == -1) {
        url = url + '?' + item.key + '=' + item.value
      } else {
        url = url + '&' + item.key + '=' + item.value
      }
    }
  })
  return url
}
// include unit
export function replace_disp_str(orig){
if(orig == undefined){
    return false;
  }
    return orig
        .replace('Group', '名称')
        //数据包
        .replace('包吞吐量 （流入和流出）', '每秒包数(总和)[个/秒]')
        .replace('包吞吐量（流入）', '每秒包数(流入)[个/秒]')
        .replace('包吞吐量（流出）', '每秒包数(流出)[个/秒]')
        .replace('数据包大小（流入）', '包大小(流入)[字节]')
        .replace('数据包大小（流出）', '包大小(流出)[字节]')
        .replace('包流量 （流入和流出）', '包个数(总和)[个]')
        .replace('包流量（流入）', '包个数(流入)[个]')
        .replace('包流量（流出）', '包个数(流出)[个]')
        //网络流量
        .replace('吞吐量（流入和流出）', '吞吐量(总和)[Mbps]')
        .replace('吞吐量（流入）', '吞吐量(流入)[Mbps]')
        .replace('吞吐量（流出）', '吞吐量(流出)[Mbps]')
        .replace('流量（流入和流出）', '字节数(总和)[MB]')
        .replace('流量（流入）', '字节数(入向)[MB]')
        .replace('流量（流出）', '字节数(出向)[MB]')
        //传输效率
        .replace('有效吞吐(流入)', '有效吞吐(流入)[kbps]')
        .replace('有效吞吐(流出)', '有效吞吐(流出)[kbps]')
        .replace('利用率 (流入)', '利用率(流入)[%]')
        .replace('利用率 (流出)', '利用率(流出)[%]')
        .replace('净荷（服务器）', '有效载荷(接收)[KB]')
        .replace('净荷（客户端）', '有效载荷(发送)[KB]')
        .replace('数据包净荷（客户端）', '载荷包数(发送)[个]')
        .replace('数据包净荷（服务器）', '载荷包数(接收)[个]')
        //网络性能
        .replace('重传率（流入）', '重传率(流入)[kbps]')
        .replace('重传率（流出）', '重传率(流出)[kbps]')
        .replace('包重传率（流入）', '包重传率(流入)[个/秒]')
        .replace('包重传率（流出）', '包重传率(流出)[个/秒]')
        .replace('往返时间（流入）', '往返时间(流入)[毫秒]')
        .replace('往返时间（流出）', '往返时间(流出)[毫秒]')
        .replace('丢包情况(流入)', '丢包情况(流入)[%]')
        .replace('丢包情况(流出)', '丢包情况(流出)[%]')
        .replace('重传时延（流入）', '重传时延(流入)[毫秒]')
        .replace('重传时延（流出）', '重传时延(流出)[毫秒]')
        //网络连接
        .replace('连接请求数(TCP服务器)', '请求数(接收)[个]')
        .replace('连接请求数(TCP客户端)', '请求数(发送)[个]')
        .replace('连接数(TCP服务器)', '连接数(接收)[个]')
        .replace('连接数(TCP客户端)', '连接数(发送)[个]')
        .replace('连接失败数(TCP服务器)', '失败数(接收)[个]')
        .replace('连接失败数(TCP客户端)', '失败数(发送)[个]')
        .replace('连接时长(TCP服务器)', '连接时长(接收)[秒]')
        .replace('连接时长(TCP客户端)', '连接时长(发送)[秒]')
        .replace('连接率(TCP服务器)', '连接率(接收)[个/秒]')
        .replace('连接率(TCP客户端)', '连接率(发送)[个/秒]')
        .replace('连接请求率(TCP服务器)', '请求率(接收)[个/秒]')
        .replace('连接请求率(TCP客户端)', '请求率(发送)[个/秒]')
        .replace('连接失败率(TCP服务器)', '失败率(接收)[个/秒]')
        .replace('连接失败率(TCP客户端)', '失败率(发送)[个/秒]')
        //应用访问
        .replace('服务器端重置率（TCP服务器）', '服务器重置率(接收)[个/秒]')
        .replace('服务器端重置率（TCP客户端）', '服务器重置率(发送)[个/秒]')
        .replace('交互率（服务器）', '交互率(接收)[个/秒]')
        .replace('交互率（客户端）', '交互率(发送)[个/秒]')
        .replace('交互数（服务器）', '交互数(接收)[个]')
        .replace('交互数（客户端）', '交互数(发送)[个]')
        .replace('客户端重置率(TCP服务器)', '客户端重置率(接收)[个/秒]')
        .replace('客户端重置率(TCP客户端)', '客户端重置率(发送)[个/秒]')
        //应用性能
        .replace('连接建立时间(TCP服务器)', '连接时间(接收)[毫秒]')
        .replace('连接建立时间(TCP客户端)', '连接时间(发送)[毫秒]')
        .replace('服务器响应时间（服务器）', '服务器响应时间(接收)[毫秒]')
        .replace('服务器响应时间（客户端）', '服务器响应时间(发送)[毫秒]')
        .replace('数据传输时间（服务器）', '数据传输时间(接收)[秒]')
        .replace('数据传输时间（客户端） ', '数据传输时间(发送)[秒]')
        .replace('净荷传输时间（服务器）', '载荷传输时间(接收)[秒]')
        .replace('净荷传输时间（客户端）', '载荷传输时间(发送)[秒]')
        .replace('第一字节时间（TCP服务器）', '首包时间(接收)[毫秒]')
        .replace('第一字节时间（TCP客户端）', '首包时间(发送)[毫秒]')
        .replace('初始应用响应时间（TCP服务器）', '首次应用响应时间(接收)[毫秒]')
        .replace('初始应用响应时间（TCP客户端）', '首次应用响应时间(发送)[毫秒]')
        //用户体验
        .replace('用户体验时间（服务器）', '用户体验时间(接收)[秒]')
        .replace('用户体验时间（客户端）', '用户体验时间(发送)[秒]')
        //业务网络使用
        .replace('请求流量', '请求流量[MB]')
        .replace('页面大小', '页面大小[KB]')
        .replace('页面流量', '页面流量[MB]')
        .replace('请求大小', '请求大小[KB]')
        //业务访问
        .replace('页面访问数', '访问数[次]')
        .replace('页面访问率', '访问率[次/分钟]')
        //业务性能
        .replace('慢页面数量', '慢访问数[次]')
        .replace('慢页面百分比', '慢访问百分比[%]')
        .replace('页面延时', '访问快慢[秒]')
        .replace('慢页面率', '慢页面率[次/分钟]')
        //WEB响应代码
        .replace('HTTP响应数', '响应数[次]')
        .replace('% HTTP 100数量', 'HTTP 100百分比[%]')
        .replace('% HTTP 200数量', 'HTTP 200百分比[%]')
        .replace('% HTTP 300数量', 'HTTP 300百分比[%]')
        .replace('% HTTP 400数量', 'HTTP 400百分比[%]')
        .replace('% HTTP 500数量', 'HTTP 500百分比[%]')

        .replace('HTTP 100数量', 'HTTP 100数量[次]')
        .replace('HTTP 200数量', 'HTTP 200数量[次]')
        .replace('HTTP 300数量', 'HTTP 300数量[次]')
        .replace('HTTP 400数量', 'HTTP 400数量[次]')
        .replace('HTTP 500数量', 'HTTP 500数量[次]')
}
//exclude unit
export function replace_disp_str2(orig){
  if(orig == undefined){
    return false;
  }
  return orig.replace('Group', '名称')
    //数据包
    .replace('包吞吐量 （流入和流出）', '每秒包数(总和)')
    .replace('包吞吐量（流入）', '每秒包数(流入)')
    .replace('包吞吐量（流出）', '每秒包数(流出)')
    .replace('数据包大小（流入）', '包大小(流入)')
    .replace('数据包大小（流出）', '包大小(流出)')
    .replace('包流量 （流入和流出）', '包个数(总和)')
    .replace('包流量（流入）', '包个数(流入)')
    .replace('包流量（流出）', '包个数(流出)')
    //网络流量
    .replace('吞吐量（流入和流出）', '吞吐量(总和)')
    .replace('吞吐量（流入）', '吞吐量(流入)')
    .replace('吞吐量（流出）', '吞吐量(流出)')
    .replace('流量（流入和流出）', '字节数(总和)')
    .replace('流量（流入）', '字节数(入向)')
    .replace('流量（流出）', '字节数(出向)')
    //传输效率
    .replace('有效吞吐(流入)', '有效吞吐(流入)')
    .replace('有效吞吐(流出)', '有效吞吐(流出)')
    .replace('利用率 (流入)', '利用率(流入)')
    .replace('利用率 (流出)', '利用率(流出)')
    .replace('净荷（服务器）', '有效载荷(接收)')
    .replace('净荷（客户端）', '有效载荷(发送)')
    .replace('数据包净荷（客户端）', '载荷数据包数(发送)')
    .replace('数据包净荷（服务器）', '载荷数据包数(接收)')
    //网络性能
    .replace('重传率（流入）', '重传率(流入)')
    .replace('重传率（流出）', '重传率(流出)')
    .replace('包重传率（流入）', '包重传率(流入)')
    .replace('包重传率（流出）', '包重传率(流出)')
    .replace('往返时间（流入）', '往返时间(流入)')
    .replace('往返时间（流出）', '往返时间(流出)')
    .replace('丢包情况(流入)', '丢包情况(流入)')
    .replace('丢包情况(流出)', '丢包情况(流出)')
    .replace('重传时延（流入）', '重传时延(流入)')
    .replace('重传时延（流出）', '重传时延(流出)')
    //网络连接
    .replace('连接请求数(TCP服务器)', '请求数(接收)')
    .replace('连接请求数(TCP客户端)', '请求数(发送)')
    .replace('连接数(TCP服务器)', '连接数(接收)')
    .replace('连接数(TCP客户端)', '连接数(发送)')
    .replace('连接失败数(TCP服务器)', '失败数(接收)')
    .replace('连接失败数(TCP客户端)', '失败数(发送)')
    .replace('连接时长(TCP服务器)', '连接时长(接收)')
    .replace('连接时长(TCP客户端)', '连接时长(发送)')
    .replace('连接率(TCP服务器)', '连接率(接收)')
    .replace('连接率(TCP客户端)', '连接率(发送)')
    .replace('连接请求率(TCP服务器)', '请求率(接收)')
    .replace('连接请求率(TCP客户端)', '请求率(发送)')
    .replace('连接失败率(TCP服务器)', '失败率(接收)')
    .replace('连接失败率(TCP客户端)', '失败率(发送)')
    //应用访问
    .replace('服务器端重置率（TCP服务器）', '服务器重置率(接收)')
    .replace('服务器端重置率（TCP客户端）', '服务器重置率(发送)')
    .replace('交互率（服务器）', '交互率(接收)')
    .replace('交互率（客户端）', '交互率(发送)')
    .replace('交互数（服务器）', '交互数(接收)')
    .replace('交互数（客户端）', '交互数(发送)')
    .replace('客户端重置率(TCP服务器)', '客户端重置率(接收)')
    .replace('客户端重置率(TCP客户端)', '客户端重置率(发送)')
    //应用性能
    .replace('连接建立时间(TCP服务器)', '连接时间(接收)')
    .replace('连接建立时间(TCP客户端)', '连接时间(发送)')
    .replace('服务器响应时间（服务器）', '服务器响应时间(接收)')
    .replace('服务器响应时间（客户端）', '服务器响应时间(发送)')
    .replace('数据传输时间（服务器）', '数据传输时间(接收)')
    .replace('数据传输时间（客户端） ', '数据传输时间(发送)')
    .replace('净荷传输时间（服务器）', '载荷传输时间(接收)')
    .replace('净荷传输时间（客户端）', '载荷传输时间(发送)')
    .replace('第一字节时间（TCP服务器）', '首包时间(接收)')
    .replace('第一字节时间（TCP客户端）', '首包时间(发送)')
    .replace('初始应用响应时间（TCP服务器）', '首次应用响应时间(接收)')
    .replace('初始应用响应时间（TCP客户端）', '首次应用响应时间(发送)')
    //用户体验
    .replace('用户体验时间（服务器）', '用户体验时间(接收)')
    .replace('用户体验时间（客户端）', '用户体验时间(发送)')
    //业务网络使用
    .replace('请求流量', '请求流量')
    .replace('页面大小', '页面大小')
    .replace('页面流量', '页面流量')
    .replace('请求大小', '请求大小')
    //业务访问
    .replace('页面访问数', '访问数')
    .replace('页面访问率', '访问率')
    //业务性能
    .replace('慢页面数量', '慢访问数')
    .replace('慢页面百分比', '慢访问百分比')
    .replace('页面延时', '访问快慢')
    .replace('慢页面率', '慢页面率')
    //WEB响应代码
    .replace('HTTP响应数', '响应数')
    .replace('% HTTP 100数量', 'HTTP 100百分比')
    .replace('% HTTP 200数量', 'HTTP 200百分比')
    .replace('% HTTP 300数量', 'HTTP 300百分比')
    .replace('% HTTP 400数量', 'HTTP 400百分比')
    .replace('% HTTP 500数量', 'HTTP 500百分比')

    .replace('HTTP 100数量', 'HTTP 100数量')
    .replace('HTTP 200数量', 'HTTP 200数量')
    .replace('HTTP 300数量', 'HTTP 300数量')
    .replace('HTTP 400数量', 'HTTP 400数量')
    .replace('HTTP 500数量', 'HTTP 500数量')
}


export function replace_unit(orig){
  if(orig && orig.metric && orig.metric.dpm) return orig.metric.unit || ''
  if(orig == undefined){
    return false;
  }
  //详细见api metrics
  let newOrig=''
  if(orig.metric.unit=='data'||orig.metric.unit=='t'){
    newOrig=orig.unit
  }else{
    newOrig=orig.metric.unit
  }
  return newOrig
      .replace('Group', '名称')
      //数据包
      // .replace('千bits/秒', 'Kbps')
      .replace('files/sec', '个/秒')
      .replace('resets/sec', '个/秒')
      .replace('packets/sec', '个/秒')
      .replace('pages/min', '个/分')
      .replace('kb/sec', 'Mbps')
      .replace('data', '个')
      .replace('千bits/秒', 'Mbps')
      .replace('KiB', 'KB')
      .replace('MiB', 'MB')
      .replace('files', '个')
      .replace('objects', '个')
      .replace('msec', '毫秒')
      .replace('sec', '秒')
      .replace('pages', '次')
      .replace('#', '个')
      .replace('t', '毫秒');
}
export function replace_unit2(orig){
  if(orig && orig.metric && orig.metric.dpm) return orig.metric.unit || ''
  if(orig == undefined){
    return false;
  }
  //详细见api metrics
  let newOrig=''
  if(orig.metric.unit=='data'||orig.metric.unit=='t'){
    newOrig=orig.unit
  }else{
    newOrig=orig.metric.unit
  }
  return newOrig
      .replace('Group', '名称')
      //数据包
      // .replace('千bits/秒', 'Kbps')
      .replace('kb/sec', 'Mbps')
      .replace('data', '个')
      .replace('千bits/秒', 'Mbps')
      .replace('KiB', 'KB')
      .replace('MiB', 'MB')
      .replace('files', '个')
      .replace('objects', '个')
      .replace('msec', '秒')
      .replace('sec', '秒')
      .replace('pages', '次')
      .replace('#', '个')
      .replace('t', '秒');
}
export function num_to_fixed(value,digits){
  // value  要处理的数值
  // digits  保留小数点的个数
  value=String(value)
  digits=digits || 3
  let index=value.indexOf('.')
  value=parseFloat(value)
  if(index!=-1){
    return value.toFixed(digits)
  }else{
    return value
  }
}
export function canvasDataURL(path, obj, callback){
  var img = new Image();
  img.src = path;
  img.setAttribute("crossOrigin",'Anonymous')
  img.onload = function(){
      var that = this;
      // 默认按比例压缩
      var w = that.width,
          h = that.height,
          scale = w / h;
      w = obj.width || w;
      h = obj.height || (w / scale);
      var quality = 0.7;  // 默认图片质量为0.7
      //生成canvas
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      // 创建属性节点
      var anw = document.createAttribute("width");
      anw.nodeValue = w;
      var anh = document.createAttribute("height");
      anh.nodeValue = h;
      canvas.setAttributeNode(anw);
      canvas.setAttributeNode(anh);
      ctx.drawImage(that, 0, 0, w, h);
      // 图像质量
      if(obj.quality && obj.quality <= 1 && obj.quality > 0){
          quality = obj.quality;
      }
      // quality值越小，所绘制出的图像越模糊
      var base64 = canvas.toDataURL('image/jpeg', quality);
      // 回调函数返回base64的值
      callback(base64);
  }
}
