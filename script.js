// ========================
// VARIABLES
// ========================
let score = 0;
let timeLeft = 60;
let remainingStars = 50;
let gameStarted = false;
let greatStarActive = false;


// star container & arrays
const stars = document.getElementById("stars");
let normalStars = []; // all normal stars

// story typewriter
const storyE1 = document.getElementById("storyline");
const typingSound = document.getElementById("typing");
const skipButton = document.getElementById("skip-button");
let typewriterTimer;
let fullStoryText = "";

// ========================
// HELPER FUNCTIONS
// ========================
function stopAllMusic() {
    const tracks = [
        "intro-music",
        "story-music",
        "game-music",
        "result-music"
    ];

    tracks.forEach(id => {
        const m = document.getElementById(id);
        if (m) {
            m.pause();
            m.currentTime = 0;
        }
    });
}


// switch scenes
function showScene(id) {
    document.querySelectorAll(".scene").forEach(scene => {
        scene.classList.remove("active");
    });
    document.getElementById(id).classList.add("active");
    

}

// play click sound
function playClick() {
    const click = document.getElementById("click");
    click.currentTime = 0;
    click.play();
}


// ========================
// BUTTON FUNCTIONS
// ========================
function goToGender() {
    playClick();
    showScene("gender");

    stopAllMusic();
    document.getElementById("intro-music").play();
}

function goToStory() {
    playClick();
    showScene("story");

     stopAllMusic();
    document.getElementById("story-music").play();

    // set story text based on gender
    const selectedGender = document.querySelector('input[name="gender"]:checked')?.value;

    if (selectedGender === "male") {
        fullStoryText = "You are the prince of the sky, born of starlight. Beyond the horizon lies your realm: the Starlight Kingdom. But first,you must rise... Summon your courage and chase the Great Star that awaits you. Time slips like silk through your fingers; gather enough stars to return home, or be lost among the constellations forever...";
    } else {
        fullStoryText = "You are the princess of the sky, born of starlight. Beyond the horizon lies your realm: the Starlight Kingdom. But first,you must rise... Summon your courage and chase the Great Star that awaits you. Time slips like silk through your fingers; gather enough stars to return home, or be lost among the constellations forever...";
    }

    typeWriter(fullStoryText, storyE1, 50);
}

let cursorX = 0;
let cursorY = 0;

// Track cursor for auto-catch
document.addEventListener("mousemove", e => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});
let remaininPoints = 25;
let greatStarCaught = false;


function startGame() {

    showScene('game');
    gameStarted = true;

    stopAllMusic();
    document.getElementById("game-music").play();

    // --- TARGET & DASHBOARD ---
    const targetPoints = 25;
    remainingPoints = targetPoints;

    score = 0;
    document.getElementById("score").textContent = score;
    document.getElementById("remaining").textContent = remainingPoints;
    document.getElementById("time").textContent = 60;
    let timeLeft = 60;

    

    // --- BACKGROUND ---
    document.body.style.backgroundImage = "url('https://cdn.leonardo.ai/users/4f5dc4be-bb0f-4717-81ce-cb29bda26d0c/generations/634cd87e-4a87-4908-9824-b3e84e4b6111/segments/1:1:1/Lucid_Origin_open_grassland_with_ethereal_starry_sky_in_169_as_0.jpg')";

    const stars = document.getElementById("stars");
    stars.innerHTML = '';
    normalStars = [];
    greatStarActive = false;
    greatStarCaught = false;


    // --- SPAWN STAR FUNCTION ---
    function spawnStar(src) {
        const star = document.createElement("img");
        star.src = src;
        star.style.position = "absolute";
        star.style.width = "50px";
        star.style.height = "auto";
        star.style.left = Math.random() * (window.innerWidth - 50) + "px";
        star.style.top = "0px";

        if (src.includes("blue")) star.dataset.points = 1;
        else if (src.includes("green")) star.dataset.points = 2;
        else if (src.includes("pink")) star.dataset.points = -2;
        else if (src.includes("great")) star.dataset.points = 5;

        stars.appendChild(star);
        normalStars.push(star);
    }

    // --- TIMER ---
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("time").textContent = timeLeft;

        if (timeLeft === 8 && !greatStarActive) {
            spawnStar("great-star.png");
            greatStarActive = true;
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame(false);
        }
    }, 1000);

    // --- SPAWN RANDOM STARS ---
    starInterval = setInterval(() => {
        let rand = Math.random();
        if (rand < 0.7) spawnStar("blue-star.png");
        else if (rand < 0.85) spawnStar("pink-star.png");
        else spawnStar("green-star.png");
    }, 1200);

    // --- STAR FALLING & AUTO-CATCH ---
    fallingInterval = setInterval(() => {
        for (let i = normalStars.length - 1; i >= 0; i--) {
            let star = normalStars[i];
            let top = parseFloat(star.style.top);
            top += 0.6; 
            star.style.top = top + "px";

            // check collision with cursor
            const rect = star.getBoundingClientRect();
            if (cursorX >= rect.left && cursorX <= rect.right &&
                cursorY >= rect.top && cursorY <= rect.bottom) {

                let points = parseInt(star.dataset.points);
                score += points;
                if (score < 0) score = 0;

                // update remaining points
remainingPoints -= points; // works for positive and negative points
if (remainingPoints < 0) remainingPoints = 0;

                document.getElementById("score").textContent = score;
                document.getElementById("remaining").textContent = remainingPoints;

                // play sound
                let sound;
                if (star.src.includes("great")) sound = document.getElementById("great-star");

                if (star.src.includes("great")) {
    greatStarCaught = true;
}


                else if (points > 0) sound = document.querySelector(".good-star");
                else sound = document.getElementById("bad-star");
                sound.currentTime = 0;
                sound.play();

                // remove star
                star.remove();
                normalStars.splice(i, 1);

                // check target
                if (remainingPoints <= 0 && greatStarActive) {
                    endGame(true);
                }

                continue; // skip further processing for this star
            }

            if (top > window.innerHeight) {
                star.remove();
                normalStars.splice(i, 1);
            }
        }
    }, 20);
}




