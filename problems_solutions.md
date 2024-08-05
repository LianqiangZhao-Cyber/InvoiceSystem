# 1. 在前后端分离项目中，如何使用docker配置前后端环境并一键运行

后端封装 **docker-compose.yml** , 后端 **Dockerfile** 文件 和 前端**Dockerfile**,只需要运行

```shell
docker-compose up --build # 创建docker image 和docker container
docker-compose up # 运行docker image
```

后端服务器就会开始运行。

【使用docker一键运行前后端环境】 https://www.bilibili.com/video/BV1AgvNeNECD/?share_source=copy_web&vd_source=40534de17f3e1d5fe4a64c5ee3d07d6d

# 2. 前后端开发时，当前端从后端拿数据，会发送跨域预检请求  `OPTIONS` 请求到服务器，询问服务器是否允许实际请求。

在settings.py中设置 允许任何域名的请求，或者配置特定的

```python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    'corsheaders.middleware.CorsMiddleware',

]

CORS_ALLOW_ALL_ORIGINS = True  # 或者使用CORS_ALLOWED_ORIGINS配置特定的域名
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]
```

# 3. 实现login和register功能的时候，前端请求这两个端口会遇到 "detail: 身份验证信息未通过"的问题/

在settings.py中设置了

```python
    # 对用户登录的身份进行校验
    # 这一块发生在 "DEFAULT_PERMISSION_CLASSES" 之前的
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.BasicAuthentication",
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ]
```

这会对所有的views视图函数强制添加authentication验证

可以通过在特定的视图函数，例如Loginview中添加

```python
    authentication_classes = []  # 禁用认证
    permission_classes = []
```

这样前端访问这个api就不再需要在url中添加userid用来验证。

# 4. 数据库用户密码哈希问题，用户将个人信息存到数据库中，为了增强数据库安全性，需要将用户密码进行哈希

简单方法: 

```python
from django.contrib.auth.hashers import make_password, check_password
ser.validated_data['password'] = make_password(ser.validated_data['password']) # 将密码哈希
check_password(ser.validated_data['password'], instance.password) # 将用户输入的正常密码与哈希值进行比较
```



# 5. 用户忘记密码功能实现-Django

models.py: User表添加两行field

```python
reset_password_token = models.CharField(max_length=255, null=True, blank=True, verbose_name='Reset Password Token')
reset_password_sent_at = models.DateTimeField(null=True, blank=True, verbose_name='Reset Password Sent At')
```

views.py

```python
class PasswordResetRequestView(APIView):
    authentication_classes = []  # 禁用认证
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = request.build_absolute_uri(reverse('password_reset_confirm', args=[uid, token]))

        user.reset_password_token = token
        user.reset_password_sent_at = now()
        user.save()

        send_mail(
            'Password Reset',
            f'Use the link to reset your password: {reset_url}',
            'from@example.com',
            [email],
            fail_silently=False,
        )
        
        return Response({"message": "Password reset link sent"}, status=status.HTTP_200_OK)
    
class PasswordResetConfirmView(APIView):
    authentication_classes = []  # 禁用认证
    permission_classes = []

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            new_password = request.data.get('new_password')
            if not new_password:
                return Response({"error": "New password is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password) # set_password 方法会自动对提供的密码进行哈希处理并存储哈希值
            user.reset_password_token = None
            user.reset_password_sent_at = None
            user.save()
            return Response({"message": "Password has been reset"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid token or user ID"}, status=status.HTTP_400_BAD_REQUEST)
```

settings.py

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'ikezhao123@gmail.com' # google设置两步验证 后添加 应用专用密码
EMAIL_HOST_PASSWORD = 'kxirrbrpliuldrjz'  # 不包括空格
```

# 6. API文档的优化

**安装`drf-yasg`**： 你需要安装`drf-yasg`库。可以使用以下命令：

```python
pip install drf-yasg
```

**修改`settings.py`**： 在你的`settings.py`文件中，确保你已经安装了`rest_framework`和`drf_yasg`，并配置了它们：

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'drf_yasg',
]
```

**创建Swagger文档视图**： 在你的项目的urls文件中，添加Swagger的视图配置。例如，在`urls.py`中：

```python
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.urls import path, re_path

schema_view = get_schema_view(
    openapi.Info(
        title="Invoice System API",
        default_version='v1',
        description="API documentation for the Invoice System",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@local.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    ...
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
```

接口细节：

https://zoejoyuliao.medium.com/%E8%87%AA%E5%AE%9A%E7%BE%A9-drf-yasg-%E7%9A%84-swagger-%E6%96%87%E6%AA%94-%E4%BB%A5-get-post-%E6%AA%94%E6%A1%88%E4%B8%8A%E5%82%B3%E7%82%BA%E4%BE%8B-eeecd922059b

