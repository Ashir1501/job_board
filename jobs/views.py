from rest_framework import viewsets, mixins, response, status, permissions
from rest_framework import filters as rest_filter
from .filters import JobFilter, filters
from .models import Job
from .serializers import JobSerializer, BookmarkSerializer
from accounts.permissions import IsRecruiter, IsRecruiterOwner, IsCandidateOrIsRecruiterOwner
from accounts.models import User
from rest_framework.decorators import action
from applications.serializers import ApplicationSerializer
from django.db.models import Prefetch
from applications.models import Application
# Create your views here.


class CreateListRetrieveUpdateViewSet(mixins.CreateModelMixin,
                                      mixins.ListModelMixin,
                                      mixins.RetrieveModelMixin,
                                      mixins.UpdateModelMixin,
                                      viewsets.GenericViewSet):
    """
    A viewset that provides `retrieve`, `create`, `update` and `list` actions.
    """
    pass

class CreateListDestroyViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    pass

class JobViewSet(CreateListRetrieveUpdateViewSet):
    serializer_class = JobSerializer
    filter_backends = [filters.DjangoFilterBackend, rest_filter.SearchFilter, rest_filter.OrderingFilter]
    filterset_class = JobFilter
    search_fields = ['title']
    ordering_fields = ['created_at']


    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and getattr(user,'role',None) == User.RECRUITER:
            return self.request.user.posted_jobs.prefetch_related('locations')
        return Job.objects.filter(is_active=True).prefetch_related('locations')
    
    def get_permissions(self):

        action_permissions = {
            'create': [IsRecruiter],
            'update': [IsRecruiter, IsRecruiterOwner],
            'partial_update': [IsRecruiter, IsRecruiterOwner],
            'retrieve': [IsCandidateOrIsRecruiterOwner],
            'applications': [IsRecruiter, IsRecruiterOwner],
            'bookmarked_jobs':[],
            'applied_jobs':[]
        }
        permission_classes = action_permissions.get(self.action,[]) + [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(created_by = self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
            
    @action(detail=True, methods=['get'])
    def applications(self, request, pk=None):
        job = self.get_object()
        applications = job.applications.select_related('user','job')
        page = self.paginate_queryset(applications)
        if page is not None:
            serializer = ApplicationSerializer(page,many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ApplicationSerializer(applications, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False)
    def bookmarked_jobs(self,request):
        user = request.user
        jobs = Job.objects.filter(bookmarked_by__user=user)
        page = self.paginate_queryset(jobs)
        if page is not None:
            serializer = JobSerializer(page,many=True, context={'request':request})
            return self.get_paginated_response(serializer.data)
        
        serializer = JobSerializer(jobs,many=True,context={'request':request})
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False)
    def applied_jobs(self,request):
        jobs = Job.objects.filter(
            applications__user=request.user
        ).prefetch_related(
            Prefetch(
                'applications',
                queryset=Application.objects.filter(user=request.user),
                to_attr='user_application'
            )
        )
        page = self.paginate_queryset(jobs)
        if page is not None:
            serializer = JobSerializer(page,many=True,context={'request':request})
            return self.get_paginated_response(serializer.data)
        
        serializer = JobSerializer(jobs,many=True,context={'request':request})
        return response.Response(serializer.data, status=status.HTTP_200_OK)
    

class BookmarkViewSet(CreateListDestroyViewSet):
    serializer_class = BookmarkSerializer

    def get_queryset(self):
        user = self.request.user
        return user.bookmarks.all()
    
    def perform_create(self, serializer):
        serializer.save(user = self.request.user)