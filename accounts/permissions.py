from rest_framework import permissions
from .models import User

class IsCandidate(permissions.BasePermission):
    message = "Only candidate allowed."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.CANDIDATE

class IsRecruiter(permissions.BasePermission):
    message = 'Only recruiters allowed.'

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.RECRUITER
    
class IsRecruiterOwner(permissions.BasePermission):
    message = 'Only owners of this job allowed.'

    def has_object_permission(self, request, view, obj):
        return obj.created_by == request.user
    
class IsCandidateOrIsRecruiterOwner(permissions.BasePermission):
    message = 'Only candidate or owned by recruiter'

    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        return request.user.role == User.CANDIDATE or (obj.created_by == request.user)