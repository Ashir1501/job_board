import { closeModal } from "../ui/profile_render.js";
import { messageBox } from "../ui/main_render.js";

export async function updateProfileAPI(data){
    const endpoint = '/profile-api/candidates/0/';

    if(data.resume){
        const formData = new FormData()
        formData.append('summary',data.summary)
        formData.append('resume',data.resume)
        if(data.skillList && data.skillList.length > 0){
            formData.append('skill_list',data.skillList)
        }

        let response = await fetch(endpoint,{
            method: 'PATCH',
            body: formData
        })
        return response
    }else{
        const bodyData = JSON.stringify({
            'summary':data.summary,
            'skill_list':data.skillList
        })
        let response = await fetch(endpoint,{
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: bodyData
        })
        return response
    }
}


export async function deleteWorkExp(pk){
    const response = await fetch(`/profile-api/candidates/0/workexp/${pk}/`, {
        method: 'DELETE',
    });
    return response;
}

export async function deleteProject(pk){
    const response = await fetch(`/profile-api/candidates/0/projects/${pk}/`, {
        method: 'DELETE',
    });
    return response;
}

export async function deleteEducation(pk){
    const response = await fetch(`/profile-api/candidates/0/educations/${pk}/`, {
        method: 'DELETE',
    });
    return response;
}


// generic submit handler
export function attachFormHandler(config) {
    const form = document.getElementById('dynamic-form');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(form);

        let payload = {};

        // collect normal fields
        config.fields.forEach(field => {
            if (field.type !== 'skills') {
                payload[field.name] = formData.get(field.name);
            }
        });

        // collect skills
        if (config.fields.some(f => f.type === 'skills')) {
            payload.skill_list = [...document.querySelectorAll('#skill-chips span')]
                .map(el => el.childNodes[0].textContent.trim());
        }

        const response = await fetch(config.url, {
            method: config.method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();

            config.onSuccess(result);   // key hook

            closeModal();
        } else {
            const err = await response.json();
            console.log(err);
            messageBox({error:err})
        }
    });
}