import { getCookie } from "../main.js"

export async function create_bookmark(job_pk){
    const csrftoken = getCookie('csrftoken');
    const endpoint = '/job-api/bookmarks/'
    const response = await fetch(endpoint,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            job: job_pk
        })
    })
    return response
}

export async function delete_bookmark(job_pk){
    const csrftoken = getCookie('csrftoken');
    const endpoint = `/job-api/bookmarks/${job_pk}/`
    const response = await fetch(endpoint,{
        method: 'DELETE',
        headers:{
            'X-CSRFToken':csrftoken
        }
    })
    return response
}