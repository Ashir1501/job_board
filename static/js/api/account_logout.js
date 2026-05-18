import { getCookie } from "../main.js"

export async function logoutAPI(){
    const csrftoken = getCookie('csrftoken');
    let response = await fetch('/auth-api/dj-rest-auth/logout/',{
        method:'POST',
        credentials: 'include',
        headers:{
            'X-CSRFToken': csrftoken
        }
    })
    return response
}