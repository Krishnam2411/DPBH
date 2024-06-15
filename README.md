<div align="center">
  <img height="100px" src="https://github.com/Krishnam2411/DPBH/assets/124492864/0d0e82ab-e14a-4e3b-b4c9-7e20a8a0828d"/>
  <h1>Dark Pattern Buster Hackathon 2023</h1>
</div>
<br>

## Table of Contents

- [Introduction](#introduction)
- [Project Overview](#project-overview)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Team Members](#team-members)

## Introduction

Welcome to the Dark Pattern Buster Hackathon 2023 project by Team Z. Our goal is to identify and mitigate dark patterns in user interfaces, making the web a more user-friendly place.

<br>

## Project Overview

### Problem Statement

Dark patterns are deceptive design practices used to trick users into taking actions they might not otherwise take. These patterns can lead to frustration, loss of trust, and even financial loss.

### Our Solution

We have developed a broswer extension that scans websites for common dark patterns and provides actionable insights to improve user experience. The extension highlights issues and suggests alternatives, promoting ethical design practices.

<br>

## Installation

### Frontend Setup
1. Clone the repository:
    ```bash
      git clone https://github.com/Krishnam2411/DPBH.git
    ```
2. **Navigate to the frontend extension directory**:
    ```bash
      cd ../extension
    ```
3. **For all browsers, installation is different**:
    - chrome :
      - Enter "chrome://extensions/" in the URL bar.
      - Turn "ON" the developers option (if not already), and click on "Load unpacked" in the toolbar.
      - Select the extension's directory and hit "Enter".
    - Edge :
      - Enter "edge://extensions/" in the URL bar.
      - Turn "ON" the developers option (if not already), and click on "Load unpacked" option.
      - Select the extension's directory and hit "Enter".
> For chromium based browsers only

### Backend Setup
1. Navigate to the Backend directory:
    ```bash
      cd /api
    ```
2. Download and Set Up the Model:
     - Download the trained model from the following link:
       https://drive.google.com/drive/folders/1meieJk9s0Mi4Vf-_6QPrdtL-xRds-3oc?usp=drive_link
     - Create a directory for the model:
       ```bash
          mkdir -p ./core/models
       ```
     - Move the downloaded model files to the newly created models directory.
3. Set Up Environment Variables:
     - Create a .env file in the project root directory:
       ```bash
         touch .env
       ```
     - Edit the .env file to include the following environment variables:
       ```env
         MODEL_PATH=./core/models/
         IMAGEDIR="screenshots/"
         URL_FILE='data/urls.txt'
         HOST='127.0.0.1'
         PORT=8000
         db_key="your-neon-tech-key"
       ```
      - Get your unique key from [Neon.tech](https://neon.tech/) by creating an account or logging in, and replace your-neon-tech-key with your actual key.
4. Build the Docker Image:
  ```bash
    docker build -t dark-pattern-buster .
  ```

<br>

## Usage

After docker image is built, you can run the image by running follwowing command:
  ```bash
      docker run -d -p 8000:8000 --env-file .env dark-pattern-buster
  ``` 

Follow the on-screen instructions to scan a website for dark patterns and view the results.

<br>

## Technologies Used
  - **Frontend**: Browser Extension (HTML, CSS, JavaScript)
  - **Backend**: Python, FastAPI
  - **Database**: Neon, mySql
  - **Deployment**: Docker

<br>

## Team Members
  - **Sohail Kazi**
  - **Sacheth Koushik**
  - **Saptarshi Adhikari**
  - **Suraj Gupta**
  - **Krishnam Maheshwari**
