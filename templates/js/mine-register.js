$(function() {

	T_change("#email_input", "#email_info", "邮箱可以用", "邮箱已存在", T_path = '/../static/user/', T_j = "check_email");
	T_change("#username_input", "#username_info", "用户名可用", "用户名已存在", T_path = '/../static/user/', T_j = "check_user");
	T_change("#tell_input", "#tell_info", "号码可以使用", "请输入正确的号码", T_path = '/../static/user/', T_j = "check_phone");
	T_change("#password_input", "#password_info", "密码可用", "密码必须含有字母、数字、符号(+-.%#@*&!)三种", T_path = '/../static/user/',
		T_j = "check_pwd");
	T_change("#password_confirm_input", "#password_confirm_info", "", "", T_path = "", is_password = 1);
	$("img").click(function() {
		// 在浏览器里面路径不改变,这个图他就会不发生改变,所以给这个路径加一个随机数让浏览器知道改变了
		$(this).attr("src", "/static/getcode/?t=" + Math.random());
		$("#verify_span").html("").css("color", "green");
	});
	// 实时监听验证码
	$("#verify_code").on("input propertychange", function(event) {
		code_v = $(this).val().trim();
		if (code_v.length >= 4) {
			$.getJSON('/../static/user/', {
				"T_name": code_v,
				"get_name": "check_code"
			}, function(data) {
				var $T_i_info = $("#verify_code_info");
				if (data['status'] === 200) {
					$T_i_info.html("验证码正确").css("color", "green");
				} else if (data['status'] === 901) {
					$T_i_info.html("验证码错误").css("color", "red");
					$("img").attr("src", "/static/getcode/?t=" + Math.random());
					$("#verify_span").html("").css("color", "green");
				}
			});
		};
	});
});

function T_change(T_input, T_info, T_text1, T_text2, T_path = "", T_j = "", is_password = 0) {
	var $T_i = $(T_input);
	$T_i.change(function() {

		// val()返回被选元素的当前值,trim()的作用是去掉字符串两端的多余的空格
		var T_i = $T_i.val().trim();
		if (is_password === 1) {
			var $T_i_info = $(T_info);
			$T_i_info.html(T_text1).css("color", "green");
		} else {
			if (T_i.length) {
				// 将用户名发给服务器
				$.getJSON(T_path, {
					"T_name": T_i,
					"get_name": T_j
				}, function(data) {
					var $T_i_info = $(T_info);
					if (data['status'] === 200) {
						$T_i_info.html(T_text1).css("color", "green");
					} else if (data['status'] === 901) {
						$T_i_info.html(T_text2).css("color", "red");
					} else if (data['status'] === 902) {
						$T_i_info.html(data['msg']).css("color", "red");
					}

				})
			}
		}
	})
}

function check() {

	username = check_one("#username_input", "#username_info", "用户名不能为空");
	email_o = check_one("#email_input", "#email_info", "邮箱不能为空");
	password_o = check_one("#password_input", "#password_info", "密码不能为空");
	password_t = check_one("#password_confirm_input", "#password_confirm_info", "请再次输入密码");

	var $password_input = $("#password_input");
	var password = $password_input.val().trim();

	var $password_confirm = $("#password_confirm_input");
	var password_confirm = $password_confirm.val().trim();

	var $email_input = $("#email_input");
	var email = $email_input.val().trim();

	// 密码输入后md5加密后提交（注意：这里是前端加密，传入后台的时候还会再加密一次）
	if (password_o === 0 || password_t === 0) {
		if (password === password_confirm) {
			if (password === email) {
				$("#password_info").html("密码不能和邮箱一样").css("color", "red");
				$("#password_confirm_info").html("密码不能和邮箱一样").css("color", "red");
				return false
			} else {
				$password_input.val(hex_md5(password));
				$password_confirm.val(hex_md5(password));
				$("#password_confirm_info").html("").css("color", "green");
			}
		} else {
			$("#password_confirm_info").html("两次密码输的不一样").css("color", "red");
			return false
		}
	}
	if ((username + email_o + password_o) == 0) {
		let form_data = $("form").serialize();
		$(".container").empty();
		$(".container").append('<br><br><br><span style="text-align: center;">正在发送激活邮件....</span><br><br>');
		$.post('../static/user/?action=register', form_data, function(data) {
			if (data["status"] != 200) {
				if (data["msg"]) {
					alert(data["msg"]);
					$(location).prop('href', '/templates/mine-register.html');
				};
			} else {
				$(location).prop('href', '/templates/mine-login.html');
			}
		});
	};
	return false;
}

function check_one(C_input, C_info, C_text) {

	var $username_info = $(C_info);
	var $username = $(C_input);

	var username = $username.val().trim();
	var info_color = $username_info.css("color");

	// 检查是否为空
	if (!username) {
		$username_info.html(C_text).css("color", "red");
		return 1
	}
	// 检查是否有重复
	if (info_color === 'rgb(255, 0, 0)' || info_color === 'rgb(51, 51, 51)') {
		console.log(C_input);
		console.log("颜色不对");
		return 1
	}

	return 0
}
