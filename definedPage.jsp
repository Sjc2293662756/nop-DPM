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
<div id="fullScreen" class="container" style="width:100%">
  <!--5_1--UNTCP-->
    <div class="at-countdown--card pad30" id="isShow_time">
        <div id="show_time">
        </div>
    </div>
    <%--侧边目录--%>
    <!-- Sidebar -->
    <div id="definedPage">
        <aside class="main-sidebar">
            <div  class="sidebar">
                <ul class="sidebar-menu">
                    <li class="header"><span class="pointer" onclick="getChildPage()">目录管理</span><i class="fa fa-plus-square pull-right m-t-3" aria-hidden="true" id="addFolder"></i></li>
                    <%--<li class="treeview">--%>
                        <%--<a href="#">--%>
                            <%--<i class="fa fa-dashboard"></i> <span>仪表盘</span>--%>
                            <%--<i class="fa fa-angle-down pull-right m-t-4"></i>--%>
                            <%--<span class="handle-icons">--%>
                                <%--<i class="fa fa-star" aria-hidden="true" ></i>--%>
                                <%--&lt;%&ndash;<i class="fa fa-star-o" aria-hidden="true"></i>&ndash;%&gt;--%>
                                <%--<i class="fa fa-pencil-square m-l-5" aria-hidden="true"  id="editFolder"></i>--%>
                                <%--<i class="fa fa-times-circle m-l-5" aria-hidden="true"  id="deleteFolder"></i>--%>
                            <%--</span>--%>

                        <%--</a>--%>
                        <%--<ul class="treeview-menu">--%>
                            <%--<li><a href="#"><i class="fa fa-circle-o"></i> 仪表盘 v1</a></li>--%>
                            <%--<li><a href="#"><i class="fa fa-circle-o"></i> 仪表盘 v2</a></li>--%>
                        <%--</ul>--%>
                    <%--</li>--%>
                </ul>
            </div>
        </aside>
        <%--右侧内容--%>
        <div class="right-content">
            <%--顶部搜索--%>
            <div class="top-handle">
                <%--<div class="col-md-3 col-sm-4 col-xs-4 form-group">--%>
                    <%--<div class="input-group">--%>
                        <%--<input type="text" id="inputTopInput" class="form-control" placeholder="输入关键字搜索">--%>
                        <%--<span class="input-group-btn">--%>
                            <%--<button class="btn btn-default" id="inputTopBtn"   data-mod='' type="button">查询</button>--%>
                        <%--</span>--%>
                    <%--</div>--%>
                <%--</div>--%>
                <div class="right-handle" style="float:right">
                    <i class="fa fa-reorder cfff fontSize22 pointer" aria-hidden="true"  id="listShow"></i>
                    <img src="../image/list.png" alt="" class="m-l-15 pointer" id="cardShow" style="height:26px"/>
                    <button class="btn btn-default m-l-15 pointer"   data-mod='' type="button" onclick="createDefinedPage()">自定义视图</button>
                </div>
            </div>
            <%--页面列表--%>
            <div class="thumbnail-list" id="list-mode">
                <div class="row">
                    <%--<div class="col-sm-6 col-md-3">--%>
                        <%--<div class="thumbnail">--%>
                            <%--<img src="../image/bg.jpg" alt="图片">--%>
                            <%--<div class="caption cfff">--%>
                                <%--<div class="title">--%>
                                    <%--<h3>Thumbnail label</h3>--%>
                                    <%--&lt;%&ndash;<i class="fa fa-star" aria-hidden="true"></i>&ndash;%&gt;--%>
                                    <%--<i class="fa fa-star-o" aria-hidden="true"></i>--%>
                                <%--</div>--%>
                                <%--<p>页面描述</p>--%>
                            <%--</div>--%>
                        <%--</div>--%>
                    <%--</div>--%>
                </div>
            </div>
        </div>
    </div>
    <%--弹框--%>
    <div class="modal fade" id="addFolderModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title" id="exampleModalLabel">新增文件夹</h4>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group">
                            <label for="recipient-name" class="control-label">文件夹名称:</label>
                            <input type="text" class="form-control" id="folder-name">
                        </div>
                        <%--<div class="form-group">--%>
                            <%--<label for="message-text" class="control-label">Message:</label>--%>
                            <%--<textarea class="form-control" id="message-text"></textarea>--%>
                        <%--</div>--%>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" id="saveFolder">保存</button>
                </div>
            </div>
        </div>
    </div>
    <%--创建自定义视图弹窗--%>
    <div class="modal fade" id="definedPageModal" tabindex="-1" role="dialog" aria-labelledby="definedPageModalLabe">
        <div class="modal-dialog" role="document" style="width:800px">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title" id="definedPageModalLabe">新增自定义视图</h4>
                </div>
                <div class="modal-body">
                    <%--<button onclick="nextStep()">addStep</button>--%>
                    <%--<button onclick="preSteps()">clearSteps</button>--%>
                    <%--步骤条--%>
                    <div class="steps">
                        <div class="step ">
                            <div class="step-head">
                                <div class="step-line"></div>
                                <div class="step-icon">
                                    1
                                </div>
                            </div>
                            <div class="step-main">
                                步骤一
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-head">
                                <div class="step-line"></div>
                                <div class="step-icon">
                                    2
                                </div>
                            </div>
                            <div class="step-main">
                                步骤二
                            </div>
                        </div>

                        <div class="step">
                            <div class="step-head">
                                <div class="step-icon">
                                    3
                                </div>
                            </div>
                            <div class="step-main">
                                步骤三
                            </div>
                        </div>
                    </div>
                    <%--第一步--%>
                    <div class="step1">
                        <div class="flex">
                            <div class="box">
                                <img src="../image/chart.png" alt=""/>
                                <div class="btn">图表</div>
                            </div>
                            <div class="box">
                                <img src="../image/networkImg.png" alt=""/>
                                <div class="btn">网络图</div>
                            </div>
                            <div class="box">
                                <img src="../image/businessImg.png" alt=""/>
                                <div class="btn">业务图</div>
                            </div>
                        </div>
                        <div class="btns">
                            <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary m-l-15" onclick="nextStep(1)" >下一步</button>
                        </div>
                    </div>
                    <%--第二步--%>
                    <div class="step2">
                        <form class="form-inline" id="step2Form">
                            <div class="form-group">
                                <label for="recipient-name" class="control-label">视图名称<span class="required cf00">*</span></label>
                                <input type="text" class="form-control" id="name"/>
                            </div>
                            <%--<div class="form-group">--%>
                                <%--<label for="recipient-name" class="control-label">--%>
                                <%--<input type="checkbox" id="is_fav" value="1">是否在首页显示</label>--%>
                            <%--</div>--%>
                            <div class="form-group">
                                <label for="recipient-name" class="control-label">目录选择<span class="cf00">*</span></label>
                                <select class="form-control" id="folder_id">
                                    <%--<option value="">1</option>--%>
                                </select>
                            </div>
                            <%--<div class="form-group">--%>
                                <%--<label for="recipient-name" class="control-label">封面<span>*</span></label>--%>
                                <%--<input type="file" class="form-control" id="thumbnail_path">--%>
                            <%--</div>--%>
                            <div class="form-group">
                                <label for="message-text" class="control-label">内容描述</label>
                                <textarea class="form-control" rows="3" id="desc"></textarea>
                            </div>
                        </form>
                        <div class="btns">
                            <button type="button" class="btn btn-primary" onclick="preStep()" >上一步</button>
                            <button type="button" class="btn btn-default m-l-15" data-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary m-l-15" onclick="nextStep(1)" >下一步</button>
                        </div>
                    </div>
                    <%--第三步--%>
                    <div class="step3">
                        <form class="form-inline">
                            <div class="form-group">
                                <label for="recipient-name" class="control-label">时间范围<span class="cf00">*</span></label>
                                <select class="form-control">
                                    <option>自动识别时间</option>
                                    <%--<option>最近1小时</option>--%>
                                    <%--<option>最近一天</option>--%>
                                    <%--<option>最近一周</option>--%>
                                </select>
                            </div>
                        </form>
                        <div class="btns">
                            <button type="button" class="btn btn-primary" onclick="preStep()" >上一步</button>
                            <button type="button" class="btn btn-default m-l-15" data-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary m-l-15" onclick="saveCreatePage()" >保存</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <%--<button type="button" class="btn btn-default" data-dismiss="modal">取消</button>--%>
                    <%--<button type="button" class="btn btn-primary" id="saveFolder">保存</button>--%>
                </div>
                </div>
            </div>
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
    var pagetagCurrent = 'definedPage';
    </script>
  <%@include file="../js/js.jpsf"%>
    <script>
    $.sidebarMenu($('.sidebar-menu'))
    </script>
