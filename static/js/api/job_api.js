
export default async function jobFilter(formElem){
    let formData = new FormData(formElem);
    formData.append('page','1');

    const params = new URLSearchParams(formData)
    let endpoint = `/job-api/jobs/?${params}`

    let response = await fetch(endpoint, {
        method:'GET',
    })
    return response
}

export async function jobFilterNav(endpoint){
    let response = await fetch(endpoint, {
        method:'GET',
    })
    return response
}

export async function bookmarkedJobs(){
    const endpoint = '/job-api/jobs/bookmarked_jobs/'
    let response = await fetch(endpoint,{
        method:'GET'
    })
    return response
}

export async function appliedJobs(){
    const endpoint = '/job-api/jobs/applied_jobs/'
    let response = await fetch(endpoint,{
        method:'GET'
    })
    return response
}

export async function createJob(formEle){
    const endpoint = '/job-api/jobs/'
    const formData = new FormData(formEle)
    const jobData = {
        'title': formData.get('title'),
        'job_type': formData.get('job_type'),
        'description': formData.get('description'),
        'locations': JSON.parse(formData.get('locations')),
        'salary_min': formData.get('salary_min'),
        'salary_max': formData.get('salary_max'),
        'experience_min': formData.get('experience_min'),
        'experience_max': formData.get('experience_max')
    }
    let response = await fetch(endpoint,{
        method: 'POST',
        headers: {
            'Content-Type':'application/json;charset=utf-8'
        },
        body: JSON.stringify(jobData)
    });
    return response
}

export async function updateJobAPI(data){
    let response = await fetch(
        `/job-api/jobs/${data.jobId}/`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charser=utf-8'
            },
            body: JSON.stringify({
                description: data.description,
                is_active: data.is_active
            })
        }
    )
    return response
}