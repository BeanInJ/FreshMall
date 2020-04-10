$(function() {
	var p = {
	    url: 'https://sns.qzone.qq.com/',
	    showcount: '1',/*是否显示分享总数,显示：'1'，不显示：'0' */
	    desc: '我正使用生鲜购物商城购物',/*默认分享理由(可选)*/
	    summary: '太方便了',/*分享摘要(可选)*/
	    title: '记录分享',/*分享标题(可选)*/
	    site: '生鲜购物商城购物',/*分享来源 如：腾讯网(可选)*/
	    pics: '/templates/img/icon.png', /*分享图片的路径(可选)*/
	    style: '101',
	    width: 199,
	    height: 30
	};
	var s = [];
	for (var i in p) {
	    s.push(i + '=' + encodeURIComponent(p[i] || ''));
	}
	var text = '<a version="1.0" class="qzOpenerDiv" href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?'+ s.join('&')+'" target="_blank">分享</a>'
	$('body').append(text);
	
});