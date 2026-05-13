from .base import *

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
]

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR/"static"]
STATIC_ROOT = BASE_DIR/"staticfiles"


# media
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR/"media"

INSTALLED_APPS = INSTALLED_APPS + [
    "debug_toolbar",
]

MIDDLEWARE = MIDDLEWARE + [
    'debug_toolbar.middleware.DebugToolbarMiddleware'
]

CSRF_COOKIE_SECURE = False
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
EMAIL_HOST = "localhost"
EMAIL_PORT = 25
EMAIL_SENDER = 'support@careerz.com'
# VERY IMPORTANT these setting will work only for default email verification
# currently using custom email url returns json response
# ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = ""
# ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = ""
# ACCOUNT_EMAIL_CONFIRMATION_URL = ""