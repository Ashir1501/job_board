import { getCookie } from "../main.js";

export default async function accountRegister(formElem){
    const csrftoken = getCookie('csrftoken');
    let response = await fetch('/auth-api/dj-rest-auth/registration/', {
            method: 'POST',
            headers:{
                'X-CSRFToken':csrftoken
            },
            body: new FormData(formElem)
    });

    return response
}