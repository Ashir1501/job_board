from django_filters import rest_framework as filters
from .models import Application

class ApplicationFilter(filters.FilterSet):
    job_id = filters.NumberFilter(field_name='job_id', lookup_expr='exact')
    class Meta:
        model = Application
        fields = ['job_id']