# 7. 使用 Json Web Token (JWT) 实现用户登录验证 

### 1. 首先如果是自定义的表，

```python
class User(AbstractBaseUser): # 或者AbstractUser，自行查看
```

### 要在setting里设置为django系统表

```python
AUTH_USER_MODEL = 'invoice.User'
```

### 2. 第二步，在setting里添加jwt定义

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5), # 设置访问令牌的有效期。在这个配置中，访问令牌的有效期是 5 分钟。
  
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1), # 设置刷新令牌的有效期。在这个配置中，刷新令牌的有效期是 1 天。 
  
    'ROTATE_REFRESH_TOKENS': False, # 如果设置为 True，每次使用刷新令牌获取新的访问令牌时，刷新令牌本身也会被刷新并返回一个新的刷新令牌。在这个配置中，设置为 False，表示刷新令牌不会被轮换。
  
    'BLACKLIST_AFTER_ROTATION': True, # 旧的刷新令牌在轮换后将被列入黑名单。在这个配置中，由于 ROTATE_REFRESH_TOKENS 是 False，这个设置的效果是当刷新令牌使用后它会被列入黑名单。
  
    'ALGORITHM': 'HS256', # 用于签名 JWT 的算法。在这个配置中，使用 HS256 算法（HMAC using SHA-256）。
  
    'SIGNING_KEY': SECRET_KEY, # 用于签名 JWT 的密钥。在这个配置中，使用 SECRET_KEY 作为签名密钥。
  	# SECRET_KEY = "django-insecure-e))(m#!c5i+w=ww@pxno12!vt*&qbes$@oeh#r$u)0g^%qp7hd"(好像是初始化django时自带的) 
  
    'VERIFYING_KEY': None, #用于验证 JWT 的密钥。在这个配置中，设置为 None，意味着不需要额外的验证密钥。
    'AUTH_HEADER_TYPES': ('Bearer',), # 定义授权头的类型。在这个配置中，设置为 ('Bearer',)，表示使用 Bearer Token。swagger每次输入token时要添加 Bearer <your-user-token>
  
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
  # 指定使用的令牌类。在这个配置中，使用 rest_framework_simplejwt.tokens.AccessToken 作为访问令牌类。
}


SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
      # 定义 API 的安全性设置。在这个配置中，定义了一个类型为 apiKey 的安全方案，名称为 Authorization，位置在 HTTP 请求头中。
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    },
    'USE_SESSION_AUTH': False, # 当设为False时，Swagger UI不会尝试使用Django的会话认证方式，而是依赖于我们定义的JWT token认证方式。
  
    'JSON_EDITOR': True, # 设置是否启用 JSON 编辑器。在这个配置中，设置为 True，表示启用 JSON 编辑器。用户可以在swaggerUI中编辑token值
}

```

### 3. 在views.py中对于需要jwt用户认证的视图类添加

```python
authentication_classes = [JWTAuthentication]
```

### 4. 问题：

* 用户登录或注册时会给出refresh token和access token，用户凭借access token访问接口，如果access token有效期过期了怎么办？

  * refresh token的有效期时间更长，其存在的意义是当access token过期时，可以通过访问refresh token来获取该用户新的access token。所以前端可以通过阶段性的访问该接口来获取新的access token

    ```python
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # url.py
    ```

* 如果access token还没有过期，用户已经log out了，理论上不能再使用该access token访问接口了，也不能再使用refresh token获取新的token了，如何解决？(**unsolved**)



# 8. 使用 parser_classes 处理不同类型的数据 (untouched)



# 9. 用户忘记密码功能实现

### 问题：

用户收到link后 http://127.0.0.1:8000/invoice/password_reset_confirm/MzI/c9ugeg-55a48d9cc3a698a143ed97dc512709ce/ 若直接打开link，会像该接口发送一个get请求，但实际上需要向该接口发送post请求，携带新密码json请求体。

### 解决措施：

```python
class PasswordResetConfirmView(APIView):
```

在该视图中添加处理get请求的接口

```python
    def get(self, request, uidb64, token):
        return render(request, 'password_reset_confirm.html', {'uid': uidb64, 'token': token})
```

会render一个html文件，该文件会发送post请求携带请求体重新到该url，实现用户密码更改

# 10. 一次性拿到所有发票的基本信息的接口(具体返回信息的处理)

```python
class FileInfoAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    def get(self, request):
        invoices = UpFile.objects.filter(userid=request.user.id)
        # 把所有过滤出来的发票传入serializer
        serializer = InvoiceUpfileSerializer(invoices, many=True)
        return Response(serializer.data)
