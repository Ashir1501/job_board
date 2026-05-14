import { getApplicationAPI } from "../api/application_api.js";

export const applicationState = new Map();

export const statusMap = {
    PEN: 'Pending',
    SHL: 'Shortlisted',
    VEW: 'Viewed',
    REJ: 'Rejected'
}


export async function loadApplication(endpoint){
    const appContainer = document.getElementById('applications-container');
    appContainer.innerHTML = ''
    applicationState.clear()

    let response = await getApplicationAPI(endpoint);
    if(response.ok){
        let data = await response.json();
        // console.log(data)
        data.results.forEach(application => {
            const jsDate = new Date(application.created_at);
            applicationState.set(application.pk, {
                status: application.status
            })
            application.created_at = get_date(jsDate);
            let card = applicationCard(application)
            appContainer.innerHTML = appContainer.innerHTML + card;
        });
        applicationNavigation(appContainer,data.next,data.previous)
    }else{
        let err = await response.json();
        messageBox({error:err})
    }
}

function applicationNavigation(container, next, previous) {


    if (next) {
        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-btn'
        nextBtn.className = 'w-1/8 p-1 m-2 font-bold border text-center rounded-sm'
        nextBtn.textContent = 'Next'
        container.append(nextBtn)
    }

    if (previous) {
        const previousBtn = document.createElement('button');
        previousBtn.id = 'prev-btn'
        previousBtn.className = 'w-1/8 p-1 m-2 font-bold text-center border rounded-sm'
        previousBtn.textContent = 'Previous'
        container.append(previousBtn)
    }

    // next request
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', async function () {
            loadApplication(next)
        });
    }

    // previous request
    const previousBtn = document.getElementById('prev-btn');
    if (previousBtn) {
        previousBtn.addEventListener('click', async function () {
            loadApplication(previous)
        });
    }
}

function get_date(jsDate){
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(jsDate);
    return formattedDate
}

function applicationCard(application) {
    const appState = applicationState.get(application.pk)
    const statusData = appState.status
    const status = statusMap[statusData]
    return `
    <article class="bg-white rounded-xl shadow-sm border p-5">

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
                <h2 class="text-lg font-semibold text-gray-800">
                    ${application.applicant}
                </h2>

                <p class="text-sm text-gray-500">
                    Applied on ${application.created_at}
                </p>

                <div class="flex flex-wrap gap-2 mt-3">
                    ${application.skills.map(skill => `
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            ${skill}
                        </span>
                    `).join('')}
                </div>
            </div>

            <div class="flex flex-wrap gap-2">

                <span id="article-${application.pk}" class="px-3 py-1 rounded bg-yellow-100 text-yellow-700 text-sm">
                    ${status}
                </span>

                <button
                    class="view-application px-4 py-2 border rounded hover:bg-gray-100"
                    data-applicationid="${application.pk}"
                >
                    View
                </button>

                <button
                    class="reject-application px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
                    data-applicationid="${application.pk}"
                >
                    Reject
                </button>

            </div>

        </div>

    </article>
    `
}


export function applicantModal(profile) {

    return `
    <div id='modaldata' class="space-y-8">

        <!-- Summary -->
        <section>
            <h3 class="text-lg font-semibold mb-2">
                Summary
            </h3>

            <p class="text-gray-700 leading-relaxed">
                ${profile.summary || 'No summary added'}
            </p>
        </section>

        <!-- Skills -->
        <section>
            <h3 class="text-lg font-semibold mb-3">
                Skills
            </h3>

            <div class="flex flex-wrap gap-2">
                ${profile.skills.map(skill => `
                    <span class="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        ${skill}
                    </span>
                `).join('')}
            </div>
        </section>

        <!-- Work Experience -->
        <section>
            <h3 class="text-lg font-semibold mb-4">
                Work Experience
            </h3>

            <div class="space-y-4">
                ${profile.work_experience.map(exp => `
                    <article class="border rounded-lg p-4">

                        <div class="flex justify-between gap-4">
                            <div>
                                <h4 class="font-semibold">
                                    ${exp.designation}
                                </h4>

                                <p class="text-gray-600">
                                    ${exp.company}
                                </p>
                            </div>

                            <p class="text-sm text-gray-500">
                                ${exp.start_date} - ${exp.end_date}
                            </p>
                        </div>

                        <p class="mt-3 text-sm text-gray-700">
                            ${exp.description}
                        </p>

                    </article>
                `).join('')}
            </div>
        </section>

        <!-- Education -->
        <section>
            <h3 class="text-lg font-semibold mb-4">
                Education
            </h3>

            <div class="space-y-4">
                ${profile.educations.map(edu => {
                    if(edu.level == 'OTH'){
                        edu.level = edu.other
                    }
                    return `
                    <article class="border rounded-lg p-4">

                        <h4 class="font-semibold">
                            ${edu.level}
                        </h4>

                        <p class="text-gray-700">
                            ${edu.institution}
                        </p>

                        <p class="text-sm text-gray-500">
                            ${edu.field}
                        </p>

                    </article>
                `}).join('')
                }
            </div>
        </section>

        <!-- Projects -->
        <section>
            <h3 class="text-lg font-semibold mb-4">
                Projects
            </h3>

            <div class="space-y-4">
                ${profile.projects.map(project => `
                    <article class="border rounded-lg p-4">

                        <h4 class="font-semibold">
                            ${project.title}
                        </h4>

                        <p class="mt-2 text-gray-700 text-sm">
                            ${project.description}
                        </p>

                    </article>
                `).join('')}
            </div>
        </section>

        <!-- Resume -->
        <section class="border rounded-lg p-4">

            <div class="flex flex-wrap items-center justify-between gap-3">

                <div>
                    <h3 class="font-semibold">
                        Resume
                    </h3>

                    <p class="text-sm text-gray-500">
                        Download applicant resume
                    </p>
                </div>

                <a
                    href="${profile.resume}"
                    download
                    target="_blank"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Download Resume
                </a>

            </div>

        </section>

        <!-- Actions -->
        <footer class="flex flex-wrap justify-end gap-3 pt-4 border-t">

            <button
                id="shortlist-applicant"
                data-applicationid="${profile.application_id}"
                class="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
                Shortlist
            </button>

            <button
                id="reject-applicant"
                data-applicationid="${profile.application_id}"
                class="px-5 py-2 border border-red-400 text-red-600 rounded hover:bg-red-50"
            >
                Reject
            </button>

        </footer>
    </div>

    </div>
    `
}
