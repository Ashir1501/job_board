import { create_bookmark, delete_bookmark } from "../api/bookmark_api.js";
import { jobFilterNav } from "../api/job_api.js";
import { messageBox } from "./main_render.js";

let bookmarkState = new Map();
export let jobsState = new Map(); // stores active status and description

export function renderJobs(container, data) {

    container.innerHTML = ''; // clear old jobs
    // clearing state variables
    bookmarkState.clear();
    jobsState.clear();
    const job_aside = document.getElementById(container.id + 'aside');
    if (job_aside) {
        job_aside.remove();
    }

    data.results.forEach(job => {
        // setting state
        jobsState.set(job.pk,{
            is_active: job.is_active,
            description: job.description,
            description_html: job.description_html
        })

        // const location = job.locations?.[0]
        //     ? `${capitalize(job.locations[0].city)}, ${capitalize(job.locations[0].country)}`
        //     : 'N/A';
        let locations = []
        job.locations.forEach(location => {
            if(location){
                locations.push(capitalize(location.city))
            }
        });

        const article = document.createElement('article');
        article.id = 'article-' + job.pk;
        article.className =
            'cursor-pointer bg-white p-4 rounded-xl shadow hover:shadow-md';
        
        let locationsHTML = ''
        if(locations.length > 1){
            locationsHTML = `
            <div>
                <span class='inline-block text-sm text-gray-500 mr-1'>${locations[0]}</span><span class='inline-block text-sm text-gray-500'>...and More</span>
            </div>`
        }else if(locations.length == 1){
            locationsHTML = `
            <div>
                <span class='inline-block text-sm text-gray-500 mr-1'>${locations[0]}</span>
            </div>`
        }

        article.innerHTML = `
        <h3 class="font-semibold text-lg capitalize">${job.title}</h3>
        <p class="text-sm text-gray-600 capitalize">${job.company || 'company not specified'}</p>
        <div class='flex flex-wrap gap-2'>
        ${locationsHTML}
        </div>
        <p class="text-xs text-gray-400 mt-1">
          ₹${job.salary_min || 0} - ₹${job.salary_max || 0} • ${job.experience_min}-${job.experience_max} yrs
        </p>
      `;
        if (job.application_status) {
            let status = {
                'PEN': 'Pending',
                'VEW': 'Viewed',
                'SHL': 'Shortlisted',
                'REJ': 'Rejected'
            }
            article.innerHTML = article.innerHTML + `
            <div class='flex flex-wrap justify-end'>
                <span class='px-2 border-2 rounded'>${status[job.application_status]}</span>
            </div>
            `
        }
        if (job.application_count) {
            article.innerHTML = article.innerHTML + `
            <div class='flex flex-wrap justify-end gap-2'>
                <div>
                    <span class='mr-2'>Applicants:</span><span class='px-2 border-2 rounded'>${job.application_count}</span>
                </div>
            </div>
            `
        }

        // click -> update right panel
        article.addEventListener('click', () => {
            selectJob(
                container,
                article,
                job,
                locations
            );
        });
        let bookmark_data = {
            is_bookmarked: job.is_bookmarked,
            bookmark_id: job.bookmark_id
        }
        bookmarkState.set(job.pk, bookmark_data)
        container.appendChild(article);

    });

    const aside = document.createElement('aside');
    aside.id = container.id + 'aside'
    aside.className = 'md:col-span-2';
    const article = document.createElement('article');
    article.id = container.id + 'jobDetail';
    article.className = 'relative w-full bg-white p-6 rounded-xl shadow'
    article.innerHTML = `
    <h2 class="text-xl font-semibold mb-2">Select a job</h2>
    <p class="text-gray-500">Click on a job card to see details here.</p>
    `
    aside.append(article)
    if (data.results.length != 0) {
        container.after(aside)
    }

    jobNavigation(container, data.next, data.previous)

}

