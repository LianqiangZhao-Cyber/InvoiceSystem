# Generated by Django 4.2.13 on 2024-08-01 13:51

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("invoice", "0040_alter_upfile_create_date"),
    ]

    operations = [
        migrations.AlterField(
            model_name="upfile",
            name="create_date",
            field=models.DateTimeField(
                default=django.utils.timezone.now, verbose_name="Create Date"
            ),
        ),
    ]