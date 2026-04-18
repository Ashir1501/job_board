from rest_framework import serializers
from .models import User
from dj_rest_auth.registration.serializers import RegisterSerializer
from django.db import transaction
from functools import partial
from profiles.service import create_profile

class UserSerializer(serializers.ModelSerializer):
    re_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['pk','username','email','role','password','re_password']
        read_only_fields = ['pk','role']

    def validate(self,data):
        password = data.get('password')
        username = data.get('username')
        if username == '':
            raise serializers.ValidationError({'username':'Username cannot be Empty!!'})
        
        if password:
            re_password = data.get('re_password')
            if re_password:
                if password.strip() != re_password.strip():
                    raise serializers.ValidationError('Password does not Match!!')
            else:
                raise serializers.ValidationError('Provide Confirmation Password to Update Password!!')
        return data
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        #normailizing email before saving
        email = validated_data.get('email')
        if email:
            validated_data['email'] = validated_data.get('email').lower()
        
        validated_data.pop('re_password', None)
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save()
        
        return user
    

    
class UserRegisterSerializer(serializers.ModelSerializer, RegisterSerializer):
    re_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email','role','password','re_password']

    def validate(self,data):
        password = data.get('password').strip()
        re_password = data.get('re_password').strip()
        if password != re_password:
            raise serializers.ValidationError('Password does not Match!!')
        return data
    
    @transaction.atomic
    def save(self,request):
        validated_data = self.validated_data
        validated_data.pop('re_password')
        
        #normailizing email before saving
        validated_data['email'] = validated_data.get('email').lower()

        #populating username field
        base_username = validated_data.get('email').split('@')[0]
        counter = 0
        while User.objects.filter(username=base_username).exists():
            base_username = f"{base_username}{counter}"
            counter+=1
        validated_data['username'] = base_username
        user = User.objects.create_user(**validated_data)
        transaction.on_commit(partial(create_profile, pk=user.pk))
        return user
    