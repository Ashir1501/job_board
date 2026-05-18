import { getCookie } from "../main.js";

export default async function jobFilter(formElem){
    let formData = new FormData(formElem);
    formData.append('page','1');

    const params = new URLSearchParams(formData)
    let endpoint = `/job-api/jobs/?${params}`

    let response = await fetch(endpoint, {
        method:'GET',
        credentials: 'include'
    })
    return response
}

export async function jobFilterNav(endpoint){
    let response = await fetch(endpoint, {
        method:'GET',
        credentials:'include'
    })
    return response
}

export async function bookmarkedJobs(){
    const endpoint = '/job-api/jobs/bookmarked_jobs/'
    let response = await fetch(endpoint,{
        method:'GET',
        credentials:'include'
    })
    return response
}

export async function appliedJobs(){
    const endpoint = '/job-api/jobs/applied_jobs/'
    let response = await fetch(endpoint,{
        method:'GET',
        credentials:'include'
    })
    return response
}

export async function createJob(formEle){
    const csrftoken = getCookie('csrftoken');
    const endpoint = '/job-api/jobs/'
    const formData = new FormData(formEle)
    const jobData = {
        'title': formData.get('title'),
        'job_type': formData.get('job_type'),
        'description': formData.get('description'),
        'locations': JSON.parse(formData.get('locations') || null),
        'salary_min': formData.get('salary_min') || null,
        'salary_max': formData.get('salary_max') || null,
        'experience_min': formData.get('experience_min') || null,
        'experience_max': formData.get('experience_max') || null
    }
    let response = await fetch(endpoint,{
        method: 'POST',
        credentials:'include',
        headers: {
            'Content-Type':'application/json;charset=utf-8',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(jobData)
    });
    return response
}

export async function updateJobAPI(data){
    const csrftoken = getCookie('csrftoken');
    let response = await fetch(
        `/job-api/jobs/${data.jobId}/`,
        {
            method: 'PATCH',
            credentials:'include',
            headers: {
                'Content-Type': 'application/json;charser=utf-8',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                description: data.description,
                is_active: data.is_active
            })
        }
    )
    return response
}