// ניהול הנתונים
let games = JSON.parse(localStorage.getItem('pro_games')) || [];
let users = JSON.parse(localStorage.getItem('pro_users')) || [];
let currentUser = JSON.parse(sessionStorage.getItem('active_user')) || null;

function nav(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if(pageId === 'homePage') renderGames();
}

// תהליך רכישה
function processPurchase() {
    const user = document.getElementById('payUser').value;
    const email = document.getElementById('payEmail').value;
    if(!user || !email) return alert("אנא מלא את כל הפרטים");

    document.getElementById('paymentForm').classList.add('opacity-50', 'pointer-events-none');
    document.getElementById('purchaseLoader').style.display = 'block';
    document.getElementById('buyGiftBtn').style.display = 'none';

    // המתנה של 6 שניות לאימות כפי שביקשת
    setTimeout(() => {
        document.getElementById('paymentForm').classList.add('hidden');
        document.getElementById('purchaseLoader').style.display = 'none';
        document.getElementById('successMessage').classList.remove('hidden');
    }, 6000);
}

function activatePremium() {
    if(currentUser) {
        currentUser.isPremium = true;
        // עדכון במאגר המשתמשים
        const idx = users.findIndex(u => u.name === currentUser.name);
        if(idx !== -1) users[idx].isPremium = true;
        
        localStorage.setItem('pro_users', JSON.stringify(users));
        sessionStorage.setItem('active_user', JSON.stringify(currentUser));
    }
    
    applyPremiumUI();
    nav('homePage');
}

function applyPremiumUI() {
    if(currentUser && currentUser.isPremium) {
        document.body.classList.add('is-premium');
        const header = document.querySelector('header');
        header.style.borderColor = "#ffd700";
        header.querySelector('h1').innerHTML = 'PRO-<span style="color:#ffd700">PLAY</span> <span class="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded ml-2">PREMIUM</span>';
    }
}

// עדכון כפתורי הניווט
function updateNav() {
    const box = document.getElementById('navButtons');
    if(currentUser) {
        box.innerHTML = `
            ${!currentUser.isPremium ? '<button onclick="nav(\'premiumPage\')" class="px-5 py-2 bg-yellow-500 text-black font-bold rounded-full hover:scale-105 transition">⭐ UPGRADE</button>' : ''}
            <span class="${currentUser.isPremium ? 'premium-text' : 'text-white'} self-center mx-2">${currentUser.name}</span>
            <button onclick="logout()" class="text-sm opacity-50">התנתק</button>
        `;
    }
}

// רינדור משחקים עם הבדל ויזואלי
function renderGames() {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = games.map(g => `
        <div class="game-card glass p-4 flex flex-col items-center justify-center text-center ${currentUser?.isPremium ? 'premium-border' : ''}" onclick="playGame('${g.id}')">
            <div class="text-4xl mb-2">${currentUser?.isPremium ? '💎' : '🎮'}</div>
            <h3 class="font-bold">${g.title}</h3>
            <p class="text-[10px] opacity-50">${g.desc}</p>
        </div>
    `).join('');
    updateNav();
}

window.onload = () => {
    applyPremiumUI();
    renderGames();
};
