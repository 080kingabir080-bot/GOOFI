// State Management
let games = JSON.parse(localStorage.getItem('sus_v2_games')) || [];
let users = JSON.parse(localStorage.getItem('sus_v2_users')) || [];
let currentUser = JSON.parse(sessionStorage.getItem('active_user')) || null;
let activeGameId = null;
let tempRating = 0;

// Navigation System
function nav(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if(pageId === 'homePage') renderHome();
    if(pageId === 'adminPage') renderAdminList();
}

// Auth Logic
function auth(type) {
    const u = type === 'login' ? document.getElementById('loginUser').value : document.getElementById('regUser').value;
    const p = type === 'login' ? document.getElementById('loginPass').value : document.getElementById('regPass').value;

    if(!u || !p) return alert("מלא את כל השדות");

    if(type === 'register') {
        if(users.find(x => x.name === u)) return alert("משתמש קיים");
        users.push({name: u, pass: p, isAdmin: u.toLowerCase() === 'admin'});
        localStorage.setItem('sus_v2_users', JSON.stringify(users));
        alert("נרשמת בהצלחה! עכשיו תתחבר");
        nav('loginPage');
    } else {
        const found = users.find(x => x.name === u && x.pass === p);
        if(found) {
            currentUser = found;
            sessionStorage.setItem('active_user', JSON.stringify(found));
            updateHeader();
            nav('homePage');
        } else {
            alert("פרטים שגויים");
        }
    }
}

function updateHeader() {
    const btnBox = document.getElementById('navButtons');
    if(currentUser) {
        btnBox.innerHTML = `
            <span class="text-cyan-400 self-center">שלום, ${currentUser.name}</span>
            ${currentUser.isAdmin ? '<button onclick="nav(\'adminPage\')" class="px-4 py-1 border border-cyan-400 rounded-lg text-sm">ניהול</button>' : ''}
            <button onclick="logout()" class="px-4 py-1 opacity-50 text-sm">התנתק</button>
        `;
    }
}

function logout() {
    sessionStorage.clear();
    location.reload();
}

// Admin Operations
function adminAddGame() {
    const t = document.getElementById('admTitle').value;
    const d = document.getElementById('admDesc').value;
    const c = document.getElementById('admCode').value;

    if(!t || !c) return alert("שם וקוד חובה");

    const newGame = {
        id: 'game_' + Date.now(),
        title: t,
        desc: d,
        code: c,
        reviews: []
    };

    games.push(newGame);
    save();
    renderAdminList();
    alert("המשחק פורסם!");
}

function deleteGame(id) {
    games = games.filter(g => g.id !== id);
    save();
    renderAdminList();
}

// Rendering
function renderHome() {
    const container = document.getElementById('gameGrid');
    container.innerHTML = games.map(g => `
        <div class="game-card glass flex flex-col items-center justify-center p-4 text-center" onclick="playGame('${g.id}')">
            <div class="text-4xl mb-4">🕹️</div>
            <div class="font-bold text-lg text-white">${g.title}</div>
            <div class="text-xs text-white/50 mt-1">${g.desc}</div>
        </div>
    `).join('');
}

function renderAdminList() {
    const list = document.getElementById('adminList');
    list.innerHTML = games.map(g => `
        <div class="flex justify-between items-center bg-white/5 p-3 rounded-xl">
            <span>${g.title}</span>
            <button onclick="deleteGame('${g.id}')" class="text-red-500 text-sm font-bold">מחק</button>
        </div>
    `).join('');
}

// Game Player
function playGame(id) {
    const g = games.find(x => x.id === id);
    activeGameId = id;
    document.getElementById('playerTitle').innerText = g.title;
    document.getElementById('playerOverlay').style.display = 'flex';
    
    const frame = document.getElementById('gameFrame');
    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(g.code);
    doc.close();
    renderReviews(g);
}

function closePlayer() {
    document.getElementById('playerOverlay').style.display = 'none';
    document.getElementById('gameFrame').src = 'about:blank';
}

// Review Logic
document.querySelectorAll('#starInput span').forEach(s => {
    s.onclick = () => {
        tempRating = s.dataset.v;
        document.querySelectorAll('#starInput span').forEach(i => {
            i.classList.toggle('text-yellow-400', i.dataset.v <= tempRating);
            i.classList.toggle('text-gray-600', i.dataset.v > tempRating);
        });
    };
});

function postReview() {
    if(!currentUser) return alert("התחבר כדי להגיב");
    if(tempRating == 0) return alert("בחר כוכבים");
    
    const text = document.getElementById('revText').value;
    const gIdx = games.findIndex(x => x.id === activeGameId);
    
    games[gIdx].reviews.unshift({
        user: currentUser.name,
        stars: tempRating,
        comment: text
    });
    
    save();
    renderReviews(games[gIdx]);
    document.getElementById('revText').value = '';
}

function renderReviews(game) {
    const div = document.getElementById('revList');
    div.innerHTML = (game.reviews || []).map(r => `
        <div class="border-b border-white/5 pb-2 text-sm">
            <div class="flex justify-between text-cyan-400 font-bold">
                <span>${r.user}</span>
                <span class="text-yellow-400">${'★'.repeat(r.stars)}</span>
            </div>
            <p class="text-white/70">${r.comment}</p>
        </div>
    `).join('');
}

function save() { localStorage.setItem('sus_v2_games', JSON.stringify(games)); }

window.onload = () => {
    if(currentUser) updateHeader();
    renderHome();
};
