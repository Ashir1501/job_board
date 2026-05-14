import accountLogin from './api/account_login.js'
import accountRegister from './api/account_register.js';
import jobFilter from './api/job_api.js';
import {
    renderJobs, 
    initializeEditMarkdownPreview, 
    editJobModal, 
    updatePreview,
    jobsState,
    insertMarkdown,
    wrapMarkdown } from './ui/job_render.js';
import post_application from './api/application_post.js';
import { bookmarkedJobs, appliedJobs, updateJobAPI } from './api/job_api.js';
import { messageBox } from './ui/main_render.js';
import { openModal, closeModal } from './ui/profile_render.js';

export function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            cookie = cookie.trim();

            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );
                break;
            }
        }
    }

    return cookieValue;
}

document.addEventListener('DOMContentLoaded', function () {

    // password toggle
    function passwordToggle(toggleBtn, passwordInput) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.textContent = 'Hide';
        } else {
            passwordInput.type = 'password';
            toggleBtn.textContent = 'Show';
        }
    }
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-password-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            passwordToggle(toggleBtn, passwordInput);
        });
    }

    const confirmPasswordInput = document.getElementById('cpassword');
    const toggleBtnC = document.getElementById('toggle-cpassword-btn');
    if (toggleBtnC) {
        toggleBtnC.addEventListener('click', function () {
            passwordToggle(toggleBtnC, confirmPasswordInput);
        });
    }
    // ---------------------------------------------------

    // login request
    const loginFormElem = document.getElementById('login-form');
    if (loginFormElem) {
        loginFormElem.onsubmit = async (e) => {
            e.preventDefault();

            let response = await accountLogin(loginFormElem)
            if (response.ok) {
                let result = await response.json();
                // console.log(result);
                window.location.href = '/'

            } else {
                let err = await response.json();
                console.log(err)
                messageBox({error: err})
                
            }
        };
    }
    // -----------------------------------------------------

    // register request
    const registerFormElem = document.getElementById('register-form')
    if (registerFormElem) {
        registerFormElem.onsubmit = async (e) => {
            e.preventDefault();

            let response = await accountRegister(registerFormElem)
            if (response.ok) {
                let result = await response.json();
                // console.log(result);
                window.location.href = '/'

            } else {
                let err = await response.json();
                console.log(err)
                messageBox({error:err})
            }
        };
    }
    // -----------------------------------------------------

    // toggle filters
    const toggleFilterBtn = document.getElementById('toggle-filters');
    const jobSearchForm = document.getElementById('job-search');
    if (toggleFilterBtn) {
        toggleFilterBtn.addEventListener('click', function (event) {
            const dropdown = document.getElementById('filterDropdown');
            dropdown.classList.toggle('hidden');
        });
    }

    // job search form
    if (jobSearchForm) {
        jobSearchForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            let response = await jobFilter(jobSearchForm);
            if (response.ok) {
                let data = await response.json()
                // console.log(data)
                const container = document.getElementById('jobList');
                if(data.count == 0){
                    container.innerHTML = `
                    <div class='mt-8'>
                        <span class='text-center text-xl text-semibold'>No Jobs Available</span>
                    </div>
                    `
                }else{
                    renderJobs(container, data)
                }

            } else {
                let err = await response.json()
                console.log(err)
                messageBox({error:err})
            }
        })
    }

});

document.addEventListener('submit', async (event) => {

    if(event.target.id == 'edit-job-form'){
        event.preventDefault()
    
        const form = event.target
    
        const jobId = form.dataset.jobid
    
        const description =
            document.getElementById('markdown-input').value
    
        const isActive =
            form.is_active.value === 'true'
    
        const dataToUpdate = {
            jobId,
            description,
            is_active: isActive
        }
        const response = await updateJobAPI(dataToUpdate)
        if(response.ok){
            let data = await response.json();
            const description = document.getElementById('description-plain');
            const statusDiv = document.querySelector('.active-status');
            description.innerHTML = data.description_html
            const status = statusDiv.dataset.isactive

            // updating job state
            const jobStateData = jobsState.get(data.pk)
            jobStateData.is_active = data.is_active
            jobStateData.description = data.description
            jobStateData.description_html = data.description_html

            if(status === 'true' && data.is_active === false){
                statusDiv.dataset.isActive = 'false'
                const statusImg = statusDiv.querySelector('img')
                statusImg.src = '/static/image/not_active.png'
                
            }else if(status === 'false' && data.is_active === true){
                statusDiv.dataset.isActive = 'true'
                const statusImg = statusDiv.querySelector('img')
                statusImg.src = '/static/image/active.png'
            }
            messageBox({content:'Update Successfull'})
            closeModal()
        }else{
            let err = await response.json();
            messageBox({error:err})
        }
    }


})

