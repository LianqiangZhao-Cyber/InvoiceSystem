# Generated by Django 4.2.13 on 2024-07-07 10:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("invoice", "0019_remove_user_token"),
    ]

    operations = [
        migrations.RenameField(
            model_name="user",
            old_name="is_admin",
            new_name="is_staff",
        ),
    ]
