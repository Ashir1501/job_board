import { getCookie } from "../main.js";

export default async function resendEmail(email){
    const csrftoken = getCookie('csrftoken');
    const endpoint = '/auth-api/dj-rest-auth/registration/resend-email/'
    let response = await fetch(endpoint,{
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            email:email
        })
    });
    return response;
}