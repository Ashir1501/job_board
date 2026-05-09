from django.shortcuts import render
from rest_framework import mixins, permissions, viewsets, status
from .tasks import application_status_mailer_task, new_application_mailer_task
from .serializers import ApplicationSerializer, ApplicationStatusSerializer
from accounts.permissions import IsCandidate, IsRecruiter
from accounts.models import User
from .models import Application
from .filters import ApplicationFilter, filters
from django.db import IntegrityError, transaction
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from profiles.serializers import ApplicantProfileSerializer
# Create your views here.


class CreateUpdateListViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
                    ):
    pass 


class ApplicationViewSet(CreateUpdateListViewSet):
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = ApplicationFilter

    def get_permissions(self):
        action_permission = {
            'create': [IsCandidate],
            'partial_update': [IsRecruiter],
            'update':[IsRecruiter],
            'applicant_profile':[IsRecruiter],
        }
        permission_classes = action_permission.get(self.action,[]) + [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self, *args, **kwargs):
        user = getattr(self.request,"user",None)
        if user.is_authenticated:
            if user.role == User.CANDIDATE:
                return user.applied_jobs.all()
            job_id = self.request.query_params.get('job_id')
            if job_id:
               return Application.objects.filter(job_id = job_id, job__created_by=user)
            # this recruiter can only access application for job created by this recruiter 
            return Application.objects.filter(job__created_by=user)
        return Application.objects.none()
    
    def get_serializer_class(self):
        if self.action in ['partial_update','update']:
            return ApplicationStatusSerializer
        return ApplicationSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        try:
            instance = serializer.save(user=self.request.user)
            # transaction.on_commit(partial(new_application_mailer_task, instance.pk))
            transaction.on_commit(
                lambda: new_application_mailer_task.delay(instance.pk) #sends task to celary
            ) 
        except IntegrityError:
            raise ValidationError('You have already applied to this job.')

    @transaction.atomic
    def perform_update(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
    
        if instance.status in [Application.SHORTLISTED, Application.REJECTED]:
            # transaction.on_commit(partial(application_status_mailer_task, instance.pk))
            transaction.on_commit(
                lambda: application_status_mailer_task.delay(instance.pk) #sends task to celary
            )
    
    @action(detail=True,methods=['get'])
    def applicant_profile(self, request, pk=None):
        application = self.get_object()
        if(application.status == Application.PENDING):
            application.status = Application.VIEWED
            application.save()
        profile = application.user.candidate_profile
        serializer = ApplicantProfileSerializer(profile)
        return Response(serializer.data,status=status.HTTP_200_OK)