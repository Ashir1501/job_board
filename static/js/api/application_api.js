export async function getApplicationAPI(endpoint){
    let response = await fetch(endpoint,{
        method: 'GET'
    })
    return response;
}

export async function getApplicantProfileAPI(application_id){
    const endpoint = `/application-api/applications/${application_id}/applicant_profile/`;
    let response = await fetch(endpoint,{
        method: 'GET'
    })
    return response
}

export async function updateApplicantStatusAPI(application_id,status){
    const endpoint = `/application-api/applications/${application_id}/`
    let response = await fetch(endpoint,{
        method: 'PATCH',
        headers:{
            'Content-Type':'application/json;charser=utf-8'
        },
        body: JSON.stringify({
            status:status
        })
    })
    return response;
}