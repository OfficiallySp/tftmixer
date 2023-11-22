// script.js
function playSelectedTracks() {
    // Stop all tracks first
    stopAllTracks();

    // Check each track and play if selected
    if (document.getElementById('track1').checked) {
        document.getElementById('audio1').play();
    }
    if (document.getElementById('track2').checked) {
        document.getElementById('audio2').play();
    }
    // Add similar if conditions for other tracks
}

function stopAllTracks() {
    var allAudioElements = document.getElementsByTagName('audio');
    for (var i = 0; i < allAudioElements.length; i++) {
        allAudioElements[i].pause();
        allAudioElements[i].currentTime = 0;
    }
}
