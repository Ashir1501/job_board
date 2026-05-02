export default async function accountRegister(formElem){
    console.log(new FormData(formElem))
    let response = await fetch('/auth-api/dj-rest-auth/registration/', {
            method: 'POST',
            body: new FormData(formElem)
    });

    return response
}