document.addEventListener('click',async function (event) {
    const dropdown = document.getElementById('filterDropdown');
    const toggleFilterBtn = document.getElementById('toggle-filters');

    if (toggleFilterBtn) {
        const isOpen = !dropdown.classList.contains('hidden');

        if (isOpen && !dropdown.contains(event.target) && !toggleFilterBtn.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    }

    // application form
    const appFormEle = document.getElementById('application-form')
    if (appFormEle) {
        appFormEle.onsubmit = async(e) => {
            e.preventDefault();
            let response = await post_application(appFormEle)
            if(response.ok){
                let result = await response.json()
                // console.log(result)
                messageBox({content:'You will receive an email about this application soon.'})
            }else{
                let err = await response.json()
                console.log(err)
                messageBox({error:err})
            }
        }
    }

    const descriptionPlain = document.querySelector('#description-plain');
    if(descriptionPlain){
        const listElems = descriptionPlain.querySelectorAll('ul')
        listElems.forEach(elem => {
            elem.className = 'list-disc'
        });
        const heading1 = descriptionPlain.querySelectorAll('h1')
        heading1.forEach(elem=>{
            elem.className = 'text-2xl font-bold'
        });
        const heading2 = descriptionPlain.querySelectorAll('h2')
        heading2.forEach(elem=>{
            elem.className = 'text-xl font-semibold'
        });
        const heading3 = descriptionPlain.querySelectorAll('h3')
        heading3.forEach(elem=>{
            elem.className = 'text-lg font-semibold'
        });
        const strongElem = descriptionPlain.querySelectorAll('strong');
        strongElem.forEach(elem=>{
            elem.className = 'font-bold'
        });
        const italicElem = descriptionPlain.querySelectorAll('em')
        italicElem.forEach(elem=>{
            elem.className = 'italic';
        });
        const anchorElem = descriptionPlain.querySelectorAll('a');
        anchorElem.forEach(elem=>{
            elem.className = 'underline text-blue-500'

        });
    }

    const closeModalBtn = document.getElementById('btn-modal-close');
    if(closeModalBtn && closeModalBtn.contains(event.target)){
        closeModal()
    }

    const cancelModalBtn = document.getElementById('cancel-edit-job');
    if(cancelModalBtn && cancelModalBtn.contains(event.target)){
        closeModal()
    }

    if(event.target.closest('.view-applications')) {
        const jobId = event.target.dataset.jobid;
        window.location.href = `/jobs/${jobId}/applications/`
    }

    const editBtn = event.target.closest('.edit-job')
    if(editBtn){
        const jobId = editBtn.dataset.jobid
        const statusEle = document.querySelector('.active-status') 
        const descriptionEle = document.querySelector('#description-plain')
    
    
        openModal(`
            <div class="p-10 text-center">
                Loading job...
            </div>
        `)
        const jobStateData = jobsState.get(Number(jobId)) 
        const job = {
            id: jobId,
            is_active: jobStateData.is_active,
            description: jobStateData.description
        }
        document.getElementById('modalContent').innerHTML = editJobModal(job)

        initializeEditMarkdownPreview()
    }


    const textarea = document.getElementById('markdown-input')

    if(textarea){
        if(event.target.closest('.md-bold')){
            wrapMarkdown(textarea, '**')
        }
    
        else if(event.target.closest('.md-italic')){
            wrapMarkdown(textarea, '*')
        }
    
        else if(event.target.closest('.md-h1')){
            insertMarkdown(textarea, '# ')
        }
    
        else if(event.target.closest('.md-h2')){
            insertMarkdown(textarea, '## ')
        }
    
        else if(event.target.closest('.md-h3')){
            insertMarkdown(textarea, '### ')
        }
    
        else if(event.target.closest('.md-list')){
            insertMarkdown(textarea, '\n- ')
        }
    
        else if(event.target.closest('.md-link')){
            insertMarkdown(textarea, '[text](https://)')
        }
    }

});