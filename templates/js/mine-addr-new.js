
var check1 = 0;
var check2 = 0;
var check3 = 0;
$(function() {
	var token = getCookie("token");
	if (token == null) {
		$(location).prop('href', '/templates/mine-login.html');
	};
	if (token == "null") {
		$(location).prop('href', '/templates/mine-login.html');
	};
	other_change();
	var p = $('#p');
	var c = $('#c');
	var a = $('#a');
	var p_dail = "";
	var c_dail = "";
	var a_dail = "";
	// 点击p时获取省级城市名单
	get_city(p, 0);
	// p发生变化
	$(p).change(function() {
		$(c).children().not(':eq(0)').remove();
		$(a).children().not(':eq(0)').remove();
		if ($("#p option:selected").val() == "") {
			$('#p').val("0");
		} else if ($("#p option:selected").val() == "0") {} else {
			p_dail = $("#p option:selected").text();
			$("#addr_dail").val(p_dail + ",");
			$("#addr_dail").css('border', '1px solid #ddd');
			check2 = 0;
			c_pid = $("#p option:selected").val();
			get_city(c, c_pid);
			if (p_dail.length >= 6) {
				var n = p_dail.substring(0,5) + "..";
				$("#p option:selected").text(n);
			};
		}
	});
	// c发生变化
	$(c).change(function() {
		$(a).children().not(':eq(0)').remove();
		if ($("#c option:selected").val() == "") {
			$('#c').val("0");
		} else if ($("#c option:selected").val() == "0") {} else {
			c_dail = $("#c option:selected").text();
			$("#addr_dail").val(p_dail + c_dail + ",");

			a_pid = $("#c option:selected").val();
			get_city(a, a_pid);
			if (c_dail.length >= 6) {
				var n = c_dail.substring(0, 5) + "..";
				$("#c option:selected").text(n);
			};
		}
	});
	// a发生变化
	$(a).change(function() {
		if ($("#a option:selected").val() == "") {
			$('#a').val("0");
		} else {
			a_dail = $("#a option:selected").text();
			$("#addr_dail").val(p_dail + c_dail + a_dail + ",");
			if (a_dail.length >= 6) {
				var n = a_dail.substring(0, 5) + "..";
				$("#a option:selected").text(n);
			};
		}
	});
	$("#btnSave").click(function() {

		var a_user_name = $('#order_name').val().trim();
		if (a_user_name == '') {
			$('#order_name').css('border', '1px solid red');
			check1 = 1;
		};
		var a_detail = $('#addr_dail').val().trim();
		if (a_detail == '') {
			$('#addr_dail').css('border', '1px solid red');
			check2 = 1;
		};
		var a_tell = $('#tell').val().trim();
		if (a_tell == '') {
			$('#tell').css('border', '1px solid red');
			check3 = 1;
		};
		var m = check1 + check2 + check3;
		var is_select = $("input[type='checkbox']").is(':checked');
		if (m == 0) {
			$.post("/static/addr/", {
				"token": token,
				"a_user_name": a_user_name,
				"a_tell": a_tell,
				"a_detail": a_detail,
				"is_select":is_select,
				"get_name":"new"
			}, function(data) {
				if(data["status"]==200){
					var action = GetRequest().action
					if (action == "list") {
						$(location).prop('href', '/templates/mine-addr-list-cart.html');
					} else if(action == "cart"){
						$(location).prop('href', '/templates/cart.html');
					} else if(action == "pay"){
						var order_t = "/templates/mine-addr-list-cart.html?action=pay&order_id="+GetRequest().order_id;
						$(location).prop('href', order_t);
					}else{
						$(location).prop('href', '/templates/mine-addr-list.html');
					};
					
				}else if(data["status"]==901){
					alert(data["msg"]);
				};
			});
		};
	});
});

function get_city(id_name, pid) {
	$.get("/static/city/", {
		"pid": pid
	}, function(data) {
		for (var i = 0; i < data.length; i++) {
			$(id_name).append('<option value="' + data[i]["id"] + '">' + data[i]["name"] + '</option>');
		}
		// 追加一些空格，不然最下面翻不到
		$(id_name).append('<option value=""></option>');
		$(id_name).append('<option value=""></option>');
		$(id_name).append('<option value=""></option>');
		$(id_name).append('<option value=""></option>');
		$(id_name).append('<option value=""></option>');
	});
};

function other_change() {
	// 姓名输入后，验证姓名
	var $order_name = $('#order_name');
	var order_name = $order_name.val().trim();
	$order_name.change(function() {
		$order_name.css('border', '1px solid #ddd');
		check1 = 0;
	});
	// 地址输入后，验证地址
	var $addr_dail = $('#addr_dail');
	var addr_dail = $addr_dail.val().trim();
	$addr_dail.change(function() {
		$addr_dail.css('border', '1px solid #ddd');
		check2 = 0;
	});
	// 电话输入后，验证电话
	var $tell = $('#tell');
	$tell.change(function() {
		if ($tell.val().trim()) {
			var reg = /^[0-9]*$/;
			if (!reg.test(jQuery($tell).val())) {
				jQuery($tell).focus();
				$tell.css('border', '1px solid red');
				check3 = 1;
			} else {
				$tell.css('border', '1px solid #ddd');
				check3 = 0;
			};
		}
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