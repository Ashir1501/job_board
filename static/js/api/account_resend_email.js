export default async function resendEmail(email){
    const endpoint = '/auth-api/dj-rest-auth/registration/resend-email/'
    let response = await fetch(endpoint,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            email:email
        })
    });
    return response;
}