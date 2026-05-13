from .base import *

ALLOWED_HOSTS = ["*"]

MIDDLEWARE.insert(1,"whitenoise.middleware.WhiteNoiseMiddleware")


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = '/static/'

STATICFILES_DIRS = [
    BASE_DIR/"static",
]

STATIC_ROOT = BASE_DIR/"staticfiles"


STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.RawMediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': env('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': env('CLOUDINARY_API_KEY'),
    'API_SECRET': env('CLOUDINARY_API_SECRET')
}

CSRF_COOKIE_SECURE = False # true only when it is https 

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = env('EMAIL_HOST')
EMAIL_PORT = env('EMAIL_PORT')
EMAIL_HOST_USER=env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD=env('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS=env('EMAIL_USE_TLS')
EMAIL_SENDER=env('EMAIL_SENDER')

UPSTASH_REDIS_REST_URL="https://well-swan-102608.upstash.io"
UPSTASH_REDIS_REST_TOKEN="gQAAAAAAAZDQAAIgcDJiNDRlYjlmMjcxNTU0YTkwYTU3OGQxMmJjYzM3ZGZiNw"