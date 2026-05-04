import accountLogin from './api/account_login.js'
import accountRegister from './api/account_register.js';
import jobFilter from './api/job_api.js';
import renderJobs from './ui/job_render.js';
import post_application from './api/application_post.js';
import { bookmarkedJobs, appliedJobs } from './api/job_api.js';
import { messageBox } from './ui/main_render.js';

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
    // if(location.href.includes('/home/')){
    //     console.log(location.href)
    //     history.pushState(null, null, location.href);
    //     // window.onpopstate = function () {
    //     //     history.go(1);
    //     // };
    // }

    // login request
    const loginFormElem = document.getElementById('login-form');
    if (loginFormElem) {
        loginFormElem.onsubmit = async (e) => {
            e.preventDefault();

            let response = await accountLogin(loginFormElem)
            if (response.ok) {
                let result = await response.json();
                console.log(result);
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
                console.log(result);
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
                console.log(data)
                const container = document.getElementById('jobList');
                renderJobs(container, data)

            } else {
                let err = await response.json()
                console.log(err)
                messageBox({error:err})
            }
        })
    }

});

document.addEventListener('click', function (event) {
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
                console.log(result)
                messageBox({content:'You will receive an email about this application soon.'})
            }else{
                let err = await response.json()
                console.log(err)
                messageBox({error:err})
            }
        }
    }

});