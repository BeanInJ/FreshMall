# 验证码,随机颜色
import random
import re
import time

from App.constant import VIP1, VIP2, VIP3, VIP4
from App.models import User, Cart, Addr, Order
from FreshFoodStore.settings import EMAIL_HOST_USER, SERVER_HOST, SERVER_PORT
from django.core.mail import send_mail
from django.template import loader


def get_color():
    return random.randrange(256)


# 验证码,随机4个文字
def get_txt():
    txt = "zxcvbnmasdfghjklqwertyuipZXCVBNMASDFGHJKLQWERTYUP23456789"
    code = ""
    for i in range(4):
        code += random.choice(txt)
    return code


def check_user(username):
    user = User.objects.filter(u_name=username)
    data = {
        "status": 200,
        "msg": '用户名可用',
    }
    if user.exists():
        data["status"] = 901
        data["msg"] = '用户名已存在'
    return data


def check_email(email):
    e = User.objects.filter(u_email=email)
    data = {
        "status": 200,
        "msg": '邮箱可用',
    }
    if e.exists():
        data["status"] = 901
        data["msg"] = '邮箱已经存在'
    else:
        if re.match("[A-Za-z0-9]+@[A-Za-z0-9]+\.[cmnoetrg]+", email):
            pass
        else:
            data["status"] = 902
            data["msg"] = '邮箱格式不正确'
    return data


def check_pwd(pwd):
    data = {}
    l_re = re.compile('[a-zA-Z]')
    num_re = re.compile('[0-9]')
    p_re = re.compile('[\.\?\!\=\-\+\_\|\*\&\%\#\@\~\@\！\%\￥]')
    wrong_re = re.compile('[^a-zA-Z0-9\.\?\!\=\-\+\_\|\*\&\%\#\@\~\@\！\%\￥]')

    if len(pwd) < 6 or len(pwd) > 20:
        data["status"] = 902
        data["msg"] = '请输入6到20位的密码'
    elif wrong_re.search(pwd) != None:
        data["status"] = 902
        data["msg"] = '密码中包含了无效字符'
    elif pwd == "123456a.":
        data["status"] = 902
        data["msg"] = '您输入的密码太简单了，请换一个'
    else:
        if l_re.search(pwd) == None:
            data["status"] = 902
            data["msg"] = '密码里必须包含字母'
        elif num_re.search(pwd) == None:
            data["status"] = 902
            data["msg"] = '密码里必须包含数字'
        elif p_re.search(pwd) == None:
            data["status"] = 902
            data["msg"] = '密码里必须包含.?!=-+_|*&%#@~￥中至少一个符号'
        else:
            data["status"] = 200
            data["msg"] = '该密码可以使用'

    return data


def check_code(verify_code, the_code):
    data = {}
    verify_code = verify_code.upper()
    if verify_code != the_code:
        data["status"] = 901
        data["msg"] = '验证码不正确，请重新输入'
    else:
        data["status"] = 200
        data["msg"] = '验证码正确'
    return data


def check_phone(phone):
    data = {}
    num_re = re.compile('[^\d]')
    if num_re.search(phone):
        data["status"] = 901
        data["msg"] = '请输入正确的手机号'
    elif len(phone) <= 5 and len(phone) != 0:
        data["status"] = 901
        data["msg"] = '哪有小于6位的电话'
    elif len(phone) == 0:
        data["status"] = 200
        data["msg"] = ''
    else:
        data["status"] = 200
        data["msg"] = '可以使用'
    return data


def send_email_activate(username, receive, email_token):
    subject = "%s 生鲜购物商城-注册激活" % username
    from_email = EMAIL_HOST_USER
    recipient_list = [receive, ]

    data = {
        "username": username,
        "activate_url": "http://{}:{}/activate/?email_token={}".format(SERVER_HOST, SERVER_PORT, email_token),
    }
    html_msg = loader.get_template("activate.html").render(data)

    send_mail(subject=subject, message='', html_message=html_msg, from_email=from_email, recipient_list=recipient_list)


def get_total_price(user):
    carts = Cart.objects.filter(c_user_id=user).filter(is_select=True)
    total = 0
    for cart in carts:
        total += cart.c_foods_num * cart.c_foods.price
    return "{:.2f}".format(total)


def get_total_points(user):
    carts = Cart.objects.filter(c_user_id=user).filter(is_select=True).filter(c_foods__is_points=True)
    total = 0
    for cart in carts:
        total += cart.c_foods_num * int(cart.c_foods.price)
    return int(total)


def get_default_addr(user):
    try:
        # 如果有默认地址
        Addr.objects.filter(a_user=user).get(pk=user.addr_id)
    except:
        # 如果没有默认地址
        try:
            # 获取第一个地址,设为默认地址
            addr_id = Addr.objects.filter(a_user=user).first().id
        except:
            # 地址为空，设默认地址为0
            addr_id = 0
        user.addr_id = addr_id
        user.save()


def get_order_id(user):
    # 时间
    id_1 = time.strftime('%Y%m%d', time.localtime(time.time()))
    # 用户id
    id_2 = user.id
    if id_2 < 10:
        id_2 = "0" + str(id_2)
    else:
        id_2 = str(id_2)
    # 累加订单id(最后4位)
    try:
        max_order_id = Order.objects.filter(o_user=user).order_by("-o_id").first().o_id + 1
        max_order_id = str(max_order_id)
    except:
        max_order_id = "0000"
    o_id = id_1 + id_2 + max_order_id[-4:]
    print("订单", o_id, "已生成")
    return o_id


def get_vip(all_points):
    if all_points < VIP1:
        vip = "VIP1"
        vip_points = 0.98
    elif all_points < VIP2:
        vip = "VIP2"
        vip_points = 0.96
    elif all_points < VIP3:
        vip = "VIP3"
        vip_points = 0.94
    elif all_points < VIP4:
        vip = "VIP4"
        vip_points = 0.92
    else:
        vip = "VIP5"
        vip_points = 0.90
    return vip, vip_points

