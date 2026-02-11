
const presets = {
	preset0: ['kda_late_secondary', 'punk_late_main', 'edm_late_drums', 'pentakill_late_main', 'pentakill_late_secondary'],
    preset1: ['edm_late_main', 'hyperpop_late_drums', 'illbeats_late', 'truedamage_late_secondary'],
    preset2: ['kda_late_main', 'kda_late_secondary', 'punk_late_main', 'maestro_late', '8bit_late_main', 'country_late_main', 'disco_late_main', 'edm_late_drums', 'edm_late_main', 'emo_late_main', 'heartsteel_late_main', 'hyperpop_late', 'illbeats_late', 'jazz_late_main', 'pentakill_late_main', 'pentakill_late_secondary', 'truedamage_late_main', 'truedamage_late_secondary'],
    preset3: ['maestro_late', 'country_late_main', 'edm_late_drums', 'edm_late_main'],
	preset4: ['maestro_early', 'mixmaster_early'],
	preset5: ['disco_late_drums', 'heartsteel_late_secondary', 'hyperpop_late_drums', 'jazz_late_main'],
	preset6: ['punk_early_drums', 'pentakill_early_main', 'pentakill_early_secondary'],
	preset7: ['kda_late_secondary', 'edm_late_main', 'hyperpop_late_drums', 'illbeats_late'],
	preset8: ['punk_late_main', 'maestro_late', 'emo_late_drums', 'emo_late_main'],
	preset9: ['kda_late_main', 'hyperpop_late', 'hyperpop_late_drums'],
	preset10: ['punk_late_main', 'country_late_main', 'emo_late_main', 'pentakill_late_drums'],
	preset11: ['punk_early_main', 'maestro_early', 'country_early_drums', 'disco_early_drums', 'pentakill_early_drums'],
	preset12: ['maestro_late', 'country_late_main', 'emo_late_drums', 'piano_late'],
	preset13: ['disco_early_drums', 'disco_early_main', 'edm_early_main', 'jazz_early_main', 'mixmaster_early'],
	preset14: ['8bit_early_drums', '8bit_early_main', 'edm_early_main', 'hyperpop_early', 'truedamage_early_drums'],
	preset15: ['kda_late_drums', 'kda_late_secondary', 'kda_late_main', 'emo_late_main', 'heartsteel_late_drums', 'hyperpop_late']
	
};

const tracks = ['8bit_early_drums', '8bit_early_main', '8bit_late_drums', '8bit_late_main', 'country_early_drums', 'country_early_main', 'country_late_drums', 'country_late_main', 'death1', 'death2', 'death3', 'death4', 'death5', 'death6', 'disco_early_drums', 'disco_early_main', 'disco_late_drums', 'disco_late_main', 'edm_early_drums', 'edm_early_main', 'edm_late_drums', 'edm_late_main', 'emo_early_drums', 'emo_early_main', 'emo_late_drums', 'emo_late_main', 'heartsteel_early_drums', 'heartsteel_early_main', 'heartsteel_early_secondary', 'heartsteel_late_drums', 'heartsteel_late_main', 'heartsteel_late_secondary', 'hyperpop_early', 'hyperpop_late', 'hyperpop_late_drums', 'illbeats_early', 'illbeats_late', 'jazz_early_main', 'jazz_late_main', 'kda_early_drums', 'kda_early_main', 'kda_early_secondary', 'kda_late_drums', 'kda_late_main', 'kda_late_secondary', 'maestro_early', 'maestro_late', 'mixmaster_early', 'mixmaster_late', 'pentakill_early_drums', 'pentakill_early_main', 'pentakill_early_secondary', 'pentakill_late_drums', 'pentakill_late_main', 'pentakill_late_secondary', 'piano_early', 'piano_late', 'punk_early_drums', 'punk_early_main', 'punk_late_drums', 'punk_late_main', 'starting_carousel', 'truedamage_early_drums', 'truedamage_early_main', 'truedamage_early_secondary', 'truedamage_late_drums', 'truedamage_late_main', 'truedamage_late_secondary'];
const context = new (window.AudioContext || window.webkitAudioContext)();

