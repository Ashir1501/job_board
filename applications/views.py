from django.shortcuts import render
from rest_framework import mixins, permissions, viewsets
from .service import application_status_mailer, new_application_mailer
from .serializers import ApplicationSerializer, ApplicationStatusSerializer
from accounts.permissions import IsCandidate, IsRecruiter
from accounts.models import User
from .models import Application
from .filters import ApplicationFilter, filters
from django.db import IntegrityError, transaction
from rest_framework.exceptions import ValidationError
from functools import partial
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
            transaction.on_commit(partial(new_application_mailer, instance.pk))
        except IntegrityError:
            raise ValidationError('You have already applied to this job.')

    @transaction.atomic
    def perform_update(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
    
        if instance.status in [Application.SHORTLISTED, Application.REJECTED]:
            transaction.on_commit(partial(application_status_mailer, instance.pk))