```



## 1. 供应商名字+金额

```python
# 拿到对应的json数据
def get_file_data(self, obj):
        file_name = os.path.basename(str(obj.file))
        file_stem = os.path.splitext(file_name)[0]
        try:
            with open(f"staticfiles/{obj.userid.id}/{file_stem}.json", 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
# 使用.get函数拿到supplier对应的数据
def get_supplier(self, obj):
        data = self.get_file_data(obj)
        return data.get('supplier', 'N/A')
    
def get_total(self, obj):
        data = self.get_file_data(obj)
        return data.get('total', 'N/A')
```

## 2. 发票状态	(未验证\未通过\已通过)

* ```python
  class UpFile(models.Model):
      file = models.FileField(upload_to=user_directory_path)
      uuid = models.CharField(max_length=30)
      userid = models.ForeignKey(User, on_delete=models.CASCADE,related_name="UserFiles",null=True, blank=True)
      timestamp = models.DateTimeField(auto_now_add=True)
      
      # 添加这两列fields到invoice_upfile数据表中
      is_validated = models.BooleanField(default=False)
      is_correct = models.BooleanField(default=False)
      
      class Meta:
          unique_together = ('userid', 'file')
  ```

* 当前端调用

  ```python
  class FileValidationsAPIView(APIView):
  ```

  ```python
  # 首先因为调用函数可以设置file.is_validated = True
  # 其次根据返回的report里的successful字段，看其对应的值是true还是false来判断file.is_correct
  if validation_response.status_code == 200:
      validate_data = validation_response.json()
      file.is_validated = True
      if validate_data.get('successful'):
          file.is_correct = True
  ```

### 3. 区分发票创建方式

```python
def get_creation_method(self, obj):
    if GUIFile.objects.filter(userid=obj.userid, uuid=obj.uuid).exists():
        return "gui"
    return "upload"
```

# 11. 发票创建耗时30秒，阻塞整个进程，如何使用celery把发票创建的进程异步化

## 1.在settings.py所在的根目录下创建celery.py

```python
# InvoiceProcessing/celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# 设置 Django 的默认设置模块
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'InvoiceProcessing.settings')

app = Celery('InvoiceProcessing')

# 从 Django 的设置中加载 Celery 配置
app.config_from_object('django.conf:settings', namespace='CELERY')

# 自动发现任务
app.autodiscover_tasks()

```

## 2.在 `__init__.py` 文件中导入 Celery：

```python
# InvoiceProcessing/__init__.py
from __future__ import absolute_import, unicode_literals

# 这将确保 Django 在 Celery 加载时会加载应用程序配置
from .celery import app as celery_app

__all__ = ('celery_app',)
```

## 3.setting.py中配置celery

```python
# InvoiceProcessing/settings.py

# 使用 Redis 作为消息队列
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

```

## 4.定义异步化任务

```python
# invoice/tasks.py
from celery import shared_task
import requests

@shared_task
def extract_pdf_data(invoice_id):
    # 调用外部 API 提取 PDF 数据的逻辑
    response = requests.get('https://example.com/extract-pdf')
    data = response.json()

    # 处理数据并保存到数据库
    # ...

```

## 5.视图中调用任务

```python
# invoice/views.py
from django.http import JsonResponse
from .tasks import extract_pdf_data

def create_invoice(request):
    if request.method == 'POST':
        # 创建发票的逻辑
        invoice_id = create_invoice_in_db()

        # 调用异步任务
        extract_pdf_data.delay(invoice_id)

        return JsonResponse({'status': 'success', 'invoice_id': invoice_id})

```

## 6.在运行celery异步worker前首先要运行redis服务器，然后运行celery worker，最后运行主代码，非常的繁琐，这里进行简化，只需要运行主程序代码就可以把三个服务器全部运行起来

### 1. 创建自定义管理命令

在你的 Django 应用中创建一个自定义管理命令，启动所有服务。在 `invoice` 应用中创建 `management/commands` 目录（如果还没有的话），然后创建一个新文件 `runserver_all.py`。

```shell
mkdir -p invoice/management/commands
touch invoice/management/commands/runserver_all.py
```

### 2. 编写自定义管理命令

编辑 `runserver_all.py` 文件，内容如下：

```python
import os
from django.core.management.commands.runserver import Command as RunserverCommand
from multiprocessing import Process
import subprocess

def start_redis():
    subprocess.run(['redis-server'])

def start_celery_worker():
    subprocess.run(['celery', '-A', 'InvoiceProcessing', 'worker', '--loglevel=info'])

class Command(RunserverCommand):
    def handle(self, *args, **options):
        # 启动 Redis 服务器
        redis_process = Process(target=start_redis)
        redis_process.start()

        # 启动 Celery worker
        celery_process = Process(target=start_celery_worker)
        celery_process.start()

        # 启动 Django 开发服务器
        super().handle(*args, **options)

        # 停止子进程
        redis_process.terminate()
        celery_process.terminate()

