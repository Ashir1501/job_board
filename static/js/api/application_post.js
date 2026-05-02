export default async function post_application(formEle){
    const endpoint = '/application-api/applications/'
    // const formData = new FormData(formEle)
  
    let response = await fetch(endpoint,{
        method: 'post',
        body: new FormData(formEle)
    })
    return response
}