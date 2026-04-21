/**
 * GOOFI TOOLS - CORE SYSTEM ENGINE
 * Built by Shimon
 */

const CONFIG = {
    MANAGER_EMAIL: "movies0pop0@gmail.com",
    FORMSPREE_ID: "YOUR_FORMSPREE_ID", // הירשם ל-Formspree ושים כאן את ה-ID
    LOAD_TIME_FREE: 20,
    LOAD_TIME_SILVER: 5
};

const APP_TOOLS = [
    { name: "מנהל מטבעות וירטואלי", tier: "FREE", url: "https://coin-me-virtual.youware.app", img: "https://share.google/xbehxjMMx3hBcvFhz", desc: "ניהול ארנק וכלכלה וירטואלית רב-שכבתית." },
    { name: "מרכז שליטה C2", tier: "SILVER", url: "https://c2-command-control.youware.app", img: "https://share.google/WtBRoyhcv06TI2vYK", desc: "מערכת פיקוד ובקרה אסטרטגית בזמן אמת." },
    { name: "City Builder Pro", tier: "SILVER", url: "https://rosebud.ai/p/city-builder-one-piece-74", img: "https://share.google/EQlIltRdcBykeNXef", desc: "בניית ערים ותשתיות אסטרטגיות מהיסוד." },
    { name: "Global Domination", tier: "GOLD", url: "https://rosebud.ai/p/global-domination-rtl", img: "https://share.google/thHo6g3kGqhIOacwR", desc: "שליטה גלובלית וניהול משאבים עולמי." },
    { name: "Master Plan Execution", tier: "GOLD", url: "https://revenge-master-plan--adamhasam.replit.app", img: "https://share.google/Qb8DsWTj8uZFvNpBW", desc: "כלי תכנון והוצאה לפועל של מהלכים מורכבים." },
    { name: "Business Caesar", tier: "DIAMOND", url: "https://business-caesar.youware.app/", img: "https://share.google/IZtsZ9NIySjE4plvS", desc: "ניהול אימפריה עסקית בדרגת קיסר - פרימיום." },
    { name: "Star Project Builder", tier: "DIAMOND", url: "https://buildwithstar.com/games/d59607f5-4079-4e6b-890b-7a7f4192d250", img: "https://share.google/hHu1E2tum9qbNm5EN", desc: "פיתוח פרויקטים בין-כוכביים וטכנולוגיית עתיד." }
];

let userData = JSON.parse(localStorage.getItem('goofi_session')) || null;

// אתחול דף
document.addEventListener('DOMContentLoaded', () => {
    renderTools();
    initUI();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('profileToggle').onclick = toggleSidePanel;
    document.getElementById('closePanelBtn').onclick = toggleSidePanel;
    document.getElementById('saveProfileBtn').onclick = saveUserProfile;
    document.getElementById('logoutBtn').onclick = logout;
    document.getElementById('closeModalBtn').onclick = closeModal;
    document.getElementById('avatarInput').onchange = handleAvatarUpload;
}

function renderTools() {
    const grid = document.getElementById('mainToolsGrid');
    grid.innerHTML = APP_TOOLS.map(tool => `
        <div class="tool-card">
            <img src="${tool.img}" alt="${tool.name}">
            <h3>${tool.name}</h3>
            <p style="font-size: 0.9rem; opacity: 0.7;">${tool.desc}</p>
            <div class="tier-label ${tool.tier.toLowerCase()}">${tool.tier}</div>
            <button class="buy-btn-premium" onclick="handleToolAccess('${tool.name}')">הפעל כלי</button>
        </div>
    `).join('');
}

function handleToolAccess(toolName) {
    const tool = APP_TOOLS.find(t => t.name === toolName);
    
    if (!userData) {
        showAuthModal();
        return;
    }

    const tiers = { "FREE": 0, "SILVER": 1, "GOLD": 2, "DIAMOND": 3 };
    if (tiers[userData.tier] < tiers[tool.tier]) {
        showPricingModal(tool.tier);
        return;
    }

    startLoadingSequence(tool);
}

function showAuthModal() {
    const body = document.getElementById('modalBody');
    document.getElementById('modalTitle').innerText = "צריך להירשם כדי להשתמש בכלים של GOOFI";
    body.innerHTML = `
        <div class="auth-form">
            <input type="text" id="regName" placeholder="שם מלא (2-12 תווים)" maxlength="12">
            <input type="email" id="regEmail" placeholder="אימייל (חובה gmail.com)">
            <button class="buy-btn-premium" onclick="performRegistration()">הירשם והתחבר</button>
        </div>
    `;
    openModal();
}

function performRegistration() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;

    if (name.length < 2 || !email.includes('gmail.com')) {
        alert("נא להזין שם תקין ואימייל של Gmail");
        return;
    }

    userData = { name, email, tier: "FREE", avatar: null };
    localStorage.setItem('goofi_session', JSON.stringify(userData));
    location.reload();
}

