from App import views, views_alipay

from django.urls import path, re_path


urlpatterns = [
    # 商城 接口
    re_path('markets/(?P<typeid>\d+)&(?P<type2id>\d+)&(?P<order_rule>\d+)/', views.Markets.as_view()),

    # 首页 slide图片
    path('slide/', views.SlideAPIView.as_view()),
    re_path('slide/(?P<pk>\d+)/', views.SlideAPIView.as_view(), name='indexslide-detail'),

    # 商品类型
    path('foodtype/', views.FoodTypeAPIView.as_view()),
    re_path('foodtype/(?P<pk>\d+)/', views.FoodTypeAPIView.as_view(), name='foodtype-detail'),

    # 所有商品详细信息
    path('foods/', views.FoodsListAPIView.as_view()),
    re_path('foods/(?P<pk>\d+)/', views.FoodsListAPIView.as_view(), name='foods-detail'),

    # 用户信息
    path('user/', views.UserAPIView.as_view()),
    re_path('user/(?P<pk>\d+)/', views.UserAPIView.as_view(), name='user-detail'),

    # 验证码图片
    path('getcode/', views.GetCode.as_view()),

    # 购物车
    path('cart/', views.CartAPIView.as_view()),
    re_path('cart/(?P<pk>\d+)/', views.CartAPIView.as_view(), name='cart-detail'),

    # 添加到购物车
    path('cartadd/', views.CartAddAPIView.as_view()),
    # re_path('cartadd/(?P<pk>\d+)/', views.CartAPIView.as_view(), name='cart-detail'),

    # 城市三级联动查询
    path('city/', views.CityAPIView.as_view()),
    re_path('city/(?P<pk>\d+)/', views.CityAPIView.as_view(), name='city-detail'),

    # 地址
    path('addr/', views.AddrAPIView.as_view()),
    re_path('addr/(?P<pk>\d+)/', views.AddrAPIView.as_view(), name='addr-detail'),

    # 订单
    path('order/', views.OrderAPIView.as_view()),
    re_path('order/(?P<pk>\d+)/', views.OrderAPIView.as_view(), name='order-detail'),

    # 付款
    path('pay/', views.PayAPIView.as_view()),

    # 支付成功后接收,跳转页面
    path('payreturn/', views_alipay.pay_return, name='pay_return'),

    # 订单列表
    path('getorder/', views.GetOrder.as_view()),

    # 订单状态改变
    path('orderchange/', views.OrderChange.as_view()),

    # 订单
    path('points/', views.PointsAPIView.as_view()),
    re_path('points/(?P<pk>\d+)/', views.PointsAPIView.as_view(), name='points-detail'),

    # 签到
    path('insign/', views.InSignView.as_view()),
]
