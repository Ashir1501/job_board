import resendEmail from "./api/account_resend_email.js";
import { 
    editSummary, 
    cancelUpdates, 
    addSummarySkills, 
    removeSummaryMinus,
    saveSummary,
    addSkillChip,
    updateWorkInDOM,
    appendWorkExperience,
    closeModal,
    openFormModal,
    updateProjectInDOM,
    appendProjectToDOM,
    attachEducationLogic,
    appendEducationToDOM,
    updateEducationInDOM,
    deleteModal
} from "./ui/profile_render.js";

import { 
    deleteWorkExp, 
    updateProfileAPI,
    deleteProject,
    deleteEducation
} from "./api/profile_api.js";

import { messageBox } from "./ui/main_render.js";

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


    
let summarySkills = []
document.addEventListener('click',async function(event){
    const summaryCancelElem = document.getElementById('btn-cancel-sec-summary')
    const editImg = document.getElementById('edit-summary-section')
    const summaryElem = document.getElementById('summary');
    const addImg = document.getElementById('add-img'); 
    const summarySaveElem = document.getElementById('btn-save-sec-summary');
    const logoutBtn = document.getElementById('logout-btn');

    if(logoutBtn && logoutBtn.contains(event.target)){
        let response = await fetch('/auth-api/dj-rest-auth/logout/',{
            method:'POST',
        })
        if(response.ok){
            window.location.href = '/'
        }else{
            let err = await response.json()
            messageBox({error:err})
        }
    }

    if(editImg && editImg.contains(event.target)){
        // This makes the summary content editable
        editSummary();

        // extract skills for recovery if cancelled update
        const summarySkillsExtract = document.querySelectorAll('[id^="summary-skill"]')
        summarySkillsExtract.forEach(elem => {
            summarySkills.push(elem.textContent.trim());
        });

    }
    // cancelling updsummarySaveElemates restores data
    if(summaryCancelElem && summaryCancelElem.contains(event.target)){
        cancelUpdates(summarySkills);
        summarySkills = []
    }

    // adding skills for summary section
    if(addImg && addImg.contains(event.target)){
        addSummarySkills();
    } 

    // removes skill if clicked on minus icon
    if(event.target.id.includes('summary-minus')){
        removeSummaryMinus(event)
    }

    // saving summary ---------------------------------------
    let saveSkills=[]
    if(summarySaveElem && summarySaveElem.contains(event.target)){
        const resumeInp = document.getElementById('resume-input');
        const allSkills = document.querySelectorAll('[id^="summary-skill"]')
        const summary = summaryElem.textContent.trim();
        const resume = resumeInp.files[0]

        allSkills.forEach(elem => {
            saveSkills.push(elem.textContent.trim())
        });
        
        const updateData = {
            summary: summary || null,
            resume: resume || null,
            skillList: saveSkills
        }
        let response = await updateProfileAPI(updateData);
        if(response.ok){
            const result = await response.json();
            saveSummary(result)
            saveSkills = []
            summarySkills = []
            
        }else{
            let err = await response.json();
            console.log(err)
            messageBox({error:err})
        }    
    }
    // ---------------------------------------------------

    // modal close
    const modalCloseBtn = document.getElementById('btn-modal-close')
    if(modalCloseBtn && modalCloseBtn.contains(event.target)){
        closeModal()
    } 

    // close modal - button
    const closeBtn = document.getElementById('modal-close-btn');
    if(closeBtn && event.target.contains(closeBtn)){
        closeModal()
    }

    // work experience --------------------------------------
    // edit work experience
    const editBtn = event.target.closest('[data-edit-work]');
    if(editBtn){
        const pk = editBtn.dataset.editWork;
        const article = document.getElementById(`w-exp-${pk}`);
    
        openWorkModalWithData(article, pk);
    }

    // add new work experience
    if (event.target.closest('#add-w-exp-section')) {
        openWorkCreate();
    }

    // adds skills in create
    const addSkillChipEle = document.getElementById('add-skill-chip')
    if(addSkillChipEle && addSkillChipEle.contains(event.target)){
        addSkillChip()
    }
    
    const deleteBtn = event.target.closest('[data-delete-work]');
    if (deleteBtn){
        const pk = deleteBtn.dataset.deleteWork;
        callDeleteModal('work experience',pk)
    }
    // ------------------------------------------------------


    // project -------------------------------------
    const editBtnP = event.target.closest('[data-edit-project]'); 
    if (editBtnP){
        const pk = editBtnP.dataset.editProject;
        const article = document.getElementById(`project-${pk}`);
    
        openProjectModalWithData(article, pk); // edit
    }

    if (event.target.closest('#add-project-section')) {
        openProjectCreate(); // create
    }

    const deleteProjectBtn = event.target.closest('[data-delete-project]');
    if(deleteProjectBtn){
        const pk = deleteProjectBtn.dataset.deleteProject;
        callDeleteModal('project',pk)
    }
    // ---------------------------------------------------

    // education ----------------------------
    if (event.target.closest('#add-education-section')) {
        openEducationCreate(); // create
    }

    const editBtnE = event.target.closest('[data-edit-education]');
    if (editBtnE){
        const pk = editBtnE.dataset.editEducation;
        const article = document.getElementById(`education-${pk}`);
    
        openEduModalWithData(article, pk); //edit
    }

    const deleteEducationBtn = event.target.closest('[data-delete-education]');
    if(deleteEducationBtn){
        const pk = deleteEducationBtn.dataset.deleteEducation;
        callDeleteModal('education',pk);
    }
    // --------------------------------------------------------
    
    // delete feature for all
    const deleteModalBtn = event.target.closest('[data-delete-item]')
    if(deleteModalBtn){
        const confirmDelete = deleteModalBtn.dataset.deleteItem
        if(confirmDelete == 'false'){
            closeModal();
            return;
        }
        closeModal();
        const pk = deleteModalBtn.dataset.item
        let content = deleteModalBtn.dataset.deleteContent
        if(content == 'work experience'){
            content = 'w-exp';
        }
        const article = document.getElementById(`${content}-${pk}`);
        console.log(content)
        if(content == 'education'){
            handleDeleteEducation(pk,article); 
        }
        else if(content == 'w-exp'){
            handleDeleteWork(pk,article);
        }else if(content == 'project'){
            handleDeleteProject(pk,article);
        }
    }

});

