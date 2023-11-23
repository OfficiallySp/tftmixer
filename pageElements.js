const htmlStart = 
  `<!DOCTYPE html>
<html>
<head>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1548903334937961"
     crossorigin="anonymous"></script>
<title>TFT Remix Rumble Music Mixer</title>
<style>
    body {
        font-family: Arial, sans-serif;
    }
    
    h1, h2, h3 {
        color: #e0e0e0;
    }
    
    label {
        color: #ffffff;
    }
    
    button {
        margin-top: 10px;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button:hover {
        background-color: #0056b3;
    }
    .background-image {
        position: fixed; 
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;

        /* Image path */
        background-image: url('bg.jpg');
        background-size: cover;
        background-position: center;
        -webkit-filter: blur(2px);
        z-index: -1;
    }
    
    .background-darken {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.25);
        z-index: -1;
    }

    .trait-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Creates a responsive grid */
        gap: 10px;
        justify-content: space-around;
    }

    .trait {
        text-align: center;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 15px;
    }
</style>
</head>
<body>

<div class="background-image"></div>
    <div class="background-darken"></div>
    <h1>TFT Remix Rumble Music Mixer</h1>
    <h2>Select Tracks to Play, Select multiple tracks to play on top of eachover to create unique combinations.</h2>
    <div class="trait-container">
        <div class="trait">
            <img src="icon/kda.png" alt="KDA">
            <h3>KDA</h3>
            <input type="checkbox" id="KDA1" name="KDA1">
            <label for="KDA1">KDA 1</label>
            <audio id="audioKDA1" src="tracks/kda1.ogg" preload="auto"></audio>
        </div>
        <div class="trait">
            <img src="icon/punk.png" alt="Punk">
            <h3>Punk</h3>
            <input type="checkbox" id="Punk3" name="Punk3">
            <label for="Punk3">Punk 3</label>
            <audio id="audioPunk3" src="tracks/punk3.ogg" preload="auto"></audio>
        </div>
        <div class="trait">
            <img src="icon/maestro.png" alt="Maestro">
            <h3>Maestro</h3>
            <input type="checkbox" id="Maestro3" name="Maestro3">
            <label for="Maestro3">Maestro 3???</label>
            <audio id="audioMaestro3" src="tracks/maestro3.ogg" preload="auto"></audio>
        </div>
        <div class="trait">
            <img src="icon/8bit.png" alt="8bit">
            <h3>8 Bit</h3>
            <input type="checkbox" id="8bit4" name="8bit4">
            <label for="8bit4">8-Bit 4???</label>
            <audio id="audio8bit4" src="tracks/8bit4.ogg" preload="auto"></audio>
        </div>
    </div>
    <h2>UNKNOWN</h2>
            <div class="trait">
            <h3>Unknown Tracks</h3>
            <h2>Please help find these tracks by opening a PR or issue on <a href="https://github.com/OfficiallySp/tftmixer">The Github Repo</a></h2>`;

const htmlEnd = 
`</div>
    <button onclick="playSelectedTracks()">Play Selected Tracks</button>
    <button onclick="stopAllTracks()">Stop All Music</button>
    <script src="script.js"></script>
<hr>
<h3>Created by <a href="https://officiallysp.net">OfficiallySp</a></h3>
<h3>TFT / LoL universe made by <a href="https://www.riotgames.com/en">Riot Games</a></h3>
<h3>©️ Shane Pepperell 2023</h3>
</body>
</html>
`;

const jsStart = `// script.js
function playSelectedTracks() {
    stopAllTracks();`;


const jsEnd = `
}

function playIfChecked(trackCheckboxId, audioId) {
    if (document.getElementById(trackCheckboxId).checked) {
        document.getElementById(audioId).play();
    }
}

function stopAllTracks() {
    var allAudioElements = document.getElementsByTagName('audio');
    for (var i = 0; i < allAudioElements.length; i++) {
        allAudioElements[i].pause();
        allAudioElements[i].currentTime = 0;
    }
}
`;

module.exports = { htmlStart: htmlStart, htmlEnd : htmlEnd, jsStart: jsStart, jsEnd: jsEnd}