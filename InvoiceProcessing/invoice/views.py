from django.shortcuts import render
import json
import os
import base64
import hashlib
import requests
import xml.etree.ElementTree as ET
from xml.dom import minidom
from django.http import JsonResponse
from .models import Company, User, UpFile, GUIFile
from django.conf import settings
from django.db.models.signals import post_save # 用户已经建好了，才触发generate_token函数生成token
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.utils.timezone import now
import uuid
from .authentication import MyAhenAuthentication

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

#from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.authentication import BasicAuthentication, SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import CompanySerializer,RegisterSerializer,LoginSerializer,\
                        FileUploadSerializer, FileGUISerializer, PasswordResetSerializer, FileDeletionSerializer
# Create your views here.


# 用户注册
class RegisterView(APIView):
    authentication_classes = []  # 禁用认证
    permission_classes = []
    
    @swagger_auto_schema(
        operation_summary='用户注册说明',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'username': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User Name'
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User Password'
                ),
                'name': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Nick Name'
                ),
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User Email'
                ),
                'confirm_password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Confirm Password'
                )
            }
        ),
        responses={
            201: openapi.Response(
                description="Register success",
                examples={
                    "application/json": {
                        "state": "Register success",
                        "username": "example_user",
                        "password": "hashed_password",
                        "userid": 1,
                        "token": "some-uuid-token"
                    }
                }
            ),
            400: openapi.Response(
                description="Bad request",
                examples={
                    "application/json": {
                        "username": ["This field is required."],
                        "password": ["This field is required."],
                        "email": ["This field is required."],
                        "confirm_password": ["This field is required."]
                    }
                }
            )
        }
    )
    def post(self, request):
        ser = RegisterSerializer(data=request.data)

        if ser.is_valid():
            ser.validated_data.pop('confirm_password')
            token =str(uuid.uuid4())
            ser.validated_data['password'] = make_password(ser.validated_data['password'])
            ser.validated_data['token'] = token
            ser.save()
            instance = User.objects.filter(**ser.validated_data).first()
            return Response({"state":"Register success",
                            'username':instance.username,
                            'password':instance.password,
                            'userid':instance.id,
                            'token': token}, 
                            status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
# 用户登录
class LoginView(APIView):
    authentication_classes = []  # 禁用认证
    permission_classes = []
    ser = LoginSerializer
    
    @swagger_auto_schema(
        operation_summary='用户登录说明',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'username': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User Name'
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User Password'
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="Login success",
                examples={
                    "application/json": {
                        "state": "Login success",
                        "userid": 1,
                        "token": "some-token-value"
                    }
                }
            ),
            400: openapi.Response(
                description="Bad request",
                examples={
                    "application/json": {
                        "username": ["This field is required."],
                        "password": ["This field is required."]
                    }
                }
            ),
            401: openapi.Response(
                description="Unauthorized",
                examples={
                    "application/json": {
                        "error": "This user does not exist"
                    },
                    "application/json": {
                        "error": "Password does not match"
                    }
                }
            )
        }
    )
    def post(self, request):
        ser = LoginSerializer(data=request.data)

        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        

        instance = User.objects.filter(username=ser.validated_data['username']).first()

        if not instance:
            return Response({'error': 'This user does not exist'}, status=status.HTTP_401_UNAUTHORIZED)
        # token, created = Token.objects.get_or_create(user=instance)
        elif not check_password(ser.validated_data['password'], instance.password):
            return Response({'error': 'Password does not match'}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({"state":"Login success",
                         'userid':instance.id,
                        'token': instance.token}, 
                        status=status.HTTP_200_OK)
    
class CreateCompanyView(APIView):
    # permission_classes = [IsAuthenticated]
    authentication_classes = [MyAhenAuthentication]
    @swagger_auto_schema(
        operation_summary='用户创建公司说明',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'name': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Company Name'
                ),
                'phone_number': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Company Phone Number'
                ),
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Company Email'
                ),
                'ABN': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Company ABN'
                ),
                'address': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Company Address'
                ),
            }
        ),
        responses={
            201: openapi.Response(
                description="Company created successfully",
                examples={
                    "application/json": {
                        "name": "Example Company",
                        "phone_number": "123456789",
                        "email": "example@company.com",
                        "ABN": "12345678901",
                        "address": "123 Example Street"
                    }
                }
            ),
            400: openapi.Response(
                description="Bad request",
                examples={
                    "application/json": {
                        "name": ["This field is required."],
                        "phone_number": ["This field is required."],
                        "email": ["This field is required."],
                        "ABN": ["This field is required."],
                        "address": ["This field is required."]
                    }
                }
            )
        }
    )

    def post(self, request, userid):
        ser = CompanySerializer(data=request.data)
        if ser.is_valid() and not Company.objects.filter(name=request.data.get('name')).first():
            validated_data = ser.validated_data
            company = Company(
                name=validated_data['name'],
                phone_number=validated_data['phone_number'],
                email=validated_data['email'],
                ABN = validated_data['ABN'],
                address=validated_data['address'],
                boss_id=request.user,  # 将 boss_id 设置为当前用户
            )
            company.save()
            request.user.company = company
            request.user.is_admin = True
            request.user.save()

            return Response(ser.data, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class JoinCompanyView(APIView):
    # permission_classes = [IsAuthenticated]

    
    authentication_classes = [MyAhenAuthentication]
    
    @swagger_auto_schema(
        operation_summary='得到加入公司的详细信息',
        responses={
            200: openapi.Response(
                description="成功获取公司详细信息",
                examples={
                    "application/json": [
                        {
                            "name": "Example Company",
                            "phone_number": "123456789",
                            "email": "example@company.com",
                            "ABN": "12345678901",
                            "address": "123 Example Street"
                        },
                        {
                            "name": "Another Company",
                            "phone_number": "987654321",
                            "email": "another@company.com",
                            "ABN": "10987654321",
                            "address": "456 Another Street"
                        }
                    ]
                }
            )
        }
    )
    def get(self,request,userid):

        companies = Company.objects.all()
        return Response(companies.values('name', 'phone_number', 'email', 'ABN', 'address'), status=status.HTTP_200_OK)
        
        
    @swagger_auto_schema(
        operation_summary='用户加入公司说明',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'company_name': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Company Name'
                ),
            }
        ),
        responses={
            200: openapi.Response(
                description="成功加入公司",
                examples={
                    "application/json": {
                        "success": "Joined the company successfully"
                    }
                }
            ),
            400: openapi.Response(
                description="请求错误",
                examples={
                    "application/json": {
                        "error": "company_name field is required"
                    }
                }
            ),
            404: openapi.Response(
                description="公司不存在",
                examples={
                    "application/json": {
                        "error": "Company does not exist"
                    }
                }
            )
        }
    )
    def post(self, request, userid):

        company_name = request.data.get('company_name')
        if not company_name:
            return Response({'error': 'company_name field is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            company = Company.objects.get(name=company_name)
        except Company.DoesNotExist:
            return Response({'error': 'Company does not exist'}, status=status.HTTP_404_NOT_FOUND)

        request.user.company = company
        request.user.save()
        return Response({'success': 'Joined the company successfully'}, status=status.HTTP_200_OK)

# for uploading and downloading files
class UpFileAPIView(APIView):
    authentication_classes = [MyAhenAuthentication]
    #parser_classes = (MultiPartParser, FormParser)

    @swagger_auto_schema(
        operation_summary='用户发票上传说明',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'file': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format='binary',
                    description='File Upload'
                ),
                'uuid': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='File ID'
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="File uploaded successfully",
                examples={
                    "application/json": {
                        "code": 0,
                        "msg": "success!",
                        "data": {
                            "file": "uploaded_file.pdf",
                            "uuid": "some-uuid"
                        }
                    }
                }
            ),
            400: openapi.Response(
                description="Bad request",
                examples={
                    "application/json": {
                        "code": 400,
                        "msg": "File ID exists"
                    },
                    "application/json": {
                        "file": ["This field is required."],
                        "uuid": ["This field is required."]
                    }
                }
            )
        }
    )
    def post(self, request, userid):
        file_serializer = FileUploadSerializer(data=request.data)
        if file_serializer.is_valid():
            uuid = file_serializer.validated_data.get('uuid')
            if UpFile.objects.filter(uuid=uuid).exists():
                return Response({
                    "code": 400,
                    "msg": "File ID exists",
                }, status=status.HTTP_400_BAD_REQUEST)
            file_serializer.save(userid=request.user)
            return Response({
                                "code": 0,
                                "msg": "success!",
                                "data": file_serializer.data
                            },
                            status=status.HTTP_200_OK
                            )
        else:
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary='获取用户上传的发票文件路径',
        manual_parameters=[
            openapi.Parameter(
                name='uuid',
                in_=openapi.IN_QUERY,
                description='File ID',
                type=openapi.TYPE_STRING
            )
        ],
        responses={
            200: openapi.Response(
                description="成功获取文件路径",
                examples={
                    "application/json": {
                        "file_url": "http://example.com/media/uploaded_file.pdf"
                    }
                }
            ),
            400: openapi.Response(
                description="请求错误",
                examples={
                    "application/json": {
                        "code": 400,
                        "msg": "File ID is required"
                    }
                }
            ),
            404: openapi.Response(
                description="文件未找到",
                examples={
                    "application/json": {
                        "code": 404,
                        "msg": "file not found"
                    }
                }
            )
        }
    )
    def get(self,request,userid):
        uuid = request.GET.get('uuid')
        if not uuid:
            return Response({
                                "code": 400,
                                "msg": "File ID is required",
                            },
                            status=status.HTTP_400_BAD_REQUEST)
        
        file = UpFile.objects.filter(userid=userid, uuid=uuid).first()
        if file is None or file.file is None :
            return Response({
                                "code": 404,
                                "msg": "file not found",
                            },
                            status=status.HTTP_404_NOT_FOUND
                            )
        file_url = file.file.url
        # 把pdf内容当成乱码返回
        """response = FileResponse(file_iterator(str(file.file)))
        response['Content-Type'] = 'application/octet-stream'
        # Content-Disposition就是当用户想把请求所得的内容存为一个文件的时候提供一个默认的文件名
        response['Content-Disposition'] = f'attachment; filename="{file.file.name}"'"""
        return JsonResponse({'file_url': file_url})
        """return Response({
            "code":200,
            "msg":"success",
        })"""
        
