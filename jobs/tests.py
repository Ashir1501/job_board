from django.urls import reverse
from rest_framework.test import APITestCase
from accounts.models import User
from .models import Job, Location
from allauth.account.admin import EmailAddress
from rest_framework import status
# Create your tests here.

class JobTestSetUp(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.candidate = User.objects.create_user(
            username='leon',
            email='leon@mail.com',
            role=User.CANDIDATE,
            password = 'password@123'
        )
        
        cls.recruiter = User.objects.create_user(
            username='baron',
            email='baron@mail.com',
            role=User.RECRUITER,
            password = 'password@123'
        )

        cls.recruiter_2 = User.objects.create_user(
            username='shawn',
            email='shawn@mail.com',
            role=User.RECRUITER,
            password='password@123'
        )
        
        EmailAddress.objects.create(
            user_id=cls.candidate.pk,
            email=cls.candidate.email,
            primary=True,
            verified=True
        )
        EmailAddress.objects.create(
            user_id=cls.recruiter.pk,
            email=cls.recruiter.email,
            primary=True,
            verified=True
        )
        EmailAddress.objects.create(
            user_id=cls.recruiter_2.pk,
            email=cls.recruiter_2.email,
            primary=True,
            verified=True
        )

class JobTests(JobTestSetUp):
        
    def test_create_job_recruiter(self):
        """
        Ensure job can be created by recruiter
        """
        # access_token = self.login_user(self.recruiter)
        # self.client.cookies['access'] = access_token
        self.client.force_authenticate(user=self.recruiter)
        url = reverse('job-list')

        data = {
            'title': 'Python Developer',
            'job_type': 'FULL',
            'description': 'something something...',
            'locations': [
                {
                    'city':'Mumbai',
                    'country': 'India'
                },
                {
                    'city':'Chennai',
                    'country':'India'
                }
            ],
            'salary_min': 10000,
            'salary_max': 20000,
            'experience_min': 0,
            'experience_max':1
        }
        
        # creating job with verified email
        response = self.client.post(url,data,format='json')
        response_data = {
            'title': response.data.get('title'),
            'job_type': response.data.get('job_type'),
            'salary_min': response.data.get('salary_min'),
            'salary_max': response.data.get('salary_max'),
            'experience_min':response.data.get('experience_min'),
            'experience_max':response.data.get('experience_max'),
            'is_active': response.data.get('is_active')
        }

        self.assertEqual(response.status_code,status.HTTP_201_CREATED)
        self.assertEqual(Job.objects.count(),1)
        self.assertEqual(response_data,{
            'title': 'python developer',
            'job_type': 'FULL',
            'salary_min': 10000,
            'salary_max': 20000,
            'experience_min':0,
            'experience_max':1,
            'is_active': True
        })

        # creating job without verifying email
        EmailAddress.objects.filter(user=self.recruiter).delete()
        
        response = self.client.post(url,data,format='json')
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('non_field_errors')[0].code , 'invalid')

    
    def test_create_job_candidate(self):
        """
        Ensure job cannot be created by candidate
        """
        self.client.force_authenticate(user=self.candidate)

        url = reverse('job-list')
        data = {
            'title': 'Python Developer',
            'job_type': 'FULL',
            'description': 'something something...',
            'locations': [
                {
                    'city':'Mumbai',
                    'country': 'India'
                },
                {
                    'city':'Chennai',
                    'country':'India'
                }
            ],
            'salary_min': 10000,
            'salary_max': 20000,
            'experience_min': 0,
            'experience_max':1
        }
        
        response = self.client.post(url,data,format='json')
        error = response.data.get('detail')

        self.assertEqual(response.status_code,status.HTTP_403_FORBIDDEN)
        self.assertEqual(error.code, 'permission_denied')

    def test_validate_job(self):
        """
        Ensure validation process working
        """
        self.client.force_authenticate(user=self.recruiter)

        url = reverse('job-list')

        # validate salary range
        data = {
            'title': 'Python Developer',
            'job_type': 'FULL',
            'description': 'something something...',
            'locations': [
                {
                    'city':'Mumbai',
                    'country': 'India'
                },
                {
                    'city':'Chennai',
                    'country':'India'
                }
            ],
            'salary_min': 30000,
            'salary_max': 20000,
            'experience_min': 0,
            'experience_max':1
        }
        
        response = self.client.post(url,data,format='json')
        
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        error = response.data.get('non_field_errors')[0]
        self.assertEqual(error.code,'invalid')

        # validate experience range
        data.update({'salary_min': 10000})
        data.update({'salary_max': 20000})
        data.update({'experience_min': 2})
        data.update({'experience_max':1})
        
        response = self.client.post(url,data,format='json')
        
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        error = response.data.get('non_field_errors')[0]
        self.assertEqual(error.code,'invalid')

        # validate salary range by not providing either one attribute
        data.update({'salary_min': None})
        data.update({'salary_max': 20000})
        data.update({'experience_min': 0})
        data.update({'experience_max':1})
        
        response = self.client.post(url,data,format='json')
        
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        error = response.data.get('non_field_errors')[0]
        self.assertEqual(error.code,'invalid')

        # create job without salary range
        data.update({'salary_min': None})
        data.update({'salary_max': None})
        
        response = self.client.post(url,data,format='json')
        response_data = {
            'title':response.data.get('title'),
            'job_type': response.data.get('job_type'),
            'salary_min': response.data.get('salary_min'),
            'salary_max': response.data.get('salary_max'),
            'experience_min': response.data.get('experience_min'),
            'experience_max': response.data.get('experience_max'),
        }
        
        self.assertEqual(response.status_code,status.HTTP_201_CREATED)
        self.assertEqual(response_data,{
            'title': "python developer",
            'job_type': "FULL",
            'salary_min': None,
            'salary_max': None,
            'experience_min': 0,
            'experience_max': 1,
        })

        # an attempt to create duplicate job which raises Integrity error
        response = self.client.post(url,data,format='json')
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        error = response.data.get('non_field_errors')[0]
        self.assertEqual(error.code,'invalid')

    def test_update_job(self):
        '''
        Ensure Job can be updated 
        '''

        data = {
            'title': 'Python Developer',
            'job_type': 'FULL',
            'description': 'something something...',
            'salary_min': 30000,
            'salary_max': 20000,
            'experience_min': 0,
            'experience_max':1,
            'created_by': self.recruiter
        }
        job = Job.objects.create(**data)
        l1= Location.objects.create(city='Delhi', country='India')
        l2= Location.objects.create(city='Bengaluru', country='India')
        job.locations.set([l1,l2])

        self.client.force_authenticate(user=self.recruiter_2)

        # another recruiter attempting to update job created by another recruiter
        # attempt fails since recruiter can access only his job
        url = reverse('job-detail', kwargs={'pk': job.id})
        data = {
            'salary_min': 1000,
            'salary_max': 2000
        }
        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND)
        error = response.data.get('detail')
        self.assertEqual(error.code,'not_found')

        # recruiter attempting to update his own job
        self.client.force_authenticate(user=self.recruiter)

        url = reverse('job-detail', kwargs={'pk': job.id})
        data = {
            'salary_min': 1000,
            'salary_max': 2000
        }
        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code,status.HTTP_200_OK)
        response_data = {
            'salary_min': response.data.get('salary_min'),
            'salary_max': response.data.get('salary_max'),
            'created_by': response.data.get('created_by')
        }
        self.assertEqual(response_data,{
            'salary_min':1000,
            'salary_max': 2000,
            'created_by': self.recruiter.username
        })

