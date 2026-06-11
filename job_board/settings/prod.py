from .base import *

ALLOWED_HOSTS = ["localhost","https://job-board-w7a7.onrender.com"]

INSTALLED_APPS += ["anymail"]

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
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': env('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': env('CLOUDINARY_API_KEY'),
    'API_SECRET': env('CLOUDINARY_API_SECRET')
}

CSRF_COOKIE_SECURE = True # true only when it is https 
#makes django trust renders reverse proxy that requset is https
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
CSRF_COOKIE_SAMESITE = "Lax"

# render unable to send email with socket.timeout
# EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_BACKEND = "anymail.backends.brevo.EmailBackend"
ANYMAIL = {
    "BREVO_API_KEY": env("BREVO_API_KEY"),
}
DEFAULT_FROM_EMAIL = env("EMAIL_SENDER")
SERVER_EMAIL = DEFAULT_FROM_EMAIL
EMAIL_SENDER=env('EMAIL_SENDER')


# EMAIL_HOST = env('EMAIL_HOST')
# EMAIL_PORT = env.int('EMAIL_PORT')
# EMAIL_HOST_USER=env('EMAIL_HOST_USER')
# EMAIL_HOST_PASSWORD=env('EMAIL_HOST_PASSWORD')
# EMAIL_USE_TLS=env.bool('EMAIL_USE_TLS')
# EMAIL_USE_SSL=env.bool('EMAIL_USE_SSL')

EMAIL_TIMEOUT = 20
CELERY_BROKER_USE_SSL = {
    "ssl_cert_reqs": ssl.CERT_NONE
}

CELERY_REDIS_BACKEND_USE_SSL = {
    "ssl_cert_reqs": ssl.CERT_NONE
}
