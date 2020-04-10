$(function() {
	var token = getCookie("token");
	if (token == null) {
		$(location).prop('href', '/templates/mine-login.html');
	};
	if (token == "null") {
		$(location).prop('href', '/templates/mine-login.html');
	};
	$.ajaxSettings.async = false;
	showcart(token);
	$.ajaxSettings.async = true;
	showaddr(token);
	cart_add(token);
});

function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if (arr = document.cookie.match(reg)) {
		return unescape(arr[2]);
	} else {
		return null;
	}
}

function showcart(token) {
	if (token != "null") {
		$.get('/static/cart/', {
			"token": token,
			"get_name": "cart_list"
		}, function(data) {
			if (data.cart_list.length > 0) {
				for (var i = 0; i < data.cart_list.length; i++) {
					if (data.cart_list[i].is_points == 1) {
						var points = parseInt(data.cart_list[i].f_price);
						var p = "送积分：" + points;
					} else {
						var points = 0;
						var p = "不参与积分";
					};
					var food_li = '<li foodid="' +
						data.cart_list[i].f_id +
						'" class="on" cart="1"><img src="img/x.png" class="x" alt="..." /><div class="l"><a target="_blank"><img src="img/n1.png" class="is_select ' +
						data.cart_list[i].is_select + '" alt="..." /><img src="' +
						data.cart_list[i].f_img + '" class="img-responsive" alt="..." /></a></div><div class="r"><p class="t">' +
						data.cart_list[i].f_longname + '</p><p class="price">￥' +
						data.cart_list[i].f_price + '</p><div class="jifen">' +
						p +
						'</div><div class="showaddcart"><div class="num_con"><img src="img/num_l.png" class="img-responsive num_l" alt="..." /><span class="number">' +
						data.cart_list[i].f_num +
						'</span><img src="img/num_r.png" class="img-responsive num_r" alt="..." /></div></div></div></li>'
					$(".lists").append(food_li);
				};
				var cartpay =
					'<div class="r"><a>提交订单</a></div><div class="l ng-binding c">￥<label id="totalmoney">' +
					data.total_price + '</label><span class="font11 points">本次获得积分：' +
					data.total_points + '</span></div>'
				$(".cart").append(cartpay);
				$(".cart").removeClass("hide");
				// 下单
				$(".r a").click(function(){
					make_order(token);
				});
			} else {
				$(".cartpay").addClass("ng-hide");
				$(".cartempty").removeClass("ng-hide");
			}
		});
	};

}
// 添加/减少商品
function cart_add(token) {

	//shop：加入购物车
	$(".lists li").each(function(i, model) {
		var objLi = $(this);
		var foodid = $(objLi).attr("foodid");
		//点击减数量
		$(objLi).find(".num_l").click(function() {
			var number = parseInt($(objLi).find(".number").text());
			if (number > 0) {
				get_food_num(token, foodid, 0, objLi);
				get_total(token, foodid);
			} else {
				$(objLi).remove();
			}
		});
		//点击加数量
		$(objLi).find(".num_r").click(function() {
			get_food_num(token, foodid, 1, objLi);
			get_total(token, foodid);
		});
		// 点击X
		$(objLi).find(".x").click(function() {
			$.get('/static/cart/', {
				"token": token,
				"foodid": foodid,
				"get_name": "food_x"
			}, function(data) {
				$(objLi).remove();
				get_total(token, foodid);
			})
		});
		// 点击勾
		$(objLi).find(".is_select").click(function() {
			var y = $(this)
			$.get('/static/cart/', {
				"token": token,
				"foodid": foodid,
				"get_name": "is_select"
			}, function(data) {
				// 如果为选中状态移除false
				if (data.msg) {
					$(y).removeClass("false");
					$(y).addClass("true");
				} else {
					$(y).removeClass("true");
					$(y).addClass("false");
				};
				get_total(token, foodid);
			})
		});
	});
}

function get_food_num(token, foodid, is_add, objLi) {
	$.get('/static/cartadd/', {
		"token": token,
		"foodid": foodid,
		"is_add": is_add
	}, function(data) {
		if (data["status"] == 200) {
			$(objLi).find(".number").text(data["c_foods_num"]);
		};
	});
};

function get_total(token, foodid) {
	$.get('/static/cart/', {
		"token": token,
		"foodid": foodid,
		"get_name": "total"
	}, function(data) {
		if (data["status"] == 200) {
			$("#totalmoney").text(data.total_price);
			var p = '本次获得积分：' + data.total_points
			$(".points").text(p);
		};
	});
};

function get_food_num(token, foodid, is_add, objLi) {
	$.get('/static/cartadd/', {
		"token": token,
		"foodid": foodid,
		"is_add": is_add
	}, function(data) {
		if (data["status"] == 200) {
			$(objLi).find(".number").text(data["c_foods_num"]);
		};
	});
};
// 显示地址
function showaddr(token) {
	if (GetRequest().addr_id) {
		getAddr(token, "my-select", GetRequest().addr_id);
	} else {
		getAddr(token, "cart", 0);
	};
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
// 获取地址
function getAddr(token, addr_select, addr_id) {
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
			if (addr_id == 0){
				$(".edit").append('<a href="mine-addr-list-cart.html?action=cart">修改</a>');
			}else{
				var a_cart = '<a href="mine-addr-list-cart.html?action=cart&addr_id='+addr_id+'">修改</a>'
				$(".edit").append(a_cart);
			};
		} else {
			$(".edit").append('<a href="mine-addr-new.html?action=cart">添加地址</a>');
		};
	});
}
// 下单
function make_order(token) {
	var addr_id = 0;
	var o_note = "您的留言";
	$.ajaxSettings.async = false;
	if (GetRequest().addr_id) {
		addr_id = GetRequest().addr_id;
	} else {
		$.get("/static/addr/", {
			"token": token,
			"addr_select": "list"
		}, function(data) {
			if (data["status"] == 200) {
				addr_id = data["addr_id"];
			};
		});
	};
	if ($("#o_note").text()){
		o_note = $("#o_note").text();
	}else{
		o_note = "您的留言";
	}
	$.post("/static/order/", {
		"token": token,
		"addr_id": addr_id,
		"o_note": o_note,
		"cart": "make_order",
	}, function(data) {
		if (data["status"] == 200) {
			var edit = "order_id=" + data["order_id"] + '&addr_id=' + addr_id;
			window.location.href = "cart-pay.html?" + edit;
		}else if(data["status"] == 901){
			alert(data["msg"]);
		};
	});
	$.ajaxSettings.async = true;
}
