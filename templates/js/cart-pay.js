// 提交的订单
var submit_order_id = 0;
// 提交的地址
var submit_addr_id = 0;
// 提交的优惠方式
var submit_points_or_vip = '';
// 如果提交方式为points，提交使用的积分数
var submit_use_points = 0;
var token = getToken();
$(function() {
	var token = getToken();
	show(token);
	$(".wxpay").click(function() {
		alert("暂时不支持微信支付");
	});
});

// 获取token
function getToken() {
	var arr, reg = new RegExp("(^| )" + "token" + "=([^;]*)(;|$)");
	if (arr = document.cookie.match(reg)) {
		if (unescape(arr[2]) == null) {
			$(location).prop('href', '/templates/mine-login.html');
		};
		if (unescape(arr[2]) == "null") {
			$(location).prop('href', '/templates/mine-login.html');
		};
		return unescape(arr[2]);
	} else {
		return null;
	}
}

//获取url参数封装成对象
function GetRequest() {
	var url = location.search; //获取url中"?"符后的字串
	var theRequest = new Object();
	if (url.indexOf("?") != -1) {
		var str = url.substr(1);
		strs = str.split("&");
		for (var i = 0; i < strs.length; i++) {
			theRequest[strs[i].split("=")[0]] = decodeURIComponent((strs[i].split("=")[1]));
		}
	}
	return theRequest;
}

