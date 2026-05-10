from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError 
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions

def enforce_csrf(request):
    check = CSRFCheck(lambda req: None)

    # populates request.META['CSRF_COOKIE']
    check.process_request(request)

    reason = check.process_view(request, None, (), {})

    if reason:
        raise exceptions.PermissionDenied(f'CSRF Failed: {reason}')

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access')
        refresh_token = request.COOKIES.get('refresh')

        #Step 1: access token
        if access_token:
            try:
                validated_token = AccessToken(access_token)
                enforce_csrf(request)
                user = self.get_user(validated_token)
                return (user, validated_token)
            except TokenError:
                pass  # expired -> try refresh

        #Step 2: refresh token
        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                new_access = str(refresh.access_token)

                validated_token = AccessToken(new_access)
                enforce_csrf(request)
                user = self.get_user(validated_token)

                # attach new token to request (for response later)
                # since drf request is a wrapper of django httprequest 
                # so its better to set access token to _request (dj http request)
                # so that middleware could access the token and set it to the cookie
                django_request = getattr(request, '_request', request)
                django_request._new_access_token = new_access

                return (user, validated_token)

            except TokenError:
                raise AuthenticationFailed('Invalid refresh token')

        return None