```

### 3. 运行自定义命令

你现在可以使用自定义的管理命令来启动所有服务：

```shell
python manage.py runserver_all
```

# 12. 有时候引入的包会显示没有安装这个包，但是当运行pip install celery时候显示已经安装了，如何解决

* 1.打开命令面板（Shift + Command + P）。

* 2.输入 `Python: Select Interpreter` 并选择这个选项。

* 3.在弹出的列表中，选择你的虚拟环境对应的解释器路径。对于 Anaconda 环境，路径通常类似于 `.../anaconda3/envs/py39/bin/python`。

# 13. Github 经常会merge的时候显示数据库数据发生冲突，如何解决？

这是因为这些文件已经被 Git 跟踪，即使你在 `.gitignore` 文件中添加了规则，Git 仍然会跟踪这些已经添加到索引中的文件。要解决这个问题，你需要将这些文件从 Git 的索引中移除。



* 使用 `git rm --cached` 命令将这些文件从 Git 的索引中移除。 

```shell
git rm -r --cached InvoiceProcessing/__pycache__
git rm -r --cached InvoiceProcessing/InvoiceProcessing/__pycache__
git rm --cached *.pyc *.pyo *.pyd
```

* 更新 ```.gitignore```文件

  ```python
  # Ignore compiled Python files
  *.pyc
  *.pyo
  *.pyd
  
  # Ignore Python cache directories
  __pycache__/
  
  # 忽略 Django 特定文件
  *.sqlite3
  db.sqlite3
  media/
  ```

* 更改提交到仓库

  ```python
  git commit -m "Remove ignored files from repository"
  ```

* push到github

# 14. 图片保存到数据库里，如何使用url进行访问

首先要配置```STATIC_URL``` 和```MEDIA_URL``` 一个是管理静态文件一个是管理动态文件

```python
STATIC_URL = "/staticfiles/"
```

说明用户只需要在网页上输入```localhost:3000/staticfiles/``` 就可以访问数据库中的图片

```python
STATIC_ROOT = os.path.join(BASE_DIR, "static/")

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "staticfiles/"),
]
```

这里是两个备选的路径，通过```localhost:3000/staticfiles/```可以直接指代这两个路径

比如```os.path.join(BASE_DIR, "staticfiles/"),``` 是 ```User/homy/9900/project/staticfiles/```,那么```localhost:3000/staticfiles/``` = ```User/homy/9900/project/staticfiles/``` 接下来只需要填写文件所在的相对路径就可以。比如```1.png```的路径为 ```User/homy/9900/project/staticfiles/avatar/1.png``` 在浏览器只需要输入 ```localhost:3000/staticfiles/avatar/1.png```即可访问



# 15.如何将项目使用云服务器运行

### 1.首先需要购买一台云服务器，这里注意一般系统都选择centos7.6左右的版本，注意宽带和按量付费的区别，阿里云做域名备案必须要求宽带

### 2.购买域名进行域名解析，一般用国内主机都需要进行域名备案，不购买域名的话只能通过ip进行访问

### 3.购买完云服务器实例后进行配置

* ssh -i test.pem root@43.128.79.206 连接到云服务器，或者使用vscode remost ssh (commond+shift+p输入remote ssh，输入user@hostname)

* lcmh@123 密码

* 目前的做法是下载git，使用git clone把项目拿下来，注意这里的项目是使用docker进行配置的

* 在云服务器下载docker，使用docker-compose up --build构建docker image，如果前端或者后端启动失败的话则使用

  ```
  docker run -d --name frontend --network my_network -p 80:3000 invoicesystem_frontend
  # 这里80:3000的意思是把3000端口映射到80端口上，因为默认http协议是往80端口发送请求
  ```

* 这里云服务器的安全组记得打开8000后端端口，否则前端访问不到
* 前端访问后端api端口需要从http://localhost:8000或者http://127.0.0.1:8000改为http://云服务器ip地址:8000
* 到这里项目应该可以正常的运行了，但是通过右键 ->检查 -> source会看到前端所有的代码![截屏2024-08-05 下午8.05.02](/Users/homy/Library/Application Support/typora-user-images/截屏2024-08-05 下午8.05.02.png)
* 解决方法是（未检测）![截屏2024-08-05 下午8.06.06](/Users/homy/Library/Application Support/typora-user-images/截屏2024-08-05 下午8.06.06.png)

![截屏2024-08-05 下午8.06.28](/Users/homy/Library/Application Support/typora-user-images/截屏2024-08-05 下午8.06.28.png)

### 4. 当代码出现bug后可以如何在云服务器里进行修改

* 1.使用docker exec -it frontend /bin/sh 打开docker 前端目录，修改后会自动提现，无需在build
* 2.或者在云服务器环境中git pull下来更新后的代码，然后docker stop all_image, docker rm all_image然后在docker-compose up --build创建新的image
