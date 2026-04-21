// Data State
let games = JSON.parse(localStorage.getItem('sus_games')) || [];
let currentUser = JSON.parse(sessionStorage.getItem('sus_user')) || null;
let currentActiveGameId = null;
let selectedRating = 0;

// Initialize
window.onload = () => {
    renderGames();
    updateAuthUI();
    setupStars();
};

// Render Games Grid
function renderGames() {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = games.map(game => `
        <div class="game-card glass-panel p-4 flex flex-col items-center justify-center text-center animate-in" onclick="openGame('${game.id}')">
            <div class="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-3 flex items-center justify-center text-2xl">
                🎮
            </div>
            <div class="font-bold truncate w-full">${game.title}</div>
            <div class="text-[10px] text-white/60 mt-1">${game.desc}</div>
        </div>
    `).join('');
}

// Auth Logic
function handleLogin() {
    const user = document.getElementById('username').value;
    if(!user) return alert("הכנס שם משתמש");
    
    currentUser = { name: user, isAdmin: user.toLowerCase() === 'admin' };
    sessionStorage.setItem('sus_user', JSON.stringify(currentUser));
    document.getElementById('loginModal').style.display = 'none';
    updateAuthUI();
}

function updateAuthUI() {
    const authSection = document.getElementById('authSection');
    if(currentUser) {
        authSection.innerHTML = `
            <span class="ml-4 text-cyan-400">שלום, ${currentUser.name}</span>
            <button onclick="logout()" class="text-xs opacity-50">התנתק</button>
        `;
        if(currentUser.isAdmin) document.getElementById('adminBtn').classList.remove('hidden');
    }
}

function logout() {
    sessionStorage.clear();
    location.reload();
}

// Admin Logic
function showAdmin() { document.getElementById('adminPanel').style.display = 'block'; }
function hideAdmin() { document.getElementById('adminPanel').style.display = 'none'; }

function saveNewGame() {
    const title = document.getElementById('newGameTitle').value;
    const desc = document.getElementById('newGameDesc').value;
    const code = document.getElementById('newGameCode').value;

    if(!title || !code) return alert("חובה למלא שם וקוד משחק");

    const newGame = {
        id: 'g_' + Date.now(),
        title: title,
        desc: desc || "משחק חדש ב-SUS",
        code: code,
        reviews: []
    };

    games.push(newGame);
    localStorage.setItem('sus_games', JSON.stringify(games));
    renderGames();
    hideAdmin();
    // Reset form
    document.getElementById('newGameTitle').value = '';
    document.getElementById('newGameDesc').value = '';
    document.getElementById('newGameCode').value = '';
}

// Gameplay Logic
function openGame(id) {
    const game = games.find(g => g.id === id);
    if(!game) return;

    currentActiveGameId = id;
    document.getElementById('currentPlayingTitle').innerText = game.title;
    document.getElementById('gameOverlay').style.display = 'flex';
    
    const iframe = document.getElementById('gameIframe');
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(game.code);
    doc.close();

    renderReviews(game);
}

function closeGame() {
    document.getElementById('gameOverlay').style.display = 'none';
    document.getElementById('gameIframe').src = "about:blank";
}

// Review System
function setupStars() {
    const stars = document.querySelectorAll('.star-rating');
    stars.forEach(star => {
        star.onclick = () => {
            selectedRating = parseInt(star.getAttribute('data-v'));
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.getAttribute('data-v')) <= selectedRating);
            });
        };
    });
}

function submitReview() {
    if(!currentUser) return alert("עליך להתחבר כדי להגיב");
    if(selectedRating === 0) return alert("אנא בחר דירוג כוכבים");
    
    const text = document.getElementById('commentInput').value;
    const gameIndex = games.findIndex(g => g.id === currentActiveGameId);
    
    const review = {
        user: currentUser.name,
        stars: selectedRating,
        text: text,
        date: new Date().toLocaleDateString()
    };

    games[gameIndex].reviews.unshift(review);
    localStorage.setItem('sus_games', JSON.stringify(games));
    renderReviews(games[gameIndex]);
    
    // Reset
    document.getElementById('commentInput').value = '';
}

function renderReviews(game) {
    const list = document.getElementById('reviewsList');
    list.innerHTML = (game.reviews || []).map(r => `
        <div class="bg-white/5 p-3 rounded-lg border border-white/10 text-sm">
            <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-cyan-400">${r.user}</span>
                <span class="text-yellow-400">${"★".repeat(r.stars)}</span>
            </div>
            <p class="text-white/80">${r.text}</p>
        </div>
    `).join('');
}

// Utilities
function showModal(id) { document.getElementById(id).style.display = 'flex'; }
