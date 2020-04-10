$(function() {
	var token = getCookie("token");
	if (token == null) {
		$(location).prop('href', '/templates/mine-login.html');
	};
	if (token == "null") {
		$(location).prop('href', '/templates/mine-login.html');
	};
	$.get('/static/points/', {
		"token": token,
		"action": "all"
	}, function(data) {
		if (data["status"] == 200) {
			$(".headerlist li:eq(0)").text("积分余额 ￥" + data["the_points"]);
			$(".headerlist li:eq(1)").text("累计消费 ￥" + data["all_cost"]);
		}
	});
	$.get('/static/points/', {
		"token": token,
	}, function(data) {
		console.log(data);
		$("tbody").empty();
		for (var i = 0; i < data.length; i++) {
			console.log("555");
			var time = data[i]["p_date"].substring(0, 10);
			if (data[i]["is_add"]) {
				var add_num = data[i]["p_num"];
				var sub_num = '-';
			} else {
				var sub_num = data[i]["p_num"];
				var add_num = '-';
			}
			var text = '<tr><td>' +
				time + '</td><td>' +
				add_num + '</td><td>' +
				sub_num + '</td><td>' +
				data[i]["p_detail"] + '</td></tr>';
			$("tbody").append(text);
		};
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
