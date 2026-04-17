from rest_framework import routers
from .views import ApplicationViewSet
router = routers.SimpleRouter()
router.register(r'applications',ApplicationViewSet, basename='application')
urlpatterns = router.urls