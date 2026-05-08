// shared.js - Bete Fetena (Full MongoDB integration)
window.API_BASE_URL = 'https://bete-fetena-backend.onrender.com'; // ✅ Change if your Render URL is different

// ------------------------------------------------------------------
// Current user cache (holds data after login / page load)
let cachedUserData = null;

// ------------------------------------------------------------------
// Session helpers
function getUserPhone() { return sessionStorage.getItem('userPhone'); }
function getCurrentAccountId() { return sessionStorage.getItem('currentAccountId'); }

// Fetch fresh user data from backend (async)
async function refreshCurrentUser() {
    const phone = getUserPhone();
    const accountId = getCurrentAccountId();
    if (!phone || !accountId) {
        cachedUserData = null;
        return null;
    }
    try {
        const res = await fetch(`${window.API_BASE_URL}/api/users/getData`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, accountId })
        });
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        cachedUserData = { phone, account: data.account };
        return cachedUserData;
    } catch (err) {
        console.error('refreshCurrentUser error:', err);
        cachedUserData = null;
        return null;
    }
}

// Synchronous getter (may return stale data until refreshCurrentUser is called)
function getCurrentUserData() { return cachedUserData; }

// ------------------------------------------------------------------
// Exam history
async function getUserExamHistory() {
    const user = await refreshCurrentUser();
    return user ? (user.account.examHistory || []) : [];
}

async function saveUserExamHistory(history) {
    const phone = getUserPhone();
    const accountId = getCurrentAccountId();
    if (!phone || !accountId) return;
    try {
        await fetch(`${window.API_BASE_URL}/api/users/updateAccount`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, accountId, updates: { examHistory: history } })
        });
        if (cachedUserData) cachedUserData.account.examHistory = history;
    } catch (err) {
        console.error('saveUserExamHistory error:', err);
    }
}

// ------------------------------------------------------------------
// Dashboard preferences
async function getUserDashboardRange() {
    const user = await refreshCurrentUser();
    return user ? (user.account.dashboardRange || 'last7days') : 'last7days';
}

async function setUserDashboardRange(range) {
    const phone = getUserPhone();
    const accountId = getCurrentAccountId();
    if (!phone || !accountId) return;
    try {
        await fetch(`${window.API_BASE_URL}/api/users/updateAccount`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, accountId, updates: { dashboardRange: range } })
        });
        if (cachedUserData) cachedUserData.account.dashboardRange = range;
    } catch (err) {
        console.error('setUserDashboardRange error:', err);
    }
}

async function getUserDashboardCategory() {
    const user = await refreshCurrentUser();
    return user ? (user.account.dashboardCategory || 'national') : 'national';
}

async function setUserDashboardCategory(cat) {
    const phone = getUserPhone();
    const accountId = getCurrentAccountId();
    if (!phone || !accountId) return;
    try {
        await fetch(`${window.API_BASE_URL}/api/users/updateAccount`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, accountId, updates: { dashboardCategory: cat } })
        });
        if (cachedUserData) cachedUserData.account.dashboardCategory = cat;
    } catch (err) {
        console.error('setUserDashboardCategory error:', err);
    }
}

// ------------------------------------------------------------------
// Authentication guard (async-free, uses sessionStorage)
function checkAuth() {
    const phone = getUserPhone();
    const accountId = getCurrentAccountId();
    if (!phone || !accountId) {
        window.location.href = 'index.html';
        return false;
    }
    // Note: refreshCurrentUser will be called on each page load
    return true;
}

// Logout (clear session)
function logout() {
    sessionStorage.clear();
    cachedUserData = null;
    window.location.href = 'index.html';
}

function confirmLogout() {
    showConfirmModal('Are you sure you want to log out?', logout);
}

// ------------------------------------------------------------------
// Modals (unchanged, but kept for compatibility)
function showConfirmModal(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="modal-confirm" id="confirmYes">Yes</button>
                <button class="modal-cancel" id="confirmNo">No</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#confirmYes').onclick = () => { modal.remove(); if(onConfirm) onConfirm(); };
    modal.querySelector('#confirmNo').onclick = () => { modal.remove(); if(onCancel) onCancel(); };
}

function showMessageModal(msg, callback) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <p>${msg}</p>
            <div class="modal-buttons">
                <button class="modal-confirm" id="msgOk">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#msgOk').onclick = () => { modal.remove(); if(callback) callback(); };
}

function showPromptModal(title, placeholder, callback) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h4>${title}</h4>
            <input type="password" id="promptInput" placeholder="${placeholder}" maxlength="6">
            <div class="modal-buttons">
                <button class="modal-confirm" id="promptOk">OK</button>
                <button class="modal-cancel" id="promptCancel">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#promptOk').onclick = () => {
        const val = modal.querySelector('#promptInput').value.trim();
        modal.remove();
        if (callback) callback(val);
    };
    modal.querySelector('#promptCancel').onclick = () => modal.remove();
}

function maskPhone(phone) {
    if (!phone) return '';
    if (phone.length <= 6) return phone;
    return phone.substring(0,4) + '•'.repeat(phone.length-7) + phone.substring(phone.length-3);
}

// ------------------------------------------------------------------
// Dark mode & sidebar (unchanged)
function initDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
}

function toggleDarkMode() {
    if (document.body.classList.contains('dark')) {
        document.body.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
    } else {
        document.body.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    }
}

function buildSidebar(currentPage) {
    const sidebarLinks = document.getElementById('sidebarLinks');
    if (!sidebarLinks) return;
    const links = [
        { name: 'Home', href: 'home.html', icon: 'Home.png' },
        { name: 'Exams', href: 'exams.html', icon: 'Exams.png' },
        { name: 'Dashboard', href: 'dashboard.html', icon: 'Dashboard.png' },
        { name: 'Account', href: 'account.html', icon: 'Account.png' }
    ];
    let html = '';
    links.forEach(link => {
        const active = (currentPage === link.name.toLowerCase()) ? 'style="background:rgba(255,165,0,0.1);"' : '';
        html += `<a href="${link.href}" ${active}><img src="${link.icon}" style="width:20px;height:20px;margin-right:12px;">${link.name}</a>`;
    });
    sidebarLinks.innerHTML = html;
}

function openNav() {
    document.getElementById("mySidebar").style.width = "280px";
    document.getElementById("main").style.marginLeft = "0px";
    document.body.style.overflow = "hidden";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.body.style.overflow = "";
}

function navigateTo(url) {
    window.location.href = url;
}

function refreshNavbarProfile() {
    // optional – called after profile pic change
}

function switchToAccount(accountId) {
    const phone = getUserPhone();
    if (!phone) return;
    sessionStorage.setItem('currentAccountId', accountId);
    window.location.reload();
}