// Active WebAudio nodes for current playback session
var sourceArray = [];
var audioGainArray = [];
var endedCallbackArray = [];

// Track elements for the full track list (stable indexing)
var trackElements = [];
var initial = true;

// Current loaded buffers (order matches `playback.trackIds`)
var audio_buffers = [];
var startCallback = null; // legacy name: used as an entry point for restarting

var masterGainNode = null;

// Playback session state
var playback = {
    mode: 'static', // 'static' | 'realtime'
    trackIds: [],
    startAt: 0, // AudioContext time when playback starts
    offset: 0, // seconds into the buffer timeline at start
    leaderIndex: null // index within `trackIds` used to trigger repeat
};

// Cache for audio buffers to avoid re-downloading
var audioBufferCache = {};

function ensureTrackElementsInitialized() {
    if (trackElements.length === tracks.length) return;
    trackElements = tracks.map((trackId) => document.getElementById(trackId));
}

async function ensureAudioContextRunning() {
    // Some browsers start the context suspended until a user gesture
    if (context.state === 'suspended') {
        try {
            await context.resume();
        } catch (e) {
            // If resume fails, playback will fail anyway; keep going and let browser surface it.
        }
    }
}

function getSelectedTrackIds() {
    ensureTrackElementsInitialized();
    return tracks.filter((trackId, i) => trackElements[i] && trackElements[i].checked);
}

function getPlaybackDurationSeconds() {
    if (!audio_buffers || audio_buffers.length === 0) return 0;

    if (playback.leaderIndex != null && audio_buffers[playback.leaderIndex]) {
        return audio_buffers[playback.leaderIndex].duration || 0;
    }

    var max = 0;
    for (var i = 0; i < audio_buffers.length; i++) {
        if (audio_buffers[i] && audio_buffers[i].duration > max) {
            max = audio_buffers[i].duration;
        }
    }
    return max;
}

function getCurrentPlaybackPositionSeconds() {
    if (!playback.startAt) return 0;
    var elapsed = Math.max(0, context.currentTime - playback.startAt);
    return (playback.offset || 0) + elapsed;
}

function computeLeaderIndex(trackIds, buffers, mode) {
    if (!buffers || buffers.length === 0) return null;

    var candidateIndices = [];
    if (mode === 'realtime') {
        // In real-time mode, only selected tracks should influence repeat timing
        for (var i = 0; i < trackIds.length; i++) {
            var el = document.getElementById(trackIds[i]);
            if (el && el.checked) candidateIndices.push(i);
        }
    } else {
        // In static mode, all loaded buffers are selected
        for (var j = 0; j < trackIds.length; j++) candidateIndices.push(j);
    }

    if (candidateIndices.length === 0) return null;

    var leader = candidateIndices[0];
    for (var k = 1; k < candidateIndices.length; k++) {
        var idx = candidateIndices[k];
        var idxDur = (buffers[idx] && buffers[idx].duration) ? buffers[idx].duration : 0;
        var leaderDur = (buffers[leader] && buffers[leader].duration) ? buffers[leader].duration : 0;
        if (idxDur > leaderDur) {
            leader = idx;
        }
    }
    return leader;
}

