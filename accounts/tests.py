from django.test import TestCase
from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from .models import User
from . import throttles
# Create your tests here.
throttles.apply_monkey_patching_for_test()

class AccountTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username = 'leon',
            email = 'leon@mail.com',
            role = User.RECRUITER,
            password='password@123'
        )
    
    def test_account_login(self):
        """
        Ensure User can login
        """
        url = reverse('rest_login')
        data = {
            'email': 'leon@mail.com',
            'password':'password@123'
        }
        response = self.client.post(url, data, format='json')
        user = response.data.get('user')
        response_data = {
            'username': user.get('username'),
            'email': user.get('email'),
            'role': user.get('role')
        }
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response_data,{
            'username': 'leon',
            'email':'leon@mail.com',
            'role':'RE'
        })

    def test_account_login_validation(self):
        """
        Ensure User login validation works
        """
        url = reverse('rest_login')
        data = {
            'email': 'leon@mail.com',
            'password':'passord@123'
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('non_field_errors')[0],"Unable to log in with provided credentials.")

    
    def test_create_account_recruiter(self):
        """
        Ensure we can create a new account object for recruiter
        """

        url = reverse('rest_register')
        data = {
            'email': 'ZoRo@mail.com',
            'role': User.RECRUITER,
            'password': 'password@123',
            're_password': 'password@123'
        }
        response = self.client.post(url, data, format='json')
        user = response.data.get('user')
        response_data = {
            'username':user.get('username'),
            'email': user.get('email'),
            'role': user.get('role')
        }
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(),2)
        self.assertEqual(response_data,{
            'username':'zoro',
            'email':'zoro@mail.com',
            'role':'RE'
        })

    def test_create_account_candidate(self):
        """
        Ensure we can create a new account object for candidate
        """

        url = reverse('rest_register')
        data = {
            'email': 'sanji@maIl.coM',
            'role': User.CANDIDATE,
            'password': 'password@123',
            're_password': 'password@123'
        }
        response = self.client.post(url, data, format='json')
        user = response.data.get('user')
        response_data = {
            'username':user.get('username'),
            'email': user.get('email'),
            'role': user.get('role')
        }
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(),2)
        self.assertEqual(response_data,{
            'username':'sanji',
            'email':'sanji@mail.com',
            'role':'CA'
        })

    def test_account_password_validation(self):
        """
        Ensure password is being validated
        """
        url = reverse('rest_register')
        data = {
            'email': 'ZoRo@mail.com',
            'role': User.RECRUITER,
            'password': 'passwrd@123',
            're_password': 'password@123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('non_field_errors')[0],'Password does not Match!!')

    def test_account_field_validation(self):
        """
        Ensure fields are being validated
        """
        url = reverse('rest_register')
        data = {
            'email': 'ZoRo@mail.com',
            'password': 'passwrd@123',
        }
        response = self.client.post(url, data, format='json')
    
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('role')[0],'This field is required.')
        self.assertEqual(response.data.get('re_password')[0],'This field is required.')

