// shared.js - Bete Fetena
// Backend URL (Render)
window.API_BASE_URL = 'https://bete-fetena-backend.onrender.com';

function getUserPhone() {
    return sessionStorage.getItem('userPhone');
}

function getCurrentAccountId() {
    return sessionStorage.getItem('currentAccountId');
}

function getCurrentUserData() {
    try {
        const phone = getUserPhone();
        const accountId = getCurrentAccountId();
        if (!phone || !accountId) return null;
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const phoneData = users[phone];
        if (!phoneData || !phoneData.accounts) return null;
        const account = phoneData.accounts.find(acc => acc.accountId === accountId);
        if (!account) return null;
        return { phone, phoneData, account };
    } catch(e) { return null; }
}

function getUserExamHistory() {
    const data = getCurrentUserData();
    return data ? (data.account.examHistory || []) : [];
}

function saveUserExamHistory(history) {
    const data = getCurrentUserData();
    if (!data) return;
    data.account.examHistory = history;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[data.phone] = data.phoneData;
    localStorage.setItem('users', JSON.stringify(users));
}

function getUserDashboardRange() {
    const data = getCurrentUserData();
    return data ? (data.account.dashboardRange || 'last7days') : 'last7days';
}

function setUserDashboardRange(range) {
    const data = getCurrentUserData();
    if (!data) return;
    data.account.dashboardRange = range;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[data.phone] = data.phoneData;
    localStorage.setItem('users', JSON.stringify(users));
}

function getUserDashboardCategory() {
    const data = getCurrentUserData();
    return data ? (data.account.dashboardCategory || 'national') : 'national';
}

function setUserDashboardCategory(cat) {
    const data = getCurrentUserData();
    if (!data) return;
    data.account.dashboardCategory = cat;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[data.phone] = data.phoneData;
    localStorage.setItem('users', JSON.stringify(users));
}

function checkAuth() {
    const phone = getUserPhone();
    const accountId = getCurrentAccountId();
    if (!phone || !accountId) {
        window.location.href = 'index.html';
        return false;
    }
    const data = getCurrentUserData();
    if (!data) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function logout() {
    sessionStorage.clear();
    localStorage.removeItem('currentAccountId');
    window.location.href = 'index.html';
}

function confirmLogout() {
    showConfirmModal('Are you sure you want to log out?', logout);
}

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
    // optional
}

function switchToAccount(accountId) {
    const phone = getUserPhone();
    if (!phone) return;
    sessionStorage.setItem('currentAccountId', accountId);
    window.location.reload();
}