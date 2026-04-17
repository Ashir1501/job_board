from django.urls import path
from . import views

urlpatterns = [
    path('analytics/',views.DashboardAnalytics.as_view(),name='analytics'),
]