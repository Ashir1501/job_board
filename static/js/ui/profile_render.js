import { attachFormHandler } from "../api/profile_api.js";

export function editSummary() {
    const editImg = document.getElementById('edit-summary-section');
    const summaryElem = document.getElementById('summary');
    const resumeName = document.getElementById('resume-name');
    const resumeUrl = document.getElementById('resume-url');
    const resumeBlock = document.getElementById('resume-block');
    const skillBlock = document.getElementById('skill-block');
    const addImgBaseSrc = document.getElementById('grab-add-img').src;

    editImg.className = 'hidden'
    // summary
    summaryElem.dataset.original = summaryElem.textContent;
    summaryElem.contentEditable = true;
    summaryElem.className = 'border p-2 rounded';

    // resume block
    resumeName.className = 'hidden';
    resumeUrl.className = 'hidden';

    const fileInput = document.createElement('input');
    fileInput.id = 'resume-input';
    fileInput.type = 'file';
    fileInput.className = 'w-[80%] border';
    resumeBlock.append(fileInput)

    // skill block
    const skillInput = document.createElement('input');
    skillInput.id = 'skill-inp';
    skillInput.type = 'text'
    skillInput.placeholder = 'skill...'
    skillInput.className = 'inline border px-2 py-1 mt-2 mr-2'

    const addImg = document.createElement('img')
    addImg.id = 'add-img'
    addImg.src = addImgBaseSrc
    addImg.className = 'inline h-8'
    skillBlock.append(skillInput, addImg)

    // minus-icon
    const minusIcons = document.querySelectorAll('[data-for-skill]');
    minusIcons.forEach(icon => {
        icon.classList.remove('hidden');
    });

    document.getElementById('summaryActions').classList.remove('hidden');
}

export function cancelUpdates(summarySkills) {
    const editImg = document.getElementById('edit-summary-section');
    const summaryElem = document.getElementById('summary');
    const resumeName = document.getElementById('resume-name');
    const resumeUrl = document.getElementById('resume-url');
    const skills = document.getElementById('skills');
    const minusBaseSrc = document.getElementById('grab-minus-img').src;

    editImg.className = 'inline-block h-8 align-middle'
    // summary restore
    summaryElem.textContent = summaryElem.dataset.original
    summaryElem.contentEditable = false
    summaryElem.className = ""

    // resume restore
    resumeName.textContent = resumeName.dataset.resumeName
    resumeUrl.href = resumeUrl.dataset.resumeUrl;
    resumeName.className = 'inline-block mr-4';
    resumeUrl.className = 'inline';

    //skills restore
    skills.innerHTML = ''
    for (let skill of summarySkills) {
        const div = document.createElement('div')
        div.id = `summary-skill-${skill}`
        div.className = 'bg-blue-100 px-2 mx-2 relative';
        div.textContent = skill;

        const minusImg = document.createElement('img')
        minusImg.id = `summary-minus-${skill}`
        minusImg.dataset.forSkill = `summary-skill-${skill}`
        minusImg.src = minusBaseSrc
        minusImg.className = 'absolute h-4 -top-2 -right-1'

        div.append(minusImg)
        skills.append(div)
    }
    summarySkills = []

    // ---------------------------------------------------------
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) {
        fileInput.remove()
    }

    const addImg = document.querySelector('#add-img')
    if (addImg) {
        addImg.remove()
    }
    const skillInpEle = document.getElementById('skill-inp');
    if (skillInpEle) {
        skillInpEle.remove()
    }

    const minusIcons = document.querySelectorAll('[data-for-skill]');
    minusIcons.forEach(icon => {
        icon.classList.add('hidden');
    });

    document.getElementById('summaryActions').classList.add('hidden');
}


export function addSummarySkills() {
    const skills = document.getElementById('skills');
    const minusBaseSrc = document.getElementById('grab-minus-img').src;
    const skillInpEle = document.getElementById('skill-inp');

    const div = document.createElement('div')
    div.id = `summary-skill-${skillInpEle.value.trim()}`
    div.className = 'bg-blue-100 px-2 mx-2 relative';
    div.textContent = skillInpEle.value.trim();

    const minusImg = document.createElement('img')
    minusImg.id = `summary-minus-${skillInpEle.value.trim()}`
    minusImg.dataset.forSkill = `summary-skill-${skillInpEle.value.trim()}`
    minusImg.src = minusBaseSrc
    minusImg.className = 'absolute h-4 -top-2 -right-1'

    div.append(minusImg)
    skills.append(div)
}