class GUIFileAPIView(APIView):
    authentication_classes = [MyAhenAuthentication]
    @swagger_auto_schema(
        operation_summary='用户发票GUI说明',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'filename': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Invoice Title'
                ),
                'uuid':openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Invoice ID'
                ),
                'abn': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='ABN'
                ),
                'additional_request': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Additional Request'
                ),
                'approver': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Approver'
                ),
                'approver_email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Approver Email'
                ),
                'bPayRef': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='BPay Reference'
                ),
                'bPaycode': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='BPay Code'
                ),
                'bankAccount': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Bank Account'
                ),
                'bankBranch': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Bank Branch'
                ),
                'bank_details': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Bank Details'
                ),
                'changed': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description='Changed'
                ),
                'charge': openapi.Schema(
                    type=openapi.TYPE_NUMBER,
                    description='Charge'
                ),
                'company_invoiced': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Company Invoiced'
                ),
                'delivery_to': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Delivery To'
                ),
                'delivery_to_address': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Delivery To Address'
                ),
                'description': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Description'
                ),
                'document_subtype': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='Document Subtype'
                ),
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Email'
                ),
                'email_to': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Email To'
                ),
                'expense_claim': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Expense Claim'
                ),
                'from_email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='From Email'
                ),
                'glcode_option': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='GL Code Option'
                ),
                'glcode_text': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='GL Code Text'
                ),
                'invoiceDate': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Invoice Date'
                ),
                'invoiceNumber': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Invoice Number'
                ),
                'invoice_to': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Invoice To'
                ),
                'invoice_to_address': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Invoice To Address'
                ),
                'location': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Location'
                ),
                'purchaseOrder': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Purchase Order'
                ),
            'require_bank_details': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description='Require Bank Details'
                ),
            'require_email': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description='Require Email'
                ),
            'supplier': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Supplier'
                ),
            'supplier_address': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Supplier Address'
                ),
            'supplier_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Supplier ID'
                ),
                'tax': openapi.Schema(
                    type=openapi.TYPE_NUMBER,
                    description='Tax'
                ),
                'total': openapi.Schema(
                    type=openapi.TYPE_NUMBER,
                    description='Total'
                ),
                'tracking': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Tracking'
                ),
                'tracking_option': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Tracking Option'
                ),
            }
        ),
        responses={
            200: openapi.Response(
                description="File uploaded successfully",
                examples={
                    "application/json": {
                        "code": 0,
                        "msg": "success!",
                        "data": {
                            "title": "Invoice Title",
                            "abn": "ABN12345678",
                            "additional_request": "Some request",
                            "approver": "Approver Name",
                            "approver_email": "approver@example.com",
                            "bPayRef": "BPay Reference",
                            "bPaycode": "BPay Code",
                            "bankAccount": "Bank Account",
                            "bankBranch": "Bank Branch",
                            "bank_details": "Bank Details",
                            "changed": True,
                            "charge": 100.0,
                            "company_invoiced": "Invoiced Company",
                            "delivery_to": "Delivery To",
                            "delivery_to_address": "Delivery Address",
                            "description": "Description",
                            "document_subtype": 1,
                            "email": "email@example.com",
                            "email_to": "email_to@example.com",
                            "expense_claim": "Expense Claim",
                            "from_email": "from@example.com",
                            "glcode_option": "GL Code Option",
                            "glcode_text": "GL Code Text",
                            "invoiceDate": "2024-07-05",
                            "invoiceNumber": "INV123456",
                            "invoice_to": "Invoice To",
                            "invoice_to_address": "Invoice Address",
                            "location": "Location",
                            "purchaseOrder": "PO123456",
                            "require_bank_details": True,
                            "require_email": True,
                            "supplier": "Supplier Name",
                            "supplier_address": "Supplier Address",
                            "supplier_id": "Supplier ID",
                            "tax": 10.0,
                            "total": 110.0,
                            "tracking": "Tracking",
                            "tracking_option": "Tracking Option"
                        }
                    }
                }
            ),
            400: openapi.Response(
                description="Bad request",
                examples={
                    "application/json": {
                        "code": 400,
                        "msg": "bad request",
                        "data": {
                            "title": ["This field is required."],
                            "abn": ["This field is required."]
                        }
                    }
                }
            )
        }
    )
    def post(self, request, userid):
        file_serializer = FileGUISerializer(data=request.data)
        if file_serializer.is_valid():
            filename = file_serializer.validated_data.get('filename')
            if GUIFile.objects.filter(userid=request.user, filename=filename).exists():
                    return Response({
                    "code": 400,
                    "msg": "File with the same name exists for this user",
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            # 将数据保存在数据库的同时，创建json文件并保存进去
            file_instance = file_serializer.save(userid=request.user)
            file_path = f"invoices_files/{file_instance.filename}.json"
            # 将数据保存到 Invoice_upfile 表中
            UpFile.objects.create(
                file=file_path,
                uuid=file_instance.uuid,
                userid=file_instance.userid,
            )
            
            file_data = FileGUISerializer(file_instance).data
            # 把title和userid pop掉，存到文件中
            file_data.pop('id', None)
            file_data.pop('filename', None)
            file_data.pop('uuid', None)
            file_data.pop('userid', None)
            
            with open(f"invoices_files/{filename}.json", "w", encoding='utf-8') as f:
                json.dump(file_data, f, ensure_ascii=False, indent=4)
            
            return Response({
                                "code": 0,
                                "msg": "success!",
                                "data": file_serializer.data
                            },
                            status=status.HTTP_200_OK
                            )
        else:
            return Response({
                                "code": 400,
                                "msg": "bad request",
                                "data": file_serializer.errors
                            },
                            status=status.HTTP_400_BAD_REQUEST)

class DeleteFileAPIView(APIView):
    authentication_classes = [MyAhenAuthentication]
    
    @swagger_auto_schema(
        operation_summary='删除发票文件',
        manual_parameters=[
            openapi.Parameter('uuid', openapi.IN_QUERY, description="File UUID", type=openapi.TYPE_STRING)
        ],
        responses={
            200: openapi.Response(
                description="Invoice file has been successfully removed",
                examples={
                    "application/json": {
                        "code": 200,
                        "msg": "Invoice file has been successfully removed!"
                    }
                }
            ),
            400: openapi.Response(
                description="File ID is required",
                examples={
                    "application/json": {
                        "code": 400,
                        "msg": "File ID is required"
                    }
                }
            ),
            404: openapi.Response(
                description="File not found",
                examples={
                    "application/json": {
                        "code": 404,
                        "msg": "file not found"
                    }
                }
            )
        }
    )
    def post(self,request,userid):
        uuid = request.query_params.get('uuid')
        if not uuid:
            return Response({
                                "code": 400,
                                "msg": "File ID is required",
                            },
                            status=status.HTTP_400_BAD_REQUEST)
        
        file = UpFile.objects.filter(userid=request.user, uuid=uuid).first()
        print(file)
        if file is None:
            return Response({
                                "code": 404,
                                "msg": "file not found",
                            },
                            status=status.HTTP_404_NOT_FOUND
                            )
        file_gui = GUIFile.objects.filter(userid=request.user, uuid=file.uuid).first()
        if file_gui is not None:
            file_gui.delete()
        # 删除发票目录下的该发票，防止下次上传时文件重复存在
        if os.path.isfile(str(file.file)):
                os.remove(str(file.file))
                
        # 如果文件被validate过，也需要删掉对应的xml文件
        file_name = os.path.basename(file.file)
        file_stem = os.path.splitext(file_name)[0]
        if os.path.isfile(f"invoices_xml/{file_stem}.xml"):
            os.remove(f"invoices_xml/{file_stem}.xml")
        file.delete()
        return Response({
                            "code": 200,
                            "msg": "Invoice file has been successfly removed!",
                        },
                        status=status.HTTP_200_OK
                        )

def json_to_xml(json_obj, line_padding=""):
    elem = ET.Element('root')
    
    def build_element(parent, key, value):
        if isinstance(value, dict):
            subelem = ET.SubElement(parent, key)
            for subkey, subvalue in value.items():
                build_element(subelem, subkey, subvalue)
        elif isinstance(value, list):
            for subvalue in value:
                subelem = ET.SubElement(parent, key)
                build_element(subelem, 'item', subvalue)
        else:
            subelem = ET.SubElement(parent, key)
            subelem.text = str(value) if value is not None else ''

    for key, value in json_obj.items():
        build_element(elem, key, value)
    
    return elem

def prettify(elem):
    rough_string = ET.tostring(elem, 'utf-8')
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ")

class FileValidationsAPIView(APIView):
    authentication_classes = [MyAhenAuthentication]
    @swagger_auto_schema(
        operation_summary="发票文件验证",
        operation_description="Validate uploaded JSON or PDF file against specific rules",
        manual_parameters=[
            openapi.Parameter('uuid', openapi.IN_QUERY, description="File UUID", type=openapi.TYPE_STRING),
            openapi.Parameter(
                'rules', 
                openapi.IN_QUERY, 
                description="Validation Rules",
                type=openapi.TYPE_STRING,
                enum=[  # 定义下拉框的选项
                    "AUNZ_PEPPOL_1_0_10",
                    "AUNZ_PEPPOL_SB_1_0_10",
                    "AUNZ_UBL_1_0_10",
                    "FR_EN16931_CII_1_3_11",
                    "FR_EN16931_UBL_1_3_11",
                    "RO_RO16931_UBL_1_0_8_EN16931",
                    "RO_RO16931_UBL_1_0_8_CIUS_RO",
                ]
            )
        ],
        responses={
            200: openapi.Response(
                description="Validation success!",
                examples={
                    "application/json": {
                        "code": 200,
                        "msg": "Validation success!",
                        "validation_report": {
                            # Example validation report data here
                        }
                    }
                }
            ),
            400: openapi.Response(
                description="Bad request",
                examples={
                    "application/json": {
                        "code": 400,
                        "msg": "File ID and Validation Rule is required"
                    }
                }
            ),
            404: openapi.Response(
                description="File not found",
                examples={
                    "application/json": {
                        "code": 404,
                        "msg": "file not found"
                    }
                }
            ),
            500: openapi.Response(
                description="Internal Server Error",
                examples={
                    "application/json": {
                        "code": 500,
                        "msg": "Validation failed",
                        "details": "Error details here"
                    }
                }
            )
        }
    )
    def post(self, request, userid):
        uuid = request.query_params.get('uuid')
        rule = request.query_params.get('rules')
        if not uuid or not rule:
            return Response({
                                "code": 400,
                                "msg": "File ID and Validation Rule is required",
                            },
                            status=status.HTTP_400_BAD_REQUEST)
        
        
        file = UpFile.objects.filter(userid=request.user, uuid=uuid).first()
        if file is None:
            return Response({
                                "code": 404,
                                "msg": "file not found",
                            },
                            status=status.HTTP_404_NOT_FOUND
                            )
        # 提取出文件名字，不带pdf和json后缀
        # invoices_files/retrospective_A.pdf = retrospective_A
        file_name = os.path.basename(str(file.file))
        file_stem = os.path.splitext(file_name)[0]
        
        # 1.将json文件转化为xml，for Later validation
        if str(file.file).endswith('.json'):
                with open(str(file.file), 'r') as f:
                    data = json.load(f)
                    # json -> xml
                    xml_elem = json_to_xml(data)
                    xml_str = prettify(xml_elem)
                with open(f"invoices_xml/{file_stem}.xml", "w", encoding="utf-8") as f:
                    f.write(xml_str)
        elif str(file.file).endswith('.pdf'):
            # 如果这里有问题看一下free trail是否过期了
            
            # 1.1 登录ezzydoc
            url = 'https://app.ezzydoc.com/EzzyService.svc/Rest'
            api_key = {'APIKey': '744f4631-41ac-4982-8b41-f49c38b78626'}
            payload = {'user': 'LianqiangZhao',
                    'pwd': 'Zlq641737796',
                    'APIKey': '744f4631-41ac-4982-8b41-f49c38b78626'}
            # 保留cookie
            r = requests.get(url + '/Login', params=payload)
            
            # 1.2 上传pdf文件
            with open(str(file.file), 'rb') as img_file:
                img_name = f"{file_stem}.pdf"
                data = img_file.read()
                b = bytearray(data)
                li = []
                for i in b:
                    li.append(i)
                raw_data = {"PictureName": img_name, "PictureStream": li}
                json_data = json.dumps(raw_data)
                r2 = requests.post("https://app.ezzydoc.com/EzzyService.svc/Rest/uploadInvoiceImage",
                                data=json_data,
                                cookies=r.cookies,
                                params=api_key,
                                headers={'Content-Type': 'application/json'})
                invoiceID = r2.json().get("invoice_id")
            
            # 1.3 获得传回的json数据
            payload2 = {'invoiceid':invoiceID,
                        'APIKey': '744f4631-41ac-4982-8b41-f49c38b78626'}
            
            r3 = requests.get(url + '/getFormData', cookies=r.cookies,params=payload2)
            if r3.status_code == 200:
                data = r3.json()
                xml_elem = json_to_xml(data)
                xml_str = prettify(xml_elem)
                with open(f"invoices_xml/{file_stem}.xml", "w", encoding="utf-8") as f:
                    f.write(xml_str)
                      
        # 2. 将xml内容转化为base64的content
        with open(f'invoices_xml/{file_stem}.xml', 'rb') as file:
            xml_bytes = file.read()
            # 使用Base64编码字节
        base64_bytes = base64.b64encode(xml_bytes)

            # 将Base64编码的字节转换为字符串
        content = base64_bytes.decode('utf-8')
        
        # 3. 计算content的checksum
        checkSum = hashlib.md5(content.encode()).hexdigest()
        
        # 4. 获得token
        def token():
            url = 'https://dev-eat.auth.eu-central-1.amazoncognito.com/oauth2/token'
            headers = {
                'content-type': 'application/x-www-form-urlencoded'
            }
            data = {
                'grant_type': 'client_credentials',
                'client_id': '7d30bi87iptegbrf2bp37p42gg',
                'client_secret': '880tema3rvh3h63j4nquvgoh0lgts11n09bq8597fgrkvvd62su',
                'scope': 'eat/read'
            }

            response = requests.post(url, headers=headers, data=data)
            response_data = response.json()
            access_token = response_data.get('access_token')
            return access_token
        
        # https://services.ebusiness-cloud.com/ess-schematron/v1/api/validate?rules=AUNZ_UBL_1_0_10&customer=COMPANY
        # 请求api做validation
        url = "https://services.ebusiness-cloud.com/ess-schematron/v1/api/validate"
        payload = {"rules":rule,
                   "customer":request.user.username}
        body_data = {"filename":f"{file_stem}.xml",
                     "content":content,
                     "checksum":checkSum}
        validation_response = requests.post(url, json=body_data, 
                                            params=payload, 
                                            headers={"Authorization": f"Bearer {token()}", "Accept-Language":"en"})
        # 处理验证响应
        if validation_response.status_code == 200:
            validate_data = validation_response.json()
            return Response({
                                "code": 200,
                                "msg": "Validation success!",
                                "validation_report": validate_data
                            },
                            status=status.HTTP_200_OK)
        else:
            return Response({
                                "code": validation_response.status_code,
                                "msg": "Validation failed",
                                "details": validation_response.text
                            },
                            status=validation_response.status_code)


        
class PasswordResetRequestView(APIView):
    authentication_classes = []  # 禁用认证
    permission_classes = []
    
    @swagger_auto_schema(
        operation_summary='用户密码重置说明',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'username': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User Name'
                ),
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User Email'
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="Password reset link sent",
                examples={
                    "application/json": {
                        "message": "Password reset link sent"
                    }
                }
            ),
            400: openapi.Response(
                description="Bad request",
                examples={
                    "application/json": {
                        "username": ["This field is required."],
                        "email": ["This field is required."]
                    }
                }
            ),
            404: openapi.Response(
                description="User not found",
                examples={
                    "application/json": {
                        "error": "User with this email does not exist"
                    }
                }
            )
        }
    )
    def post(self, request):
        ser = PasswordResetSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        email = request.data.get('email')
        username = request.data.get('username')

        try:
            user = User.objects.get(email=email,username=username)
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
    @swagger_auto_schema(
        operation_summary='用户密码重置确认说明',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'new_password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User New Password'
                ),
            }
        ),
        responses={
            200: openapi.Response(
                description="Password has been reset",
                examples={
                    "application/json": {
                        "message": "Password has been reset"
                    }
                }
            ),
            400: openapi.Response(
                description="Bad request",
                examples={
                    "application/json": {
                        "error": "New password is required"
                    },
                    "application/json": {
                        "error": "Invalid token or user ID"
                    }
                }
            )
        }
    )
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

        
    
    
