import random
import uuid
import time
from io import BytesIO

from App.auth import UserAuth
from App.constant import ALL_TPYE, ORDER_TOTAL, ORDER_PRICE_UP, ORDER_PRICE_DOWN, ORDER_SALE_UP, ORDER_SALE_DOWN, \
    ORDER_STATUS_NOT_PAY, ORDER_DONE, ORDER_STATUS_NOT_SEND
from App.models import User, Foods, IndexSlide, FoodType, Cart, City, Addr, Order, OrderFoods, Points, InSign
from App.permissions import IsActive
from App.serializers import UserSerializer, FoodsSerializer, SlideSerializer, FoodTypeSerializer, CartSerializer, \
    CitySerializer, AddrSerializer, OrderSerializer, PointsSerializer
from App.views_alipay import my_alipay
from App.views_helper import get_color, get_txt, check_user, check_email, check_pwd, check_code, check_phone, \
    send_email_activate, get_total_price, get_total_points, get_default_addr, get_order_id, get_vip
from FreshFoodStore.settings import MY_HTTP
from alipay import AliPay
from django.contrib.auth.hashers import make_password, check_password

from django.core.cache import cache
from django.http import JsonResponse, HttpResponse
from django.shortcuts import redirect
from django.views import View
from rest_framework import exceptions
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from PIL import Image, ImageFont
from PIL.ImageDraw import ImageDraw


# 获取首页slide
class SlideAPIView(ListCreateAPIView):
    serializer_class = SlideSerializer
    queryset = IndexSlide.objects.all()


# 获取商品分类
class FoodTypeAPIView(ListCreateAPIView):
    serializer_class = FoodTypeSerializer
    queryset = FoodType.objects.all()


# 商城页面数据获取
class Markets(View):
    def get(self, request, typeid, type2id, order_rule):

        typeid = int(typeid)
        type2id = int(type2id)
        order_rule = int(order_rule)

        foodtypes = FoodType.objects.all()
        if typeid == 1000:
            foods_list = Foods.objects.filter(is_hot=True)
        elif type2id == ALL_TPYE:
            foods_list = Foods.objects.filter(typeid=typeid)
        else:
            foods_list = Foods.objects.filter(type2id=type2id)

        if order_rule == ORDER_TOTAL:
            pass
        elif order_rule == ORDER_PRICE_UP:
            foods_list = foods_list.order_by("price")
        elif order_rule == ORDER_PRICE_DOWN:
            foods_list = foods_list.order_by("-price")
        elif order_rule == ORDER_SALE_UP:
            foods_list = foods_list.order_by("f_num")
        elif order_rule == ORDER_SALE_DOWN:
            foods_list = foods_list.order_by("-f_num")

        foodtype = foodtypes.get(typeid=typeid)
        type2s = foodtype.type2name.split("#")
        type2s_name_id = []
        for type2 in type2s:
            type2s_name_id.append(type2.split("："))
        order_rule_list = [
            ['综合排序', ORDER_TOTAL],
            ['价格升序', ORDER_PRICE_UP],
            ['价格降序', ORDER_PRICE_DOWN],
            ['销量升序', ORDER_SALE_UP],
            ['销量降序', ORDER_SALE_DOWN],
        ]
        foodtypes = list(foodtypes.values())
        foods_list = list(foods_list.values())
        data = {
            # 类型
            "foodtypes": foodtypes,
            # 食品
            "foods_list": foods_list,
            # 类型id
            "typeid": int(typeid),
            # 二级类型，名：id
            "type2s_name_id": type2s_name_id,
            # get传过来的 二级类型id
            "type2id": type2id,
            # 排序规则
            "order_rule_list": order_rule_list,
            #  # get传过来的 排序规则
            "order_rule_view": order_rule,
        }
        return JsonResponse(data)


class FoodsListAPIView(ListCreateAPIView):
    serializer_class = FoodsSerializer
    queryset = Foods.objects.all().order_by('id')

    def get(self, request, *args, **kwargs):
        if request.GET.get("typeid"):
            typeid = int(request.GET.get("typeid"))
            if typeid > 1:
                typeid = FoodType.objects.get(pk=typeid).typeid
                foods = Foods.objects.filter(typeid=typeid)
                return Response(list(foods.values()))
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return Response({"msg": "您没有权限"})