function showPricingModal(targetTier) {
    const body = document.getElementById('modalBody');
    document.getElementById('modalTitle').innerText = `שדרוג למנוי ${targetTier}`;
    
    const colors = { SILVER: 'silver', GOLD: 'gold', DIAMOND: 'diamond' };
    const durations = [
        { t: "3 חודשים", p: "₪150", d: "חבילת בסיס" },
        { t: "6 חודשים", p: "₪250", d: "חיסכון של 20%" },
        { t: "12 חודשים", p: "₪400", d: "המסלול המשתלם ביותר" }
    ];

    body.innerHTML = `
        <div class="pricing-grid">
            ${durations.map(dur => `
                <div class="price-box ${colors[targetTier]}" onclick="showPaymentForm('${targetTier}', '${dur.t}')">
                    <h4>${dur.t}</h4>
                    <p class="price">${dur.p}</p>
                    <small>${dur.d}</small>
                </div>
            `).join('')}
        </div>
    `;
    openModal();
}

function showPaymentForm(tier, duration) {
    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <div class="payment-ui">
            <h3>תשלום עבור מנוי ${tier} (${duration})</h3>
            <input type="text" id="payName" placeholder="שם על הכרטיס" maxlength="12">
            <input type="text" id="payCard" placeholder="מספר כרטיס (16 ספרות)">
            <div style="display:flex; gap:10px">
                <input type="text" id="payDate" placeholder="MM/YY" maxlength="5">
                <input type="text" id="payCvv" placeholder="CVV" maxlength="3">
            </div>
            <input type="text" id="payId" placeholder="תעודת זהות (9 ספרות)" maxlength="9">
            <button class="buy-btn-premium" id="submitPayBtn" onclick="processPayment('${tier}')">רכוש מנוי עכשיו</button>
        </div>
    `;

    // פורמט כרטיס אשראי
    document.getElementById('payCard').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    });
}

async function processPayment(tier) {
    const btn = document.getElementById('submitPayBtn');
    btn.innerHTML = "VERIFYING...";
    btn.classList.add('scanning');

    const payload = {
        buyer: userData.name,
        email: userData.email,
        tier: tier,
        date: new Date().toLocaleString()
    };

    // שליחה למנהל (סימולציה או Formspree)
    console.log("Sending to movies0pop0@gmail.com...", payload);

    setTimeout(() => {
        userData.tier = tier;
        localStorage.setItem('goofi_session', JSON.stringify(userData));
        alert("הרכישה הצליחה! תהנה מהמנוי החדש.");
        location.reload();
    }, 4000);
}

function startLoadingSequence(tool) {
    const isPremium = userData.tier !== "FREE";
    let time = 0;
    if (tool.tier === "FREE" && !isPremium) time = CONFIG.LOAD_TIME_FREE;
    else if (tool.tier === "SILVER" && userData.tier === "SILVER") time = CONFIG.LOAD_TIME_SILVER;

    if (time === 0) { window.open(tool.url, '_blank'); return; }

    const screen = document.getElementById('loadingScreen');
    const num = document.getElementById('timeLeftNum');
    screen.style.display = 'flex';
    
    let left = time;
    const interval = setInterval(() => {
        left--;
        num.innerText = left;
        if (left <= 0) {
            clearInterval(interval);
            screen.style.display = 'none';
            window.open(tool.url, '_blank');
        }
    }, 1000);
}

function initUI() {
    if (!userData) return;
    
    document.body.className = `${userData.tier.toLowerCase()}-ui`;
    document.getElementById('currentTierDisplay').innerText = userData.tier;
    document.getElementById('tierStatus').innerText = userData.tier;
    document.getElementById('headerAvatar').src = userData.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    document.getElementById('footerDot').style.backgroundColor = getTierColor(userData.tier);
}

function getTierColor(t) {
    if (t === 'SILVER') return '#c0c0c0';
    if (t === 'GOLD') return '#ffd700';
    if (t === 'DIAMOND') return '#00f2ff';
    return '#00ff00';
}

function toggleSidePanel() { document.getElementById('sidePanel').classList.toggle('open'); }
function openModal() { document.getElementById('mainModal').style.display = 'flex'; }
function closeModal() { document.getElementById('mainModal').style.display = 'none'; }
function logout() { localStorage.clear(); location.reload(); }

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        userData.avatar = event.target.result;
        document.getElementById('sidebarAvatarPreview').src = userData.avatar;
    };
    reader.readAsDataURL(file);
}

function saveUserProfile() {
    const newName = document.getElementById('userNameInput').value;
    if (newName) userData.name = newName;
    localStorage.setItem('goofi_session', JSON.stringify(userData));
    location.reload();
}
