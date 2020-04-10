from App.constant import ORDER_STATUS_NOT_PAY
from django.db import models


# 首页顶部图片
class IndexSlide(models.Model):
    img = models.CharField(max_length=255)
    name = models.CharField(max_length=64)


# 商品分类信息
class FoodType(models.Model):
    # 分类编号默认1000，不允许重复
    typeid = models.IntegerField(default=1000, unique=True)
    typenames = models.CharField(max_length=32)
    typeimg = models.CharField(max_length=255)
    type2name = models.CharField(max_length=255)
    is_hot = models.BooleanField(default=False)


# 商品信息
class Foods(models.Model):
    # 商品编号默认1000，允许重复
    f_id = models.IntegerField(default=1000)
    f_img = models.CharField(max_length=255)
    f_name = models.CharField(max_length=128)
    f_longname = models.CharField(max_length=255)
    f_num = models.IntegerField(default=100)
    scale = models.CharField(max_length=64)
    price = models.FloatField(default=1)
    eprice = models.FloatField(default=2)
    typeid = models.IntegerField(default=1000)
    type2id = models.IntegerField(default=1000, blank=True, null=True)
    type2name = models.CharField(max_length=128, blank=True, null=True)
    is_sell = models.BooleanField(default=True)
    is_points = models.BooleanField(default=True)
    is_hot = models.BooleanField(default=False)
    place = models.CharField(max_length=255, blank=True)


# 用户信息
class User(models.Model):
    u_name = models.CharField(max_length=32, unique=True)
    u_password = models.CharField(max_length=255, unique=True)
    u_email = models.CharField(max_length=64, unique=True)
    u_phone = models.CharField(max_length=64, default='')
    u_icon = models.ImageField(upload_to='icons/%Y/%m/%d/')
    all_points = models.IntegerField(default=0)
    all_cost = models.IntegerField(default=0)
    the_points = models.IntegerField(default=0)
    is_active = models.BooleanField(default=False)
    is_delete = models.BooleanField(default=False)
    # 默认地址id为0就是还未填写地址
    addr_id = models.IntegerField(default=0)


# 管理员信息
class Admin(models.Model):
    name = models.CharField(max_length=64)
    password = models.CharField(max_length=255)
    auth = models.IntegerField(default=1)


# 积分详单
class Points(models.Model):
    p_user = models.ForeignKey(User, on_delete=models.CASCADE)
    p_num = models.IntegerField(default=1)
    is_add = models.BooleanField(default=True)
    p_date = models.DateTimeField(auto_now=True)
    p_price = models.FloatField(default=100)
    p_detail = models.CharField(max_length=255)
    # 积分状态默认为不可用，订单完成后改为True
    p_status = models.BooleanField(default=False)
    is_order_id = models.BigIntegerField(default=0)


# 优惠卷
class Coupon(models.Model):
    # 优惠卷编号，默认编号1000
    cou_id = models.IntegerField(default=1000)
    cou_name = models.CharField(max_length=255)
    cou_method = models.IntegerField(default=1)
    cou_num = models.CharField(max_length=32)
    is_open = models.BooleanField(default=True)
    which_user = models.IntegerField(default=1)


# 用户领取的优惠卷
class UserCoupon(models.Model):
    cou_user = models.ForeignKey(User, on_delete=models.CASCADE)
    cou_id = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    cou_status = models.IntegerField(default=0)


# 购物车
class Cart(models.Model):
    c_user = models.ForeignKey(User, on_delete=models.CASCADE)
    c_foods = models.ForeignKey(Foods, on_delete=models.CASCADE)
    # c_foods_id = models.IntegerField(default=1000)
    c_foods_num = models.IntegerField(default=1)
    is_select = models.BooleanField(default=True)
    # 地址id为0就是还未选择地址
    c_addr = models.IntegerField(default=0)


# 订单
class Order(models.Model):
    o_user = models.ForeignKey(User, on_delete=models.CASCADE)
    o_id = models.BigIntegerField(default=202004010001)
    o_price = models.FloatField(default=0)
    o_time = models.DateTimeField(auto_now=True)
    o_status = models.IntegerField(default=ORDER_STATUS_NOT_PAY)
    o_note = models.CharField(max_length=255, default=0)
    o_addr = models.IntegerField(default=0)
    o_points = models.IntegerField(default=0)
    o_use_points = models.IntegerField(default=0)
    o_coupon = models.IntegerField(default=0)
    o_vip = models.BooleanField(default=False)


# 订单里的商品
class OrderFoods(models.Model):
    o_user_order = models.ForeignKey(Order, on_delete=models.CASCADE)
    o_foods = models.ForeignKey(Foods, on_delete=models.CASCADE)
    o_foods_num = models.IntegerField(default=1)


# 全国地名表
class City(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    pid = models.IntegerField()

    class Meta:
        db_table = 'pro_city_area'


# 收货信息（收货地址）
class Addr(models.Model):
    a_user = models.ForeignKey(User, on_delete=models.CASCADE)
    a_order_id = models.IntegerField(default=0)
    a_city_id = models.IntegerField(default=0)
    a_detail = models.CharField(max_length=125)
    a_user_name = models.CharField(max_length=125)
    a_tell = models.CharField(max_length=64)
    a_time = models.IntegerField(default=1)


# 签到
class InSign(models.Model):
    today = models.DateTimeField(auto_now=True)
