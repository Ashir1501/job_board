
export default async function accountLogin(formElem){
    let response = await fetch('/auth-api/dj-rest-auth/login/', {
            method: 'POST',
            body: new FormData(formElem)
    });

    return response
}