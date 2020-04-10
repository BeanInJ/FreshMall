from App.constant import ORDER_STATUS_NOT_SEND
from App.models import Order
from alipay import AliPay
from django.http import JsonResponse
from django.shortcuts import redirect


def my_alipay():
    alipay_public_key_string = """-----BEGIN PUBLIC KEY-----
    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDIgHnOn7LLILlKETd6BFRJ0GqgS2Y3mn1wMQmyh9zEyWlz5p1zrahRahbXAfCfSqshSNfqOmAQzSHRVjCqjsAw1jyqrXaPdKBmr90DIpIxmIyKXv4GGAkPyJ/6FTFY99uhpiq0qadD/uSzQsefWo0aTvP/65zi3eof7TcZ32oWpwIDAQAB
    -----END PUBLIC KEY-----"""

    app_private_key_string = """-----BEGIN RSA PRIVATE KEY-----
    MIICXQIBAAKBgQCgaYHnBs4xmVUeJ06Wncybr4OOu0svQbD/g7kfud2aMPoB3UETNWs0lxu2CtzvdlUtLFSQSI2QfAVeB2fVULILUzyh0HCHMa11/hdAuXBYOTP4Xhe5QlGUTNpBJjqLKsFxLc3PmVptHHRtHlhfdF4NOLdbPfBEB8Fw2oyTo2RhbwIDAQABAoGBAJRXvbemBXy8rYhLFVQX7aVztBeEgMzc1RAWAlaijZoP/MNIlutqlQ93Rjsc5J/WMIKr4i/jyHZ7GoOQGaedDmgORxhw2ji29vgKllsuHzAD5/JzFLIr4T1N//bU6gb7DbTml7dHyEHDLg/nsPVZFmKNg7h3SudPMnpobNPfi4eBAkEA3pTFkd7yzs60Bl559y2UHwYmMFPxmgNJspsVtynv4LS+Fb5a4xDJrMeAjJt16UGE4Xm1669jd5ReckHD7ddUTwJBALh/Lh1BYEYdTXANtIjSPOvKh7Jgc44aQ3nCQP92imwmvI3zIVlnXEXIVVNc1k6dzA1Ppgj8jBMAuLYItn+uOOECQQDU4oIcxJqDRpxUwyPwT/2ttpnr+z3HSoHAfChG6atuxjBQZ6JSLwpVYPMIiOA72tiXN2vSIgwGoTe8HD6jSyJtAkAEtmrtIGBfKhxyQkdcP1KDC1dP/Rq2hIE4uPeEDvkWLh8e2Rj++Z7nwWg8iuCGfY1awbASBrFlQt10+OAAfujBAkBJHaKdVyVmdK9Xqdb4IOopO511kOSIQBZwPnfgkFdBpRrPF+Bt4ROxBi9hP5UwKosONAhi508L5QZDgkgPht2w
    -----END RSA PRIVATE KEY-----"""

    # 实例化支付应用
    alipay = AliPay(
        appid="2016102100728965",
        app_notify_url=None,
        app_private_key_string=app_private_key_string,
        alipay_public_key_string=alipay_public_key_string,
        sign_type="RSA",

    )
    return alipay


# 支付成功后执行
def pay_return(request):
    params = request.GET.dict()
    # 获取字典里的'sign'的值，然后移除这个数据
    sign = params.pop('sign', None)
    alipay = my_alipay()
    status = alipay.verify(params, sign)  # 返回 True or False
    if status:
        o_id = params.get('out_trade_no')
        order = Order.objects.get(o_id=o_id)
        order.o_status = ORDER_STATUS_NOT_SEND
        order.save()

        return redirect("http://127.0.0.1:8000/templates/mine.html")
    return JsonResponse({"status": 901, "msg": "支付失败"})
