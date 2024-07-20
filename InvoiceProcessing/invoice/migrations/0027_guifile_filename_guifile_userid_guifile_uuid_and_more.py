# Generated by Django 4.2.13 on 2024-07-20 19:18

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        (
            "invoice",
            "0026_order_alter_guifile_unique_together_guifile_address_and_more",
        ),
    ]

    operations = [
        migrations.AddField(
            model_name="guifile",
            name="filename",
            field=models.CharField(default="1", max_length=30),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="guifile",
            name="userid",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="GUIFiles",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="guifile",
            name="uuid",
            field=models.CharField(default="1", max_length=30),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="guifile",
            name="items",
            field=models.JSONField(default=list),
        ),
        migrations.AlterUniqueTogether(
            name="guifile",
            unique_together={("userid", "filename")},
        ),
    ]