# Job Board
## Overview
  The goal of this project is to demonstrate building end-to-end application with configuration for deployment and to host it. 
  As the title says this application is designed for candidates and recruiters to apply for and post jobs with emailing system to keep users notified.
## ER Diagram
![job board ER diagram](https://github.com/Ashir1501/Images/blob/main/job_board_er_diagram.png)
## ScreenShots
- login view
![job board login view](https://github.com/Ashir1501/Images/blob/main/job_board_login_view.png)
- candidate view
![job board candidate view](https://github.com/Ashir1501/Images/blob/main/job_board_ca_view.png)
- recruiter view
![job board recruiter view](https://github.com/Ashir1501/Images/blob/main/job_board_re_view.png)
## Live link
Click this [link](https://job-board-w7a7.onrender.com) to view live application
## Prerequisites
python 3.8, node 24.13.1 (node mainly for tailwindcss), docker 20.10.21
## Tech Stack
  - Backend (django rest framework, dj-rest-auth)
  - frontend (vanilla js and tailwindcss)
## Installation
  - git clone https://github.com/Ashir1501/job_board.git
  - cd job_board
  - create .env file to configure environment variables (refer .env.example)
  - docker compose build
  - docker compose up
  - for local development change link of all templates in (path -> accounts/templates/account/email)\
    from (website.com/auth-api/dj-rest-auth/confirm-email/{{ key }})\
    to (http://localhost:8000/auth-api/dj-rest-auth/confirm-email/{{ key }})
## Deployment Configuration
  - Uses render platform to host application - free tier
  - first use the steps above to install
  - push your code to github
  - deployment does not use docker-compose.yml and .env file
  - create a postgres service in render - free tier
  - use cloudinary storage to store resume - free tier
  - sign up to brevo or any similar service for emailbackend - free tier
  - use upstash to avail services for redis - free tier
  - create a web service in render and configure environment variable 
  ### Environment variables on render web service
  - BREVO_API_KEY
  - CELERY_BROKER_URL, CELERY_RESULT_BACKEND - uses upstash redis tcp url
  - CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME - from cloudinary
  - DATABASE_URL - uses render postgres service internal database url
  - DEBUG, DJANGO_SETTINGS_MODULE, JWT_SIGNING_KEY, SECRET_KEY, EMAIL_USE_TLS, EMAIL_USE_SSL
  - EMAIL_SENDER - a application specific email (your brevo email)
  - EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, EMAIL_HOST - from brevo 