class UserAPIView(ListCreateAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    authentication_classes = (UserAuth,)
    permission_classes = (IsActive,)

    def get(self, request, *args, **kwargs):
        get_name = request.GET.get("get_name")
        if get_name:
            if get_name == "check_user":
                print(type(request.GET.get("T_name")))
                data = check_user(request.GET.get("T_name"))
                return Response(data)
            if get_name == "check_email":
                data = check_email(request.GET.get("T_name"))
                return Response(data)
            if get_name == "check_pwd":
                data = check_pwd(request.GET.get("T_name"))
                return Response(data)
            if get_name == "check_code":
                data = check_code(request.GET.get("T_name"), request.session.get("the_code"))
                return Response(data)
            if get_name == "check_phone":
                data = check_phone(request.GET.get("T_name"))
                return Response(data)
        else:
            if isinstance(request.user, User):
                self.queryset = self.queryset.filter(pk=request.user.id)
                serializer = self.get_serializer(self.queryset, many=True)
                serializer.data[0]["u_password"] = None
                serializer.data[0]["all_points"] = get_vip(serializer.data[0]["all_points"])[0]
                return Response(serializer.data[0])
            else:
                raise exceptions.NotAcceptable

    # 用户登录、注册
    def post(self, request, *args, **kwargs):
        action = request.query_params.get('action')
        if action == "register":
            try:
                # 判断验证码
                code_data = check_code(request.POST.get("verify_code"), request.session.get("the_code"))
                if code_data["status"] != 200:
                    return Response(code_data)
                u_name = request.POST.get("u_name")
                print(type(u_name))
                u_email = request.POST.get("u_email")
                u_phone = request.POST.get("u_phone")
                password = request.POST.get("u_password")
                # 判断用户名、邮箱、电话是否符合条件
                name_data = check_user(u_name)
                email_data = check_email(u_email)
                phone_data = check_phone(u_phone)
                if name_data["status"] != 200:
                    return Response(name_data)
                if email_data["status"] != 200:
                    return Response(email_data)
                if phone_data["status"] != 200:
                    return Response(phone_data)
                print(request.data)
                self.create(request, *args, **kwargs)
                pwd = make_password(password)
                self.queryset.filter(u_name=u_name).update(u_password=pwd)
            except Exception as e:
                print("错误提示：", e)
                return Response({"status": 901, "msg": "信息填写有误，请重新填写"})
            # 发送激活邮件
            try:
                user = User.objects.get(u_name=u_name)
                email_token = uuid.uuid4().hex
                cache.set(email_token, user.id, timeout=60 * 60 * 24)
                send_email_activate(u_name, u_email, email_token)
            except:
                return Response({"status": 901, "msg": "您的激活邮件发送失败，请重新注册"})
            return Response({"status": 200})

        elif action == "login":
            u_name = request.data.get('u_name')
            u_password = request.data.get('u_password')

            # 首先判断验证码
            code_data = check_code(request.POST.get("verify_code"), request.session.get("the_code"))
            if code_data["status"] != 200:
                code_data["status"] = 909
                print("验证码不通过")
                return Response(code_data)
            try:
                user = User.objects.get(u_name=u_name)
                print(u_name, "用户名验证通过")
                if not user.is_active:
                    data = {
                        'msg': '用户未激活',
                        'status': 908,
                    }
                    return Response(data)
                if check_password(u_password, user.u_password):
                    print(u_name, "密码验证通过")
                    token = uuid.uuid4().hex
                    cache.set(token, user.id)
                    data = {
                        'msg': '登录成功',
                        'status': 200,
                        'token': token,
                    }
                    return Response(data)
            except Exception as e:
                print("记得打开系统的reids-server")
                print("错误提示：", e)
            return Response({"status": 901, "msg": "用户名或密码错误"})
        elif action == "logout":
            token = request.POST.get("token")
            cache.delete(token)
            return Response({'status': 200})
        elif action == "send_email":
            u_name = request.data.get('u_name')
            try:
                user = User.objects.get(u_name=u_name)
                u_email = user.u_email
                email_token = uuid.uuid4().hex
                cache.set(email_token, user.id, timeout=60 * 60 * 24)
                send_email_activate(u_name, u_email, email_token)
            except:
                return Response({"status": 901, "msg": "您的激活邮件发送失败，请重新注册"})
            return Response({"status": 200, "msg": "邮件发送成功，请前往邮箱激活"})
        else:
            print("接收到的网址有问题")
            data = {
                'msg': '网址有误',
                'status': 901,
            }
            return Response(data)


class CartAPIView(ListCreateAPIView):
    serializer_class = CartSerializer
    queryset = Cart.objects.all()
    authentication_classes = (UserAuth,)
    permission_classes = (IsActive,)

    def get(self, request, *args, **kwargs):
        get_name = request.GET.get("get_name")
        if get_name:
            if get_name == "cart_list":
                try:
                    self.queryset = self.queryset.filter(c_user=request.user)
                    cart = {}
                    cart_list = []
                    # 购物车需要获取的数据：商品id、商品longname、商品价格、商品是否能积分、选购数量、是否被选中
                    i = 0
                    for c in self.queryset:
                        if c.c_foods.is_sell:
                            cart_list.append({"f_id": c.c_foods.id})
                            cart_list[i]["f_longname"] = c.c_foods.f_longname
                            cart_list[i]["f_price"] = c.c_foods.price
                            cart_list[i]["f_img"] = c.c_foods.f_img
                            cart_list[i]["f_num"] = c.c_foods_num
                            cart_list[i]["is_points"] = c.c_foods.is_points
                            cart_list[i]["is_select"] = c.is_select
                            i = i + 1
                    cart["status"] = 200
                    cart["cart_list"] = cart_list
                    cart["total_price"] = get_total_price(request.user)
                    cart["total_points"] = get_total_points(request.user)
                    return Response(cart)
                except Exception as e:
                    print(e)
                return Response({"status": 901, "msg": "未登录"})
            elif get_name == "food_x":
                foodid = request.GET.get("foodid")
                try:
                    Cart.objects.filter(c_user_id=request.user).filter(c_foods_id=foodid).first().delete()
                    return Response({"status": 200, "msg": "删除商品成功"})
                except Exception as e:
                    print(e)
                    return Response({"status": 901, "msg": "删除商品失败，请刷新后重试"})
            elif get_name == "is_select":
                foodid = request.GET.get("foodid")
                try:
                    is_select_food = Cart.objects.filter(c_user_id=request.user).filter(c_foods_id=foodid).first()
                    if is_select_food.is_select:
                        is_select_food.is_select = 0
                    else:
                        is_select_food.is_select = 1
                    is_select_food.save()
                    return Response({"status": 200, "msg": is_select_food.is_select})
                except Exception as e:
                    print(e)
                    return Response({"status": 901, "msg": "失败，请刷新后重试"})
            elif get_name == "total":
                data = {
                    "status": 200,
                    "total_price": get_total_price(request.user),
                    "total_points": get_total_points(request.user)
                }
                return Response(data)
            return Response({"status": 901, "msg": "未登录"})


class CartAddAPIView(View):
    def get(self, request):
        if request.method == 'GET':
            token = request.GET.get('token')
            try:
                u_id = cache.get(token)
                user = User.objects.get(pk=u_id)
                request.user = user
            except Exception as e:
                print("错误提示：", e)
                data = {'status': 901}
                return JsonResponse(data=data)
            foodid = request.GET.get("foodid")
            is_add = int(request.GET.get("is_add"))
            carts = Cart.objects.filter(c_user_id=request.user).filter(c_foods_id=foodid)
            # 加
            if is_add == 1:
                if carts.exists():
                    c_obj = carts.first()
                    c_obj.c_foods_num = c_obj.c_foods_num + 1
                else:
                    c_obj = Cart()
                    c_obj.c_foods_id = foodid
                    c_obj.c_user_id = u_id
                c_obj.save()
                data = {
                    'status': 200,
                    "c_foods_num": c_obj.c_foods_num,
                }
                return JsonResponse(data=data)
            # 减
            elif is_add == 0:
                if carts.exists():
                    c_obj = carts.first()
                    if c_obj.c_foods_num >= 1:
                        c_obj.c_foods_num = c_obj.c_foods_num - 1
                        c_obj.save()
                    data = {
                        'status': 200,
                        "c_foods_num": c_obj.c_foods_num,
                    }
                    if c_obj.c_foods_num == 0:
                        Cart.objects.filter(pk=c_obj.id).delete()
                    return JsonResponse(data=data)
                data = {
                    'status': 200,
                    "c_foods_num": 0,
                }
                return JsonResponse(data=data)
            else:
                if carts.exists():
                    c_obj = carts.first()
                    data = {
                        'status': 200,
                        "c_foods_num": c_obj.c_foods_num,
                    }
                else:
                    data = {
                        'status': 200,
                        "c_foods_num": 0,
                    }
                return JsonResponse(data=data)


class GetCode(View):
    def get(self, request):
        color_bg = (get_color(), get_color(), get_color())
        image = Image.new(mode='RGB', size=(100, 50), color=color_bg)
        imagedraw = ImageDraw(image, mode='RGB')
        the_code = get_txt()
        upper_code = the_code.upper()
        request.session["the_code"] = upper_code
        font = ImageFont.truetype("C:\Windows\Fonts\simsunb.ttf", 50)
        for i in range(4):
            fill = (get_color(), get_color(), get_color())
            imagedraw.text(xy=(25 * i, 0), text=the_code[i], fill=fill, font=font)
        for i in range(1000):
            fill = (get_color(), get_color(), get_color())
            xy = (random.randrange(201), random.randrange(100))
            imagedraw.point(xy=xy, fill=fill)

        imagedraw.arc((random.randrange(0, 10), 6, 100, random.randrange(70, 100)),
                      random.randrange(0, 180), random.randrange(250, 360), fill=get_color())

        fp = BytesIO()
        image.save(fp, "png")

        return HttpResponse(fp.getvalue(), content_type="image/png")


class CityAPIView(ListCreateAPIView):
    serializer_class = CitySerializer
    queryset = City.objects.all()

    def get(self, request, *args, **kwargs):
        if request.GET.get("pid"):
            pid = int(request.GET.get("pid"))
            self.queryset = self.queryset.filter(pid=pid)
        else:
            self.queryset = self.queryset.filter(pid=0)
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return Response({"msg": "您没有权限"})


class AddrAPIView(ListCreateAPIView):
    serializer_class = AddrSerializer
    queryset = Addr.objects.all()
    authentication_classes = (UserAuth,)
    permission_classes = (IsActive,)

    def get(self, request, *args, **kwargs):
        # 获取地址列表
        self.queryset = self.queryset.filter(a_user=request.user)
        # 编辑地址
        edit_addr_id = request.GET.get("edit_addr_id")
        if edit_addr_id:
            self.queryset = self.queryset.filter(pk=int(edit_addr_id))
        # 删除地址
        del_addr_id = request.GET.get("del_addr_id")
        if del_addr_id:
            Addr.objects.filter(pk=int(del_addr_id)).delete()
            return Response({"status": 200})
        # 获取默认地址
        addr_select = request.GET.get("addr_select")
        if addr_select:
            # 获取默认地址信息
            if addr_select == "cart":
                get_default_addr(request.user)
                self.queryset = self.queryset.filter(pk=request.user.addr_id)
            # 获取选择的地址信息
            if addr_select == "my-select":
                addr_id = request.GET.get("addr_id")
                self.queryset = self.queryset.filter(pk=addr_id)
            # 获取默认地址编号
            if addr_select == "list":
                addr_id = request.user.addr_id
                return Response({"status": 200, "addr_id": addr_id})
            # 修改默认地址
            if addr_select == "select_addr_id":
                addr_id = request.GET.get("addr_id")
                user = request.user
                user.addr_id = addr_id
                user.save()
                return Response({"status": 200})
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        token = request.POST.get('token')
        # 未登录
        if token == None or token == "null":
            return Response({"status": 901, "msg": "未登录"})

        try:
            u_id = cache.get(token)
            user = User.objects.get(pk=u_id)
            get_name = request.POST.get('get_name')
            a_detail = request.data["a_detail"]
            # 新添加地址
            if get_name == "new":
                # 如果新添加地址已存在
                if Addr.objects.filter(a_user_id=user.id).filter(a_detail=a_detail):
                    return Response({"status": 901, "msg": "该地址已存在，不用重复添加"})
                # 新添加地址
                addr = Addr()
            # 编辑地址
            else:
                edit_addr_id = request.data["edit_addr_id"]
                addr = Addr.objects.get(pk=edit_addr_id)
            addr.a_user = user
            addr.a_detail = a_detail
            addr.a_user_name = request.data["a_user_name"]
            addr.a_tell = request.data["a_tell"]
            addr.save()
            # 设为默认地址
            if request.data["is_select"] == "true":
                addr_id = Addr.objects.filter(a_detail=a_detail).first().id
                user.addr_id = addr_id
                user.save()
            return Response({"status": 200})
        except Exception as e:
            print(e)
            return Response({"status": 901, "msg": "信息填写有误"})


class OrderAPIView(ListCreateAPIView):
    serializer_class = OrderSerializer
    queryset = Order.objects.all()
    authentication_classes = (UserAuth,)
    permission_classes = (IsActive,)

    # def get(self, request, *args, **kwargs):
    def post(self, request, *args, **kwargs):
        token = request.POST.get('token')
        # 未登录
        if token == None or token == "null":
            return Response({"status": 901, "msg": "未登录"})
        u_id = cache.get(token)
        user = User.objects.get(pk=u_id)

        cart = request.POST.get("cart")
        if cart:
            o_addr = request.POST.get("addr_id")
            o_note = request.POST.get("o_note")
            cartfoods = Cart.objects.filter(c_user=user).filter(is_select=1)
            if cartfoods:
                try:
                    order = Order()
                    order.o_user = user
                    order.o_addr = o_addr
                    order.o_note = o_note
                    order.o_id = get_order_id(user)
                    order.o_price = get_total_price(user)
                    order.o_points = get_total_points(user)
                    order.save()
                    for food in cartfoods:
                        orderfood = OrderFoods()
                        orderfood.o_user_order = order
                        orderfood.o_foods_id = food.c_foods_id
                        orderfood.o_foods_num = food.c_foods_num
                        orderfood.save()
                        food.delete()
                    return Response({"status": 200, "order_id": order.id})
                except Exception as e:
                    print(e)
                    Response({"status": 901, "msg": "信息填写有误"})
            else:
                return Response({"status": 901, "msg": "没有商品被选中或刷新再试"})
        return Response({"status": 200, "msg": "....."})


class PayAPIView(ListCreateAPIView):
    def get(self, request, *args, **kwargs):
        try:
            token = request.GET.get('token')
            if token == None or token == "null":
                return JsonResponse({"status": 901, "msg": "未登录"})
            u_id = cache.get(token)
            user = User.objects.get(pk=u_id)
            order_id = request.GET.get("order_id")
            order = Order.objects.get(pk=order_id)
            orderfoods = OrderFoods.objects.filter(o_user_order=order)
            foods = []

            for food in orderfoods:
                food_dict = {
                    "f_img": food.o_foods.f_img,
                    "f_longname": food.o_foods.f_longname,
                    "f_price": food.o_foods.price,
                    "f_is_points": food.o_foods.is_points,
                    "f_num": food.o_foods_num
                }
                foods.append(food_dict)

        except Exception as e:
            return JsonResponse({"status": 901, "msg": "信息有误..."})
        print(order.o_time)
        data = {
            "status": 200,
            "o_time": order.o_time,
            "o_id": order.o_id,
            "foods": foods,
            "points": user.the_points,
            "vip_points": get_vip(user.all_points)[1],
            "vip": get_vip(user.all_points)[0],
        }
        return JsonResponse(data)

    def post(self,  request, *args, **kwargs):
        try:
            token = request.POST.get('token')

            if token == None or token == "null":
                return JsonResponse({"status": 901, "msg": "未登录12333333"})
            u_id = cache.get(token)
            user = User.objects.get(pk=u_id)

            submit_addr_id = request.POST.get('submit_addr_id')
            submit_order_id = request.POST.get('submit_order_id')
            submit_points_or_vip = request.POST.get('submit_points_or_vip')
            submit_use_points = int(request.POST.get('submit_use_points'))

            order = Order.objects.get(pk=submit_order_id)
            orderfoods = OrderFoods.objects.filter(o_user_order=order)

            if order.o_user != user:
                return JsonResponse({"status": 901, "msg": "您操作的订单不属于当前用户"})

            total_price = 0
            total_points = 0
            for food in orderfoods:
                total_price = total_price + food.o_foods_num * food.o_foods.price
                if food.o_foods.is_points:
                    total_points = total_points + food.o_foods_num * int(food.o_foods.price)

            if submit_points_or_vip == "points":

                if user.the_points < submit_use_points:
                    return JsonResponse({"status": 901, "msg": "您使用的积分超出你所拥有的积分"})
                total_price = total_price - (submit_use_points*0.01)

            if submit_points_or_vip == "vip":
                order.o_vip = 1
                total_price = total_price * (get_vip(user.all_points)[1])

            if submit_addr_id == 0:
                order.o_addr = submit_addr_id

            order.o_price = total_price
            order.o_points = total_points
            order.o_use_points = submit_use_points
            order.save()

            sub_ponits = Points.objects.filter(is_order_id=order.o_id).filter(is_add=0)
            if sub_ponits.exists():
                old_points = sub_ponits[0].p_num

                sub_ponits = Points.objects.get(pk=sub_ponits[0].id)
                sub_ponits.p_num = submit_use_points
                sub_ponits.save()

                user.the_points = user.the_points + old_points - sub_ponits.p_num
                user.save()
            else:
                # 生成积分消费信息
                if order.o_use_points > 0:
                    sub_ponits = Points()
                    sub_ponits.p_user = user
                    sub_ponits.p_num = submit_use_points
                    sub_ponits.is_add = 0
                    sub_ponits.p_price = order.o_price
                    sub_ponits.p_status = True
                    sub_ponits.p_detail = '订单' + str(order.o_id)[8:] + '抵扣积分'
                    sub_ponits.is_order_id = order.o_id
                    sub_ponits.save()

                    user.the_points = user.the_points - sub_ponits.p_num
                    user.save()

            order_string = my_alipay().api_alipay_trade_page_pay(
                out_trade_no=order.o_id,  # 订单号，多次请求不能一样
                total_amount=str(total_price),  # 支付金额
                subject=user.u_name+"在生鲜系统的购物订单",  # 交易主题
                return_url=MY_HTTP + '/static/payreturn',
                notify_url=None
            )
            return redirect("https://openapi.alipaydev.com/gateway.do?" + order_string)
        except Exception as e:
            print(e)
            return JsonResponse({"status": 901, "msg": "信息有误..."})


class GetOrder(View):
    def get(self, request):
        try:
            token = request.GET.get('token')
            if token == None or token == "null":
                return JsonResponse({"status": 901, "msg": "未登录"})
            u_id = cache.get(token)
            user = User.objects.get(pk=u_id)

            order_status = int(request.GET.get('order_status'))
            orders = Order.objects.filter(o_user=user).filter(o_status=order_status)
            orders_list = []

            # 订单信息
            for order in orders:
                orderfoods = OrderFoods.objects.filter(o_user_order=order)
                foods = []
                total_price = 0

                # 订单里的商品
                for food in orderfoods:
                    food_dict = {
                        "f_img": food.o_foods.f_img,
                        "f_longname": food.o_foods.f_longname,
                        "f_price": food.o_foods.price,
                        "f_is_points": food.o_foods.is_points,
                        "f_num": food.o_foods_num
                    }
                    foods.append(food_dict)
                    total_price = total_price + (food.o_foods.price*food.o_foods_num)

                o_addr = Addr.objects.get(pk=order.o_addr)
                # 订单信息模板
                order_dict = {
                    "id": order.id,
                    "o_time": order.o_time,
                    "o_id": order.o_id,
                    "o_note": order.o_note,
                    "o_addr": o_addr.a_detail,
                    "o_name": o_addr.a_user_name,
                    "o_tell": o_addr.a_tell,
                    "o_foods": foods,
                    "o_price": order.o_price,
                    "o_sub_price": round(total_price-order.o_price, 2)
                }
                orders_list.append(order_dict)
            return JsonResponse({"status": 200, "orders_list": orders_list})
        except Exception as e:
            print(e)
            return JsonResponse({"status": 901, "msg": "信息有误..."})


class OrderChange(View):
    def get(self, request):
        try:
            token = request.GET.get('token')
            if token == None or token == "null":
                return JsonResponse({"status": 901, "msg": "未登录.."})
            u_id = cache.get(token)
            user = User.objects.get(pk=u_id)

            action = request.GET.get('action')
            order_id = request.GET.get('order_id')
            order = Order.objects.get(pk=order_id)

            if order.o_user != user:
                return JsonResponse({"status": 901, "msg": "非本人，不能操作"})

            # 删除订单
            if action == "del":
                if order.o_status == ORDER_DONE:
                    orderfoods = OrderFoods.objects.filter(o_user_order=order.id)
                    for orderfood in orderfoods:
                        orderfood.delete()
                    order.delete()
                else:
                    return JsonResponse({"status": 901, "msg": "当前订单未完成，不能删除"})

            # 完成收货
            if action == "done":
                if order.o_status == ORDER_STATUS_NOT_SEND:

                    add_ponits = Points()
                    add_ponits.p_user = user
                    add_ponits.p_num = int(order.o_points)
                    add_ponits.is_add = True
                    add_ponits.p_price = order.o_price
                    add_ponits.p_status = True
                    add_ponits.p_detail = '订单'+str(order.o_id)[8:]+'积分'
                    add_ponits.is_order_id = order.o_id
                    add_ponits.save()

                    user.the_points = user.the_points + order.o_points
                    user.all_points = user.all_points + order.o_points
                    user.all_cost = user.all_cost + order.o_price
                    user.save()

                    order.o_status = ORDER_DONE
                    order.save()


                else:
                    return JsonResponse({"status": 901, "msg": "订单状态不正确"})

            return JsonResponse({"status": 200})
        except Exception as e:
            print(e)
            return JsonResponse({"status": 901, "msg": "信息有误"})


class PointsAPIView(ListCreateAPIView):
    serializer_class = PointsSerializer
    queryset = Points.objects.all()
    authentication_classes = (UserAuth,)
    permission_classes = (IsActive,)

    def get(self, request, *args, **kwargs):
        if request.GET.get('action') == "all":
            the_points = request.user.the_points
            all_cost = request.user.all_cost
            return Response({"status": 200, "the_points": the_points, "all_cost": all_cost})
        self.queryset = self.queryset.filter(p_user=request.user)
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return Response({"status": 901, "msg": "不能手动提交积分"})


class InSignView(View):
    def get(self, request):
        try:
            token = request.GET.get('token')
            if token == None or token == "null":
                return JsonResponse({"status": 901, "msg": "未登录.."})
            u_id = cache.get(token)
            user = User.objects.get(pk=u_id)

            today = time.strftime('%Y-%m-%d', time.localtime(time.time()))
            i_last = InSign.objects.all().last()
            if i_last:
                if str(i_last.today)[:10] == today:
                    return JsonResponse({"status": 901, "msg": "今天已签过到了"})
            i = InSign()
            i.save()

            add_ponits = Points()
            add_ponits.p_user = user
            add_ponits.p_num = 5
            add_ponits.is_add = True
            add_ponits.p_status = True
            add_ponits.p_detail = '签到获得积分'
            add_ponits.save()

            user.the_points = user.the_points + 5
            user.all_points = user.all_points + 5
            user.save()

            return JsonResponse({"status": 200, "msg": "签到成功"})
        except Exception as e:
            print(e)
            return JsonResponse({"status": 901, "msg": "状态错误，请重新登录"})
