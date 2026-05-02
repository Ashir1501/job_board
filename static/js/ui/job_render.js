import { create_bookmark, delete_bookmark } from "../api/bookmark_api.js";
import {jobFilterNav} from "../api/job_api.js";

let bookmarkState = new Map()

export default function renderJobs(container, data) {
   
    container.innerHTML = ''; // clear old jobs
    bookmarkState.clear()
    const job_aside = document.getElementById(container.id+'aside');
    if(job_aside){
        job_aside.remove()
    }

    data.results.forEach(job => {
        const location = job.locations?.[0]
            ? `${capitalize(job.locations[0].city)}, ${capitalize(job.locations[0].country)}`
            : 'N/A';

        const article = document.createElement('article');
        article.id = 'article-'+job.pk;
        article.className =
            'cursor-pointer bg-white p-4 rounded-xl shadow hover:shadow-md';

        article.innerHTML = `
        <h3 class="font-semibold text-lg capitalize">${job.title}</h3>
        <p class="text-sm text-gray-600 capitalize">${job.created_by}</p>
        <p class="text-sm text-gray-500">${location}</p>
        <p class="text-xs text-gray-400 mt-1">
          ₹${job.salary_min} - ₹${job.salary_max} • ${job.experience_min}-${job.experience_max} yrs
        </p>
      `;

        // click → update right panel
        article.addEventListener('click', () => {
            selectJob(
                container,
                article,
                job.pk,
                job.title,
                job.created_by,
                job.description_html || 'No description available',
                location
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
    article.id = container.id+'jobDetail';
    article.className = 'relative w-full bg-white p-6 rounded-xl shadow'
    article.innerHTML = `
    <h2 class="text-xl font-semibold mb-2">Select a job</h2>
    <p class="text-gray-500">Click on a job card to see details here.</p>
    `
    aside.append(article)
    if(data.results.length != 0){
        container.after(aside)
    }

    jobNavigation(container, data.next, data.previous)

}

function selectJob(container,article,job_id,title, company, description, location) {
    const detailIdName = container.id + 'jobDetail'
    const detail = document.querySelector(`#${detailIdName}`);
    const bookmarkWhite = document.getElementById('grab_bookmark_white')
    const bookmarkBlack = document.getElementById('grab_bookmark_black')
    let bookmark_id = bookmarkState.get(job_id).bookmark_id
    let is_bookmarked = bookmarkState.get(job_id).is_bookmarked

    const bookmarkSrc = is_bookmarked?bookmarkBlack.src:bookmarkWhite.src
    
    detail.innerHTML = `
        <img id='bookmark-${job_id}' data-bookmark-job-id='${job_id}' data-bookmark-id='${bookmark_id}' src='${bookmarkSrc}' class='absolute top-4 right-24 h-8 cursor-pointer' alt='bookmark_image'>
        <form id="application-form" method="post" class="absolute top-4 right-0 mr-4">
            <input type='hidden' name='job' value='${job_id}'>
            <input type="submit" class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700" value='Apply' />
        </form>

        <h2 class="text-2xl font-semibold mb-2">${title}</h2>
        <p class="text-gray-700 mb-1">${company}</p>
        <p class="text-gray-500 mb-4">${location}</p>
        <p class="text-gray-600">${description}</p>
    `;
    

    // create and delete bookmarks
    const bookmarkImg = document.querySelector(`#bookmark-${job_id}`)
    if(bookmarkImg){
        bookmarkImg.addEventListener('click',async function(){
            console.log('bookmark')
            const state = bookmarkState.get(job_id);
            if(!state) return;

            if(!state.is_bookmarked){
                const response = await create_bookmark(job_id);
                if(response.ok){
                    const result = await response.json()

                    bookmarkImg.src = bookmarkBlack.src;
                    bookmarkImg.dataset.bookmarkId = result.pk

                    bookmarkState.set(job_id, {
                        is_bookmarked: true,
                        bookmark_id: result.pk
                    })
                }else{
                    const result = await response.json();
                    console.log(result);
                }
            }else{
                const response = await delete_bookmark(state.bookmark_id);
                if(response.ok){       
                    bookmarkImg.src = bookmarkWhite.src
                    bookmarkImg.dataset.bookmarkId = ''
                    if(container.id == 'bookmarkedList'){
                        article.remove()
                        detail.innerHTML = `
                        <h2 class="text-xl font-semibold mb-2">Select a job</h2>
                        <p class="text-gray-500">Click on a job card to see details here.</p>
                        `
                    }
                    bookmarkState.set(job_id,{
                        is_bookmarked: false,
                        bookmark_id: null
                    })
                }else{
                    const result = await response.json()
                    console.log(result) 
                }
            }
        });
    }
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}


export function jobNavigation(container, next, previous){

    
    if(next){
        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-btn'
        nextBtn.className = 'w-1/4 p-1 m-2 font-bold border text-center rounded-sm'
        nextBtn.textContent = 'Next'
        container.append(nextBtn)
    }

    if(previous){
        const previousBtn = document.createElement('button');
        previousBtn.id = 'prev-btn'
        previousBtn.className = 'w-1/4 p-1 m-2 font-bold text-center border rounded-sm'
        previousBtn.textContent = 'Previous'
        container.append(previousBtn)
    }

    // next request
    const nextBtn = document.getElementById('next-btn');
    if(nextBtn){
        nextBtn.addEventListener('click',async function(){
    
            let response = await jobFilterNav(next)
            if(response.ok){
                let result = await response.json()
                renderJobs(container,result)
            }else{
                let message = await response.json()
                console.log(message)
            }
        });
    }

    // previous request
    const previousBtn = document.getElementById('prev-btn');
    if(previousBtn){
        previousBtn.addEventListener('click',async function(){
            let response = await jobFilterNav(previous)
            if(response.ok){
                let result = await response.json()
                renderJobs(container,result)
            }else{
                let message = await response.json()
                console.log(message)
            }
        });
    }
}