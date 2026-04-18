from accounts.models import User
from jobs.models import Job
from applications.models import Application
from django.utils import timezone
from django.db.models import Count
from django.shortcuts import get_object_or_404
from .serializers import JobAnalyticsSerializer
from applications.serializers import ApplicationSerializer

def get_recruiter_analytics(pk):
    user = get_object_or_404(User,pk=pk)

    # Total Jobs
    total_jobs = user.posted_jobs.count()

    # Total Applications
    total_applications = Application.objects.filter(job__created_by=user).count()

    # Total Applications per Job
    applications_per_job_qs = Job.objects.filter(created_by=user).annotate(app_count=Count('applications', distinct=True)).values('id','title','app_count')
    applications_per_job_serializer = JobAnalyticsSerializer(applications_per_job_qs, many=True)

    # Recent Applications
    recent_applicatins_qs = Application.objects.filter(job__created_by=user,created_at__gte=timezone.now()-timezone.timedelta(days=2))
    recent_applications_serializer = ApplicationSerializer(recent_applicatins_qs, many=True)

    return {
        'total_jobs': total_jobs,
        'total_applications':total_applications,
        'application_per_job':applications_per_job_serializer.data,
        'recent_applicatins': recent_applications_serializer.data,
    }

def get_candidate_analytics(pk):

    user = get_object_or_404(User,pk=pk)

    # Total Applications
    total_applications = user.applied_jobs.count()

    # Active Applications
    active_applications = user.applied_jobs.filter(is_active=True).count()

    # Rejected Applications
    rej_applications = user.applied_jobs.filter(status=Application.REJECTED).count()

    # shortlisted Applications
    shl_applications = user.applied_jobs.filter(status=Application.SHORTLISTED).count()

    # Pending Applications
    pen_applications = user.applied_jobs.filter(status=Application.PENDING).count()

    # Viewed Applications
    vew_applications = user.applied_jobs.filter(status=Application.VIEWED).count()

    return {
        'total_applications': total_applications,
        'active_applications': active_applications,
        'rej_applications': rej_applications,
        'shl_applications': shl_applications,
        'pen_applications': pen_applications,
        'vew_applications': vew_applications,
    }
