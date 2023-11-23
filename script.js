// script.js
function playSelectedTracks() {
    stopAllTracks();

    playIfChecked('KDA1', 'audioKDA1');
    // Repeat the above line for each track, replacing IDs as needed
    playIfChecked('Punk3', 'audioPunk3');
	playIfChecked('Maestro3', 'audioMaestro3');
	playIfChecked('8bit4', 'audio8bit4');
	// Unknown Tracks
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
	playIfChecked('unknown15', 'audiounknown15');
	playIfChecked('unknown16', 'audiounknown16');
	playIfChecked('unknown17', 'audiounknown17');
	playIfChecked('unknown18', 'audiounknown18');
	playIfChecked('unknown19', 'audiounknown19');
	playIfChecked('unknown20', 'audiounknown20');
	playIfChecked('unknown21', 'audiounknown21');
	playIfChecked('unknown22', 'audiounknown22');
	playIfChecked('unknown23', 'audiounknown23');
	playIfChecked('unknown24', 'audiounknown24');
	playIfChecked('unknown25', 'audiounknown25');
	playIfChecked('unknown26', 'audiounknown26');
	playIfChecked('unknown27', 'audiounknown27');
	playIfChecked('unknown28', 'audiounknown28');
	playIfChecked('unknown29', 'audiounknown29');
	playIfChecked('unknown30', 'audiounknown30');
	playIfChecked('unknown31', 'audiounknown31');
	playIfChecked('unknown32', 'audiounknown32');
	playIfChecked('unknown33', 'audiounknown33');
	playIfChecked('unknown34', 'audiounknown34');
	playIfChecked('unknown35', 'audiounknown35');
	playIfChecked('unknown36', 'audiounknown36');
	playIfChecked('unknown37', 'audiounknown37');
	playIfChecked('unknown38', 'audiounknown38');
	playIfChecked('unknown39', 'audiounknown39');
	playIfChecked('unknown40', 'audiounknown40');
	playIfChecked('unknown41', 'audiounknown41');
	playIfChecked('unknown42', 'audiounknown42');
	playIfChecked('unknown43', 'audiounknown43');
	playIfChecked('unknown44', 'audiounknown44');
	playIfChecked('unknown45', 'audiounknown45');
	playIfChecked('unknown46', 'audiounknown46');
	playIfChecked('unknown47', 'audiounknown47');
	playIfChecked('unknown48', 'audiounknown48');
	playIfChecked('unknown49', 'audiounknown49');
	playIfChecked('unknown50', 'audiounknown50');
	playIfChecked('unknown51', 'audiounknown51');
	playIfChecked('unknown52', 'audiounknown52');
	playIfChecked('unknown53', 'audiounknown53');
	playIfChecked('unknown54', 'audiounknown54');
	playIfChecked('unknown55', 'audiounknown55');
	playIfChecked('unknown56', 'audiounknown56');
	playIfChecked('unknown57', 'audiounknown57');
	playIfChecked('unknown58', 'audiounknown58');
	playIfChecked('unknown59', 'audiounknown59');
	playIfChecked('unknown60', 'audiounknown60');
	playIfChecked('unknown61', 'audiounknown61');
	playIfChecked('unknown62', 'audiounknown62');
	playIfChecked('unknown63', 'audiounknown63');
	playIfChecked('unknown64', 'audiounknown64');
	playIfChecked('unknown65', 'audiounknown65');
	playIfChecked('unknown66', 'audiounknown66');
	playIfChecked('unknown67', 'audiounknown67');
	playIfChecked('unknown68', 'audiounknown68');
	playIfChecked('unknown69', 'audiounknown69');
	playIfChecked('unknown70', 'audiounknown70');
	playIfChecked('unknown71', 'audiounknown71');
	playIfChecked('unknown72', 'audiounknown72');
	playIfChecked('unknown73', 'audiounknown73');
	playIfChecked('unknown74', 'audiounknown74');
	playIfChecked('unknown75', 'audiounknown75');
	playIfChecked('unknown76', 'audiounknown76');
	playIfChecked('unknown77', 'audiounknown77');
	playIfChecked('unknown78', 'audiounknown78');
	playIfChecked('unknown79', 'audiounknown79');
	playIfChecked('unknown80', 'audiounknown80');
	playIfChecked('unknown81', 'audiounknown81');
	playIfChecked('unknown82', 'audiounknown82');
	playIfChecked('unknown83', 'audiounknown83');
	playIfChecked('unknown84', 'audiounknown84');
	playIfChecked('unknown85', 'audiounknown85');
	playIfChecked('unknown86', 'audiounknown86');
	playIfChecked('unknown87', 'audiounknown87');

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
