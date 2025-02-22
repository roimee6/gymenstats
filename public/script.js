let playerData;
let goalData;
let matchData;

async function fetchData(endpoint) {
    const response = await fetch(`${window.location.href}api/${endpoint}`);
    return await response.json();
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value || ""}${expires}; path=/`;
}

function getCookie(name) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
        while (cookie.charAt(0) === " ") cookie = cookie.substring(1, cookie.length);
        if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length);
    }
    return "dark";
}

function toggleDarkMode() {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");

    setCookie("theme", isDark ? "dark" : "light", 365);
}

function getPlayerPosition(positionId) {
    if (positionId === 11) return "goalkeeper";
    if (positionId >= 32 && positionId <= 38) return "defender";
    if (positionId >= 50 && positionId <= 100) return "midfielder";
    if (positionId >= 100 && positionId <= 130) return "forward";
    return "unknown";
}

function createPlayerCard(player) {
    const playerCard = document.createElement("div");

    playerCard.id = `player-${player.id}`;
    playerCard.className = "text-center flex-1 min-w-0 p-1";
    playerCard.innerHTML = `
        <img src="/static/cdn/players/${player.id}.png" alt="${player.name}" class="rounded-full w-10 h-10 mx-auto mb-1 border-2 border-gray-200 dark:border-dark-border">
        <div class="flex items-center justify-center w-full">
            <div class="flex items-center mr-1">
                ${player.isCaptain ? "<span class=\"mr-1 text-gray-500 text-xs\">©</span>" : ""}
                <span class="text-xs text-gray-500">${player.shirtNumber}</span>
            </div>
            <span class="text-gray-600 dark:text-dark-text font-medium text-xs truncate">${player.lastName}</span>
        </div>
    `;

    return playerCard;
}

function renderTeamComposition() {
    const container = document.getElementById("player-stats-container");

    container.innerHTML = "";
    container.className = "flex flex-col h-full";

    const positions = ["forward", "midfielder", "defender", "goalkeeper"];

    positions.forEach(position => {
        const row = document.createElement("div");
        const positionPlayers = playerData.filter(p => getPlayerPosition(p.positionId) === position);

        row.className = "flex justify-between w-full mb-2";

        positionPlayers.reverse().forEach(player => {
            row.appendChild(createPlayerCard(player));
        });

        container.appendChild(row);
    });
}

function renderGoalCards() {
    let goalCount = 0;

    const container = document.getElementById("team-cards-container");
    const titleElement = document.getElementById("league-title");

    container.innerHTML = "";

    function updateGoalCard(index) {
        if (index >= goalData.length) return;

        goalCount++;
        titleElement.textContent = `Les ${goalCount} buts de notre saison`;

        const goal = goalData[index];
        const goalCard = createGoalCard(goal, goalCount);

        container.appendChild(goalCard);
        setTimeout(() => updateGoalCard(index + 1), Math.max(5, 200 - (goalCount * 40)));
    }

    updateGoalCard(0);
}

function createGoalCard(goal, number) {
    const card = document.createElement("div");

    card.id = `goal-card-${number}`;

    card.className = `
        animate-flipIn delay-0 bg-gray-50 dark:bg-dark-bg rounded-lg overflow-hidden 
        flex shadow-md transition duration-300 p-6 max-w-md mx-auto relative cursor-pointer
        hover:shadow-lg hover:translate-y-px active:shadow-inner active:translate-y-0.5
    `;

    card.innerHTML = `
        <div class="absolute top-4 right-4 flex space-x-2">
            <img src="https://seeklogo.com/images/D/dazn-logo-5BF74BE005-seeklogo.com.png" alt="Logo channel" class="w-4 h-4 object-cover">
            <img src="/static/cdn/leagues/${goal.tournamentId}.png" alt="Logo tournament" class="w-4 h-4 object-cover">
        </div>
        <div class="flex flex-col items-center">
            <img src="/static/cdn/players/${goal.playerId}.png" alt="Joueur" class="w-20 h-20 object-cover">
            <div class="mt-2 bg-red-600 text-white text-sm font-bold py-1 px-3 rounded-full">BUT N°${number}</div>
        </div>
        <div class="ml-4 flex-1">
            <h3 class="font-semibold text-nice-red text-2xl">${goal.player}</h3>
            <div class="flex">
                <div class="flex-1 mt-4">
                    <p class="text-xs text-gray-600 dark:text-dark-text-muted">Minute: ${goal.time}'</p>
                    <p class="text-xs text-gray-600 dark:text-dark-text-muted">Date: ${formatDate(goal.date)}</p>
                    <p class="text-xs text-gray-600 dark:text-dark-text-muted">Score: ${goal.home ? goal.finalScore : goal.finalScore}</p>
                </div>
                <div class="flex items-center mt-2">
                    <p class="ml-4 text-2xl font-bold text-gray-700 dark:text-gray-300">VS</p>
                    <img src="/static/cdn/teams/${goal.opponentId}.png" alt="Club Opposant" class="ml-4 w-16 h-16 object-cover">
                </div>
            </div>
        </div>
    `;

    card.addEventListener("click", () => showVideoOverlay(goal, parseInt(goal.number) - 1));
    return card;
}

async function showVideoOverlay(goal, goalIndex, oldTitle, oldTitleClass) {
    const clip = await fetchData(`clips/${goal.id}`);
    if (!clip.result) return;

    const section = document.getElementById("team-cards-container");
    const title = document.getElementById("league-title");

    oldTitle = oldTitle ? oldTitle : title.innerHTML;
    oldTitleClass = oldTitleClass ? oldTitleClass : title.className;

    const startTime = parseInt(clip.result.start);
    const endTime = parseInt(clip.result.end);

    section.className = "flex flex-col items-center justify-center h-fit relative";
    title.className = "w-full flex justify-between items-center mb-5";

    title.innerHTML = `
        <span class="inline-block bg-red-600 text-white text-sm font-bold py-1 px-3 rounded-full">
            But N°${goal.number}
        </span>
        
        <div class="flex items-center space-x-4">
            <button id="prevButton" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition duration-300 ${goalIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button id="nextButton" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition duration-300 ${goalIndex === goalData.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
            <button id="closeButton" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    `;

    section.innerHTML = `
        <div class="rounded-1xl overflow-hidden flex flex-col justify-center max-w-4xl w-full relative">
            <div class="rounded-3xl overflow-hidden">
                <video id="player" class="w-full aspect-video">
                    <source src="${clip.result.url}#t=${startTime},${endTime}" type="video/mp4">
                </video>
            </div>
            
            <div class="p-6 flex flex-col">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <img src="/static/cdn/players/${goal.playerId}.png" alt="${goal.player}" class="w-16 h-16 rounded-full object-cover">
                        <div>
                            <h3 class="font-semibold text-2xl text-red-600 dark:text-red-600">${goal.player}</h3>
                            <p class="text-gray-500 dark:text-gray-400">${formatDate(goal.date)} - ${goal.time}'</p>
                            <p class="text-gray-500 dark:text-gray-400">${goal.stadium}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <span class="font-medium text-1xl dark:text-dark-text px-2 ${getResultClass(goal.win)}"> 
                                ${goal.finalScore}
                            </span>
                            <p class="text-gray-500 dark:text-gray-400">vs ${goal.opponent}</p>
                        </div>
                        
                        <img src="/static/cdn/teams/${goal.opponentId}.png" alt="${goal.opponent}" class="w-12 h-12 object-contain">
                    </div>
                </div>
            </div>
        </div>
    `;

    const video = document.getElementById("player");

    const player = new Plyr(video, {
        controls: [
            "play-large", "play",
            "mute", "volume",
            "download",
            "restart",
        ],
        hideControls: false,
        volume: 0.5
    });

    setupVideoPlayerEvents(player, startTime, endTime);
    applyVideoPlayerStyles();

    const closeButton = document.getElementById("closeButton");
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");

    closeButton.addEventListener("click", () => {
        player.destroy();

        section.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 max-h-[calc(100vh-335px)] overflow-y-auto scrollbar";

        title.className = oldTitleClass;
        title.innerHTML = oldTitle;

        renderGoalCards();
    });

    prevButton.addEventListener("click", () => {
        if (goalIndex > 0) showVideoOverlay(goalData[goalIndex - 1], goalIndex - 1, oldTitle, oldTitleClass);
    });

    nextButton.addEventListener("click", () => {
        if (goalIndex < goalData.length - 1) showVideoOverlay(goalData[goalIndex + 1], goalIndex + 1, oldTitle, oldTitleClass);
    });
}

function setupVideoPlayerEvents(player, startTime, endTime) {
    player.on("ready", () => player.currentTime = startTime);

    player.on("timeupdate", () => {
        if (player.currentTime < startTime) {
            player.currentTime = startTime;
        } else if (player.currentTime >= endTime) {
            player.pause();
            player.currentTime = startTime;
        }
    });

    player.on("seeking", () => {
        if (player.currentTime < startTime) {
            player.currentTime = startTime;
        } else if (player.currentTime > endTime) {
            player.currentTime = endTime;
        }
    });
}

function applyVideoPlayerStyles() {
    const style = document.createElement("style");

    style.textContent = `
        :root {
            --plyr-color-main: #CC0000;
        }
        .plyr--video .plyr__controls {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            background: transparent;
            padding: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .plyr--video .plyr__controls button {
            background: transparent;
        }
        .plyr--video .plyr__progress__container {
            flex-grow: 1;
            margin: 0;
        }
        .plyr--video .plyr__control--overlaid {
            display: none;
        }
        .plyr--video .plyr__control svg {
            filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5));
        }
        .plyr--video .plyr__controls .plyr__controls__item {
            margin: 0;
        }
    `;

    document.head.appendChild(style);
}

function renderMatchCards() {
    const container = document.getElementById("matches-container");

    matchData.forEach(match => {
        const matchCard = createMatchCard(match);
        container.appendChild(matchCard);
    });
}

function createMatchCard(match) {
    const card = document.createElement("div");

    card.className = "p-1 w-full text-white text-xs";
    card.innerHTML = `
        <div class="flex flex-col space-y-0.5"> 
            <div class="flex justify-between items-center text-xxs text-gray-400"> 
                <span>${formatDate(match.date)}</span>
                <img src="/static/cdn/leagues/${match.tournamentId}.png" alt="${match.tournament}" class="w-3 h-3"> 
            </div>
            <div class="flex items-center justify-center space-x-2"> 
                <div class="flex items-center space-x-1">
                    <img src="/static/cdn/teams/${match.homeId}.png" alt="${match.home}" class="w-4 h-4"> 
                    <span class="font-medium text-gray-800 dark:text-dark-text">${match.home}</span>
                </div>
                <span class="text-gray-800 dark:text-dark-text font-bold px-1 ${match.finished ? getResultClass(match.win) : ""}"> 
                    ${match.finished ? match.finalScore : formatTime(match.date)}
                </span>
                <div class="flex items-center space-x-1"> 
                    <span class="font-medium text-gray-800 dark:text-dark-text">${match.away}</span>
                    <img src="/static/cdn/teams/${match.awayId}.png" alt="${match.away}" class="w-4 h-4"> 
                </div>
            </div>
        </div>
    `;

    return card;
}

function getResultClass(winValue) {
    if (winValue === 1) return "bg-green-500 rounded";
    if (winValue === -1) return "bg-red-500 rounded";
    return "bg-gray-500 rounded";
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {weekday: "short", day: "numeric", month: "short"});
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {hour: "2-digit", minute: "2-digit"});
}

(async () => {
    const themeToggle = document.getElementById("themeToggle");

    window.addEventListener("load", () => {
        const savedTheme = getCookie("theme");
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
    });

    themeToggle.addEventListener("click", toggleDarkMode);

    playerData = await fetchData("composition");
    goalData = await fetchData("goals");
    matchData = await fetchData("matches");

    renderTeamComposition();
    renderMatchCards();
    renderGoalCards();
})();