// needed
function openWorkModalWithData(article, pk) {
    const designation = article.querySelector('[data-w-designation]').dataset.wDesignation;
    const company = article.querySelector('[data-w-company]').dataset.wCompany;
    const type = article.querySelector('[data-w-type]').dataset.wType;
    const start = article.querySelector('[data-w-start_date]').dataset.wStart_date;
    const end = article.querySelector('[data-w-start_date]').dataset.wEnd_date;
    const description = article.querySelector('[data-w-description]').dataset.wDescription;

    const skills = [...article.querySelectorAll('[data-w-skill]')]
        .map(el => el.dataset.wSkill);

    openWorkEdit(pk, {
        designation,
        company,
        type,
        start,
        end,
        description,
        skills
    });
}


async function handleDeleteWork(pk, article) {

    try {
        const response = await deleteWorkExp(pk);

        if (response.ok) {
            // remove from UI
            article.remove();

            // optional: show empty state if no items left
            const list = document.getElementById('workList');
            if (list.children.length === 0) {
                list.innerHTML = `<h2>Add a List of work experiences here..</h2>`;
            }

        } else {
            const err = await response.json();
            console.log(err);
            messageBox({error:err})
        }

    } catch (error) {
        console.error('Delete failed:', error);
    }
}


async function handleDeleteProject(pk, article) {

    try {
        const response = await deleteProject(pk);

        if (response.ok) {
            // remove from UI
            article.remove();

            // optional: show empty state if no items left
            const list = document.getElementById('projectList');
            if (list.children.length === 0) {
                list.innerHTML = `<h2>Add a List of projects here..</h2>`;
            }

        } else {
            const err = await response.json();
            console.log(err);
            messageBox({error:err})
        }

    } catch (error) {
        console.error('Delete failed');
    }
}

function openProjectModalWithData(article, pk) {
    const title = article.querySelector('[data-title]').dataset.title;

    const dateElem = article.querySelector('[data-p-start_date]');
    const start = dateElem.dataset.pStart_date;
    const end = dateElem.dataset.pEnd_date;

    const description = article.querySelector('[data-p-description]').dataset.pDescription;

    const skills = [...article.querySelectorAll('[data-p-skill]')]
        .map(el => el.dataset.pSkill);

    openProjectEdit(pk, {
        title,
        start,
        end,
        description,
        skills
    });
}



function openEduModalWithData(article, pk) {

    const levelElem = article.querySelector('[data-e-level]');
    const otherElem = article.querySelector('[data-e-other]');

    let level = '';
    let other = '';

    if (levelElem) {
        level = levelElem.dataset.eLevel;
    } else if (otherElem) {
        level = 'OTH';   // important
        other = otherElem.dataset.eOther;
    }

    const field = article.querySelector('[data-e-field]').dataset.eField;
    const institution = article.querySelector('[data-e-institution]').dataset.eInstitution;

    const dateElem = article.querySelector('[data-e-start_date]');
    const start = dateElem.dataset.eStart_date;
    const end = dateElem.dataset.eEnd_date;

    openEducationEdit(pk, {
        level,
        other,
        field,
        institution,
        start,
        end
    });
}


// Work Exp Edit config
function openWorkEdit(pk, data) {
    openFormModal({
        title: 'Edit Work Experience',
        method: 'PATCH',
        url: `/profile-api/candidates/0/workexp/${pk}/`,

        fields: [
            { type: 'text', name: 'designation', value: data.designation },
            { type: 'text', name: 'company', value: data.company },

            {
                type: 'select',
                name: 'work_type',
                value: data.type,
                options: [
                    { value: 'FULL', label: 'Full time' },
                    { value: 'PART', label: 'Part time' },
                    { value: 'INTR', label: 'Internship' },
                    { value: 'FRLN', label: 'Freelance' },
                    { value: 'CONT', label: 'Contractual' }
                ]
            },

            { type: 'textarea', name: 'description', value: data.description },
            { type: 'skills', name: 'skill_list', value: data.skills },

            { type: 'date', name: 'start_date', value: data.start },
            { type: 'date', name: 'end_date', value: data.end }
        ],

        onSuccess: updateWorkInDOM
    });
}

