from rest_framework import routers
from .views import JobViewSet, BookmarkViewSet

router = routers.SimpleRouter()
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'bookmarks', BookmarkViewSet, basename='bookmark')
urlpatterns = router.urls