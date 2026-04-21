const tools = [
    { name: "מנהל מטבעות", tier: "FREE", img: "https://share.google/xbehxjMMx3hBcvFhz", url: "https://coin-me-virtual.youware.app", desc: "ניהול ארנק וירטואלי חכם" },
    { name: "מרכז שליטה C2", tier: "SILVER", img: "https://share.google/WtBRoyhcv06TI2vYK", url: "https://c2-command-control.youware.app", desc: "מערכת שליטה ובקרה מתקדמת" },
    { name: "בונה ערים", tier: "SILVER", img: "https://share.google/EQlIltRdcBykeNXef", url: "https://rosebud.ai/p/city-builder-one-piece-74", desc: "תכנון אסטרטגי של תשתיות" },
    { name: "שליטה גלובלית", tier: "GOLD", img: "https://share.google/thHo6g3kGqhIOacwR", url: "https://rosebud.ai/p/global-domination-rtl", desc: "ניהול זירות מסחר עולמיות" },
    { name: "תוכנית נקמה", tier: "GOLD", img: "https://share.google/Qb8DsWTj8uZFvNpBW", url: "https://revenge-master-plan--adamhasam.replit.app", desc: "ניהול סיכונים ומשברים" },
    { name: "קיסר עסקי", tier: "DIAMOND", img: "https://share.google/IZtsZ9NIySjE4plvS", url: "https://business-caesar.youware.app/", desc: "ניהול אימפריה כלכלית" },
    { name: "בונה כוכבים", tier: "DIAMOND", img: "https://share.google/hHu1E2tum9qbNm5EN", url: "https://buildwithstar.com/games/d59607f5-4079-4e6b-890b-7a7f4192d250", desc: "פיתוח פרויקטים עתידניים" }
];

let currentUser = JSON.parse(localStorage.getItem('goofiUser')) || null;

// יצירת הגריד
const grid = document.getElementById('toolsGrid');
tools.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.innerHTML = `
        <img src="${tool.img}" alt="${tool.name}">
        <h3>${tool.name}</h3>
        <p>${tool.desc}</p>
        <button onclick="handleToolClick('${tool.tier}', '${tool.url}')">כניסה לכלי [${tool.tier}]</button>
    `;
    grid.appendChild(card);
});

function handleToolClick(tier, url) {
    if (!currentUser) {
        showLoginModal();
        return;
    }

    if (tier !== "FREE" && currentUser.tier !== tier && !hasAccess(currentUser.tier, tier)) {
        showUpgradeModal(tier);
        return;
    }

    startLoading(tier, url);
}

function hasAccess(userTier, requiredTier) {
    const levels = { "FREE": 0, "SILVER": 1, "GOLD": 2, "DIAMOND": 3 };
    return levels[userTier] >= levels[requiredTier];
}

function showLoginModal() {
    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <h2>צריך להירשם כדי להשתמש בכלים של GOOFI</h2>
        <input type="text" id="regName" placeholder="שם (2-12 תווים)">
        <input type="email" id="regEmail" placeholder="אימייל (חייב gmail.com)">
        <button class="btn-buy" onclick="register()">הרשמה מהירה</button>
    `;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function register() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    
    if (name.length < 2 || name.length > 12) return alert("שם לא תקין");
    if (!email.includes("gmail.com")) return alert("חובה אימייל ג'ימייל");

    currentUser = { name, email, tier: "FREE", profilePic: "https://via.placeholder.com/50" };
    localStorage.setItem('goofiUser', JSON.stringify(currentUser));
    location.reload();
}

function showUpgradeModal(tier) {
    const color = tier === 'SILVER' ? 'silver' : tier === 'GOLD' ? 'gold' : 'diamond';
    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <div class="purchase-page ${color}">
            <h2>שדרוג למנוי ${tier}</h2>
            <p>פתיחת כלים וביטול המתנה! 🚀</p>
            <form id="payForm">
                <input type="text" placeholder="שם בעל הכרטיס" required minlength="2" maxlength="12">
                <input type="text" id="cardNum" placeholder="מספר כרטיס (16 ספרות)" required maxlength="19">
                <input type="text" id="cardExp" placeholder="תוקף MM/YY" required maxlength="5">
                <input type="text" placeholder="CVV" required maxlength="3">
                <input type="text" placeholder="תעודת זהות" required maxlength="9">
                <label><input type="checkbox" checked> אישור קבלת עדכונים מגופי</label>
                <button type="button" class="btn-buy" id="buyBtn">רכוש מנוי</button>
            </form>
        </div>
    `;
    document.getElementById('modalOverlay').style.display = 'flex';
    
    // עיצוב קלט כרטיס אשראי
    document.getElementById('cardNum').oninput = (e) => {
        e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim();
    };
    document.getElementById('cardExp').oninput = (e) => {
        let val = e.target.value.replace(/[^\d]/g, '');
        if (val.length >= 2) val = val.slice(0,2) + '/' + val.slice(2,4);
        e.target.value = val;
    };

    document.getElementById('buyBtn').onclick = function() {
        this.innerText = "VERIFY...";
        this.classList.add('scanning');
        
        // שליחת נתונים למנהל (בלי אשראי!)
        const formData = {
            buyer: currentUser.name,
            email: currentUser.email,
            package: tier
        };

        fetch('https://formspree.io/f/YOUR_ID_HERE', { // החלף ב-ID שלך
            method: 'POST',
            body: JSON.stringify(formData),
            headers: { 'Accept': 'application/json' }
        });

        setTimeout(() => {
            currentUser.tier = tier;
            localStorage.setItem('goofiUser', JSON.stringify(currentUser));
            body.innerHTML = `<h2>הצלחה! 🎉</h2><p>מנוי ${tier} הופעל. כל הכלים פתוחים עבורך.</p><button class="btn-buy" onclick="location.reload()">התחל שימוש</button>`;
        }, 3000);
    };
}

function startLoading(tier, url) {
    let waitTime = (tier === "FREE") ? 20 : (tier === "SILVER") ? 5 : 0;
    if (waitTime === 0) { window.open(url, '_blank'); return; }

    const overlay = document.getElementById('loaderOverlay');
    const num = document.getElementById('timerNum');
    overlay.style.display = 'flex';
    
    let timeLeft = waitTime;
    const interval = setInterval(() => {
        timeLeft--;
        num.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            overlay.style.display = 'none';
            window.open(url, '_blank');
        }
    }, 1000);
}

// עדכון עיצוב לפי מנוי
if (currentUser) {
    const dot = document.getElementById('footerDot');
    const border = document.getElementById('profileBorder');
    if (currentUser.tier === "SILVER") {
        document.body.style.border = "5px solid var(--silver)";
        dot.style.background = "var(--silver)";
        border.className = "profile-img-container tier-silver";
    } else if (currentUser.tier === "GOLD") {
        document.body.style.border = "5px solid var(--gold)";
        dot.style.background = "var(--gold)";
        border.className = "profile-img-container tier-gold";
    } else if (currentUser.tier === "DIAMOND") {
        document.body.style.border = "10px solid var(--diamond)";
        dot.style.background = "var(--diamond)";
        border.className = "profile-img-container tier-diamond";
    }
}
