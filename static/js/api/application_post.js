import { getCookie } from "../main.js"

export default async function post_application(formEle){
    const csrftoken = getCookie('csrftoken');
    const endpoint = '/application-api/applications/'
  
    let response = await fetch(endpoint,{
        method: 'post',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: new FormData(formEle)
    })
    return response
}