function selectJob(container, article,job, locations) {
    const detailIdName = container.id + 'jobDetail'
    const detail = document.querySelector(`#${detailIdName}`);
    const bookmarkWhite = document.getElementById('grab_bookmark_white')
    const bookmarkBlack = document.getElementById('grab_bookmark_black')
    let bookmark_id = bookmarkState.get(job.pk).bookmark_id
    let is_bookmarked = bookmarkState.get(job.pk).is_bookmarked

    const bookmarkSrc = is_bookmarked ? bookmarkBlack.src : bookmarkWhite.src
    const userr = document.querySelector('[data-user-r]')
    detail.innerHTML = '';
    if (userr.dataset.userR == 'CA') {
        detail.innerHTML = detail.innerHTML + `
        <img id='bookmark-${job.pk}' data-bookmark-job-id='${job.pk}' data-bookmark-id='${bookmark_id}' src='${bookmarkSrc}' class='absolute top-4 right-24 h-8 cursor-pointer' alt='bookmark_image'>
        <form id="application-form" method="post" class="absolute top-4 right-0 mr-4">
            <input type='hidden' name='job' value='${job.pk}'>
            <input type="submit" class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700" value='Apply' />
        </form>
        `
    }
    detail.innerHTML = detail.innerHTML + `
    <h2 class="text-2xl font-semibold mb-2">${job.title}</h2>
    `
    const jobStateData = jobsState.get(job.pk)
    let jobStatus = {
        is_active: null,
        activeImgSrc: null
    }
    if(jobStateData.is_active){
        jobStatus.is_active = true
        jobStatus.activeImgSrc = '/static/image/active.png'
    }else{
        jobStatus.is_active = false
        jobStatus.activeImgSrc = '/static/image/not_active.png'
    }
    if (userr.dataset.userR == 'RE') {
        detail.innerHTML = detail.innerHTML + `
        <div class='relative md:absolute md:top-5 md:right-20 flex flex-wrap gap-2'>
            <div data-isactive='${jobStatus.is_active}' class='active-status px-2 border-1 rounded'>
                <span class='align-middle'>Active</span><img src='${jobStatus.activeImgSrc}' class='h-6 inline-block' />
            </div>
            <button data-jobid='${job.pk}' class='view-applications block px-2 border-1 rounded cursor-pointer'>View Applicants</button>
            <img src='/static/image/edit.png' data-jobid='${job.pk}' class='block edit-job h-8 cursor-pointer' />
        </div>
        `
    }

    let locationsHTML = ''
    if(locations.length >= 1){
        locations.forEach(location => {
            locationsHTML = locationsHTML + `
            <div>
                <span class='inline-block text-sm text-gray-500'>${location}</span>
            </div>
            `
        });
    }

    detail.innerHTML = detail.innerHTML + `
        <p class="text-gray-700 mb-1">${job.company || 'Company Not Available'}</p>
        <div class='flex flex-wrap gap-2'>
        ${locationsHTML}
        </div>
        <div id='description-plain' data-descriptionmk='${jobStateData.description}' class="text-gray-600">${jobStateData.description_html}</div>
        <div class='mt-2'>
            <span class='text-sm font-light'>Recruiter: ${job.created_by}</span>
        </div>
    `;

    // create and delete bookmarks
    const bookmarkImg = document.querySelector(`#bookmark-${job.pk}`)
    if (bookmarkImg) {
        bookmarkImg.addEventListener('click', async function () {
            console.log('bookmark')
            const state = bookmarkState.get(job.pk);
            if (!state) return;

            if (!state.is_bookmarked) {
                const response = await create_bookmark(job.pk);
                if (response.ok) {
                    const result = await response.json()

                    bookmarkImg.src = bookmarkBlack.src;
                    bookmarkImg.dataset.bookmarkId = result.pk

                    bookmarkState.set(job.pk, {
                        is_bookmarked: true,
                        bookmark_id: result.pk
                    })
                } else {
                    const err = await response.json();
                    console.log(err);
                    messageBox({ error: err })
                }
            } else {
                const response = await delete_bookmark(state.bookmark_id);
                if (response.ok) {
                    bookmarkImg.src = bookmarkWhite.src
                    bookmarkImg.dataset.bookmarkId = ''
                    if (container.id == 'bookmarkedList') {
                        article.remove()
                        detail.innerHTML = `
                        <h2 class="text-xl font-semibold mb-2">Select a job</h2>
                        <p class="text-gray-500">Click on a job card to see details here.</p>
                        `
                    }
                    bookmarkState.set(job.pk, {
                        is_bookmarked: false,
                        bookmark_id: null
                    })
                } else {
                    const err = await response.json()
                    console.log(err)
                    messageBox({ error: err })
                }
            }
        });
    }
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}


export function jobNavigation(container, next, previous) {


    if (next) {
        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-btn'
        nextBtn.className = 'w-1/4 p-1 m-2 font-bold border text-center rounded-sm'
        nextBtn.textContent = 'Next'
        container.append(nextBtn)
    }

    if (previous) {
        const previousBtn = document.createElement('button');
        previousBtn.id = 'prev-btn'
        previousBtn.className = 'w-1/4 p-1 m-2 font-bold text-center border rounded-sm'
        previousBtn.textContent = 'Previous'
        container.append(previousBtn)
    }

    // next request
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', async function () {

            let response = await jobFilterNav(next)
            if (response.ok) {
                let result = await response.json()
                renderJobs(container, result)
            } else {
                let err = await response.json()
                console.log(err)
                messageBox({ error: err })
            }
        });
    }

    // previous request
    const previousBtn = document.getElementById('prev-btn');
    if (previousBtn) {
        previousBtn.addEventListener('click', async function () {
            let response = await jobFilterNav(previous)
            if (response.ok) {
                let result = await response.json()
                renderJobs(container, result)
            } else {
                let err = await response.json()
                console.log(err)
                messageBox({ error: err })
            }
        });
    }
}


