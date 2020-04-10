$(function() {
	// 检查是否登录
	var token = getCookie("token");
	if(token==null){document.cookie = "token=" + "null";};
	if (token!="null") {
		$.get('/static/user/1/', {
			"token": token
		}, function(data) {
			$(".header").empty();
			$(".headerlist").empty();
			var img_str = '<img src="/templates/img/tou.png" class="img">'
			var phone_str = '<p class="mobile ng-binding"></p>'
			if (data['u_icon'] != null) {
				img_str = '<img src="' + data['u_icon'] + '" class="img">'
			};
			if (data['u_phone'] != null) {
				phone_str = '<p class="mobile ng-binding">' + data['u_phone'] + '</p>'
			};
			var login = img_str + '<p class="nickname ng-binding">' +
				data['u_name'] + '</p>' +
				phone_str + '<p class="vip ng-binding">会员等级:' +
				data['all_points'] + '</p>'
			$(".header").append(login);
			var login_li = '<li class="ng-binding">当前积分：'+
				data['the_points']+'积分</li><li class="ng-binding">累计消费：￥'+
				data['all_cost']+'</li>'
			var addr = '<li><a href="mine-addr-list.html"><p class="ico ico-addr"></p><p>地址管理</p></a></li>'
			var logout = '<li><a><p class="ico ico-logout"></p><p>退出登录</p></a></li>'
			$(".headerlist").append(login_li);
			$(".userlist").append(addr+logout);
			$(".ico-logout").click(function() {
				document.cookie = "token=" + null;
				$.post('/../static/user/?action=logout', {"token":token}, function(data) {});
				$(location).prop('href', '/templates/mine.html');
			});
		});
		$(".ico-reward").click(function(){
			$.get('/static/insign/',{
				"token":token,
			},function(data){
				$(".ico-reward").removeClass("ico-reward");
				$('.userlist li:eq(0) a p:eq(0)').addClass("ico-insign");
				alert(data["msg"]);
			});
		}); 
	} else {
		$('a').each(function() {
			// $(this).attr("href", "/templates/mine-login.html");
			$(".nav li:eq(0) a").attr("href", "/templates/index.html");
			$(".register").attr("href", "/templates/index.html");
		});
	};
	
});

function parse_data() {

	var $password_input = $("#password_input");
	var password = $password_input.val().trim();
	$password_input.val(hex_md5(password));

	return true
}

function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if (arr = document.cookie.match(reg)) {
		return unescape(arr[2]);
	} else {
		return null;
	}
}
