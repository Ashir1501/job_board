from rest_framework import viewsets, mixins, permissions
from rest_framework.parsers import MultiPartParser, JSONParser, FormParser
from .serializers import (
    CandidateSerializer,
    RecruiterSerializer,
    WorkExperienceSerializer,
    EducationSerializer,
    ProjectSerializer
)
from .models import (
    WorkExperience, 
    Project, 
    Education,
    RecruiterProfile,
    CandidateProfile
)
from accounts.permissions import IsCandidate, IsRecruiter
from drf_spectacular.utils import extend_schema

# Create your views here.

class RetrieveUpdateViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    pass


class CandidateProfileViewSet(RetrieveUpdateViewSet):
    serializer_class = CandidateSerializer
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    parser_classes = [MultiPartParser,FormParser, JSONParser]             

    def get_queryset(self):
        return CandidateProfile.objects.filter(user=self.request.user)
    
    def get_object(self):
        return self.get_queryset().get()
    
class RecruiterProfileViewSet(RetrieveUpdateViewSet):
    serializer_class = RecruiterSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return RecruiterProfile.objects.filter(user=self.request.user)
    
    def get_object(self):
        return self.get_queryset().get()

class WorkExpViewSet(viewsets.ModelViewSet):
    queryset = WorkExperience.objects.all()
    serializer_class = WorkExperienceSerializer

    def get_permissions(self):
        action_permission = {
            'create': [IsCandidate],
            'update': [IsCandidate],
            'partial_update': [IsCandidate],
            'destroy': [IsCandidate]
        }
        permission_classes = action_permission.get(self.action,[]) + [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        profile_pk = self.kwargs.get('profile')
        if profile_pk:
            return WorkExperience.objects.filter(profile_id=profile_pk)
        return super().get_queryset()
    
class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer

    def get_permissions(self):
        action_permission = {
            'create': [IsCandidate],
            'update': [IsCandidate],
            'partial_update': [IsCandidate],
            'destroy': [IsCandidate]
        }
        permission_classes = action_permission.get(self.action,[]) + [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        profile_pk = self.kwargs.get('profile')
        if profile_pk:
            return Education.objects.filter(profile_id=profile_pk)
        return super().get_queryset()
    
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_permissions(self):
        action_permission = {
            'create': [IsCandidate],
            'update': [IsCandidate],
            'partial_update': [IsCandidate],
            'destroy': [IsCandidate]
        }
        permission_classes = action_permission.get(self.action,[]) + [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        profile_pk = self.kwargs.get('profile')
        if profile_pk:
            return Project.objects.filter(profile_id=profile_pk)
        return super().get_queryset()

        
