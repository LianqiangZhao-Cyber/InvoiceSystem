# Generated by Django 3.0.6 on 2024-06-22 12:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True, verbose_name='Company Name')),
                ('logo', models.URLField(verbose_name='Company Logo')),
                ('phone_number', models.CharField(max_length=20, verbose_name='Company Phone Number')),
                ('email', models.EmailField(max_length=254, verbose_name='Company Email')),
                ('address', models.CharField(max_length=255, verbose_name='Company Address')),
                ('create_date', models.DateTimeField(auto_now_add=True, verbose_name='Create Date')),
                ('update_date', models.DateTimeField(auto_now=True, verbose_name='Update Date')),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('username', models.CharField(max_length=255, unique=True, verbose_name='Username')),
                ('password', models.CharField(max_length=255, verbose_name='Password')),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
                ('avatar', models.URLField(verbose_name='Avatar')),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='Email')),
                ('create_date', models.DateTimeField(auto_now_add=True, verbose_name='Create Date')),
                ('update_date', models.DateTimeField(auto_now=True, verbose_name='Update Date')),
                ('company', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='employees', to='invoice.Company', verbose_name='Company')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