// 选择优惠监听
function discount_select(all_points, use_points, vip, vip_points, no_points_yuan, total_yuan) {
	var a = $("input[name='discount']:checked").val();
	$("input[name='discount']").change(function() {
		if (this.value == '3') {

			submit_points_or_vip = 'points';
			submit_use_points = all_points;

			$(".discount").empty();
			var use_points_1 = use_points * 0.01;
			// 使用积分不超出总积分
			if (use_points > all_points) {
				use_points = all_points;
				use_points_1 = all_points * 0.01;
			};
			// 兑换金额不超出总消费额
			if (use_points_1 < total_yuan) {
				// 兑换金额不超出不积分的总消费额
				submit_use_points = use_points;
			} else {
				use_points = 0;
				use_points_1 = 0;
			};

			var text = '账户共有' +
				all_points + '个积分，本次使用 <input type="number" class="number" max="' +
				all_points + '" min="1" value="' +
				use_points + '" /> 个&nbsp&nbsp&nbsp<span class="red">￥' +
				use_points_1 + '</span>'
			$(".discount").append(text);

			var yuan_span = '优惠抵扣：￥' + use_points_1 + ' 元';
			$("#yuan div span").text(yuan_span);
			$("#totalmoney").text(total_yuan - use_points_1);
			$(".number").bind("input", function() {
				var points_1 = this.value * 0.01;
				// 使用积分不超出总积分
				if (this.value < all_points) {
					// 兑换金额不超出总消费额
					if (points_1 < total_yuan) {
						// 兑换金额不超出不积分的总消费额
						$(".discount .red").text("￥" + points_1);
						submit_use_points = parseInt(this.value);
						var yuan_span = '优惠抵扣：￥' + points_1 + ' 元';
						$("#yuan div span").text(yuan_span);
					} else {
						$(this).val(0);
						$(".discount .red").text("￥" + 0);
						alert("优惠金额超出消费总金额，请重新输入");
						var yuan_span = '优惠抵扣：￥' + 0 + ' 元';
						$("#yuan div span").text(yuan_span);
						points_1 = 0;
					};
				} else {
					$(this).val(0);
					$(".discount .red").text("￥" + 0);
					alert("超出总积分，请重新输入");
					var yuan_span = '优惠抵扣：￥' + 0 + ' 元';
					$("#yuan div span").text(yuan_span);
					points_1 = 0;
				};
				$("#totalmoney").text(total_yuan - points_1);
			});
		} else if (this.value == '2') {
			submit_points_or_vip = 'vip';
			$(".discount").empty();
			var text = '您的VIP等级为<span class="red">' +
				vip + '</span>，可享受<span class="red">' +
				vip_points + '</span>折优惠'
			$(".discount").append(text);
			$("#totalmoney").text(total_yuan * vip_points);
			var yuan_span = '优惠抵扣：￥' + parseFloat(total_yuan * (1 - vip_points)).toFixed(2) + ' 元';
			$("#yuan div span").text(yuan_span);
		} else if (this.value == '0') {
			$(".discount").empty();
			var text = '不参与优惠'
			$(".discount").append(text);
		}
	});
}
// 获取地址信息
function getAddr(token, addr_select, addr_id, order_id) {
	$.get("/static/addr/", {
		"token": token,
		"addr_select": addr_select,
		"addr_id": addr_id
	}, function(data) {
		if (data.length > 0) {
			var name = '收货人：' + data[0]["a_user_name"];
			var tell = '电话：' + data[0]["a_tell"];
			var addr = '收货地址：' + data[0]["a_detail"];
			$(".addr p:eq(0)").text(name);
			$(".addr p:eq(1)").text(tell);
			$(".addr p:eq(2)").text(addr);
			if (addr_id == 0) {
				var action_text = '<p class="edit"><a href="mine-addr-list-cart.html?action=pay&order_id=' + order_id +
					'">修改</a></p>'
				$(".addr").append(action_text);
			} else {
				var action_text = '<p class="edit"><a href="mine-addr-list-cart.html?action=pay&addr_id=' + addr_id +
					'&order_id=' + order_id + '">修改</a>'
				$(".addr").append(action_text);
			};
			$(".addr").append('');
		} else {
			var action_text = '<a href="mine-addr-new.html?action=pay&order_id=' + order_id + '">点击 添加地址</a>'
			$(".addr").append(action_text);
		};
		submit_addr_id = parseInt(addr_id);
	});
}
// 根据是否传递过来addr_id,获取地址
function showaddr(token) {
	var getRequest = GetRequest();
	if (getRequest.addr_id) {
		// 获取传过来的地址信息
		getAddr(token, "my-select", getRequest.addr_id, getRequest.order_id);
	} else {
		// 获取默认地址
		getAddr(token, "cart", 0, getRequest.order_id);
	};
}
// 显示信息
function show(token) {
	order_id = GetRequest().order_id;
	$.get("/static/pay/", {
		"token": token,
		"order_id": order_id,
	}, function(data) {
		if (data["status"] == 200) {
			submit_order_id = order_id;
			// 时间、订单编号
			var time = data["o_time"].substring(0, 10) + " " + data["o_time"].substring(11, 19);
			$(".title span:eq(0)").text(time);
			var id = "订单编号：" + data["o_id"]
			$(".title span:eq(1)").text(id);
			// 地址
			showaddr(token);
			// 商品
			var acc_points = 0; // 累计获得的积分
			var no_points_yuan = 0; // 不积分总价
			var total_yuan = 0;
			for (var i = 0; i < data["foods"].length; i++) {
				if (data["foods"][i]["f_is_points"]) {
					var points = parseInt(data["foods"][i]["f_price"]) * data["foods"][i]["f_num"];
				} else {
					var points = 0;
					no_points_yuan = no_points_yuan + (data["foods"][i]["f_price"] * data["foods"][i]["f_num"]);
				};
				total_yuan = total_yuan + (data["foods"][i]["f_price"] * data["foods"][i]["f_num"]);
				acc_points = acc_points + points;
				var li = '<li><div class="l"><img src="' +
					data["foods"][i]["f_img"] + '" class="img-responsive" alt="..." /></div><div class="r"><p class="t">' +
					data["foods"][i]["f_longname"] + '</p><p class="money">￥' +
					data["foods"][i]["f_price"] + ' x ' +
					data["foods"][i]["f_num"] + '</p><p class="jf">送积分：' +
					points + '</p></div></li>'
				$(".pdtlist").append(li);
			};
			// 选择优惠方式
			var all_points = data["points"];
			var use_points = all_points;
			discount_select(all_points, use_points, data["vip"], data["vip_points"], no_points_yuan, total_yuan);
			// 总价

			var yuan = '<p>总计：￥' + total_yuan + '元<span class="right">优惠抵扣：￥0.00 元</span></p>'
			$("#yuan div").append(yuan);
			$("#totalmoney").text(total_yuan);
		};
	});
	// 优惠方式：总价、减去的优惠
}

function checkyy() {
	$("#pay input:eq(0)").attr("value", token);
	$("#pay input:eq(1)").attr("value", submit_addr_id);
	$("#pay input:eq(2)").attr("value", submit_order_id);
	$("#pay input:eq(3)").attr("value", submit_points_or_vip);
	$("#pay input:eq(4)").attr("value", submit_use_points);
	return true
}
