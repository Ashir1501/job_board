import { getCookie } from "../main.js";

export async function getApplicationAPI(endpoint){
    let response = await fetch(endpoint,{
        method: 'GET',
        credentials: 'include'
    })
    return response;
}

export async function getApplicantProfileAPI(application_id){
    const endpoint = `/application-api/applications/${application_id}/applicant_profile/`;
    let response = await fetch(endpoint,{
        method: 'GET',
        credentials: 'include'
    })
    return response
}

export async function updateApplicantStatusAPI(application_id,status){
    const csrftoken = getCookie('csrftoken');
    const endpoint = `/application-api/applications/${application_id}/`
    let response = await fetch(endpoint,{
        method: 'PATCH',
        credentials: 'include',
        headers:{
            'Content-Type':'application/json;charser=utf-8',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            status:status
        })
    })
    return response;
}