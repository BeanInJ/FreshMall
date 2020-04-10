$(function() {
	var token = getCookie("token");
	if (token == null) {
		$(location).prop('href', '/templates/mine-login.html');
	};
	if (token == "null") {
		$(location).prop('href', '/templates/mine-login.html');
	};
	getOrder(token, 1, '#order_1 .lists', "去付款", "");
	$(".navlist li").each(function() {
		$(this).click(function() {
			$(".navlist li").removeClass("active");
			$(this).addClass("active");

			var order_status = $(this).attr("type");
			$(".orderlist").hide();
			$("#order_" + order_status + "").show();

			ul = "#order_" + order_status + " .lists";

			if (order_status == "1") {
				var a_text = "去付款";
				var action = "";
			} else if (order_status == "2") {
				var a_text = "收货";
				var action = "done";
			} else {
				var a_text = "删除记录";
				var action = "del";
			};
			getOrder(token, order_status, ul, a_text, action);
		});
	});
});

function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if (arr = document.cookie.match(reg)) {
		return unescape(arr[2]);
	} else {
		return null;
	}
}

function getOrder(token, order_status, ul, a_text, action) {

	$.get('/static/getorder/', {
		"token": token,
		"order_status": order_status
	}, function(data) {
		if (data["status"] == 200) {
			$(ul).empty();
			for (var i = 0; i < data["orders_list"].length; i++) {
				var orders_list = data["orders_list"][i];
				var time = orders_list["o_time"].substring(0, 10) + " " + orders_list["o_time"].substring(11, 19);

				var order_li = '<li orderid="' +
					orders_list["id"] + '"><p>' +
					time + '</p><p>订单编号：' +
					orders_list["o_id"] + '</p><p>订单备注：' +
					orders_list["o_note"] + '</p><p>收货地址：' +
					orders_list["o_name"] + ' ' +
					orders_list["o_tell"] + ' ' +
					orders_list["o_addr"] + '</p>'

				var foods_ul = '<ul class="pdtlist">';
				for (var j = 0; j < orders_list["o_foods"].length; j++) {
					var foods = orders_list["o_foods"][j];
					if (foods["f_is_points"]) {
						var points = parseInt(foods["f_price"]) * foods["f_num"];
					} else {
						var points = 0;
					};

					var food_li = '<li><div class="l"><img src="' +
						foods["f_img"] + '" class="img-responsive" alt="..." /></div><div class="r"><p class="t">' +
						foods["f_longname"] + '</p><p class="money">￥' +
						foods["f_price"] + ' x ' +
						foods["f_num"] + '</p><p class="jf">送积分：' +
						points + '</p></div></li>'
					foods_ul = foods_ul + food_li;
				}
				if (a_text == "去付款") {
					var href = 'href="/templates/cart-pay.html?order_id=' + orders_list["id"] + '&token=' + token + '"';
				} else {
					var href = "";
				};
				order_li = order_li + foods_ul + '</ul><div class="bottom"><p>应付：<b style="color: #d51b44">￥' +
					orders_list["o_price"] + '元</b> &nbsp&nbsp&nbsp&nbsp优惠抵扣：<b style="color: #d51b44">￥' +
					orders_list["o_sub_price"] + '元</b></p><a class="order_a"' +
					href + '>' +
					a_text + '</a></div></li>'
				$(ul).append(order_li);
			};
		};
		if (action == "del") {
			order_click(action, token);
		} else if (action == "done") {
			order_click(action, token);
		};
	});

}

function order_click(action, token) {
	$(".order_a").click(function() {
		var order_id = $(this).parent().parent().attr("orderid");
		$(this).parent().parent().hide();
		console.log(order_id)
		$(this).attr("href", "#");
		$.get("/static/orderchange/", {
			"token": token,
			"action": action,
			"order_id": parseInt(order_id)
		}, function(data) {
			if (data["status"] == 200) {
				
			} else {
				alert(data["msg"]);
			}
		});
	});
}
