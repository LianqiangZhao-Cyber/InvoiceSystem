# Generated by Django 4.2.13 on 2024-07-29 22:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("invoice", "0036_user_join_company_date_user_login_date"),
    ]

    operations = [
        migrations.AddField(
            model_name="draft",
            name="create_date",
            field=models.DateTimeField(
                auto_now_add=True, default="2000-01-01", verbose_name="Create Date"
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="draft",
            name="update_date",
            field=models.DateTimeField(auto_now=True, verbose_name="Update Date"),
        ),
        migrations.AlterField(
            model_name="draft",
            name="invoice_num",
            field=models.CharField(max_length=20, unique=True),
        ),
        migrations.AlterField(
            model_name="upfile",
            name="sending_date",
            field=models.DateTimeField(
                blank=True, null=True, verbose_name="Validation Date"
            ),
        ),
        migrations.AlterField(
            model_name="upfile",
            name="validation_date",
            field=models.DateTimeField(
                blank=True, null=True, verbose_name="Validation Date"
            ),
        ),
    ]
