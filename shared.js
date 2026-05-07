// ── SHARED UTILITIES ────────────────────────────────────────────

function getUserPhone() { return sessionStorage.getItem('userPhone'); }
function getCurrentAccountId() { return sessionStorage.getItem('currentAccountId'); }

function getCurrentUserData() {
    const phone = getUserPhone();
    if (!phone) return null;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const phoneData = users[phone];
    if (!phoneData || !phoneData.accounts) return null;
    const accountId = getCurrentAccountId();
    const account = phoneData.accounts.find(acc => acc.accountId === accountId);
    if (!account) return null;
    return { phone, phoneData, account };
}

function checkAuth(redirectOnFail) {
    if (redirectOnFail === undefined) redirectOnFail = true;
    const phone = getUserPhone();
    const accountId = getCurrentAccountId();
    if (!phone || !accountId) {
        if (redirectOnFail) window.location.href = 'index.html';
        return false;
    }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const phoneData = users[phone];
    if (!phoneData || !phoneData.accounts) {
        if (redirectOnFail) window.location.href = 'index.html';
        return false;
    }
    const account = phoneData.accounts.find(acc => acc.accountId === accountId);
    if (!account) {
        if (redirectOnFail) window.location.href = 'index.html';
        return false;
    }
    return true;
}

function isLoggedIn() { return checkAuth(false); }

function logout() {
    sessionStorage.removeItem('userPhone');
    sessionStorage.removeItem('currentAccountId');
    sessionStorage.removeItem('currentPage');
    window.location.href = 'index.html';
}

function confirmLogout() {
    showConfirmModal('Are you sure you want to log out?', function() { logout(); }, null);
}

function switchToAccount(accountId) {
    sessionStorage.setItem('currentAccountId', accountId);
    window.location.reload();
}

function navigateTo(url) { window.location.href = url; }

function openNav() {
    document.getElementById('mySidebar').style.width = '270px';
    document.getElementById('mySidebar').style.boxShadow = '4px 0 60px rgba(0,0,0,0.25)';
}

function closeNav() { document.getElementById('mySidebar').style.width = '0'; }

// ── DARK MODE ───────────────────────────────────────────────────
function initDarkMode() {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') document.body.classList.add('dark');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

// ── EXAM HISTORY ─────────────────────────────────────────────────
function getUserExamHistory() {
    const data = getCurrentUserData();
    if (!data) return [];
    return data.account.examHistory || [];
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
    return (data && data.account.dashboardRange) ? data.account.dashboardRange : 'last7days';
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
    return (data && data.account.dashboardCategory) ? data.account.dashboardCategory : 'national';
}

function setUserDashboardCategory(cat) {
    const data = getCurrentUserData();
    if (!data) return;
    data.account.dashboardCategory = cat;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[data.phone] = data.phoneData;
    localStorage.setItem('users', JSON.stringify(users));
}

// ── SIDEBAR BUILDER ──────────────────────────────────────────────
function buildSidebar(currentPage) {
    const loggedIn = isLoggedIn();
    const linksContainer = document.getElementById('sidebarLinks');
    if (!linksContainer) return;

    const allLinks = [
        { label: 'Home', icon: 'Home.png', url: 'home.html', key: 'home' },
        { label: 'Exams', icon: 'Exams.png', url: 'exams.html', key: 'exams' },
        { label: 'Dashboard', icon: 'Dashboard.png', url: 'dashboard.html', key: 'dashboard' },
        { label: 'Account', icon: 'Account.png', url: 'account.html', key: 'account' }
    ];

    let html = '';
    allLinks.forEach(link => {
        if (!loggedIn && (link.key === 'dashboard' || link.key === 'account')) return;
        const isCurrent = currentPage === link.key;
        html += `<a href="${link.url}" style="${isCurrent ? 'font-weight:700;opacity:0.85;' : ''}display:flex;align-items:center;">
            <img src="${link.icon}" style="width:20px;height:20px;margin-right:12px;" onerror="this.style.display='none'">
            ${link.label}
        </a>`;
    });

    if (!loggedIn) {
        html += `<a href="index.html" style="display:flex;align-items:center;">
            <img src="Account.png" style="width:20px;height:20px;margin-right:12px;" onerror="this.style.display='none'">
            Login
        </a>`;
    }

    linksContainer.innerHTML = html;

    const sidebarHeader = document.getElementById('sidebarUserHeader');
    const logoutLink = document.querySelector('.sidebar .logout');
    if (!loggedIn) {
        if (sidebarHeader) sidebarHeader.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
    } else {
        if (sidebarHeader) sidebarHeader.style.display = '';
        if (logoutLink) logoutLink.style.display = '';
    }
}

// ── MODAL HELPERS ────────────────────────────────────────────────
function showMessageModal(message, onOk) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `<div class="modal-content"><h4>${message}</h4><div class="modal-buttons"><button class="modal-confirm" id="msgOkBtn">OK</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#msgOkBtn').onclick = () => {
        modal.remove();
        if (onOk) onOk();
    };
}

function showConfirmModal(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `<div class="modal-content"><h4>${message}</h4><div class="modal-buttons"><button class="modal-confirm" id="confirmYes">Yes</button><button class="modal-cancel" id="confirmNo">No</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#confirmYes').onclick = () => {
        modal.remove();
        if (onConfirm) onConfirm();
    };
    modal.querySelector('#confirmNo').onclick = () => {
        modal.remove();
        if (onCancel) onCancel();
    };
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            modal.remove();
            if (onCancel) onCancel();
        }
    });
}

function showPromptModal(title, placeholder, onSubmit) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `<div class="modal-content"><h4>${title}</h4><div class="modal-buttons" style="flex-direction:column;gap:8px;"><input type="password" id="promptInput" placeholder="${placeholder}" maxlength="6" inputmode="numeric" style="width:100%;padding:10px 14px;border:1px solid var(--border-light);border-radius:30px;background:var(--option-bg,#e8e3d8);color:var(--text-primary,#0a0a0a);font-family:'DM Sans',sans-serif;font-size:0.92rem;outline:none;"><div style="display:flex;gap:10px;justify-content:center;"><button class="modal-confirm" id="promptOk">Confirm</button><button class="modal-cancel" id="promptCancel">Cancel</button></div></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#promptOk').onclick = () => {
        const val = modal.querySelector('#promptInput').value;
        modal.remove();
        onSubmit(val);
    };
    modal.querySelector('#promptCancel').onclick = () => {
        modal.remove();
        onSubmit(null);
    };
    setTimeout(() => modal.querySelector('#promptInput')?.focus(), 100);
}