function startPlaybackFromLoadedBuffers(trackIds, buffers, mode, offsetSeconds) {
    stopAllTracks({ clearPlayback: false });

    var currentGlobalVolume = getGlobalVolume();
    masterGainNode = context.createGain();
    masterGainNode.connect(context.destination);
    masterGainNode.gain.setValueAtTime(currentGlobalVolume, context.currentTime);

    playback.mode = mode;
    playback.trackIds = trackIds;
    playback.offset = Math.max(0, offsetSeconds || 0);
    playback.startAt = context.currentTime + 0.25;
    playback.leaderIndex = computeLeaderIndex(trackIds, buffers, mode);

    audio_buffers = buffers;

    // Keep the old entry point name for any existing calls
    startCallback = function (buf, i) {
        // (Re)create a BufferSource for this track
        var source = context.createBufferSource();
        source.buffer = buf;

        var gainNode = context.createGain();
        source.connect(gainNode);
        gainNode.connect(masterGainNode);

        var trackChecked = true;
        if (mode === 'realtime') {
            var el = document.getElementById(trackIds[i]);
            trackChecked = !!(el && el.checked);
        }
        gainNode.gain.setValueAtTime(trackChecked ? 1 : 0, context.currentTime);

        // Guard against invalid offsets (throws in some browsers)
        if (playback.offset < (buf.duration || 0)) {
            source.start(playback.startAt, playback.offset);
        }

        sourceArray[i] = source;
        audioGainArray[i] = gainNode;

        // Only the "leader" track triggers repeat restart (prevents out-of-sync loops)
        if (playback.leaderIndex === i) {
            endedCallbackArray[i] = function () {
                if (document.getElementById('repeat').checked) {
                    restartPlaybackAt(0);
                }
            };
            source.addEventListener('ended', endedCallbackArray[i]);
        }
    };

    // Reset arrays sized to this playback session
    sourceArray = new Array(buffers.length);
    audioGainArray = new Array(buffers.length);
    endedCallbackArray = new Array(buffers.length);

    buffers.forEach(startCallback);
}

function playSelectedTracks() {
    ensureTrackElementsInitialized();

    // If we're in real-time mode and have already loaded buffers, just restart from cache
    if (document.getElementById('realTime').checked &&
        audio_buffers &&
        audio_buffers.length > 0 &&
        playback.trackIds &&
        playback.trackIds.length > 0 &&
        playback.mode === 'realtime'
    ) {
        startPlaybackFromLoadedBuffers(playback.trackIds, audio_buffers, 'realtime', 0);
        return;
    }

    stopAllTracks({ clearPlayback: true });

    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';

    // Hacky way to only add the listeners once bc they are annoying to remove
    // when using an anon func (but anon func makes indexing the tracks easy)
    if (initial) {
        for (var li = 0; li < tracks.length; li++) {
            const trackIndex = li;
            const el = trackElements[li];
            if (el) {
                el.addEventListener('change', () => toggleTrackRealTime(trackIndex));
            }
        }
        initial = false;
    }

    var isRealTime = document.getElementById('realTime').checked;
    var trackIdsToLoad = isRealTime ? tracks.slice() : getSelectedTrackIds();
    var mode = isRealTime ? 'realtime' : 'static';

    (async () => {
        await ensureAudioContextRunning();

        // OPTIMIZATION: Check cache first, only fetch if not cached
        const loadPromises = trackIdsToLoad.map(async (trackId) => {
            if (audioBufferCache[trackId]) {
                return audioBufferCache[trackId];
            }
            const url = "tracks/" + trackId + ".aac";
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await context.decodeAudioData(arrayBuffer);
            audioBufferCache[trackId] = audioBuffer;
            return audioBuffer;
        });

        const buffers = await Promise.all(loadPromises);

        // Avoid appearing to infinite load when playing with no tracks selected (static mode)
        if (!isRealTime && buffers.length === 0) {
            stopAllTracks({ clearPlayback: true });
            document.getElementById('loadingIndicator').style.display = 'none';
            return;
        }

        startPlaybackFromLoadedBuffers(trackIdsToLoad, buffers, mode, 0);

        document.getElementById('loadingIndicator').style.display = 'none';
    })().catch((err) => {
        console.error(err);
        document.getElementById('loadingIndicator').style.display = 'none';
        stopAllTracks({ clearPlayback: true });
    });
}

