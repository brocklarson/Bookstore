# Generated by Django 3.2.2 on 2023-04-29 16:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0005_alter_book_available'),
    ]

    operations = [
        migrations.AlterField(
            model_name='book',
            name='title',
            field=models.CharField(default='', max_length=250),
        ),
    ]