export function removeSummaryMinus(event) {
    const minusElem = document.querySelector(`#${event.target.id}`)
    const skillDivId = minusElem.dataset.forSkill
    const skillDiv = document.querySelector(`#${skillDivId}`)
    if (minusElem) {
        skillDiv.remove()
        minusElem.remove()
    }
}

export function saveSummary(result) {
    const editImg = document.getElementById('edit-summary-section')
    const summaryElem = document.getElementById('summary');
    const resumeName = document.getElementById('resume-name');
    const resumeUrl = document.getElementById('resume-url');
    const skills = document.getElementById('skills');
    const minusBaseSrc = document.getElementById('grab-minus-img').src;

    // updating UI
    editImg.className = 'inline-block h-8 align-middle'

    summaryElem.textContent = result.summary
    summaryElem.contentEditable = false
    summaryElem.className = ""

    resumeName.textContent = result.resume_name;
    resumeUrl.href = result.resume_url;
    resumeName.className = 'inline-block mr-4';
    resumeUrl.className = 'inline';

    skills.innerHTML = ''
    for (let skill of result.skills) {
        const div = document.createElement('div')
        div.id = `summary-skill-${skill}`
        div.className = 'bg-blue-100 px-2 mx-2 relative';
        div.textContent = skill;

        const minusImg = document.createElement('img')
        minusImg.id = `summary-minus-${skill}`
        minusImg.dataset.forSkill = `summary-skill-${skill}`
        minusImg.src = minusBaseSrc
        minusImg.className = 'absolute h-4 -top-2 -right-1'

        div.append(minusImg)
        skills.append(div)
    }
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) {
        fileInput.remove()
    }

    const addImg = document.querySelector('#add-img')
    if (addImg) {
        addImg.remove()
    }
    const skillInpEle = document.getElementById('skill-inp');
    if (skillInpEle) {
        skillInpEle.remove()
    }

    const minusIcons = document.querySelectorAll('[data-for-skill]');
    minusIcons.forEach(icon => {
        icon.classList.add('hidden');
    });

    document.getElementById('summaryActions').classList.add('hidden');

}

export function addSkillChip() {
    const input = document.getElementById('skill-input');
    const value = input.value.trim();
    if (!value) return;

    const chip = document.createElement('span');
    chip.className = 'bg-blue-100 px-2 py-1 text-sm flex items-center gap-1';
    chip.innerHTML = `
        ${value}
        <button type="button" onclick="this.parentElement.remove()">×</button>
    `;

    document.getElementById('skill-chips').appendChild(chip);
    input.value = '';
}

export function updateWorkInDOM(work) {
    const article = document.getElementById(`w-exp-${work.pk}`);

    const workTypeMap = {
        FULL: 'Full time',
        PART: 'Part time',
        INTR: 'Internship',
        FRLN: 'Freelance',
        CONT: 'Contractual'
    };

    article.innerHTML = `
        <div class="flex justify-between items-start flex-wrap gap-2">
            <h3 class="text-lg font-bold" data-w-designation="${ work.designation}">${ work.designation }</h3>
            <div class="flex gap-2">
                <img class="h-5 cursor-pointer" id="edit-w-exp-section-${ work.pk }" data-edit-work="${ work.pk }" src="/static/image/edit2.png" alt="edit-image">
                <img class="h-5 cursor-pointer" id="delete-w-exp-${ work.pk }" data-delete-work="${ work.pk }" src="/static/image/delete.png" alt="delete-image">
            </div>
        </div>

        <span class="block font-light"
            data-w-company="${work.company}">
            ${work.company}
        </span>

        <span class="block font-thin"
            data-w-type="${work.work_type}">
            ${workTypeMap[work.work_type]}
        </span>

        <span class="font-thin"
            data-w-start_date="${work.start_date}"
            data-w-end_date="${work.end_date}">
            ${work.start_date} to ${work.end_date}
        </span>

        <div class="flex gap-2 flex-wrap">
            ${work.skills.map(skill => `
                <div data-w-skill="${skill}"
                    class="bg-blue-100 px-2 mx-2">
                    ${skill}
                </div>
            `).join('')}
        </div>

        <p data-w-description="${work.description}" class="font-light">
            ${work.description}
        </p>
    `;
}

