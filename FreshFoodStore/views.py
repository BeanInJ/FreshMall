from App.models import User
from FreshFoodStore import settings
from django.core.cache import cache
from django.http import JsonResponse
from django.shortcuts import render


def is_debug(request):
    debug_user_text = 'debug环境，用于测试的账号：(用户名：马云，密码：a.123456) 注：服务器需开启redis'
    return JsonResponse({"is_debug": settings.DEBUG, "debug_user": debug_user_text})


def activate(request):
    email_token = request.GET.get("email_token")
    user_id = cache.get(email_token)

    if user_id:
        cache.delete(email_token)
        user = User.objects.get(pk=user_id)
        user.is_active = True
        user.save()
        request.session['error_msg'] = '成功激活，请登录'
        return render(request, 'mine-login.html')

    return render(request, 'activate-fail.html')
