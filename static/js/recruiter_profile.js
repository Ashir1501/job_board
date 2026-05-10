import resendEmail from "./api/account_resend_email.js";
import { messageBox } from "./ui/main_render.js";
import {
    editRecruiterSummary, 
    cancelRecruiterSummary, 
    updateRecruiterSummary } from "./ui/profile_render.js";
import { updateRecruiterProfileAPI } from "./api/profile_api.js";
import { logoutAPI } from "./api/account_logout.js";

document.addEventListener('DOMContentLoaded',function(){
    const verifyLink = document.querySelector('#verify-link');
    const emailElem = document.querySelector('#email');
    email = emailElem.dataset.email;
    if(verifyLink){
        verifyLink.addEventListener('click',async function(){
            let response = await resendEmail(email);
            if(response.ok){
                messageBox({content:'Verification Email has been sent'})
            }else{
                let err = await response.json();
                console.log(err);
                messageBox({error:err})
            }
        });
    }
    
});

document.addEventListener('click', async function(event){
    const summaryCancelElem = document.getElementById('btn-cancel-sec-summary')
    const editImg = document.getElementById('edit-summary-section')
    const logoutBtn = document.getElementById('logout-btn');
    const cancelSummaryBtn = document.getElementById('btn-cancel-sec-summary');
    const saveSummaryBtn = document.getElementById('btn-save-sec-summary');

    if(logoutBtn && logoutBtn.contains(event.target)){
        let response = await logoutAPI();
        if(response.ok){
            window.location.href = '/'
        }else{
            let err = await response.json()
            messageBox({error:err})
        }
    }

    if(editImg && editImg.contains(event.target)){
        // This makes the summary content editable
        editRecruiterSummary();

    }

    if(cancelSummaryBtn && cancelSummaryBtn.contains(event.target)){
        cancelRecruiterSummary();
    }

    if(saveSummaryBtn && saveSummaryBtn.contains(event.target)){
        const descriptionElem = document.getElementById('description');
        const companyElem = document.getElementById('company');
        const websiteElem = document.getElementById('website');
        let data = {
            description: descriptionElem.textContent.trim(),
            company: companyElem.textContent.trim(),
            website: websiteElem.textContent.trim()
        }
        let response = await updateRecruiterProfileAPI(data);
        if(response.ok){
            let result = await response.json()
            let data = {
                description: result.description,
                company: result.company,
                website: result.website
            }
            updateRecruiterSummary(data);
        }else{
            let err = await response.json()
            messageBox({error:err})
        }
    }

});

const elem = document.querySelector('[contenteditable]');
elem.addEventListener('paste', (event) => {
  event.preventDefault();
  const text = event.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
});