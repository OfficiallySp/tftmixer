
const presets = {
	preset0: ['kda_late_secondary', 'punk_late_main', 'edm_late_drums', 'pentakill_late_main', 'pentakill_late_secondary'],
    preset1: ['edm_late_main', 'truedamage_late_drums', 'illbeats_late', 'truedamage_late_secondary'],
    preset2: ['kda_late_main', 'kda_late_secondary', 'punk_late_main', 'maestro_late', '8bit_late_main', 'country_late_main', 'disco_late_main', 'edm_late_drums', 'edm_late_main', 'emo_late_main', 'heartsteel_late_main', 'hyperpop_late', 'illbeats_late', 'jazz_late_main', 'pentakill_late_main', 'pentakill_late_secondary', 'truedamage_late_main', 'truedamage_late_secondary'],
    preset3: ['maestro_late', 'country_late_main', 'edm_late_drums', 'edm_late_main'],
	preset4: ['maestro_early', 'mixmaster_early'],
	preset5: ['disco_late_drums', 'heartsteel_late_secondary', 'truedamage_late_drums', 'jazz_late_main'],
	preset6: ['punk_early_drums', 'pentakill_early_main', 'pentakill_early_secondary'],
	preset7: ['kda_late_secondary', 'edm_late_main', 'truedamage_late_drums', 'illbeats_late'],
	preset8: ['punk_late_main', 'maestro_late', 'emo_late_drums', 'emo_late_main'],
	preset9: ['kda_late_main', 'hyperpop_late', 'truedamage_late_drums'],
	preset10: ['punk_late_main', 'country_late_main', 'emo_late_main', 'pentakill_late_drums'],
	preset11: ['punk_early_main', 'maestro_early', 'country_early_drums', 'disco_early_drums', 'pentakill_early_drums'],
	preset12: ['maestro_late', 'country_late_main', 'emo_late_drums', 'piano_late'],
	preset13: ['disco_early_drums', 'disco_early_main', 'edm_early_main', 'jazz_early_main', 'mixmaster_early'],
	preset14: ['8bit_early_drums', '8bit_early_main', 'edm_early_main', 'hyperpop_early', 'truedamage_early_drums'],
	preset15: ['kda_late_drums', 'kda_late_secondary', 'kda_late_main', 'emo_late_main', 'heartsteel_late_drums', 'hyperpop_late']
	
};

const tracks = ['8bit_early_drums', '8bit_early_main', '8bit_late_drums', '8bit_late_main', 'country_early_drums', 'country_early_main', 'country_late_drums', 'country_late_main', 'death1', 'death2', 'death3', 'death4', 'death5', 'death6', 'disco_early_drums', 'disco_early_main', 'disco_late_drums', 'disco_late_main', 'edm_early_drums', 'edm_early_main', 'edm_late_drums', 'edm_late_main', 'emo_early_drums', 'emo_early_main', 'emo_late_drums', 'emo_late_main', 'heartsteel_early_drums', 'heartsteel_early_main', 'heartsteel_early_secondary', 'heartsteel_late_drums', 'heartsteel_late_main', 'heartsteel_late_secondary', 'hyperpop_early', 'hyperpop_late', 'illbeats_early', 'illbeats_late', 'jazz_early_main', 'jazz_late_main', 'kda_early_drums', 'kda_early_main', 'kda_early_secondary', 'kda_late_drums', 'kda_late_main', 'kda_late_secondary', 'maestro_early', 'maestro_late', 'mixmaster_early', 'mixmaster_late', 'pentakill_early_drums', 'pentakill_early_main', 'pentakill_early_secondary', 'pentakill_late_drums', 'pentakill_late_main', 'pentakill_late_secondary', 'piano_early', 'piano_late', 'punk_early_drums', 'punk_early_main', 'punk_late_drums', 'punk_late_main', 'starting_carousel', 'truedamage_early_drums', 'truedamage_early_main', 'truedamage_early_secondary', 'truedamage_late_drums', 'truedamage_late_main', 'truedamage_late_secondary'];
const context = new(window.AudioContext || window.webkitAudioContext)();
var sourceArray = [];
var audioGainArray = [];
var activeTrackElements = [];
var masterGainNode = null
var initial = true;

var audio_buffers = [];
var startCallback = null;
var endedArray = [];
var playingArray = [];
var endedCallbackArray = [];

// Cache for audio buffers to avoid re-downloading
var audioBufferCache = {};

// Playback control center state
var playbackStartContextTime = 0;  // context.currentTime when playback started
var playbackOffset = 0;            // offset into the track (for seeking)
var maxDuration = 0;               // duration of the longest active track
var isPlaying = false;
var progressAnimationId = null;

