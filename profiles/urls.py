from rest_framework_nested import routers
from django.urls import path, include

from .views import (
    CandidateProfileViewSet,
    RecruiterProfileViewSet,
    WorkExpViewSet,
    ProjectViewSet,
    EducationViewSet
)
router = routers.SimpleRouter()
router.register(r'candidates', CandidateProfileViewSet, basename='candidate')
router.register(r'recruiters', RecruiterProfileViewSet, basename='recruiter')
candidates_router = routers.NestedSimpleRouter(router,r'candidates',lookup='profile')
candidates_router.register(r'workexp',WorkExpViewSet,basename='workexp')
candidates_router.register(r'projects',ProjectViewSet,basename='project')
candidates_router.register(r'educations',EducationViewSet,basename='education')
urlpatterns = [
    path(r'',include(router.urls)),
    path(r'',include(candidates_router.urls)),
]