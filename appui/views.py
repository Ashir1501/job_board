from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from accounts.models import User
from rest_framework.decorators import api_view, renderer_classes, permission_classes
from django.shortcuts import redirect
from allauth.account.admin import EmailAddress
from profiles.serializers import WorkExperienceSerializer, ProjectSerializer, EducationSerializer
from django.views.decorators.cache import never_cache
# Create your views here.

@api_view(['GET'])
@renderer_classes([TemplateHTMLRenderer])
@permission_classes([AllowAny])
def home(request):
    if not request.user.is_authenticated:
        return redirect('login')
    if request.user.role == User.CANDIDATE:
        context = {
            'username': request.user.username
        }
        return Response(context, template_name='candidate_home.html')
    else:
        return Response({'username':request.user.username}, template_name='recruiter_home.html')
        
@never_cache
@api_view(['GET'])
@renderer_classes([TemplateHTMLRenderer])
@permission_classes([AllowAny])
def login(request):
    if(request.user.is_authenticated):
        return redirect('home')
    return Response({'user':request.user},template_name='login.html')

@never_cache
@api_view(['GET'])
@renderer_classes([TemplateHTMLRenderer])
@permission_classes([AllowAny])
def register_view(request):
    if(request.user.is_authenticated):
        return redirect('home')
    return Response({'user':request.user},template_name='register.html')

@api_view(['GET'])
@renderer_classes([TemplateHTMLRenderer])
@permission_classes([AllowAny])
def my_jobs_view(request):
    if request.user.is_authenticated:
        return Response({'username':request.user.username},template_name='my_jobs.html')
    return redirect('login')

@api_view(['GET'])
@renderer_classes([TemplateHTMLRenderer])
@permission_classes([AllowAny])
def profile_view(request):
    if request.user.is_authenticated:
        # email verification data
        is_verified = False 
        if(EmailAddress.objects.filter(user=request.user).exists()):
            email_address_instance = EmailAddress.objects.get(user=request.user)
            is_verified = email_address_instance.verified

        if request.user.role == User.CANDIDATE:

            # profile data
            profile_instance = request.user.candidate_profile
            skills_queryset = profile_instance.skills.all()
            resume = profile_instance.resume
            resume_url, resume_name, clean_skill_list = '', '', []
            if(resume):
                resume_name = resume.name.split('/')[2]
                resume_url = resume.url
            if(skills_queryset):
                skill_list = profile_instance.skills.values_list('id','name')
                clean_skill_list = list(skill_list)

            # work experience
            work_experiences_qs = profile_instance.work_experience.all()
            work_exp_serializer = WorkExperienceSerializer(work_experiences_qs, many=True)

            # projects
            projects_qs = profile_instance.projects.all()
            projects_serializer = ProjectSerializer(projects_qs, many=True)

            #educations
            education_qs = profile_instance.educations.all()
            education_serializer = EducationSerializer(education_qs, many=True)

            context = {
                'username': request.user.username,
                'email': request.user.email,
                'is_verified': is_verified,
                'summary': profile_instance.summary or 'No summary available',
                'resume_name':resume_name,
                'resume_url':resume_url,
                'skill_list': clean_skill_list,
                'work_experiences': work_exp_serializer.data,
                'projects': projects_serializer.data,
                'educations': education_serializer.data
            }
            return Response(context,template_name='profile.html')
    
        if request.user.role == User.RECRUITER:
            # profile data
            profile_instance = request.user.recruiter_profile
            company = profile_instance.company
            website = profile_instance.website
            description = profile_instance.description
            context = {
                'username': request.user.username,
                'email': request.user.email,
                'is_verified': is_verified,
                'company': company or 'Which Company you belong to?', 
                'website': website or 'Add you Company official Website',
                'description': description or 'Write a short description'
            }
            return Response(context,template_name='recruiter_profile.html')
    return redirect('login')

@api_view(['GET'])
@renderer_classes([TemplateHTMLRenderer])
def create_job_view(request):
    context = {
        'username': request.user.username
    }
    return Response(context,template_name='create_job.html')

@api_view(['GET'])
@renderer_classes([TemplateHTMLRenderer])
def application_page_view(request,job_id):
    context = {
        'username': request.user.username,
        'job_id': job_id
    }
    return Response(context, template_name='application_page.html')