
$(document).ready(function () {
    //address：切换城市显示对应的大厦
    $("#city li").each(function (i, model) {
        $(this).click(function () {
            $("#city li").removeClass("active");
            $(this).addClass("active");

            $(".branch_city").hide();
            $("#branch_city_" + (i + 1) + "").show();
        });
    });
    // //shop：切换左边菜单
    // $("#aside li").each(function (i, model) {
    //     $(this).click(function () {
    //         $("#aside li").removeClass("active");
    //         $(this).addClass("active");

    //         var datacid = $(this).attr("data-cid");//分类编号
    //         var dataident = $(this).attr("data-ident");//分类是否是2级  1.有 0.无

    //         if (dataident == 0) {//没有2级直接显示列表
    //             //二级分类(列表)
    //             $(".cate").removeClass("show");
    //             $(".cate").addClass("hide");

    //             $(".lists").removeClass("show");
    //             $(".lists").addClass("hide");
    //             $("#lists_" + datacid + "").removeClass("hide");
    //             $("#lists_" + datacid + "").addClass("show");
    //         }
    //         if (dataident == 1) {//有2级显示缩略图，点击缩略图在显示列表
    //             //一级分类(缩略图)
    //             $(".lists").removeClass("show");
    //             $(".lists").addClass("hide");

    //             $(".cate").removeClass("show");
    //             $(".cate").addClass("hide");
    //             $("#cate_" + datacid + "").removeClass("hide");
    //             $("#cate_" + datacid + "").addClass("show");
    //         }
    //     });
    // });
    //shop：点击一级分类缩略图，显示对应的二级分类列表
    $(".cate ul li").each(function (i, model) {
        $(this).click(function () {
            var datacid = $(this).attr("data-cid");//一级分类编号
            var dataident = $(this).attr("data-ident");//分类是否是3级  1.有 0.无

            $(".cate").removeClass("show");
            $(".cate").addClass("hide");

            $(".lists").removeClass("show");
            $(".lists").addClass("hide");
            $("#lists_" + datacid + "").removeClass("hide");
            $("#lists_" + datacid + "").addClass("show");
        });
    });

    // //shop：加入购物车
    // $(".lists li").each(function (i, model) {
    //     var objLi = $(this);
    //     //点击购物车
    //     $(objLi).find(".join").click(function () {
    //         $(objLi).addClass("on");
    //         $(objLi).find(".number").text(1);

    //         CountNumPrice();
    //     });
    //     //点击减数量
    //     $(objLi).find(".num_l").click(function () {
    //         var number = parseInt($(objLi).find(".number").text()) - 1;
    //         var cart = $(objLi).attr("cart");
    //         if (number > 0) {
    //             $(objLi).find(".number").text(number);
    //         } else {
    //             if (cart == 1) {//说明是购物车中的操作
    //                 $(objLi).remove();
    //             } else if (cart == 2) {//说明是外卖的操作
    //                 if (number == 0) {
    //                     $(objLi).find(".number").text(number);
    //                 }
    //             } else {
    //                 $(objLi).removeClass("on");
    //             }
    //         }

    //         CountNumPrice();
    //     });
    //     //点击加数量
    //     $(objLi).find(".num_r").click(function () {
    //         var number = parseInt($(objLi).find(".number").text()) + 1;
    //         $(objLi).find(".number").text(number);

    //         CountNumPrice();
    //     });
        // //点击查看产品详情
        // $(objLi).find(".view").click(function () {
        //     $(objLi).find(".detail").show(200);
        // });
    // });
    //addr：添加收货地址
    // $("#btnSave").click(function () {
    //     if ($("#name").val() == "") {
    //         weui_dialog_alert(1);
    //         return;
    //     }
    //     if ($("#phone").val() == "") {
    //         weui_dialog_alert(2);
    //         return;
    //     }
    //     if ($("#dong").val() == "") {
    //         weui_dialog_alert(3);
    //         return;
    //     }
    //     if ($("#ceng").val() == "") {
    //         weui_dialog_alert(4);
    //         return;
    //     }
    //     if ($("#fang").val() == "") {
    //         weui_dialog_alert(5);
    //         return;
    //     }
    //     window.location.href="cart.html"
    // });
    //order：订单tab切换
    $(".navlist li").each(function () {
        $(this).click(function () {
            $(".navlist li").removeClass("active");
            $(this).addClass("active");

            var type = $(this).attr("type");
            $(".orderlist").hide();
            $("#order_" + type + "").show();
        });
    });
});
//address：搜索触发事件
function searchfocus() {
    $(".list").addClass("ng-hide");
}
//address：搜索焦点离开事件
function searchblur() {
    $(".list").removeClass("ng-hide");
}
//address：搜索改变事件
function kwsearch() {
    $("#branch1").removeClass("ng-hide");
}
//address：点击选择地址
function showselect(type) {
    if (type == 1) {
        $("#addrselect").removeClass("ng-hide");
    } else {
        $("#addrselect").addClass("ng-hide");
    }
}
//shop：计算数量和价格
function CountNumPrice() {
    var totalcartnumber = 0;//数量
    var totalmoney = 0;//价格
    $(".lists .on").each(function (i, model) {
        var objLi = $(this);
        var number = parseInt($(objLi).find(".number").text());
        var price = parseFloat($(objLi).attr("price"));
        
        totalcartnumber = totalcartnumber + number;
        totalmoney = totalmoney + (number * price);
    });
    $("#totalcartnumber").text(totalcartnumber);
    $("#totalmoney").text(totalmoney.toFixed(2));
}
//shop：关闭产品详情
function CloseDetail(obj) {
    $(obj).parent(".detail").hide(100);
}
// //弹出dialog
// function weui_dialog_alert(code) {
//     var msg = "";
//     if (code==1) {
//         msg = "填写姓名";
//     }
//     if (code == 2) {
//         msg = "手机号格式错误";
//     }
//     if (code == 3) {
//         msg = "选择栋";
//     }
//     if (code == 4) {
//         msg = "选择楼层";
//     }
//     if (code == 5) {
//         msg = "填写房间号";
//     }
//     $("#_alert_").show();
//     $("#_alert_ #alert-msg").html(msg);
// }
//关闭dialog
function weui_dialog_close() {
    $("#_alert_").hide();
}