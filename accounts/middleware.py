class JWTSetCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        new_access = getattr(request, '_new_access_token', None)

        if new_access:
            response.set_cookie(
                key='access',
                value=new_access,
                httponly=True,
                secure=False,  # True in production
                samesite='Lax',
                path='/'
            )

        return response