export function appendWorkExperience(work) {
    const workList = document.getElementById('workList');

    // remove empty message if exists
    if (workList.children.length === 1 && workList.textContent.includes('Add a List')) {
        workList.innerHTML = '';
    }

    const article = document.createElement('article');
    article.id = `w-exp-${work.pk}`;
    article.className = 'bg-white shadow-md m-3 p-1 rounded';

    const workTypeMap = {
        FULL: 'Full time',
        PART: 'Part time',
        INTR: 'Internship',
        FRLN: 'Freelance',
        CONT: 'Contractual'
    };

    article.innerHTML = `
        <div class="flex justify-between items-start flex-wrap gap-2">
            <h3 class="text-lg font-bold" data-w-designation="${ work.designation}">${ work.designation }</h3>
            <div class="flex gap-2">
                <img class="h-5 cursor-pointer" id="edit-w-exp-section-${ work.pk }" data-edit-work="${ work.pk }" src="/static/image/edit2.png" alt="edit-image">
                <img class="h-5 cursor-pointer" id="delete-w-exp-${ work.pk }" data-delete-work="${ work.pk }" src="/static/image/delete.png" alt="delete-image">
            </div>
        </div>

        <span class="block font-light"
            data-w-company="${work.company}">
            ${work.company}
        </span>

        <span class="block font-thin"
            data-w-type="${work.work_type}">
            ${workTypeMap[work.work_type] || work.work_type}
        </span>

        <span class="font-thin"
            data-w-start_date="${work.start_date}"
            data-w-end_date="${work.end_date}">
            ${work.start_date} to ${work.end_date}
        </span>

        <div class="flex gap-2 flex-wrap relative">
            ${work.skills.map(skill => `
                <div data-w-skill="${skill}"
                    class="bg-blue-100 px-2 mx-2 relative">
                    ${skill}
                </div>
            `).join('')}
        </div>

        <p data-w-description="${work.description}" class="font-light">
            ${work.description}
        </p>
    `;

    article.classList.add('opacity-0');
    // append at top (better UX)
    workList.prepend(article);
    setTimeout(() => {
        article.classList.remove('opacity-0');
        article.classList.add('transition', 'duration-300');
    }, 10);
}

export function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// modal
export function openModal(html) {
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modal').classList.remove('hidden');
}

export function deleteModal(content,pk){
    const html = `
    <h1 class="text-xl font-bold">Delete this ${content}</h1>
    <div class="flex gap-2 flex-wrap">
        <button id="deleteYes" data-delete-item="true" data-delete-content="${content}" data-item="${pk}" class="px-2 text-base cursor-pointer border border-red-500 rounded">Yes</button>
        <button id="deleteNo" data-delete-item="false" class="px-2 text-base cursor-pointer border border-lime-500">No</button>
    </div>
    `
    openModal(html)
}


// generic modal form builder
export function openFormModal(config) {
    const html = `
        <h2 class="text-xl font-semibold mb-4">${config.title}</h2>

        <form id="dynamic-form" class="space-y-3">
            ${config.fields.map(field => renderField(field)).join('')}

            <div class="flex gap-2 mt-3">
                <button type="submit"
                    class="bg-blue-600 text-white px-4 py-1 rounded">
                    Save
                </button>

                <button type="button" id="modal-close-btn"
                    class="border px-4 py-1 rounded">
                    Cancel
                </button>
            </div>
        </form>
    `;

    openModal(html);
    config.afterRender?.();

    attachFormHandler(config);
}

// Field Renderer 
function renderField(field) {
    const val = field.value || '';

    switch (field.type) {

        case 'text':
        case 'date':
            return `
                <input type="${field.type}" name="${field.name}"
                    value="${val}"
                    placeholder="${field.placeholder || ''}"
                    class="w-[80%] border px-2 py-1 block">
            `;

        case 'textarea':
            return `
                <textarea name="${field.name}" placeholder="${field.placeholder}" class="w-[80%] border px-2 py-1 block">${val}</textarea>
            `;

        case 'select':
            return `
                <select name="${field.name}" class="w-[80%] border px-2 py-1 block">
                    ${field.options.map(opt => `
                        <option value="${opt.value}" ${opt.value === val ? 'selected' : ''}>
                            ${opt.label}
                        </option>
                    `).join('')}
                </select>
            `;

        case 'skills':
            return `
                <div>
                    <div id="skill-chips" class="flex gap-2 flex-wrap mb-2">
                        ${(field.value || []).map(skill => `
                            <span class="bg-blue-100 px-2">
                                ${skill}
                                <button type="button" onclick="this.parentElement.remove()">×</button>
                            </span>
                        `).join('')}
                    </div>

                    <input id="skill-input" class="border px-2 py-1"
                        placeholder="Add skill">

                    <button type="button" id="add-skill-chip">+</button>
                </div>
            `;
    }
}