// Work Exp Create Config
function openWorkCreate() {
    openFormModal({
        title: 'Add Work Experience',
        method: 'POST',
        url: `/profile-api/candidates/0/workexp/`,

        fields: [
            { type: 'text', name: 'designation', placeholder: 'Designation..'},
            { type: 'text', name: 'company', placeholder: 'Company...' },
            {
                type: 'select',
                name: 'work_type',
                options: [
                    { value: 'FULL', label: 'Full time' },
                    { value: 'PART', label: 'Part time' },
                    { value: 'INTR', label: 'Internship' },
                    { value: 'FRLN', label: 'Freelance' },
                    { value: 'CONT', label: 'Contractual' }
                ]
            },
            { type: 'textarea', name: 'description', placeholder: 'description..' },
            { type: 'skills', name: 'skill_list', value: [] },
            { type: 'date', name: 'start_date' },
            { type: 'date', name: 'end_date' }
        ],

        onSuccess: appendWorkExperience
    });
}

// project
function openProjectCreate() {
    openFormModal({
        title: 'Add Project',
        method: 'POST',
        url: `/profile-api/candidates/0/projects/`,

        fields: [
            { type: 'text', name: 'title', placeholder: 'Project Title' },
            { type: 'textarea', name: 'description', placeholder: 'Description' },
            { type: 'skills', name: 'skill_list', value: [] },
            { type: 'date', name: 'start_date' },
            { type: 'date', name: 'end_date' }
        ],

        onSuccess: appendProjectToDOM
    });
}

function openProjectEdit(pk, data) {
    openFormModal({
        title: 'Edit Project',
        method: 'PATCH',
        url: `/profile-api/candidates/0/projects/${pk}/`,

        fields: [
            { type: 'text', name: 'title', value: data.title },
            { type: 'textarea', name: 'description', value: data.description },
            { type: 'skills', name: 'skill_list', value: data.skills },
            { type: 'date', name: 'start_date', value: data.start },
            { type: 'date', name: 'end_date', value: data.end }
        ],

        onSuccess: updateProjectInDOM
    });
}


// education
function openEducationCreate() {
    openFormModal({
        title: 'Add Education',
        method: 'POST',
        url: `/profile-api/candidates/0/educations/`,

        fields: [
            {
                type: 'select',
                name: 'level',
                options: [
                    { value: 'TEN', label: '10th Pass' },
                    { value: 'TWL', label: '12th Pass' },
                    { value: 'DIP', label: 'Diploma' },
                    { value: 'BAC', label: "Bachelor's Degree" },
                    { value: 'MAS', label: "Master's Degree" },
                    { value: 'DOC', label: 'Doctorate' },
                    { value: 'OTH', label: 'Other' }
                ]
            },

            { type: 'text', name: 'other', placeholder: 'Specify (if Other)' },

            { type: 'text', name: 'field', placeholder: 'Field of study' },
            { type: 'text', name: 'institution', placeholder: 'Institution' },

            { type: 'date', name: 'start_date' },
            { type: 'date', name: 'end_date' }
        ],

        onSuccess: appendEducationToDOM,
        afterRender: attachEducationLogic
    });
}

function openEducationEdit(pk, data) {
    openFormModal({
        title: 'Edit Education',
        method: 'PATCH',
        url: `/profile-api/candidates/0/educations/${pk}/`,

        fields: [
            {
                type: 'select',
                name: 'level',
                value: data.level,
                options: [
                    { value: 'TEN', label: '10th Pass' },
                    { value: 'TWL', label: '12th Pass' },
                    { value: 'DIP', label: 'Diploma' },
                    { value: 'BAC', label: "Bachelor's Degree" },
                    { value: 'MAS', label: "Master's Degree" },
                    { value: 'DOC', label: 'Doctorate' },
                    { value: 'OTH', label: 'Other' }
                ]
            },

            { type: 'text', name: 'other', value: data.other, placeholder: 'Specify (if Other)' },

            { type: 'text', name: 'field', value: data.field },
            { type: 'text', name: 'institution', value: data.institution },

            { type: 'date', name: 'start_date', value: data.start },
            { type: 'date', name: 'end_date', value: data.end }
        ],

        onSuccess: updateEducationInDOM,
        afterRender: attachEducationLogic
    });
}


function callDeleteModal(content,pk){
    deleteModal(content,pk)
}

async function handleDeleteEducation(pk, article) {
    try {
        const response = await deleteEducation(pk);

        if (response.ok) {
            // remove from UI
            article.remove();

            // optional: show empty state if no items left
            const list = document.getElementById('educationList');
            if (list.children.length === 0) {
                list.innerHTML = `<h2>Add a List of educations here..</h2>`;
            }

        } else {
            const err = await response.json();
            console.log(err);
            messageBox({error:err})
        }

    } catch (error) {
        console.error('Delete failed');
    }
}

