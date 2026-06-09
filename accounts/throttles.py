from rest_framework.throttling import UserRateThrottle

class BurstRateThrottle(UserRateThrottle):
    scope = 'burst'

class SustainedRateThrottle(UserRateThrottle):
    scope = 'sustained'

def apply_monkey_patching_for_test():
    def _allow_request(self, request, view):
        return True
    
    BurstRateThrottle.allow_request = _allow_request
    SustainedRateThrottle.allow_request = _allow_request