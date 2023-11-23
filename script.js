// script.js
function playSelectedTracks() {
    stopAllTracks();

    playIfChecked('KDA1', 'audioKDA1');
    // Repeat the above line for each track, replacing IDs as needed
    playIfChecked('Punk3', 'audioPunk3');
	playIfChecked('Maestro3', 'audioMaestro3');
	playIfChecked('8bit4', 'audio8bit4');
	playIfChecked('unknown', 'audiounknown');
	playIfChecked('unknown1', 'audiounknown1');
	playIfChecked('unknown2', 'audiounknown2');
	playIfChecked('unknown3', 'audiounknown3');
	playIfChecked('unknown4', 'audiounknown4');
	playIfChecked('unknown5', 'audiounknown5');
	playIfChecked('unknown6', 'audiounknown6');
	playIfChecked('unknown7', 'audiounknown7');
	playIfChecked('unknown8', 'audiounknown8');
	playIfChecked('unknown9', 'audiounknown9');
	playIfChecked('unknown10', 'audiounknown10');
	playIfChecked('unknown11', 'audiounknown11');
	playIfChecked('unknown12', 'audiounknown12');
	playIfChecked('unknown13', 'audiounknown13');
	playIfChecked('unknown14', 'audiounknown14');
	
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
