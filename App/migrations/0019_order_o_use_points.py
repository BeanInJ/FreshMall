# Generated by Django 3.0.4 on 2020-04-05 20:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('App', '0018_auto_20200402_0013'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='o_use_points',
            field=models.IntegerField(default=0),
        ),
    ]