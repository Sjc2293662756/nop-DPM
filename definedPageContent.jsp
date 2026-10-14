<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <%@include file="../js/css.jpsf"%>
    </head>

    <body class="noTime">
    <!--顶部导航-->

    <%@include file="../js/menu.jpsf"%>

    <!--主体部分-->
    <div id="fullScreen" class="" style="width:100%">
    <!--5_1--UNTCP-->
    <div class="at-countdown--card pad30" id="isShow_time">
    <div id="show_time">
    </div>
    </div>
    <div id="definedPageContent">
    <iframe id="mainiframe" src="" width="100%"  style="height:calc(100vh - 56px);margin-top:-11px" frameborder="0" scrolling="no"></iframe>
    </div>
    </div>
    <div class="scroll-to-top">
    <i class="fa fa-arrow-circle-up"></i>
    </div>

    <%@include file="../js/footer.jpsf"%>
    <script>

    </script>

    </body>
    </html>
    <script>
    var pagetagCurrent = 'definedPageContent';
    </script>
    <%@include file="../js/js.jpsf"%>
    <script>
    $(function(){
    // 获取浏览器url get参数
    var baseURL0 = "https://" + window.location.host;
    function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
    var r = window.location.search.substr(1).match(reg);
    return r?decodeURIComponent(r[2]):null;
    }
    var paramsId=getUrlParam('id')
    var pageName=getUrlParam('pageName')
    var page=getUrlParam('page')
    if(page==="view"){
    $('#mainiframe').attr("src",baseURL0+"/NetInside/virtualization/definedView/#/preview?id="+paramsId+"&pageName="+pageName)
    }else if(page==="editor"){
    $('#mainiframe').attr("src",baseURL0+"/NetInside/virtualization/definedView/#/imgeditor?id="+paramsId+"&pageName="+pageName)
    }else if(page==="network-editor"){
    $('#mainiframe').attr("src",baseURL0+"/NetInside/virtualization/definedView/#/network/editor?id="+paramsId+"&pageName="+pageName)
    }else if(page==="network-view"){
    $('#mainiframe').attr("src",baseURL0+"/NetInside/virtualization/definedView/#/network/view?id="+paramsId+"&pageName="+pageName)
    }else if(page==="application-editor"){
    $('#mainiframe').attr("src",baseURL0+"/NetInside/virtualization/definedView/#/application/editor?id="+paramsId+"&pageName="+pageName)
    }else if(page==="application-view"){
    $('#mainiframe').attr("src",baseURL0+"/NetInside/virtualization/definedView/#/application/view?id="+paramsId+"&pageName="+pageName)
    }
    <%--$('#mainiframe').attr("src","http://localhost:8080/#/imgeditor?id="+paramsId)--%>
    })
    </script>

