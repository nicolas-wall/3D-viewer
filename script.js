let currentUser = "";
let users = {};

// Load users from users.json
fetch('users.json')
    .then(response => response.json())
    .then(data => users = data)
    .catch(error => console.error('Error loading users:', error));

// Show login form
document.getElementById('login-container').style.display = "block";

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (users[username] && users[username] === password) {
        currentUser = username;
        document.getElementById('login-container').style.display = "none";
        document.getElementById('viewer-container').style.display = "block";
        document.getElementById('username-display').textContent = username;
        loadModelList(username);
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

async function loadModelList(username) {
    try {
        const dropdown = document.getElementById('modelDropdown');
        dropdown.innerHTML = `<option value="" disabled selected>Select a model</option>`;

        const folderURL = `https://api.github.com/repos/nicolas-wall/3D-viewer/contents/models/${username}`;
        const response = await fetch(folderURL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        data.forEach(file => {
            if (file.name.endsWith('.glb')) {
                let option = document.createElement('option');
                option.value = file.download_url;
                option.textContent = file.name.replace('.glb', '');
                dropdown.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading models:', error);
        document.getElementById('error-msg').innerText = "Failed to load model list.  Check console for details.";
    }
}

document.getElementById('modelDropdown').addEventListener('change', function() {
    const modelViewer = document.getElementById('modelViewer');
    modelViewer.src = this.value;
});

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