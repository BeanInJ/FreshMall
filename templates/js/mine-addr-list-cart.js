$(function() {
	var token = getCookie("token");
	if (token == null) {
		$(location).prop('href', '/templates/mine-login.html');
	};
	if (token == "null") {
		$(location).prop('href', '/templates/mine-login.html');
	};
	if (token != null) {
		if (token != "null") {
			$.get("/static/addr/", {
				"token": token
			}, function(data) {
				if (data.length > 0) {
					for (var i = 0; i < data.length; i++) {
						var addr_ul = '<ul class="user_addr" ul_addrid="' +
							data[i]["id"] +
							'"><div class="is_select"><img src="img/n1.png" class="false" alt="..."></div><li class="menuList"><p><span id="name">' +
							data[i]["a_user_name"] + '</span><span id="tell">' +
							data[i]["a_tell"] + '</span></p><div id="detail">收货地址:' +
							data[i]["a_detail"] + '</div><div id="toto"><a addrid="' +
							data[i]["id"] + '" class="edi">编辑</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a addrid="' +
							data[i]["id"] + '" class="del">删除</a></div></li></ul>';
						$('.container').append(addr_ul);
					};
					// 获取默认地址
					get_is_select(token);
					// 编辑
					edit();
					// 删除按钮响应
					del(token);
					// 选择地址响应
					is_select(token);
					// 监听新添加地址
					$("#btnSave").click(function() {

						if (GetRequest().action == "pay") {
							var btnSave_href = 'mine-addr-new.html?action=pay&order_id=' + GetRequest().order_id;
							$(location).prop('href', btnSave_href);
						} else {
							var btnSave_href = 'mine-addr-new.html?action=list';
							$(location).prop('href', btnSave_href);
						};
					});
				} else {
					alert("您还没有添加地址，请添加");
					window.location.href = "mine-addr-new.html?action=cart";
				};
			});
		} else {
			alert("未登录");
			$(location).prop('href', '/templates/mine.html');
		};
	} else {
		alert("未登录");
		$(location).prop('href', '/templates/mine.html');
	};
});

function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if (arr = document.cookie.match(reg)) {
		return unescape(arr[2]);
	} else {
		return null;
	}
}

function del(token) {
	$(".del").click(function() {
		// 阻止点击事件冒泡
		cancelBubble();
		var del_addr_id = $(this).attr("addrid");
		$.get("/static/addr/", {
			"del_addr_id": del_addr_id,
			"token": token
		}, function(data) {});
		var ul = '*[ul_addrid="' + del_addr_id + '"]'
		$(ul).hide();
	});
}
// 点击勾
function is_select(token) {
	$('.user_addr').click(function() {
		var y = $(this).find(".is_select img");
		var addr_id = $(this).attr("ul_addrid");

		$(".true").attr("class", "false");
		$(y).attr("class", "true");

		var getRequest = GetRequest();

		// 如果是支付页面传过来的，需要把order_id传回去
		if (getRequest.action == "pay") {
			var addr = "addr_id=" + parseInt(addr_id) + '&order_id=' + getRequest.order_id;
			window.location.href = "cart-pay.html?" + addr;
		} else {
			var addr = "addr_id=" + parseInt(addr_id);
			window.location.href = "cart.html?" + addr;
		};

	});
}
// 编辑
function edit() {
	$(".edi").click(function() {
		// 阻止点击事件冒泡
		cancelBubble();
		var edit_addr_id = $(this).attr("addrid");
		if (GetRequest().action) {
			if (GetRequest().order_id) {
				var edit = "edit_addr_id=" + edit_addr_id + "&action=" + GetRequest().action + "&order_id=" + GetRequest().order_id;
			} else {
				var edit = "edit_addr_id=" + edit_addr_id + "&action=" + GetRequest().action;
			}
		} else {
			var edit = "edit_addr_id=" + edit_addr_id;
		};
		window.location.href = "mine-addr-edit.html?" + edit;
	});
}
// 根据是否传递过来addr_id,获取地址
function get_is_select(token) {
	var getRequest = GetRequest();
	var addr_id = getRequest.addr_id;
	// var action = getRequest.action;
	// if (action == "pay") {
	if (addr_id) {
		// 获取传过来的地址
		addr_text = '#order_addr_list ul[ul_addrid="' + addr_id + '"] img';
		$(addr_text).attr("class", "true");
	} else {
		// 获取默认地址
		$.get('/static/addr/', {
			"token": token,
			"addr_select": "list"
		}, function(data) {
			if (data["status"] == 200) {
				if (data["addr_id"] == 0) {
					$("#order_addr_list ul:eq(0) img").attr("class", "true");
				} else {
					addr_text = '#order_addr_list ul[ul_addrid="' + data["addr_id"] + '"] img';
					$(addr_text).attr("class", "true");
				};
			};
		});
	};
	// };
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
//阻止外层onclick事件
function cancelBubble(e) {
	var evt = e ? e : window.event;
	if (evt.stopPropagation) { //W3C 
		evt.stopPropagation();
	} else { //IE      
		evt.cancelBubble = true;
	}
}
