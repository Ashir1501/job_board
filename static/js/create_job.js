import { createJob } from "./api/job_api.js";
import { messageBox } from "./ui/main_render.js";
import { updatePreview, wrapMarkdown, insertMarkdown } from "./ui/job_render.js";

document.addEventListener('input', function(event){
    const textarea = document.getElementById('markdown-input');
    if(textarea && textarea.contains(event.target)){
        updatePreview();
    }    
});

document.addEventListener('submit',async function(event){
    const jobFormEle = document.getElementById('jobForm');

    if(jobFormEle && jobFormEle.contains(event.target)){
        event.preventDefault()
        const response = await createJob(jobFormEle);
        if(response.ok){
            let result = await response.json()
            messageBox({content:'Job created Successfully'})
            jobFormEle.reset()
        }else{
            let err = await response.json();
            messageBox({error:err})
        }
    }
});

document.addEventListener('click',function(event){
    const textarea = document.getElementById('markdown-input')
    if(textarea){
        if(event.target.closest('#wrap-bold-btn')){
            wrapMarkdown(textarea,'**');
        }else if(event.target.closest('#wrap-italic-btn')){
            wrapMarkdown(textarea,'*');
        }else if(event.target.closest('#insert-list-btn')){
            insertMarkdown(textarea,'\n- ');
        }else if(event.target.closest('#insert-numbered-btn')){
            insertMarkdown(textarea,'\n1. ');
        }else if(event.target.closest('#insert-h1-btn')){
            insertMarkdown(textarea,'# ');
        }else if(event.target.closest('#insert-h2-btn')){
            insertMarkdown(textarea,'## ');
        }else if(event.target.closest('#insert-h3-btn')){
            insertMarkdown(textarea,'### ');
        }else if(event.target.closest('#insert-link-btn')){
            insertMarkdown(textarea,'[text](https://)');
        }else if(event.target.closest('#add-location-btn')){
            addLocation();
        }else if(event.target.closest('#remove-loc-btn')){
            const locationIdx = event.target.dataset.locationIdx
            removeLocation(locationIdx);
        }
    }
});



// Locations logic ---------------------------------------------------------------
let locations = [];

function addLocation() {
    const city = document.getElementById('city').value.trim();
    const country = document.getElementById('country').value.trim();

    if (!city || !country) return;

    const loc = { city, country };
    locations.push(loc);

    renderLocations();

    document.getElementById('city').value = '';
    document.getElementById('country').value = '';
}

function removeLocation(index) {
    locations.splice(index, 1);
    renderLocations();
}

function renderLocations() {
    const container = document.getElementById('locationTags');
    container.innerHTML = '';

    locations.forEach((loc, i) => {
        const tag = document.createElement('div');
        tag.className = 'flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-full';
        tag.innerHTML = `${loc.city}, ${loc.country} <button id='remove-loc-btn' data-location-idx='${i}'>×</button>`;
        container.appendChild(tag);
    });

    document.getElementById('locationsInput').value = JSON.stringify(locations);
}


document.addEventListener('reset', function(){
    const jobForm = document.getElementById('jobForm');
    const locationTags = document.getElementById('locationTags');
    const mkPreview = document.getElementById('markdown-preview');
    if(jobForm && event.target.contains(jobForm)){
        locationTags.innerHTML = '';
        mkPreview.innerHTML = '';
        locations = []
    }
});
// -----------------------------------------------------------------------------