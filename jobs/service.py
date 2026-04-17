from django.core.exceptions import ValidationError
import markdown
import bleach

def validate_job(data):
    salary_min = data.get('salary_min')
    salary_max = data.get('salary_max')
    experience_min = data.get('experience_min')
    experience_max = data.get('experience_max')
    if (salary_min and not salary_max) or (salary_max and not salary_min):
            raise  ValidationError("Please Specify both salary values or None of them!")
    if (salary_min and salary_max) and (salary_min >= salary_max):
        raise ValidationError("Minimum salary should be less than Maximum salary!")
    
    if (experience_min and experience_max) and (experience_min > experience_max):
            raise ValidationError("Minimum experience should be less than Maximum experience!")
    

def get_location_obj(locations):
    from .models import Location
    location_objs = []
    for location in locations:
        city = location.get('city').lower().strip()
        country = location.get('country').lower().strip()
        
        l,_ = Location.objects.get_or_create(city=city, country=country)
        location_objs.append(l)
    return location_objs


ALLOWED_TAGS = [
    'p', 'br',
    'strong', 'b', 'em', 'i',
    'ul', 'ol', 'li',
    'a',
    'h1', 'h2', 'h3'
]
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'target'],
}
ALLOWED_PROTOCOLS = ['http', 'https']

def render_markdown_safe(text):
    # Convert markdown -> HTML
    html = markdown.markdown(text)
    # Clean HTML
    clean_html = bleach.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True  # removes disallowed tags completely
    )
    return clean_html