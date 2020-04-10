$(function() {
	var token = getCookie("token");
	if (token == null) {
		document.cookie = "token=" + "null";
	};

	$.ajaxSettings.async = false;
	//首页banner
	$.get('/static/slide/', {}, function(data) {
		for (var i = 0; i < 3; i++) {
			$('.swiper-wrapper').append(' <div class="swiper-slide"><img src="' +
				data[i].img +
				'"/>');
		};
	});
	var mySwiper = new Swiper('.slide', {
		autoplay: 5000,
		visibilityFullFit: true,
		loop: true,
		pagination: '.pagination',
	});

	// 分类
	$.get('/static/foodtype/', {}, function(data) {
		var length = data.length <= 3 ? data.length : (data.length >= 6 ? 6 : 3);
		for (var i = 0; i < length; i++) {
			if (data[i].is_hot) {
				$('.index_menu').append('<li typeid="' +
					data[i].id + '"><a><img src="' +
					data[i].typeimg + '" class="img-responsive" alt="..." /><p>' +
					data[i].typenames + '</p></a></li>');
			};
		};
	});
	$.ajaxSettings.async = true;
	$.get('/static/foods/', {}, function(data) {
		for (var i = 0; i < data.length; i++) {
			if (!data[i].is_hot) {
				continue;
			}
			var red_text = data[i].is_points ? "积分" : "折扣";
			var new_li = '<li foodid="' +
				data[i].id + '"><a href="javascript:;" class="jq22-list-item"><div class="jq22-list-theme-img"><img src="' +
				data[i].f_img + '" alt=""></div><div class="jq22-list-theme-message"><h3 class="jq22-list-theme-subtitle">' +
				data[i].f_longname + '</h3><div class="jq22-flex"><div class="jq22-flex-box"><h2><em>￥</em><m>' +
				data[i].price + '</m>&nbsp;&nbsp;<i>￥<n>' +
				data[i].eprice + '</n></i></h2><span class="red_text">' +
				red_text +
				'</span><div class="num_con"><img src="/templates/img/num_l.png" class="img-responsive num_l" alt="...">' +
				'<span class="number">0</span><img src="/templates/img/num_r.png" class="img-responsive num_r" alt="..."></div></div></div></div></a></li>'
			$(".ii").append(new_li);

		};
		cart_add(token, '.ii li');
	});

	$(".index_menu li").each(function() {
		$(this).click(function() {
			var typeid = $(this).attr("typeid");
			$(".ii").removeClass("show");
			$(".it").addClass("show");
			type_show(token, typeid);
			$(".index").hide();
		});
	});
	cart_add(token, '.ii li');
});
// 添加/减少商品
function cart_add(token, ii) {
	$(ii).each(function(i, model) {
		var objLi = $(this);
		var foodid = $(objLi).attr("foodid");
		//点击减数量
		$(objLi).find(".num_l").click(function() {
			var number = parseInt($(objLi).find(".number").text());
			if (number > 0) {
				get_food_num(token, foodid, 0, objLi);
			} else {
				$(objLi).removeClass("on");
			}
			console.log(foodid)
		});
		//点击加数量
		$(objLi).find(".num_r").click(function() {
			console.log(foodid)
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

function type_show(token, typeid) {
	console.log(typeid)
	$.get('/static/foods/', {
		"typeid": typeid
	}, function(data) {
		console.log(data)
		if (data.length==0) {
			console.log(data)
			var emp = '<div class="cartempty ng-scope"><h3>亲，此类商品暂时没货~</h3><a href="index.html">去看看其他的</a></div>'
			$(".it").append(emp);
		} else {
			for (var i = 0; i < data.length; i++) {
				var red_text = data[i].is_points ? "积分" : "折扣";
				var new_li = '<li foodid="' +
					data[i].id + '"><a href="javascript:;" class="jq22-list-item"><div class="jq22-list-theme-img"><img src="' +
					data[i].f_img + '" alt=""></div><div class="jq22-list-theme-message"><h3 class="jq22-list-theme-subtitle">' +
					data[i].f_longname + '</h3><div class="jq22-flex"><div class="jq22-flex-box"><h2><em>￥</em><m>' +
					data[i].price + '</m>&nbsp;&nbsp;<i>￥<n>' +
					data[i].eprice + '</n></i></h2><span class="red_text">' +
					red_text +
					'</span><div class="num_con"><img src="/templates/img/num_l.png" class="img-responsive num_l" alt="...">' +
					'<span class="number">0</span><img src="/templates/img/num_r.png" class="img-responsive num_r" alt="..."></div></div></div></div></a></li>'
				$(".it").append(new_li);
			};
			cart_add(token, '.it li');
		};
	});
}
