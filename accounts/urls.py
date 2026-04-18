from django.urls import path, include
from . import views
from dj_rest_auth.registration.views import VerifyEmailView

urlpatterns = [
    path('dj-rest-auth/confirm-email/<str:key>/', views.ConfirmEmailAPI.as_view()),
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    path("dj-rest-auth/registration/", views.CustomRegisterView.as_view()),
    path(
        "dj-rest-auth/registration/",
        include("dj_rest_auth.registration.urls"),
    ),
    # path(
    #     'dj-rest-auth/account-confirm-email/',
    #     VerifyEmailView.as_view(),
    #     name='account_email_verification_sent'
    # ),
]