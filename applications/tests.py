from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from accounts.models import User
from jobs.models import Job, Location
from profiles.models import CandidateProfile
from .models import Application
from allauth.account.admin import EmailAddress
# Create your tests here.


class ApplicationTestSetUp(APITestCase):

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

        resume_file = SimpleUploadedFile(
            "resume.pdf",
            b"dummy content",
            content_type="application/pdf"
        )
        cls.profile = CandidateProfile.objects.create(
            user = cls.candidate,
            resume = resume_file
        )
    
        email_candidate = EmailAddress.objects.create(
            user_id=cls.candidate.pk,
            email=cls.candidate.email,
            primary=True,
            verified=True
        )

        email_recruiter = EmailAddress.objects.create(
            user_id=cls.recruiter.pk,
            email=cls.recruiter.email,
            primary=True,
            verified=True
        )

    def status_transition_invalid_request(self,url,app_status):
        data = {
            'status': app_status
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)

    def status_transition_valid_request(self,url,app_status):
        data = {
            'status': app_status
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code,status.HTTP_200_OK)

    def authenticate_user(self,user):
        self.client.force_authenticate(user=user)


class ApplicationTests(ApplicationTestSetUp):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        data = {
            'title': 'Python Developer',
            'job_type': 'FULL',
            'description': 'something something...',
            'salary_min': 10000,
            'salary_max': 20000,
            'experience_min': 0,
            'experience_max':1,
            'created_by': cls.recruiter
        }
        cls.job = Job.objects.create(**data)
        l1 = Location.objects.create(city='New York', country='USA')
        l2 = Location.objects.create(city='starbase', country='USA')
        cls.job.locations.set([l1,l2])
    
    def test_create_application_without_resume(self):
        '''
        Ensure candidate cannot apply without resume
        '''
        self.client.force_authenticate(user=self.candidate)
        profile = CandidateProfile.objects.get(pk=self.profile.pk)
        profile.resume = None
        profile.save()
        url = reverse('application-list')
        data = {
            'job': self.job.pk,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        error = response.data.get('non_field_errors')[0]
        self.assertEqual(error.code,'invalid')

    def test_create_application_with_resume(self):
        """
        Ensure candidate can apply with resume
        """
        self.client.force_authenticate(user=self.candidate)

        url = reverse('application-list')
        data = {
            'job': self.job.pk,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code,status.HTTP_201_CREATED)
    
    def test_create_application_without_email_verification(self):
        """
        Ensure candidate can apply with resume
        """
        self.client.force_authenticate(user=self.candidate)
        EmailAddress.objects.filter(user=self.candidate).delete()
        url = reverse('application-list')
        data = {
            'job': self.job.pk,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
    
    def test_create_application_by_recruiter(self):
        """
        Ensure recruiter cannot apply
        """
        self.client.force_authenticate(user=self.recruiter)

        url = reverse('application-list')
        data = {
            'job': self.job.pk,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code,status.HTTP_403_FORBIDDEN)

    def test_application_unique_constraint(self):
        """
        Ensure application unique check working
        """

        self.client.force_authenticate(user=self.candidate)

        url = reverse('application-list')
        data = {
            'job': self.job.pk,
        }
        self.client.post(url, data, format='json')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_application_by_candidate(self):
        """
        Ensure candidate cannot update application
        """
        self.client.force_authenticate(user=self.candidate)

        application = Application.objects.create(
            user = self.candidate,
            job = self.job
        )

        url = reverse('application-detail', kwargs={'pk':application.id})
        data = {
            'status': Application.SHORTLISTED
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_application_by_recruiter(self):
        """
        Ensure recruiter can update an application
        """

        self.client.force_authenticate(user=self.recruiter)

        application = Application.objects.create(user=self.candidate,job=self.job)
        url = reverse('application-detail', kwargs={'pk':application.id})
        data = {
            'status': Application.VIEWED
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code,status.HTTP_200_OK)

    def test_update_application_transition_from_rejected(self):
        """
        Ensure application transition from rejected is validated
        """
        self.client.force_authenticate(user=self.recruiter)

        application = Application.objects.create(
            user=self.candidate,
            job=self.job,
            status=Application.REJECTED
        )
        url = reverse('application-detail', kwargs={'pk':application.id})

        self.status_transition_invalid_request(url,Application.PENDING)
        self.status_transition_invalid_request(url,Application.REJECTED)
        self.status_transition_invalid_request(url,Application.SHORTLISTED)
        self.status_transition_invalid_request(url,Application.VIEWED)

    def test_update_application_transition_from_shortlisted(self):
        """
        Ensure application transition from shortlisted is validated
        """
        self.client.force_authenticate(user=self.recruiter)

        application = Application.objects.create(
            user=self.candidate,
            job=self.job,
            status=Application.SHORTLISTED
        )
        url = reverse('application-detail', kwargs={'pk':application.id})

        self.status_transition_invalid_request(url,Application.PENDING)
        self.status_transition_invalid_request(url,Application.REJECTED)
        self.status_transition_invalid_request(url,Application.SHORTLISTED)
        self.status_transition_invalid_request(url,Application.VIEWED)
    
    def test_update_application_transition_from_pending(self):
        """
        Ensure application transition from pending is validated
        """
        self.client.force_authenticate(user=self.recruiter)

        application = Application.objects.create(
            user=self.candidate,
            job=self.job
        )
        url = reverse('application-detail', kwargs={'pk':application.id})

        self.status_transition_invalid_request(url,Application.PENDING)
        self.status_transition_invalid_request(url,Application.SHORTLISTED)
        self.status_transition_valid_request(url,Application.REJECTED)
        self.status_transition_invalid_request(url,Application.VIEWED)
    
    def test_update_application_transition_from_viewed(self):
        """
        Ensure application transition from viewed is validated
        """
        self.client.force_authenticate(user=self.recruiter)

        application = Application.objects.create(
            user=self.candidate,
            job=self.job,
            status=Application.VIEWED
        )
        url = reverse('application-detail', kwargs={'pk':application.id})

        self.status_transition_invalid_request(url,Application.PENDING)
        self.status_transition_valid_request(url,Application.REJECTED)
  
        application.status = Application.VIEWED
        application.save()
        self.status_transition_valid_request(url,Application.SHORTLISTED)

        application.status = Application.VIEWED
        application.save()
        self.status_transition_invalid_request(url,Application.VIEWED)
        


    