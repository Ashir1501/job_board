
from allauth.account.models import EmailConfirmationHMAC
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.jwt_auth import set_jwt_cookies
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework import permissions
# Create your views here.

class ConfirmEmailAPI(APIView):
    permission_classes = []
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request, key):
        confirmation = EmailConfirmationHMAC.from_key(key)
        if confirmation:
            confirmation.confirm(request)
            # return Response({"detail": "Email confirmed"}, status=status.HTTP_200_OK)
            return Response({'username':request.user.username},template_name='email_confirmed.html')
        # return Response({"detail": "Invalid or expired"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'username':request.user.username},template_name='failed_verification.html')
    
class CustomRegisterView(RegisterView):

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        set_jwt_cookies(response, response.data.get('access'), response.data.get('refresh'))

        return response
    