function playSelectedTracks() {
    stopAllTracks();
    playbackOffset = 0;

    // reuse loaded AudioBuffer in real time mode
    if (document.getElementById('realTime').checked &&
        audio_buffers &&
        audio_buffers.length > 0 &&
        startCallback
    ) {
        masterGainNode = context.createGain();
        masterGainNode.connect(context.destination);
        masterGainNode.gain.setValueAtTime(getGlobalVolume(), context.currentTime);
        playbackStartContextTime = context.currentTime + 0.25;
        isPlaying = true;
        maxDuration = audio_buffers.reduce((max, buf) => Math.max(max, buf.duration), 0);
        audio_buffers.forEach(startCallback);
        updateControlCenter(true);
        return;
    }

    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    var playlist = [];
    activeTrackElements = [];

    var currentGlobalVolume = getGlobalVolume(); // Get the current global volume
    var isRealTime = document.getElementById('realTime').checked;
    for (var i = 0; i < tracks.length; i++) {
        // Hacky way to only add the listeners once bc they are annoying to remove 
        // when using an anon func (but anon func makes indexing the tracks easy)
        const trackElement = document.getElementById(tracks[i])
        if (initial) {
            const trackIndex = i;
            trackElement.addEventListener('change', () => toggleTrackRealTime(trackIndex));
        }
        // In real-time mode, load ALL tracks so they can be toggled on/off
        // In normal mode, only load checked tracks
        if (isRealTime || trackElement.checked) {
            activeTrackElements.push(trackElement);
            playlist.push("tracks/" + tracks[i] + ".aac");
        }
    }
    initial = false;

    (async () => {
        const urls = playlist;
        // OPTIMIZATION: Check cache first, only fetch if not cached
        const loadPromises = urls.map(async (url) => {
            const trackName = url.replace('tracks/', '').replace('.aac', '');
            if (audioBufferCache[trackName]) {
                return audioBufferCache[trackName];
            }
            // Fetch and decode, then cache
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await context.decodeAudioData(arrayBuffer);
            audioBufferCache[trackName] = audioBuffer;
            return audioBuffer;
        });
        
        audio_buffers = await Promise.all(loadPromises);
        // to enable the AudioContext we need to handle a user gesture
        masterGainNode = context.createGain();
        masterGainNode.connect(context.destination);
        masterGainNode.gain.setValueAtTime(currentGlobalVolume, context.currentTime);

        startCallback = (buf, i) => {
            // a buffer source is a really small object
            // don't be afraid of creating and throwing it
            const source = context.createBufferSource();
            // we only connect the decoded data, it's not copied
            source.buffer = buf;
            // start them all at playbackStartContextTime, so we're sure they're in sync
            const gainNode = context.createGain();
            source.start(playbackStartContextTime, playbackOffset);
            source.connect(gainNode);
            gainNode.connect(masterGainNode);
            sourceArray.push(source);
            audioGainArray.push(gainNode);
            const trackChecked = !document.getElementById('realTime').checked || activeTrackElements[i].checked;
            gainNode.gain.setValueAtTime(trackChecked ? 1 : 0, context.currentTime);
            // prepare for repeat play
            endedArray.push(false);
            if (trackChecked) {
                playingArray[i] = true;
            }
            endedCallbackArray[i] = () => {
                endedArray[i] = true;
                if (playingArray[i]) {
                    playingArray[i] = false;
                    // only the last track triggers restart
                    if (areAllCheckedTracksDone()) {
                        if (document.getElementById('repeat').checked) {
                            stopAllTracks();
                            playbackOffset = 0;
                            playbackStartContextTime = context.currentTime + 0.25;
                            masterGainNode = context.createGain();
                            masterGainNode.connect(context.destination);
                            masterGainNode.gain.setValueAtTime(getGlobalVolume(), context.currentTime);
                            isPlaying = true;
                            audio_buffers.forEach(startCallback);
                            updateControlCenter(true);
                        } else {
                            updateControlCenter(false);
                        }
                    }
                }
            };
            source.addEventListener('ended', endedCallbackArray[i]);
        };

        // Calculate max duration for the progress bar
        maxDuration = audio_buffers.reduce((max, buf) => Math.max(max, buf.duration), 0);
        playbackStartContextTime = context.currentTime + 0.25;
        isPlaying = true;
        audio_buffers.forEach(startCallback);
        updateControlCenter(true);

        // Avoid appearing to infinite load when playing with no tracks selected
        if (audio_buffers.length == 0) {
            stopAllTracks();
        }

        document.getElementById('loadingIndicator').style.display = 'none';
    })();
}