export function appendProjectToDOM(project) {
    const list = document.getElementById('projectList');
    const editImgSrc = document.getElementById('grab-edit2-img').src;
    const deleteImgSrc = document.getElementById('grab-delete-img').src;
    // remove empty message
    if (list.children.length === 1 && list.textContent.includes('Add a List')) {
        list.innerHTML = '';
    }

    const article = document.createElement('article');
    article.id = `project-${project.pk}`;
    article.className = `
        bg-white shadow-md m-3 p-3 rounded-xl 
        transition hover:shadow-lg
    `;

    article.innerHTML = `
        <div class="flex justify-between items-start flex-wrap gap-2">
            <h3 class="text-lg font-bold"
                data-title="${project.title}">
                ${project.title}
            </h3>

            <div class="flex gap-2">
                <img class="h-5 cursor-pointer"
                    data-edit-project="${project.pk}"
                    src="${editImgSrc}">

                <img class="h-5 cursor-pointer"
                    data-delete-project="${project.pk}"
                    src="${deleteImgSrc}">
            </div>
        </div>

        <span class="block text-sm text-gray-500 mt-1"
            data-p-start_date="${project.start_date}"
            data-p-end_date="${project.end_date}">
            ${project.start_date} to ${project.end_date}
        </span>

        <div class="flex flex-wrap gap-2 mt-2">
            ${project.skills.map(skill => `
                <span data-p-skill="${skill}"
                    class="bg-blue-100 text-sm px-2 py-1 rounded">
                    ${skill}
                </span>
            `).join('')}
        </div>

        <p class="text-gray-700 mt-2 text-sm"
            data-p-description="${project.description}">
            ${project.description}
        </p>
    `;

    list.prepend(article);
}

export function updateProjectInDOM(project) {
    const article = document.getElementById(`project-${project.pk}`);

    article.innerHTML = `
        <div class="flex justify-between items-start flex-wrap gap-2">
            <h3 class="text-lg font-bold"
                data-title="${project.title}">
                ${project.title}
            </h3>

            <div class="flex gap-2">
                <img class="h-5 cursor-pointer"
                    data-edit-project="${project.pk}"
                    src="/static/image/edit2.png">

                <img class="h-5 cursor-pointer"
                    data-delete-project="${project.pk}"
                    src="/static/image/delete.png">
            </div>
        </div>

        <span class="block text-sm text-gray-500 mt-1"
            data-p-start_date="${project.start_date}"
            data-p-end_date="${project.end_date}">
            ${project.start_date} to ${project.end_date}
        </span>

        <div class="flex flex-wrap gap-2 mt-2">
            ${project.skills.map(skill => `
                <span data-p-skill="${skill}"
                    class="bg-blue-100 text-sm px-2 py-1 rounded">
                    ${skill}
                </span>
            `).join('')}
        </div>

        <p class="text-gray-700 mt-2 text-sm"
            data-p-description="${project.description}">
            ${project.description}
        </p>
    `;
}

export function attachEducationLogic() {
    const levelSelect = document.querySelector('[name="level"]');
    const otherInput = document.querySelector('[name="other"]');

    function toggle() {
        if (levelSelect.value === 'OTH') {
            otherInput.classList.remove('hidden');
        } else {
            otherInput.classList.add('hidden');
            otherInput.value = '';
        }
    }

    toggle(); // initial
    levelSelect.addEventListener('change', toggle);
}

export function appendEducationToDOM(edu) {
    const list = document.getElementById('educationList');

    if (list.children.length === 1 && list.textContent.includes('Add a List')) {
        list.innerHTML = '';
    }

    const article = document.createElement('article');
    article.id = `education-${edu.pk}`;
    article.className = `
        bg-white shadow-md m-3 p-3 rounded-xl 
        transition hover:shadow-lg
    `;

    const title = edu.level === 'OTH' ? edu.other : edu.readable_level;

    article.innerHTML = `
        <div class="flex justify-between items-start flex-wrap gap-2">
            <h3 class="text-lg font-bold"
                ${edu.level === 'OTH'
                    ? `data-e-other="${edu.other}"`
                    : `data-e-level="${edu.level}"`}>
                ${title}
            </h3>

            <div class="flex gap-2">
                <img class="h-5 cursor-pointer"
                    data-edit-education="${edu.pk}"
                    src="/static/image/edit2.png">

                <img class="h-5 cursor-pointer"
                    data-delete-education="${edu.pk}"
                    src="/static/image/delete.png">
            </div>
        </div>

        <span class="block text-sm text-gray-700"
            data-e-field="${edu.field}">
            ${edu.field}
        </span>

        <span class="block text-sm text-gray-600"
            data-e-institution="${edu.institution}">
            ${edu.institution}
        </span>

        <span class="block text-xs text-gray-500"
            data-e-start_date="${edu.start_date}"
            data-e-end_date="${edu.end_date}">
            ${edu.start_date} to ${edu.end_date}
        </span>
    `;

    list.prepend(article);
}

