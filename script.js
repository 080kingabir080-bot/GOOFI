/**
 * GOOFI TOOLS - CORE SYSTEM ENGINE
 * Developer: Shimon
 */

const CONFIG = {
    ADMIN_EMAIL: "movies0pop0@gmail.com",
    FORMSPREE_ID: "YOUR_ID_HERE", // החלף ב-ID האמיתי
    PLAN_DURATIONS: ["3 חודשים", "6 חודשים", "12 חודשים"]
};

const TOOLS = [
    { name: "מנהל מטבעות וירטואלי", tier: "FREE", url: "https://coin-me-virtual.youware.app", img: "https://share.google/xbehxjMMx3hBcvFhz" },
    { name: "מרכז שליטה C2", tier: "SILVER", url: "https://c2-command-control.youware.app", img: "https://share.google/WtBRoyhcv06TI2vYK" },
    { name: "City Builder Strategic", tier: "SILVER", url: "https://rosebud.ai/p/city-builder-one-piece-74", img: "https://share.google/EQlIltRdcBykeNXef" },
    { name: "Global Domination RTL", tier: "GOLD", url: "https://rosebud.ai/p/global-domination-rtl", img: "https://share.google/thHo6g3kGqhIOacwR" },
    { name: "Master Plan Execution", tier: "GOLD", url: "https://revenge-master-plan--adamhasam.replit.app", img: "https://share.google/Qb8DsWTj8uZFvNpBW" },
    { name: "Business Caesar Pro", tier: "DIAMOND", url: "https://business-caesar.youware.app/", img: "https://share.google/IZtsZ9NIySjE4plvS" },
    { name: "Interstellar Builder", tier: "DIAMOND", url: "https://buildwithstar.com/games/d59607f5-4079-4e6b-890b-7a7f4192d250", img: "https://share.google/hHu1E2tum9qbNm5EN" }
];

let state = {
    user: JSON.parse(localStorage.getItem('goofi_session')) || null,
    isSidebarOpen: false
};

// אתחול מערכת
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderTools();
    updateUIStyles();
    attachListeners();
}

function attachListeners() {
    document.getElementById('profileBtn').onclick = toggleSidebar;
    document.getElementById('closeSidebar').onclick = toggleSidebar;
    document.getElementById('saveProfile').onclick = handleProfileUpdate;
    document.getElementById('logoutBtn').onclick = logout;
    document.getElementById('modalClose').onclick = closeModal;
}

// רינדור גריד כלים
function renderTools() {
    const grid = document.getElementById('toolsGrid');
    grid.innerHTML = TOOLS.map(tool => `
        <div class="tool-card" data-tier="${tool.tier}">
            <div class="tool-img-wrapper">
                <img src="${tool.img}" alt="${tool.name}">
            </div>
            <h3>${tool.name}</h3>
            <div class="tier-tag">${tool.tier}</div>
            <button class="btn-premium" onclick="accessTool('${tool.name}')">הפעל כלי</button>
        </div>
    `).join('');
}

// ניהול גישה
async function accessTool(toolName) {
    const tool = TOOLS.find(t => t.name === toolName);
    
    if (!state.user) {
        showAuthForm();
        return;
    }

    const tierPower = { "FREE": 0, "SILVER": 1, "GOLD": 2, "DIAMOND": 3 };
    if (tierPower[state.user.tier] < tierPower[tool.tier]) {
        showPricing(tool.tier);
        return;
    }

    runLoader(tool);
}

// מערכת טעינה וטיימר
function runLoader(tool) {
    const waitTimes = { "FREE": 20, "SILVER": 5, "GOLD": 0, "DIAMOND": 0 };
    const seconds = (state.user.tier === "FREE") ? waitTimes["FREE"] : (state.user.tier === "SILVER" ? waitTimes["SILVER"] : 0);

    if (seconds === 0) {
        window.open(tool.url, '_blank');
        return;
    }

    const loader = document.getElementById('loader');
    const timerText = document.getElementById('timerCount');
    loader.style.display = 'flex';
    
    let left = seconds;
    const interval = setInterval(() => {
        left--;
        timerText.innerText = left;
        if (left <= 0) {
            clearInterval(interval);
            loader.style.display = 'none';
            window.open(tool.url, '_blank');
        }
    }, 1000);
}

// טפסי רכישה ומנויים
function showPricing(targetTier) {
    const modalBody = document.getElementById('modalBody');
    document.getElementById('modalTitle').innerText = `שדרוג למנוי ${targetTier}`;
    
    modalBody.innerHTML = `
        <div class="pricing-container">
            ${CONFIG.PLAN_DURATIONS.map(d => `
                <div class="tier-box ${targetTier.toLowerCase()}" onclick="showPaymentForm('${targetTier}', '${d}')">
                    <h4>חבילת ${d}</h4>
                    <p>כל הכלים של ${targetTier} פתוחים עבורך</p>
                    <button class="btn-premium">בחר מסלול</button>
                </div>
            `).join('')}
        </div>
    `;
    openModal();
}

