from App.models import User
from rest_framework.permissions import BasePermission


class IsActive(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':

            # 如果get到"get_name"，就是验证用户名、邮箱等
            if request.GET.get("get_name"):
                return True
            # 验证邮箱是否没激活
            if isinstance(request.user, User):
                return request.user.is_active
            return False
        return True