export function editJobModal(job) {

    return `
    <form id="edit-job-form"
          class="space-y-6"
          data-jobid="${job.id}">

        <!-- Header -->
        <section>
            <p class="text-sm text-gray-500 mt-1">
                Update job description and visibility
            </p>
        </section>

        <!-- Status -->
        <section class="space-y-3">

            <h3 class="font-semibold text-gray-700">
                Job Status
            </h3>

            <div class="flex flex-wrap gap-6">

                <label class="flex items-center gap-2 cursor-pointer">

                    <input
                        type="radio"
                        name="is_active"
                        value="true"
                        ${job.is_active ? 'checked' : ''}
                    >

                    <span>Active</span>

                </label>

                <label class="flex items-center gap-2 cursor-pointer">

                    <input
                        type="radio"
                        name="is_active"
                        value="false"
                        ${!job.is_active ? 'checked' : ''}
                    >

                    <span>Inactive</span>

                </label>

            </div>

        </section>

        <!-- Markdown Editor -->
        <section>

            <label class="block text-sm font-medium mb-2">
                Job Description (Markdown)
            </label>

            <!-- Toolbar -->
            <div class="flex flex-wrap gap-2 mb-3">

                <button type="button"
                        class="md-bold px-3 py-1 border rounded hover:bg-gray-100">
                    Bold
                </button>

                <button type="button"
                        class="md-italic px-3 py-1 border rounded hover:bg-gray-100">
                    Italic
                </button>

                <button type="button"
                        class="md-h1 px-3 py-1 border rounded hover:bg-gray-100">
                    H1
                </button>

                <button type="button"
                        class="md-h2 px-3 py-1 border rounded hover:bg-gray-100">
                    H2
                </button>

                <button type="button"
                        class="md-h3 px-3 py-1 border rounded hover:bg-gray-100">
                    H3
                </button>

                <button type="button"
                        class="md-list px-3 py-1 border rounded hover:bg-gray-100">
                    List
                </button>

                <button type="button"
                        class="md-link px-3 py-1 border rounded hover:bg-gray-100">
                    Link
                </button>

            </div>

            <!-- Textarea -->
            <textarea
                id="markdown-input"
                rows="10"
                class="w-full border rounded-xl p-4 resize-none outline-none focus:ring focus:ring-blue-200"
            >${job.description || ''}</textarea>

        </section>

        <!-- Preview -->
        <section>

            <div class="flex items-center justify-between mb-2">

                <h3 class="font-semibold text-gray-700">
                    Preview
                </h3>

                <span class="text-sm text-gray-400">
                    Live preview
                </span>

            </div>

            <article
                id="markdown-preview"
                class="prose max-w-none border rounded-xl p-4 bg-gray-50 min-h-[200px]"
            ></article>

        </section>

        <!-- Footer -->
        <footer class="flex justify-end gap-3 pt-4 border-t">

            <button
                type="button"
                id="cancel-edit-job"
                class="px-5 py-2 border rounded hover:bg-gray-100"
            >
                Cancel
            </button>

            <button
                type="submit"
                class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Save Changes
            </button>

        </footer>

    </form>
    `
}

export function wrapMarkdown(textarea, symbol){

    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    const selected =
        textarea.value.substring(start, end)

    textarea.setRangeText(
        symbol + selected + symbol
    )

    updatePreview()
}

export function insertMarkdown(textarea, text){

    const start = textarea.selectionStart

    textarea.setRangeText(
        text,
        start,
        start,
        'end'
    )

    updatePreview()
}

export function initializeEditMarkdownPreview(){

    updatePreview()

    const textarea =
        document.getElementById('markdown-input')

    textarea.addEventListener('input', updatePreview)
}

export function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function updatePreview() {

    const textarea =
        document.getElementById('markdown-input')

    const preview =
        document.getElementById('markdown-preview')

    let text = escapeHtml(textarea.value)

    text = text

        // headings
        .replace(/^### (.*?)$/gm,
            '<h3 class="text-lg font-semibold">$1</h3>')

        .replace(/^## (.*?)$/gm,
            '<h2 class="text-xl font-semibold">$1</h2>')

        .replace(/^# (.*?)$/gm,
            '<h1 class="text-2xl font-bold">$1</h1>')

        // bold
        .replace(/\*\*(.*?)\*\*/g,
            '<strong class="font-bold">$1</strong>')

        // italic
        .replace(/\*(.*?)\*/g,
            '<em class="italic">$1</em>')

        // unordered lists
        .replace(/(?:^|\n)- (.*?)(?=\n|$)/g,
            '<li class="list-disc ml-6">$1</li>')

        // wrap consecutive <li> in <ul>
        .replace(/(<li.*?<\/li>)/gs,
            '<ul>$1</ul>')

        // links
        .replace(/\[(.*?)\]\((.*?)\)/g,
            '<a class="underline text-blue-500" href="$2" target="_blank">$1</a>')

        // line breaks
        .replace(/\n/g, '<br>');

    preview.innerHTML = text
}