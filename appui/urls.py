from django.urls import path
from . import views
urlpatterns = [
    path('',views.home,name='home'),
    path('login/',views.login,name='login'),
    path('register/',views.register_view,name='register'),
    path('my-jobs/',views.my_jobs_view,name='my_jobs'),
    path('profile/',views.profile_candidate_view,name='candidate_profile'),
]