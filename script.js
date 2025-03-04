let currentUser = "";
let users = {};
const githubToken = 'YOUR_GITHUB_TOKEN'; // NEVER HARDCODE IN PRODUCTION
const modelRepoBaseURL = 'https://api.github.com/repos/nicolas-wall/3D-viewer/contents/models/';

// Load users from users.json
fetch('users.json')
    .then(response => response.json())
    .then(data => {
        users = data;
        console.log("Loaded users:", data);
    })
    .catch(error => console.error('Error loading users:', error));

// Show login form
document.getElementById('login-container').style.display = "block";

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    console.log("Username entered:", username);
    console.log("Password entered:", password);
    console.log("Users object:", users);

    const isValid = users[username] && users[username] === password;
    console.log("Login valid:", isValid);

    if (isValid) {
        currentUser = username;
        document.getElementById('login-container').style.display = "none";
        document.getElementById('viewer-container').style.display = "block";
        document.getElementById('username-display').textContent = username;
        loadProjectList(username); // Load projects instead of models directly
    } else {
        document.getElementById('error-msg').innerText = "Invalid username or password.";
    }
}

function logout() {
    currentUser = "";
    document.getElementById('login-container').style.display = "block";
    document.getElementById('viewer-container').style.display = "none";
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
}

//New function to load projects
async function loadProjectList(username) {
    const projectListDiv = document.getElementById('projectList');
    projectListDiv.innerHTML = ''; // Clear existing content

    try {
        const userFolderURL = `${modelRepoBaseURL}${username}`;
        const response = await fetch(userFolderURL, {
            headers: {
                'Authorization': `token ${githubToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user folder: ${response.status}`);
        }

        const folders = await response.json();

        for (const item of folders) {
            if (item.type === 'dir') { // Check if it's a directory (project folder)
                const projectDiv = document.createElement('div');
                projectDiv.classList.add('project');

                const projectHeader = document.createElement('h2');
                projectHeader.textContent = item.name;
                projectHeader.addEventListener('click', () => {
                    projectDiv.classList.toggle('active'); // Toggle active class for collapsing/expanding
                });

                const modelList = document.createElement('ul');
                await loadModelList(username, item.name, modelList); // Load models for the project

                projectDiv.appendChild(projectHeader);
                projectDiv.appendChild(modelList);
                projectListDiv.appendChild(projectDiv);
            }
        }
    } catch (error) {
        console.error("Error loading project list:", error);
        projectListDiv.innerHTML = '<p>Failed to load projects.</p>';
    }
}

// Modified function to load models for a specific project
async function loadModelList(username, projectName, modelList) {
    try {
        const projectFolderURL = `${modelRepoBaseURL}${username}/${projectName}`;
        const response = await fetch(projectFolderURL, {
            headers: {
                'Authorization': `token ${githubToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch project folder: ${response.status}`);
        }

        const models = await response.json();

        for (const file of models) {
            if (file.name.endsWith('.glb')) {
                const modelItem = document.createElement('li');
                const modelLink = document.createElement('a');
                modelLink.href = '#';
                modelLink.textContent = file.name.replace('.glb', '');
                modelLink.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent page from jumping to top
                    loadModel(file.download_url);
                });

                modelItem.appendChild(modelLink);
                modelList.appendChild(modelItem);
            }
        }
    } catch (error) {
        console.error(`Error loading models for project ${projectName}:`, error);
        modelList.innerHTML = '<li>Failed to load models.</li>';
    }
}

function loadModel(modelURL) {
    const modelViewer = document.getElementById('modelViewer');
    modelViewer.src = modelURL;
}

const modelViewer = document.getElementById('modelViewer');
modelViewer.addEventListener('progress', (event) => {
    const progressBar = modelViewer.querySelector('.progress-bar');
    const updateBar = modelViewer.querySelector('.update-bar');
    if (event.detail.totalProgress === 1) {
        progressBar.classList.remove('show');
        updateBar.classList.remove('show');
    } else {
        progressBar.classList.add('show');
        updateBar.classList.add('show');
        const progress = Math.min(event.detail.totalProgress, 1);
        updateBar.style.width = `${progress * 100}%`;
    }
});