from django_filters import rest_framework as filters
from .models import Job
class JobFilter(filters.FilterSet):
    min_exp = filters.NumberFilter(field_name="experience_min", lookup_expr='exact')
    max_exp = filters.NumberFilter(field_name="experience_max", lookup_expr='lte')
    min_salary = filters.NumberFilter(field_name="salary_min", lookup_expr='exact')
    max_salary = filters.NumberFilter(field_name="salary_max", lookup_expr='lte')
    city = filters.CharFilter(field_name="locations__city", lookup_expr='exact')
    country = filters.CharFilter(field_name="locations__country", lookup_expr='exact')

    class Meta:
        model = Job
        fields = ['min_exp','max_exp','min_salary','max_salary','city','country']