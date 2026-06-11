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

## Architecture

### Backend

Django, DRF, [dj-rest-auth](https://dj-rest-auth.readthedocs.io/en/latest/getting-started/installation/), Celery, Redis, Docker

### Database

Postgres

### Frontend

Django Templates, Tailwind CSS, Vanilla JavaScript

### Django, DRF

The batteries-included framework that serves as the foundation of the application. Most of the REST APIs are built using DRF ViewSets, Routers and api_view.

The API uses throttling to rate-limit requests on a rate/minute and rate/day basis.

The API also uses permission classes to make sure only specific users have authorization to access certain views and perform specific actions.

DRF serializers are used to validate incoming data and convert model instances into JSON responses.

### dj-rest-auth

A third-party library used for authentication. It's mainly used for keeping JWT tokens in HTTP-only cookies and provides predefined API views for registering users, logging in, regenerating refresh/access tokens, resetting passwords, resending email verification, confirming email verification, etc.

Under the hood it uses [django-allauth](https://docs.allauth.org/en/latest/) for more complex authentication features such as social authentication (Login with Google, GitHub, etc.). In this application it's mainly used for email verification.
  
### Celery

Celery is used to execute tasks in the background using Celery workers.

It's mainly used for sending emails asynchronously so the user doesn't have to wait for the email operation to complete before receiving a response.

### Redis

An in-memory data store used as both the Celery broker and cache backend.

For Celery, Redis is used to queue background tasks which are then picked up by Celery workers.

For caching, Redis stores frequently accessed data to reduce database queries and improve performance.

Currently caching is implemented only on the profile page. Additional caching can be added to other parts of the application later.

### Docker

The application is containerized using Docker.

For local development, a docker-compose file is used to run multiple services such as the web application, PostgreSQL database and Redis.

In the production environment, only the Dockerfile is used and individual services are hosted separately. PostgreSQL is hosted as a managed database service, the web application is hosted on Render, Redis is hosted on Upstash, emails are sent through Brevo and resumes are uploaded to Cloudinary.

### Database

PostgreSQL is used as the primary relational database for storing application data.

The database stores users, jobs, applications, bookmarks, profile information and other application-related data.

### Frontend

The main focus of the project was backend development, so no frontend framework or JavaScript library was introduced.

Django Templates are used to render HTML pages and Tailwind CSS utility classes are used for styling.

To add behaviour and interactivity, vanilla JavaScript is used throughout the application.

The frontend also maintains client-side state to improve the user experience. This is mainly used to track application and bookmark states so the UI can update without requiring a full page refresh.
  
The implementation can be found mainly in `job_render.js` and `application_render.js` inside the static folder.

## Testing

There are currently 21 unit tests written to verify core application features.

The tests cover API endpoints related to user accounts, job creation and updates, applications, application status transitions, permissions and other important functionality.

These tests provide a basic level of confidence in the application and more comprehensive test coverage can be added in the future.

## CI/CD
GitHub Actions is used for Continuous Integration (CI). On every push, the workflow builds the application and runs the test suite.

For deployment, once the Testing workflow is completed the deployment workflow is triggered. It checks the status of testing workflow to be success, if this condition is met the render deployment hook is executed.  
This provides a simple Continuous Deployment (CD) workflow.

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
  - create a postgres service in render -environment: production free tier
  - use cloudinary storage to store resume - free tier
  - sign up to brevo or any similar service for emailbackend - free tier
  - use upstash to avail services for redis - free tier
  - create a web service in render and configure environment variable 
  ### Environment variables on render web service
  - BREVO_API_KEY
  - CELERY_BROKER_URL, CELERY_RESULT_BACKEND, REDIS_URL - uses upstash redis tcp url
  - CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME - from cloudinary
  - DATABASE_URL - uses render postgres service internal database url
  - DEBUG, DJANGO_SETTINGS_MODULE, JWT_SIGNING_KEY, SECRET_KEY, EMAIL_USE_TLS, EMAIL_USE_SSL
  - EMAIL_SENDER - a application specific email (your brevo email)
  - EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, EMAIL_HOST - from brevo 
