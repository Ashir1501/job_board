export async function create_bookmark(job_pk){
    const endpoint = '/job-api/bookmarks/'
    const response = await fetch(endpoint,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            job: job_pk
        })
    })
    return response
}

export async function delete_bookmark(job_pk){
    const endpoint = `/job-api/bookmarks/${job_pk}/`
    const response = await fetch(endpoint,{
        method: 'DELETE',
    })
    return response
}