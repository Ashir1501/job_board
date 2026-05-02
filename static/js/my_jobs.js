import { bookmarkedJobs, appliedJobs } from "./api/job_api.js";
import renderJobs from "./ui/job_render.js";

document.addEventListener('DOMContentLoaded', async function(){

    const tabApplied = document.getElementById('tab-applied');
    const tabBookmarked = document.getElementById('tab-bookmarked');
    
    const appliedSection = document.getElementById('applied-section');
    const bookmarkedSection = document.getElementById('bookmarked-section');

    const appliedListC = document.getElementById('appliedList');
    const bookmarkListC = document.getElementById('bookmarkedList');
    
    // initial request on page load
    appliedJobRequest(appliedListC, bookmarkListC)

    tabApplied.classList.add('border-blue-600', 'font-semibold');
    tabApplied.classList.remove('text-gray-500');

    tabBookmarked.classList.remove('border-blue-600', 'font-semibold');
    tabBookmarked.classList.add('text-gray-500');

    if(tabApplied){
        tabApplied.addEventListener('click', () => {
            // request to get all applied jobs
            appliedJobRequest(appliedListC, bookmarkListC)
            appliedSection.classList.remove('hidden');
            bookmarkedSection.classList.add('hidden');

        
            tabApplied.classList.add('border-blue-600', 'font-semibold');
            tabApplied.classList.remove('text-gray-500');
        
            tabBookmarked.classList.remove('border-blue-600', 'font-semibold');
            tabBookmarked.classList.add('text-gray-500');
        });
    }
    if(tabBookmarked){
        tabBookmarked.addEventListener('click', async () => {
            // request to get all bookmarked jobs
            let bookmarkResponse = await bookmarkedJobs();
            let bookmarkData = null;
            if(bookmarkResponse.ok){
                let result = await bookmarkResponse.json()
                bookmarkData = result
            }else{
                let message = await bookmarkResponse.json()
                console.log(message)
            }
            appliedListC.innerHTML=''
            const appliedAside = document.querySelector('#appliedListaside');
            if(appliedAside){
                appliedAside.remove();
            }

            bookmarkedSection.classList.remove('hidden');
            appliedSection.classList.add('hidden');
            
            tabBookmarked.classList.add('border-blue-600', 'font-semibold');
            tabBookmarked.classList.remove('text-gray-500');
        
            tabApplied.classList.remove('border-blue-600', 'font-semibold');
            tabApplied.classList.add('text-gray-500');
            renderJobs(bookmarkListC,bookmarkData)
        });    
    }
});

async function appliedJobRequest(appliedListC, bookmarkListC){
    let appliedResponse = await appliedJobs();
    let appliedData = null
    if(appliedResponse.ok){
        let result = await appliedResponse.json()
        appliedData = result
    }else{
        let message = await appliedResponse.json()
        console.log(message)
    }
    bookmarkListC.innerHTML = ''
    const bookmarkAside = document.querySelector('#bookmarkedListaside')
    if(bookmarkAside){
        bookmarkAside.remove();
    }
    renderJobs(appliedListC,appliedData)
}