// ========================
// TYPEWRITER FUNCTION
// ========================
function typeWriter(text, element, speed = 50) {
    let i = 0;
    element.textContent = "";

    function type() {
        if (i < text.length) {
            element.textContent += text[i];
            i++;
            if (i % 2 === 0) typingSound.play();
            typewriterTimer = setTimeout(type, speed);
        }
    }

    type();
}

// ========================
// SKIP BUTTON
// ========================
skipButton.onclick = function() {
    clearTimeout(typewriterTimer); // stop typewriter
    showScene("starting");          // move to start button scene
}

// ========================
// STAR FUNCTIONS
// ========================

// create star
function spawnStar(src, width = 32) {
    let star = document.createElement("img"); 
    star.src = src;                            
    star.style.position = "absolute";          
    star.style.width = width + "px";           
    star.style.height = "auto";                
    star.style.left = Math.random() * (window.innerWidth - width) + "px"; 
    star.style.top = "0px";                    

    stars.appendChild(star);                   
    normalStars.push(star);                    
}

// move all stars down
function moveNormalStars() {
    for (let i = normalStars.length - 1; i >= 0; i--) {
        let star = normalStars[i];
        let currentTop = parseFloat(star.style.top);
        currentTop += 2; // speed                
        star.style.top = currentTop + "px";

        if (currentTop > window.innerHeight) {
            star.remove();               
            normalStars.splice(i, 1);    
        }
    }
}

function endGame(won) {
    // Stop all intervals
    clearInterval(timerInterval);
    clearInterval(starInterval);
    clearInterval(fallingInterval);

    stopAllMusic();
    document.getElementById("result-music").play();

    // Hide game scene, show result scene
    showScene('result');

    
    // Determine if target reached
    const reachedTarget = remainingPoints <= 0;

    // Determine if great star caught
    // (make sure to set greatStarActive = false when great star is caught)
    const caughtGreat = greatStarCaught;


    // Calculate stars
    let starCount = 1;
    if (reachedTarget && caughtGreat) starCount = 3;
    else if (reachedTarget || caughtGreat) starCount = 2;

    

    // Optional: special sound if max stars
    if (starCount === 3) {
        const greatResultSound = document.getElementById("great-star");
        greatResultSound.currentTime = 0;
        greatResultSound.play();
    }

    const messageEl = document.getElementById("result-message");

    if (!messageEl) {
        console.error("result-message element missing!");
        return;
    }

    if (reachedTarget && caughtGreat) {
        messageEl.textContent = "Great job! You may now return home ✨";
    } else if (reachedTarget || caughtGreat) {
        messageEl.textContent = "Nice try… but you are now lost among the stars forever";
    } else {
        messageEl.textContent = "The stars pull you deeper into the void… try again";
    }

}
function restartGame() {
    // reset values
    score = 0;
    timeLeft = 60;
    remainingPoints = 25;
    greatStarActive = false;
    gameStarted = false;

    // update dashboard
    document.getElementById("score").textContent = score;
    document.getElementById("time").textContent = timeLeft;
    document.getElementById("remaining").textContent = remainingPoints;

    // clear stars
    document.getElementById("star-container").innerHTML = "";

    function restartGame() {
    stopAllMusic();
    startGame();
}


    // start again
    startGame();
}


// move stars continuously
setInterval(moveNormalStars, 20);

// ========================
// ATTACH BUTTONS AFTER DOM LOAD
// ========================
document.addEventListener("DOMContentLoaded", function(){

    document.getElementById("next").onclick = goToGender;
    document.getElementById("continue").onclick = goToStory;
    document.getElementById("start-button").onclick = startGame;
    document.getElementById("restart-button").onclick = restartGame;
});

