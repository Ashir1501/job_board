import { 
    getApplicationAPI, 
    getApplicantProfileAPI, 
    updateApplicantStatusAPI } from "./api/application_api.js";
import { messageBox } from "./ui/main_render.js";
import { openModal, closeModal } from "./ui/profile_render.js";
import { 
    loadApplication,
    applicationState,
    statusMap,
    applicantModal
 } from "./ui/application_render.js";


document.addEventListener('DOMContentLoaded',async function(){
    const heading = document.getElementById('applications-heading');
    const jobId = heading.dataset.jobid
    loadApplication(`/job-api/jobs/${jobId}/applications`)
    
});


document.addEventListener('click',async function(event){
    
    if(event.target.closest('.view-application')){
        const appId = event.target.dataset.applicationid
        let appState = applicationState.get(+appId)

        // caching application state
        if(!appState.application_id){
            let response = await getApplicantProfileAPI(appId)
            if(!response.ok){
                let err = await response.json()
                messageBox({error:err})
                return
            }

            const data = await response.json();
            data.status = appState.status
            data.application_id = appId
            applicationState.set(+appId,data)
            appState = applicationState.get(+appId)
        }

        
        if(appState.status === 'PEN'){
            appState.status = 'VEW'
            const articleStatus = document.getElementById(`article-${appId}`);
            articleStatus.innerHTML = statusMap[appState.status]
        }

        const modalHtml = applicantModal(appState)
        openModal(modalHtml)

    }

    const modalCloseBtn = document.getElementById('btn-modal-close');
    if(modalCloseBtn && modalCloseBtn.contains(event.target)){
        closeModal();
    }

    const rejectBtn = document.getElementById('reject-applicant')
    if(rejectBtn && rejectBtn.contains(event.target)){
        const applicationId = rejectBtn.dataset.applicationid
        updateStatus(applicationId,'REJ')
    }
    
    const shortlistBtn = document.getElementById('shortlist-applicant');
    if(shortlistBtn && shortlistBtn.contains(event.target)){
        const applicationId = shortlistBtn.dataset.applicationid;
        updateStatus(applicationId,'SHL')
    }

    if(event.target.closest('.reject-application')){
        const applicationId = event.target.dataset.applicationid;
        updateStatus(applicationId,'REJ');

    }
});

async function updateStatus(applicationId,status){
    let response = await updateApplicantStatusAPI(applicationId,status)
    if(response.ok){
        let application = await response.json();
        let appState = applicationState.get(application.pk);
        appState.status = application.status
        const status = statusMap[application.status]
        const articleStatus = document.getElementById(`article-${application.pk}`)
        articleStatus.textContent = status
        messageBox({content:'Update Successfull'})
    }else{
        let err = await response.json()
        messageBox({error:err})
    }
}


