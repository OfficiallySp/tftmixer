// script.js
function playSelectedTracks() {
    stopAllTracks();

    playIfChecked('KDA1', 'audioKDA1');
    // Repeat the above line for each track, replacing IDs as needed

    playIfChecked('Punk3', 'audioPunk3');
    // Repeat for other tracks
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
