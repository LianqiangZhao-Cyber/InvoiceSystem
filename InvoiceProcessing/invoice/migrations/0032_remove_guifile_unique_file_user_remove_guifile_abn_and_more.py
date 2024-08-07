# Generated by Django 4.2.13 on 2024-07-26 18:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("invoice", "0031_remove_user_aqstar_user_avatar_user_bio"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="guifile",
            name="unique_file_user",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="ABN",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="address",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="bank",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="company_name",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="country_name",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="file_id",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="filename",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="important_text",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="items",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="purchase_id",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="qst_total",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="terms",
        ),
        migrations.RemoveField(
            model_name="guifile",
            name="total_price",
        ),
        migrations.RemoveField(
            model_name="order",
            name="price",
        ),
        migrations.RemoveField(
            model_name="order",
            name="qst",
        ),
        migrations.AddField(
            model_name="guifile",
            name="bank_name",
            field=models.CharField(default="", max_length=255),
        ),
        migrations.AddField(
            model_name="guifile",
            name="client_abn",
            field=models.CharField(default="", max_length=100),
        ),
        migrations.AddField(
            model_name="guifile",
            name="client_address",
            field=models.CharField(default="", max_length=100),
        ),
        migrations.AddField(
            model_name="guifile",
            name="client_company_name",
            field=models.CharField(default="", max_length=100),
        ),
        migrations.AddField(
            model_name="guifile",
            name="client_email",
            field=models.EmailField(default="", max_length=254),
        ),
        migrations.AddField(
            model_name="guifile",
            name="currency",
            field=models.CharField(default="", max_length=255),
        ),
        migrations.AddField(
            model_name="guifile",
            name="gst_total",
            field=models.CharField(default="", max_length=20),
        ),
        migrations.AddField(
            model_name="guifile",
            name="invoice_name",
            field=models.CharField(default="", max_length=30),
        ),
        migrations.AddField(
            model_name="guifile",
            name="invoice_num",
            field=models.CharField(default="", max_length=20),
        ),
        migrations.AddField(
            model_name="guifile",
            name="my_abn",
            field=models.CharField(default="", max_length=20),
        ),
        migrations.AddField(
            model_name="guifile",
            name="my_address",
            field=models.CharField(default="", max_length=255),
        ),
        migrations.AddField(
            model_name="guifile",
            name="my_company_name",
            field=models.CharField(default="", max_length=255),
        ),
        migrations.AddField(
            model_name="guifile",
            name="my_email",
            field=models.EmailField(default="", max_length=254),
        ),
        migrations.AddField(
            model_name="guifile",
            name="note",
            field=models.TextField(default=""),
        ),
        migrations.AddField(
            model_name="guifile",
            name="total_amount",
            field=models.CharField(default="", max_length=20),
        ),
        migrations.AddField(
            model_name="order",
            name="gst",
            field=models.CharField(default="", max_length=10),
        ),
        migrations.AddField(
            model_name="order",
            name="unit_price",
            field=models.CharField(default="", max_length=20),
        ),
        migrations.AlterField(
            model_name="company",
            name="logo",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="staticfiles/avatar/",
                verbose_name="Aqstar",
            ),
        ),
        migrations.AlterField(
            model_name="guifile",
            name="account_name",
            field=models.CharField(default="", max_length=255),
        ),
        migrations.AlterField(
            model_name="guifile",
            name="account_num",
            field=models.CharField(default="", max_length=20),
        ),
        migrations.AlterField(
            model_name="guifile",
            name="bank_branch",
            field=models.CharField(default="", max_length=255),
        ),
        migrations.AlterField(
            model_name="guifile",
            name="bsb_num",
            field=models.CharField(default="", max_length=20),
        ),
        migrations.AlterField(
            model_name="guifile",
            name="subtotal",
            field=models.CharField(default="", max_length=20),
        ),
        migrations.AlterField(
            model_name="guifile",
            name="uuid",
            field=models.CharField(default="", max_length=30),
        ),
        migrations.AlterField(
            model_name="order",
            name="description",
            field=models.CharField(default="", max_length=255),
        ),
        migrations.AlterField(
            model_name="order",
            name="gross",
            field=models.CharField(default="", max_length=20),
        ),
        migrations.AlterField(
            model_name="order",
            name="net",
            field=models.CharField(default="", max_length=20),
        ),
        migrations.AlterField(
            model_name="order",
            name="quantity",
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name="user",
            name="avatar",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="staticfiles/avatar/",
                verbose_name="Avatar",
            ),
        ),
        migrations.AddConstraint(
            model_name="guifile",
            constraint=models.UniqueConstraint(
                fields=("invoice_name", "userid"), name="unique_file_user"
            ),
        ),
    ]