function areAllCheckedTracksDone() {
    return playingArray.some((playing) => playing === false) && playingArray.every((playing) => playing === false);
}

function stopAllTracks() {
    document.getElementById('loadingIndicator').style.display = 'none';
    for (var i = 0; i < sourceArray.length; i++) {
        sourceArray[i].stop();
        if (endedCallbackArray[i] != undefined) {
            sourceArray[i].removeEventListener('ended', endedCallbackArray[i]);
            delete endedCallbackArray[i];
        }
    }
    // clear array contents made in startCallback()
    sourceArray = [];
    audioGainArray = [];
    endedArray = [];
    playingArray = [];
    endedCallbackArray = [];
    isPlaying = false;
    if (progressAnimationId) {
        cancelAnimationFrame(progressAnimationId);
        progressAnimationId = null;
    }
}

function getGlobalVolume() {
    return document.getElementById('globalVolume').valueAsNumber || 1; // Default to 1 if not set
}

function setGlobalVolume(value) {
    if (masterGainNode != null) {
        masterGainNode.gain.setValueAtTime(value, context.currentTime);
    }
}

function toggleRealTime() {
    stopAllTracks();
    audio_buffers = [];
    startCallback = null;
    activeTrackElements = [];
}

function toggleTrackRealTime(trackIndex) {
    if (document.getElementById('realTime').checked) {
        const track = activeTrackElements[trackIndex];
        if (!track) return;
        
        const gainNode = audioGainArray[trackIndex];
        if (gainNode != null) {
            gainNode.gain.setValueAtTime(track.checked ? 1 : 0, context.currentTime);

            if (endedArray[trackIndex] !== true) {
                if (track.checked) {
                    playingArray[trackIndex] = true;
                } else if (playingArray[trackIndex] != undefined) {
                    delete playingArray[trackIndex];
                }
            }
        }
    }
}

function randomSelectTracks(trackSelector = '') {
    clearAllSelections();
    var checkboxes = document.querySelectorAll('.trait input[type="checkbox"]' + trackSelector);
    var maxSelect = Math.min(5, checkboxes.length);

    for (var i = 0; i < maxSelect; i++) {
        var randomIndex = Math.floor(Math.random() * checkboxes.length);
        checkboxes[randomIndex].checked = true;
        checkboxes[randomIndex].dispatchEvent(new Event('change'))
    }

    if (document.getElementById('realTime').checked &&
        audio_buffers &&
        startCallback &&
        document.getElementById('repeat').checked &&
        areAllCheckedTracksDone()
    ) {
        stopAllTracks();
        playbackOffset = 0;
        playbackStartContextTime = context.currentTime + 0.25;
        masterGainNode = context.createGain();
        masterGainNode.connect(context.destination);
        masterGainNode.gain.setValueAtTime(getGlobalVolume(), context.currentTime);
        isPlaying = true;
        audio_buffers.forEach(startCallback);
        updateControlCenter(true);
    }
}

function randomSelectEarlyTracks() {
    randomSelectTracks('.early')
}

function randomSelectLateTracks() {
    randomSelectTracks('.late')
}

function clearAllSelections() {
    var checkboxes = document.querySelectorAll('.trait input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
        checkboxes[i].dispatchEvent(new Event('change'))
    }
}

function generateShareableLink() {
    var checkboxes = document.querySelectorAll('.trait input[type="checkbox"]');
    var selectedTracks = [];

    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            selectedTracks.push(checkbox.id);
        }
    });

    var url = window.location.href.split('?')[0];
    var params = selectedTracks.join(',');

    // Add the parameters to the URL
    url += '?selectedTracks=' + params;

    navigator.clipboard.writeText(url).then(function() {
            alert("Mix URL copied to clipboard!");
        })
        .catch(function(error) {
            console.error("Error copying URL: ", error);
        });
}

function tweetMix() {
    var checkboxes = document.querySelectorAll('.trait input[type="checkbox"]');
    var selectedTracks = [];

    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            selectedTracks.push(checkbox.id);
        }
    });

    var url = window.location.href.split('?')[0];
    url += '?selectedTracks=' + selectedTracks.join(',');

    var twitterUrl = 'https://x.com/intent/tweet?text=Check out my TFT remix rumble music mix!: ' + encodeURIComponent(url) + '&hashtags=TFT,TFTRemixRumble';
    window.open(twitterUrl, '_blank').focus();
}