function restartPlaybackAt(offsetSeconds) {
    if (!playback.trackIds || playback.trackIds.length === 0 || !audio_buffers || audio_buffers.length === 0) {
        return;
    }
    startPlaybackFromLoadedBuffers(playback.trackIds, audio_buffers, playback.mode, offsetSeconds);
}

function stopAllTracks(opts) {
    opts = opts || {};
    var clearPlayback = opts.clearPlayback !== false;

    document.getElementById('loadingIndicator').style.display = 'none';
    for (var i = 0; i < sourceArray.length; i++) {
        if (!sourceArray[i]) continue;
        try {
            sourceArray[i].stop();
        } catch (e) {
            // ignore if already stopped
        }
        if (endedCallbackArray[i] != undefined) {
            sourceArray[i].removeEventListener('ended', endedCallbackArray[i]);
            delete endedCallbackArray[i];
        }
    }
    // clear array contents made in startCallback()
    sourceArray = [];
    audioGainArray = [];
    endedCallbackArray = [];

    if (clearPlayback) {
        playback.mode = 'static';
        playback.trackIds = [];
        playback.startAt = 0;
        playback.offset = 0;
        playback.leaderIndex = null;
        audio_buffers = [];
        startCallback = null;
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
    stopAllTracks({ clearPlayback: true });
}

function toggleTrackRealTime(trackIndex) {
    if (!document.getElementById('realTime').checked) return;
    if (playback.mode !== 'realtime') return;
    if (!playback.trackIds || playback.trackIds.length === 0) return;

    const trackId = tracks[trackIndex];
    const track = document.getElementById(trackId);
    if (!track) return;

    // In real-time mode, playback order is `tracks`, so indices align
    const gainNode = audioGainArray[trackIndex];
    if (gainNode != null) {
        gainNode.gain.setValueAtTime(track.checked ? 1 : 0, context.currentTime);
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
    var selectedTracks = getSelectedTrackIds();

    var url = new URL(window.location.href);
    url.search = '';
    if (selectedTracks.length > 0) {
        // Use comma-separated IDs. URLSearchParams will encode this safely.
        url.searchParams.set('selectedTracks', selectedTracks.join(','));
    }

    navigator.clipboard.writeText(url.toString())
        .then(function () {
            var notification = document.getElementById('copyNotification');
            if (notification) {
                notification.style.display = 'block';
                setTimeout(function () {
                    notification.style.display = 'none';
                }, 2000);
            } else {
                alert("Mix URL copied to clipboard!");
            }
        })
        .catch(function (error) {
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

// Control center helpers (seek / replay / skip)
function restartMix() {
    restartPlaybackAt(0);
}

function seekRelative(seconds) {
    if (!audio_buffers || audio_buffers.length === 0) return;
    var duration = getPlaybackDurationSeconds();
    if (!duration) return;

    var current = getCurrentPlaybackPositionSeconds();
    var target = current + (seconds || 0);
    target = Math.max(0, Math.min(target, Math.max(0, duration - 0.01)));
    restartPlaybackAt(target);
}

function setTracksFromURL() {
    var params = new URLSearchParams(window.location.search);
    var selectedTracks = params.get('selectedTracks');

    if (selectedTracks) {
        // URLSearchParams() already decodes %2C => ',' and %2E%2C => '.,'
        // Support both modern (',') and legacy ('.,') separators.
        selectedTracks.split(/,|\.,/).forEach(function (rawTrackId) {
            var trackId = (rawTrackId || '').trim();
            if (!trackId) return;

            // Handle double-encoded values defensively
            try {
                if (trackId.includes('%')) trackId = decodeURIComponent(trackId);
            } catch (e) {}

            // Remove any trailing dot(s) for legacy URLs
            trackId = trackId.replace(/\.+$/, '');

            var checkbox = document.getElementById(trackId);
            if (checkbox) checkbox.checked = true;
        });
    }
}

setTracksFromURL();
