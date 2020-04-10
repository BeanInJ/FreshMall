from App.models import User
from django.core.cache import cache
from rest_framework.authentication import BaseAuthentication


class UserAuth(BaseAuthentication):
    # 用户认证 登录后会产生token，主要认证这个
    def authenticate(self, request):
        if request.method == 'GET':
            token = request.query_params.get('token')
            try:
                u_id = cache.get(token)
                user = User.objects.get(pk=u_id)
                request.user = user
                return user, token
            except:
                return

    def authenticate_header(self, request):  # 返回相应头信息
        pass
