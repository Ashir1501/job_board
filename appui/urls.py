from django.urls import path
from . import views
urlpatterns = [
    path('',views.home,name='home'),
    path('login/',views.login,name='login'),
    path('register/',views.register_view,name='register'),
    path('my-jobs/',views.my_jobs_view,name='my_jobs'),
    path('profile/',views.profile_view,name='profile'),
    path('create/jobs/',views.create_job_view,name='create_job'),
    path('jobs/<int:job_id>/applications/',views.application_page_view,name='applications_page'),
]