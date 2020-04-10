$(function() {
	// 检查是是debug模式
	$.get('/../is_debug/', function(data) {
		if (data["is_debug"]) {
			$("#is_debug").text(data["debug_user"]);
		} else {
			$("#is_debug").hide();
		};
	});
	// 阻止表单默认行为
	$("form").on("submit", function(event) {
		event.preventDefault();
		//return false;  当然这里也可以返回false。
	})
	//监听页面变化 清空#err的内容
	$("body").click(function() {
		$('#err').html("");
		$('#password_info').html("");
		$('#username_info').html("");
	});
	// 监听 验证码是否输入 
	$("#verify_code").click(function() {
		verify_code = $("#verify_code").val();
		if (verify_code.length != 0) {
			$("#verify_code").val("");
			$('#verify_code_info').html("");
			$("img").attr("src", "/static/getcode/?t=" + Math.random());
		};
	});
	// 监听 验证码点击
	$("img").click(function() {
		$('#verify_code_info').html("");
		$(this).attr("src", "/static/getcode/?t=" + Math.random());
	});
});

function parse_data() {
	username = check_one("#username_input", "#username_info", "用户名不能为空");
	password_o = check_one("#password_input", "#password_info", "密码不能为空");
	verify_code = check_one("#verify_code", "#verify_code_info", "验证码不能为空");

	if ((username + password_o + verify_code) == 0) {
		// 前端加密密码
		form_data = hex();
		$.post('/../static/user/?action=login', form_data, function(data) {
			if (data["status"] == 200) {
				// 储存token
				document.cookie = "token=" + data.token;
				$(location).prop('href', '/templates/mine.html');
			} else if (data["status"] == 909) {
				// 验证码错误
				$('#verify_code_info').html("");
				$('#verify_code_info').html(data["msg"]);
			} else if (data["status"] == 908) {
				// 未激活
				$('#err').html(data["msg"]);
				$('#verify_code_info').html("");

				$('#err').append(
					'<a class="send_email" style="color:green;">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp点击发送激活邮件</a>');
				$(".send_email").click(function() {
					var form_user = $("form").serialize();
					$.post('/../static/user/?action=send_email', form_user, function(data) {
						$('#err').html(data["msg"]);
					});
				});

			} else {
				// 其他错误
				$('#err').html(data["msg"]);
				$('#verify_code_info').html("");
				$(this).attr("src", "/static/getcode/?t=" + Math.random());
			};
		});
	};
	return false
}

function check_one(input, info, text) {
	var v = $(input).val().trim();
	// 如果输入长度为0，提示错误
	if (v.length == 0) {
		$(info).html(text);
		return 1
	};
	return 0
}

function hex() {
	// 前端加密密码
	var $password_input = $("#password_input");
	var password = $password_input.val().trim();
	$password_input.val(hex_md5(password));
	var form_data = $("form").serialize();
	$password_input.val(password);
	return form_data
}
