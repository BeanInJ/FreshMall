a = "0";
var typeid = 1000;
var type2id = 0;
var order_rule = 0;
var url = '/static/markets/' + typeid + '&0&0';

$(function() {
	var token = getCookie("token");
	if(token==null){document.cookie = "token=" + "null";};
	// 全部类型，综合排序： 展示、收起
	the_slideDown("#all_types", ".grey1", "#sort_rule", ".grey2");
	the_slideUp("#all_types", ".grey1", );
	the_slideDown("#sort_rule", ".grey2", "#all_types", ".grey1");
	the_slideUp("#sort_rule", ".grey2", );

	// 一级分类信息获取
	$.get(url, function(data) {
		// 食物分类 名
		for (var i = 0; i < data.foodtypes.length; i++) {
			var aside_li = '<li class="table" typeid="' + data.foodtypes[i].typeid + '"><p>' + data.foodtypes[i].typenames +
				'</p></li>';
			$("#aside").append(aside_li);
			if (i == 0) {
				$("#aside li").addClass("active");
			};
		};
		section_ul(typeid, data.foods_list);
		// 2级分类
		t_span('.t span:eq(0)', '.grey1 .bnb', data.type2s_name_id);
		// 排序规则
		t_span('.t span:eq(1)', '.grey2 .bnb', data.order_rule_list);
		// 点击购物车
		if (token != "null") {
			cart_add(token);
		};
		// 点击一级分类 获取商品信息
		$("#aside li").click(function() {

			$('.grey1').slideUp();
			$('.grey2').slideUp();
			a = "0"; // a = 0表示清除点击状态
			$("#aside li").removeClass("active");
			$(this).addClass("active");

			typeid = $(this).attr("typeid");
			url = '/static/markets/' + typeid + '&0&0';
			// $(location).prop('href', url);
			$.get(url, function(data) {

				section_ul(typeid, data.foods_list);
				// 2级分类
				t_span('.t span:eq(0)', '.grey1 .bnb', data.type2s_name_id);
				// 排序规则
				t_span('.t span:eq(1)', '.grey2 .bnb', data.order_rule_list);
				// 点击购物车
				if (token != "null") {
					cart_add(token);
				};
			});

		});
		// cart();
	});
});


// the_text:当前点击的文字  the_shade:当前阴影
// 全部类型、综合排序 展示
function the_slideDown(the_text, the_shade, other_text, other_shade) {
	$(the_text).click(function() {
		var $the_shade = $(the_shade);

		// 先检查如果当前id已经被点击过了，就视为收起执行
		if (a === the_text) {
			$the_shade.slideUp();
			a = "0";

			// 否则展示
		} else {
			// 显示阴影
			$the_shade.slideDown();
			var $other_shade = $(other_shade);
			$other_shade.slideUp(0);
			// 记录当前id已经被点击
			a = the_text;
		}

	})
}

// 全部类型、综合排序 收起
function the_slideUp(the_text, the_shade) {

	$(the_shade).click(function() {
		// 点击阴影，收回阴影
		var $the_shade = $(the_shade);
		$the_shade.slideUp();
		// 清除点击记录
		a = "0"
	})
}
// 显示食物
function section_ul(typeid, foods_list) {
	$('.foods_list').empty();
	var foods_ul = '<ul class="lists show" typeid="' + typeid + '"></ul>'
	$('.foods_list').append(foods_ul);
	for (var i = 0; i < foods_list.length; i++) {
		if (foods_list[i].is_points) {
			var is_points = "可积分";
		} else {
			var is_points = "折扣优惠";
		};
		var food_li = '	<li foodid="' +
			foods_list[i].id + '"><div class="l view"><a href="#" target="_blank"><img src="' +
			foods_list[i].f_img +
			'" class="img-responsive" alt="..."></a></div><div class="r"><p class="pt">' +
			foods_list[i].f_longname + '</p><p class="price">￥' +
			foods_list[i].price + '</p><div class="jifen">' +
			is_points +
			'</div><div class="showaddcart"><img src="img/shop_cart02.png" class="img-responsive join" alt="..."><div class="num_con"><img src="img/num_l.png" class="img-responsive num_l" alt="..."><span class="number">' +
			0 +
			'</span><img src="img/num_r.png" class="img-responsive num_r" alt="..."></div></div></div></li>'
		var the_ul = '.foods_list ul[typeid="' + typeid + '"]';
		$(the_ul).append(food_li);
	};
}
// 2级分类、排序点击事件
function t_span(span, bnb_a, rule_or_type2id, the_typeid) {
	$(span).click(function() {
		$(".t span").removeClass("active");
		$(this).addClass("active");
		if (rule_or_type2id.length <= 3) {
			$("#grey").css("width", "100%");
		} else {
			$("#grey").css("width", "");
		};
		$(bnb_a).empty();
		for (var i = 0; i < rule_or_type2id.length; i++) {
			var btn = "bnn btn-default"
			var button = '<a><button class="' +
				btn + '" rule_or_type2id="' +
				rule_or_type2id[i][1] + '">' +
				rule_or_type2id[i][0] + '</button></a>'
			$(bnb_a).append(button);
		};
		btn_success(".bnb a .bnn");
	});
}
// 2级分类、排序点击 里面的点击事件
function btn_success(bnn) {
	$(bnn).click(function() {
		$(".bnb a .bnn").removeClass("btn-success");
		$(".bnb a .bnn").addClass("btn-default");
		$(this).removeClass("btn-default");
		$(this).addClass("btn-success");

		num = $(this).attr("rule_or_type2id")

		if (num < 999) {
			order_rule = num;
		} else {
			type2id = num;
		};
		url = '/static/markets/' + typeid + '&' + type2id + '&' + order_rule;
		$.get(url, function(data) {
			section_ul(typeid, data.foods_list);
			t_span('.t span:eq(0)', '.grey1 .bnb', data.type2s_name_id);
			t_span('.t span:eq(1)', '.grey2 .bnb', data.order_rule_list);
		});
		order_rule = 0;
		type2id = 0;
	});
}
// 添加/减少商品
function cart_add(token) {
	//shop：加入购物车
	$(".lists li").each(function(i, model) {
		var objLi = $(this);
		var foodid = $(objLi).attr("foodid");
		//点击购物车
		$(objLi).find(".join").click(function() {
			$(objLi).addClass("on");
			get_food_num(token, foodid, 2, objLi);
		});
		//点击减数量
		$(objLi).find(".num_l").click(function() {
			var number = parseInt($(objLi).find(".number").text());
			if (number > 0) {
				get_food_num(token, foodid, 0, objLi);
			} else {
				$(objLi).removeClass("on");
			}
		});
		//点击加数量
		$(objLi).find(".num_r").click(function() {
			get_food_num(token, foodid, 1, objLi);
		});
	});
}

function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if (arr = document.cookie.match(reg)) {
		return unescape(arr[2]);
	} else {
		return null;
	}
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
