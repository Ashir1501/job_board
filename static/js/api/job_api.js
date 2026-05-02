
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