function showPaymentForm(tier, duration) {
    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <form class="purchase-form" id="payForm">
            <input type="text" id="pName" placeholder="שם מלא (2-12 תווים)" required maxlength="12">
            <input type="email" id="pEmail" value="${state.user.email}" readonly>
            <input type="text" id="pCard" placeholder="**** **** **** ****" maxlength="19" required>
            <div style="display:flex; gap:10px">
                <input type="text" id="pDate" placeholder="MM/YY" maxlength="5" required>
                <input type="text" id="pCvv" placeholder="CVV" maxlength="3" required>
            </div>
            <input type="text" id="pId" placeholder="תעודת זהות (9 ספרות)" maxlength="9" required>
            <button type="button" class="btn-premium" id="confirmPay">רכוש מנוי - ${tier}</button>
        </form>
    `;

    document.getElementById('pCard').oninput = (e) => {
        e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim();
    };

    document.getElementById('confirmPay').onclick = () => processPurchase(tier, duration);
}

async function processPurchase(tier, duration) {
    const btn = document.getElementById('confirmPay');
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Verifying...`;
    btn.style.background = "#222";

    const payload = {
        user: state.user.name,
        email: state.user.email,
        tier: tier,
        duration: duration,
        timestamp: new Date().toISOString()
    };

    // שליחה למנהל
    try {
        await fetch(`https://formspree.io/f/${CONFIG.FORMSPREE_ID}`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) { console.error("Email simulation failed"); }

    setTimeout(() => {
        state.user.tier = tier;
        localStorage.setItem('goofi_session', JSON.stringify(state.user));
        document.getElementById('modalBody').innerHTML = `
            <div style="text-align:center">
                <h2 style="color:var(--accent)">רכישה הושלמה! 🎉</h2>
                <p>מנוי ${tier} ל-${duration} הופעל בחשבונך.</p>
                <button class="btn-premium" onclick="location.reload()">התחל להשתמש</button>
            </div>
        `;
    }, 3000);
}

// ניהול פרופיל ואזור אישי
function toggleSidebar() {
    const sb = document.getElementById('profileSidebar');
    state.isSidebarOpen = !state.isSidebarOpen;
    sb.classList.toggle('open', state.isSidebarOpen);
    
    if (state.isSidebarOpen && state.user) {
        document.getElementById('editName').value = state.user.name;
        document.getElementById('editEmail').value = state.user.email;
        document.getElementById('statusTier').innerText = state.user.tier;
        document.getElementById('sidebarAvatar').src = state.user.avatar || `https://ui-avatars.com/api/?name=${state.user.name}`;
    }
}

function handleProfileUpdate() {
    const newName = document.getElementById('editName').value;
    if (newName.length < 2) return alert("שם קצר מדי");
    
    state.user.name = newName;
    localStorage.setItem('goofi_session', JSON.stringify(state.user));
    alert("עודכן בהצלחה!");
    location.reload();
}

function updateUIStyles() {
    if (!state.user) return;
    
    const dot = document.getElementById('statusDot');
    const navTier = document.getElementById('navTier');
    const frame = document.getElementById('avatarFrame');
    
    navTier.innerText = state.user.tier;
    document.getElementById('displayAvatar').src = state.user.avatar || `https://ui-avatars.com/api/?name=${state.user.name}`;

    if (state.user.tier === "SILVER") {
        document.body.style.border = "2px solid #bdc3c7";
        dot.style.background = "#bdc3c7";
        frame.style.border = "2px solid #bdc3c7";
    } else if (state.user.tier === "GOLD") {
        document.body.style.border = "3px solid #ffd700";
        dot.style.background = "#ffd700";
        frame.style.border = "3px solid #ffd700";
    } else if (state.user.tier === "DIAMOND") {
        document.body.classList.add('diamond-mode');
        dot.style.background = "#00f2ff";
        frame.classList.add('diamond-anim');
    }
}

// פונקציות עזר למודאל
function openModal() { document.getElementById('globalModal').style.display = 'flex'; }
function closeModal() { document.getElementById('globalModal').style.display = 'none'; }
function logout() { localStorage.clear(); location.reload(); }

function showAuthForm() {
    document.getElementById('modalTitle').innerText = "התחברות למערכת";
    document.getElementById('modalBody').innerHTML = `
        <div class="auth-form">
            <input type="text" id="regName" placeholder="שם משתמש (2-12 תווים)">
            <input type="email" id="regEmail" placeholder="אימייל (חייב gmail.com)">
            <button class="btn-premium" style="width:100%" onclick="registerUser()">היכנס עכשיו</button>
        </div>
    `;
    openModal();
}

function registerUser() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    if (name.length >= 2 && email.includes('gmail.com')) {
        state.user = { name, email, tier: "FREE", avatar: null };
        localStorage.setItem('goofi_session', JSON.stringify(state.user));
        location.reload();
    } else {
        alert("נתונים לא תקינים!");
    }
}
