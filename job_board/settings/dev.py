from .base import *

MEDIA_ROOT = BASE_DIR/"media"
MEDIA_URL = 'media/'

INSTALLED_APPS = INSTALLED_APPS + [
    "debug_toolbar",
]

MIDDLEWARE = MIDDLEWARE + [
    'debug_toolbar.middleware.DebugToolbarMiddleware'
]


# VERY IMPORTANT these setting will work only for default email verification
# currently using custom email url returns json response
# ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = ""
# ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = ""
# ACCOUNT_EMAIL_CONFIRMATION_URL = ""