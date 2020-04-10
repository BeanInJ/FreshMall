from App.models import User, Foods, IndexSlide, FoodType, Cart, City, Addr, Order, Points
from rest_framework import serializers


class SlideSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = IndexSlide
        fields = ('url', 'id', 'img', 'name')


class FoodTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = FoodType
        fields = ('url', 'id', 'typeid', 'typenames', 'type2name', 'is_hot', 'typeimg')


class FoodsSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Foods
        fields = ('url', 'id', 'f_id', 'f_img', 'f_name', 'f_num', 'f_longname', 'scale', 'price', 'eprice',
                  'typeid', 'type2id', 'type2name', 'is_sell', 'is_points', 'is_hot', 'place')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'id', 'u_name', 'u_password', 'u_email', 'u_phone', 'the_points',
                  'is_active', 'all_points', 'all_cost')


class CartSerializer(serializers.HyperlinkedModelSerializer):
    foods_set = FoodsSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ('id', 'c_foods', 'c_foods_num', 'is_select', 'foods_set')


class CitySerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = City
        fields = ('id', 'name', 'pid')


class AddrSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Addr
        fields = ('id', 'a_detail', 'a_user_name', 'a_tell')


class OrderSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Order
        fields = ('id', 'o_user', 'o_price', 'o_status', 'o_status', 'o_note', 'o_addr', 'o_points', 'o_coupon', 'o_vip')


class PointsSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Points
        fields = ('id', 'p_date', 'is_add', 'p_num', 'p_detail')

