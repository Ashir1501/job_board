from rest_framework import serializers
from jobs.models import Job

class JobAnalyticsSerializer(serializers.ModelSerializer):
    app_count = serializers.IntegerField()

    class Meta:
        model = Job
        fields = ['id', 'title', 'app_count']