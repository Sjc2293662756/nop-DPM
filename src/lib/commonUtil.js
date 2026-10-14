// 密码正则验证
export function checkPass (password) {
    let reg = new RegExp(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/);
    return reg.test(password);
}

// 手机号正则验证
export function checkPhone (phone) {
    let reg = new RegExp(/^1[\d]{10}$/);
    return reg.test(phone);
}

// 纯数字正则验证
export function checkNum (num) {
    let reg = new RegExp(/^[0-9]*$/);
    reg.test(num);
}

// 去除前后空格
export function clearSpace(Str){
    let tempStr = Str.replace(/(^\s*)|(\s*)$/g,"");
    return tempStr;
}

// 纯英文正则验证
export function checkLetter(letter){
    let reg = new RegExp(/^[A-Za-z]+$/);
    return reg.test(letter);
}

// 匹配中文，数字，字母，//下划线
export function checkChinese(str){
    // let reg = new RegExp(/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/gi);
    let reg = new RegExp(/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/gi);
    return reg.test(str);
}

// 判断字符串中是否含有中文
export function isHaveChinese(str){
    let flag = false;
    for(let i = 0; i< str.length; i++){
        // 含有中文
        if(str.charCodeAt(i) > 255){
            flag = true;
        }
    }
    return flag;
}

/**
 * @param value input输入框的值
 * @param byteLength 限制的字符长度
 */ 
 export function checkField(value, byteLength) {    
    var newvalue = value.replace(/[^\x00-\xff]/g, "**");
    var length = newvalue.length;
    //当填写的字节数小于设置的字节数
    if (length * 1 <= byteLength * 1) {
     return value;
    }
    var limitDate = newvalue.substr(0, byteLength);
    var count = 0;
    var limitvalue = "";
    for (var i = 0; i < limitDate.length; i++) {
     var flat = limitDate.substr(i, 1);
     if (flat == "*") {
      count++;
     }
    }
    var size = 0;
    var istar = newvalue.substr(byteLength * 1 - 1, 1); //校验点是否为“*”
    //if 基点是*; 判断在基点内有×为偶数还是奇数
    if (count % 2 == 0) {
     //当为偶数时
     size = count / 2 + (byteLength * 1 - count);
     limitvalue = value.substr(0, size);
    } else {
     //当为奇数时
     size = (count - 1) / 2 + (byteLength * 1 - count);
     limitvalue = value.substr(0, size);
    }
    return limitvalue;
   }

/**
 * 正则匹配api地址是否合法
 */
export function checkApi(api) {
    let reg = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/);
    return reg.test(api)
}    
 
/**
 * 判断字符串是否为空
 * @param str
 * @returns {*|boolean}
 */
export function isStrEmpty(str) {
    return !(str && str !== 'null' && str !== 'undefined' && str !== '');
}