export function updateEducationInDOM(edu) {
    const article = document.getElementById(`education-${edu.pk}`);

    const title = edu.level === 'OTH' ? edu.other : edu.readable_level;

    article.innerHTML = `
        <div class="flex justify-between items-start flex-wrap gap-2">
            <h3 class="text-lg font-bold"
                ${edu.level === 'OTH'
                    ? `data-e-other="${edu.other}"`
                    : `data-e-level="${edu.level}"`}>
                ${title}
            </h3>

            <div class="flex gap-2">
                <img class="h-5 cursor-pointer"
                    data-edit-education="${edu.pk}"
                    src="/static/image/edit2.png">

                <img class="h-5 cursor-pointer"
                    data-delete-education="${edu.pk}"
                    src="/static/image/delete.png">
            </div>
        </div>

        <span class="block text-sm text-gray-700"
            data-e-field="${edu.field}">
            ${edu.field}
        </span>

        <span class="block text-sm text-gray-600"
            data-e-institution="${edu.institution}">
            ${edu.institution}
        </span>

        <span class="block text-xs text-gray-500"
            data-e-start_date="${edu.start_date}"
            data-e-end_date="${edu.end_date}">
            ${edu.start_date} to ${edu.end_date}
        </span>
    `;
}


export function editRecruiterSummary() {
    const editImg = document.getElementById('edit-summary-section');
    const descriptionElem = document.getElementById('description');
    const companyElem = document.getElementById('company');
    const websiteElem = document.getElementById('website');
    editImg.className = 'hidden'
    // description
    descriptionElem.dataset.original = descriptionElem.textContent;
    descriptionElem.contentEditable = true;
    descriptionElem.className = 'w-full min-h-[2.5rem] p-2 border rounded-md outline-none whitespace-pre-wrap break-words';

    //company
    companyElem.dataset.original = companyElem.textContent;
    companyElem.contentEditable = true;
    companyElem.className = 'text-wrap break-words font-light border mb-2 p-2 rounded'

    //website
    websiteElem.dataset.original = websiteElem.textContent;
    websiteElem.contentEditable = true;
    websiteElem.className = 'text-wrap break-words font-light border mb-2 p-2 rounded';
    document.getElementById('summaryActions').classList.remove('hidden');
}

export function cancelRecruiterSummary() {
    const editImg = document.getElementById('edit-summary-section');
    const descriptionElem = document.getElementById('description');
    const companyElem = document.getElementById('company');
    const websiteElem = document.getElementById('website');    


    editImg.className = 'inline-block h-8 align-middle'
    // description restore
    descriptionElem.textContent = descriptionElem.dataset.original
    descriptionElem.contentEditable = false
    descriptionElem.className = "font-light"
    
    // company restore
    companyElem.textContent = companyElem.dataset.original
    companyElem.contentEditable = false
    companyElem.className = "font-light"

    // website restore
    websiteElem.textContent = websiteElem.dataset.original
    websiteElem.contentEditable = false
    websiteElem.className = "font-light"


    document.getElementById('summaryActions').classList.add('hidden');
}

export function updateRecruiterSummary(data) {
    const editImg = document.getElementById('edit-summary-section');
    const descriptionElem = document.getElementById('description');
    const companyElem = document.getElementById('company');
    const websiteElem = document.getElementById('website');    


    editImg.className = 'inline-block h-8 align-middle'
    // description update
    descriptionElem.textContent = data.description
    descriptionElem.contentEditable = false
    descriptionElem.className = "font-light"
    
    // company update
    companyElem.textContent = data.company;
    companyElem.contentEditable = false
    companyElem.className = "font-light"

    // website update
    websiteElem.textContent = data.website;
    websiteElem.contentEditable = false
    websiteElem.className = "font-light"


    document.getElementById('summaryActions').classList.add('hidden');
}