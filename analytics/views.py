from django.shortcuts import render
from rest_framework import views, status
from accounts.models import User
from .service import get_recruiter_analytics, get_candidate_analytics
from rest_framework.response import Response
# Create your views here.

class DashboardAnalytics(views.APIView):

    def get(self, request, **kwargs):

        try:
            user = request.user
            analytics_data = None
            if user.role == User.RECRUITER:
                analytics_data = get_recruiter_analytics(user.pk)
            else:
                analytics_data = get_candidate_analytics(user.pk)
        except Exception as e:
            print(e)
            return Response({'message': 'Oops Something Went Wrong.'},status=status.HTTP_400_BAD_REQUEST)

        return Response(analytics_data, status=status.HTTP_200_OK)