function applyPreset(presetName) {
    // First, clear all selections
    const checkboxes = document.querySelectorAll('input[type=checkbox]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Apply the preset selections
    const presetSelections = presets[presetName];
    presetSelections.forEach(selectionId => {
        const checkbox = document.getElementById(selectionId);
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    // Update any UI elements or states as necessary
}

// ---- Control Center Functions ----

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function getCurrentPlaybackTime() {
    if (!isPlaying) return playbackOffset;
    return playbackOffset + (context.currentTime - playbackStartContextTime);
}

function updateControlCenter(playing) {
    var controlCenter = document.getElementById('controlCenter');
    if (!controlCenter) return;

    if (playing) {
        controlCenter.style.display = 'block';
        startProgressUpdate();
    } else {
        stopProgressUpdate();
        // Update final state
        var progressBar = document.getElementById('progressBar');
        var currentTimeDisplay = document.getElementById('currentTime');
        if (progressBar && currentTimeDisplay) {
            var currentTime = Math.min(getCurrentPlaybackTime(), maxDuration);
            progressBar.value = maxDuration > 0 ? (currentTime / maxDuration) * 100 : 0;
            currentTimeDisplay.textContent = formatTime(currentTime);
        }
    }

    var totalTimeDisplay = document.getElementById('totalTime');
    if (totalTimeDisplay) {
        totalTimeDisplay.textContent = formatTime(maxDuration);
    }
}

function startProgressUpdate() {
    stopProgressUpdate();
    function update() {
        if (!isPlaying) return;
        var progressBar = document.getElementById('progressBar');
        var currentTimeDisplay = document.getElementById('currentTime');
        if (progressBar && currentTimeDisplay) {
            var currentTime = getCurrentPlaybackTime();
            var effectiveDuration = maxDuration - playbackOffset;
            if (effectiveDuration > 0 && maxDuration > 0) {
                var progress = Math.min(currentTime / maxDuration, 1) * 100;
                progressBar.value = progress;
            }
            currentTimeDisplay.textContent = formatTime(Math.min(currentTime, maxDuration));
        }
        progressAnimationId = requestAnimationFrame(update);
    }
    progressAnimationId = requestAnimationFrame(update);
}

function stopProgressUpdate() {
    if (progressAnimationId) {
        cancelAnimationFrame(progressAnimationId);
        progressAnimationId = null;
    }
}

function seekTo(position) {
    // position is 0-100 percentage
    if (maxDuration <= 0 || !audio_buffers || audio_buffers.length === 0) return;
    var newOffset = (position / 100) * maxDuration;
    playbackOffset = Math.max(0, Math.min(newOffset, maxDuration));
    if (isPlaying) {
        // Stop current playback and restart at new position
        stopAllTracks();
        // Recreate master gain
        var currentGlobalVolume = getGlobalVolume();
        var current_time = context.currentTime;
        masterGainNode = context.createGain();
        masterGainNode.connect(context.destination);
        masterGainNode.gain.setValueAtTime(currentGlobalVolume, context.currentTime);
        playbackStartContextTime = current_time + 0.25;
        isPlaying = true;
        audio_buffers.forEach(startCallback);
        updateControlCenter(true);
    }
}

function skipForward() {
    if (maxDuration <= 0) return;
    var currentTime = getCurrentPlaybackTime();
    var newTime = Math.min(currentTime + 10, maxDuration);
    seekTo((newTime / maxDuration) * 100);
}

function skipBackward() {
    if (maxDuration <= 0) return;
    var currentTime = getCurrentPlaybackTime();
    var newTime = Math.max(currentTime - 10, 0);
    seekTo((newTime / maxDuration) * 100);
}

function restartPlayback() {
    playbackOffset = 0;
    if (audio_buffers && audio_buffers.length > 0) {
        stopAllTracks();
        var currentGlobalVolume = getGlobalVolume();
        var current_time = context.currentTime;
        masterGainNode = context.createGain();
        masterGainNode.connect(context.destination);
        masterGainNode.gain.setValueAtTime(currentGlobalVolume, context.currentTime);
        playbackStartContextTime = current_time + 0.25;
        isPlaying = true;
        audio_buffers.forEach(startCallback);
        updateControlCenter(true);
    }
}

function setTracksFromURL() {
    var params = new URLSearchParams(window.location.search);
    var selectedTracks = params.get('selectedTracks');

    if (selectedTracks) {
        selectedTracks.split(',').forEach(function(trackId) {
            // Remove any trailing dot for legacy URLs and trim whitespace
            trackId = trackId.replace(/\.+$/, '').trim();
            if (trackId) {
                var checkbox = document.getElementById(trackId);
                if (checkbox) {
                    checkbox.checked = true;
                }
            }
        });
    }
}

setTracksFromURL();
