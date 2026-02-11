const presets = {
    preset0: ["kda_late_secondary", "punk_late_main", "edm_late_drums", "pentakill_late_main", "pentakill_late_secondary"],
    preset1: ["edm_late_main", "hyperpop_late_drums", "illbeats_late", "truedamage_late_secondary"],
    preset2: ["kda_late_main", "kda_late_secondary", "punk_late_main", "maestro_late", "8bit_late_main", "country_late_main", "disco_late_main", "edm_late_drums", "edm_late_main", "emo_late_main", "heartsteel_late_main", "hyperpop_late", "illbeats_late", "jazz_late_main", "pentakill_late_main", "pentakill_late_secondary", "truedamage_late_main", "truedamage_late_secondary"],
    preset3: ["maestro_late", "country_late_main", "edm_late_drums", "edm_late_main"],
    preset4: ["maestro_early", "mixmaster_early"],
    preset5: ["disco_late_drums", "heartsteel_late_secondary", "hyperpop_late_drums", "jazz_late_main"],
    preset6: ["punk_early_drums", "pentakill_early_main", "pentakill_early_secondary"],
    preset7: ["kda_late_secondary", "edm_late_main", "hyperpop_late_drums", "illbeats_late"],
    preset8: ["punk_late_main", "maestro_late", "emo_late_drums", "emo_late_main"],
    preset9: ["kda_late_main", "hyperpop_late", "hyperpop_late_drums"],
    preset10: ["punk_late_main", "country_late_main", "emo_late_main", "pentakill_late_drums"],
    preset11: ["punk_early_main", "maestro_early", "country_early_drums", "disco_early_drums", "pentakill_early_drums"],
    preset12: ["maestro_late", "country_late_main", "emo_late_drums", "piano_late"],
    preset13: ["disco_early_drums", "disco_early_main", "edm_early_main", "jazz_early_main", "mixmaster_early"],
    preset14: ["8bit_early_drums", "8bit_early_main", "edm_early_main", "hyperpop_early", "truedamage_early_drums"],
    preset15: ["kda_late_drums", "kda_late_secondary", "kda_late_main", "emo_late_main", "heartsteel_late_drums", "hyperpop_late"]
};

const tracks = ["8bit_early_drums", "8bit_early_main", "8bit_late_drums", "8bit_late_main", "country_early_drums", "country_early_main", "country_late_drums", "country_late_main", "death1", "death2", "death3", "death4", "death5", "death6", "disco_early_drums", "disco_early_main", "disco_late_drums", "disco_late_main", "edm_early_drums", "edm_early_main", "edm_late_drums", "edm_late_main", "emo_early_drums", "emo_early_main", "emo_late_drums", "emo_late_main", "heartsteel_early_drums", "heartsteel_early_main", "heartsteel_early_secondary", "heartsteel_late_drums", "heartsteel_late_main", "heartsteel_late_secondary", "hyperpop_early", "hyperpop_late", "hyperpop_late_drums", "illbeats_early", "illbeats_late", "jazz_early_main", "jazz_late_main", "kda_early_drums", "kda_early_main", "kda_early_secondary", "kda_late_drums", "kda_late_main", "kda_late_secondary", "maestro_early", "maestro_late", "mixmaster_early", "mixmaster_late", "pentakill_early_drums", "pentakill_early_main", "pentakill_early_secondary", "pentakill_late_drums", "pentakill_late_main", "pentakill_late_secondary", "piano_early", "piano_late", "punk_early_drums", "punk_early_main", "punk_late_drums", "punk_late_main", "starting_carousel", "truedamage_early_drums", "truedamage_early_main", "truedamage_early_secondary", "truedamage_late_drums", "truedamage_late_main", "truedamage_late_secondary"];

const trackSourceOverrides = {
    heartsteel_late_drums: "illbeats_late",
    illbeats_late: "heartsteel_late_drums",
    hyperpop_late_drums: "truedamage_late_drums",
    truedamage_late_drums: "hyperpop_late_drums"
};

const PLAY_START_DELAY_SECONDS = 0.25;
const REAL_TIME_ADD_DELAY_SECONDS = 0.05;
const PLAYBACK_POSITION_UPDATE_MS = 250;

const context = new (window.AudioContext || window.webkitAudioContext)();
const audioBufferCache = {};
const activeTrackState = new Map();
const pendingTrackLoads = new Set();

let masterGainNode = null;
let isPlaybackActive = false;
let playbackGeneration = 0;
let loadingToken = 0;
let basePlaybackOffset = 0;
let playbackStartedAt = 0;
let playbackPositionIntervalId = null;

tracks.forEach((trackId) => {
    const trackElement = document.getElementById(trackId);
    if (trackElement) {
        trackElement.addEventListener("change", () => toggleTrackRealTime(trackId));
    }
});

function getTrackFileId(trackId) {
    return trackSourceOverrides[trackId] || trackId;
}

function getTrackUrl(trackId) {
    return "tracks/" + getTrackFileId(trackId) + ".aac";
}

function getSelectedTrackIds() {
    return tracks.filter((trackId) => {
        const trackElement = document.getElementById(trackId);
        return Boolean(trackElement && trackElement.checked);
    });
}

function setLoadingIndicatorVisible(isVisible) {
    const loadingIndicator = document.getElementById("loadingIndicator");
    if (loadingIndicator) {
        loadingIndicator.style.display = isVisible ? "block" : "none";
    }
}

function ensureMasterGainNode() {
    if (!masterGainNode) {
        masterGainNode = context.createGain();
        masterGainNode.connect(context.destination);
    }
}

function normalizeOffsetForBuffer(buffer, offsetSeconds) {
    if (!buffer || buffer.duration <= 0) {
        return 0;
    }
    const normalizedOffset = offsetSeconds % buffer.duration;
    return normalizedOffset >= 0 ? normalizedOffset : normalizedOffset + buffer.duration;
}

async function loadTrackBuffer(trackId) {
    if (audioBufferCache[trackId]) {
        return audioBufferCache[trackId];
    }
    const response = await fetch(getTrackUrl(trackId));
    if (!response.ok) {
        throw new Error("Failed loading track " + trackId + " (" + response.status + ")");
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    audioBufferCache[trackId] = audioBuffer;
    return audioBuffer;
}

function removeTrackState(trackId, stopSource) {
    const trackState = activeTrackState.get(trackId);
    if (!trackState) {
        return;
    }

    if (trackState.onEnded) {
        trackState.source.removeEventListener("ended", trackState.onEnded);
    }

    if (stopSource) {
        try {
            trackState.source.stop();
        } catch (error) {
            // Source may have already ended; ignore.
        }
    }

    activeTrackState.delete(trackId);
}

function stopAllSources() {
    playbackGeneration += 1;
    for (const trackId of activeTrackState.keys()) {
        removeTrackState(trackId, true);
    }
}

function getCurrentPlaybackOffset() {
    if (!isPlaybackActive || playbackStartedAt === 0) {
        return basePlaybackOffset;
    }
    const elapsed = context.currentTime - playbackStartedAt;
    return Math.max(0, basePlaybackOffset + (elapsed > 0 ? elapsed : 0));
}

function formatTime(seconds) {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(remainingSeconds).padStart(2, "0");
}

function updatePlaybackPositionDisplay(seconds) {
    const playbackPosition = document.getElementById("playbackPosition");
    if (!playbackPosition) {
        return;
    }
    const value = typeof seconds === "number" ? seconds : getCurrentPlaybackOffset();
    playbackPosition.textContent = formatTime(value);
}

function startPlaybackPositionUpdates() {
    if (playbackPositionIntervalId) {
        clearInterval(playbackPositionIntervalId);
    }
    updatePlaybackPositionDisplay();
    playbackPositionIntervalId = setInterval(() => {
        updatePlaybackPositionDisplay();
    }, PLAYBACK_POSITION_UPDATE_MS);
}

function stopPlaybackPositionUpdates(resetPosition) {
    if (playbackPositionIntervalId) {
        clearInterval(playbackPositionIntervalId);
        playbackPositionIntervalId = null;
    }
    if (resetPosition) {
        updatePlaybackPositionDisplay(0);
    }
}

function startTrackSource(trackId, offsetSeconds, startAt, sessionGeneration) {
    const audioBuffer = audioBufferCache[trackId];
    if (!audioBuffer) {
        return;
    }

    removeTrackState(trackId, true);

    const source = context.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = context.createGain();
    source.connect(gainNode);
    gainNode.connect(masterGainNode);

    const checkbox = document.getElementById(trackId);
    const isChecked = Boolean(checkbox && checkbox.checked);
    gainNode.gain.setValueAtTime(isChecked ? 1 : 0, context.currentTime);

    const trackState = {
        source,
        gainNode,
        ended: false,
        generation: sessionGeneration,
        onEnded: null
    };

    trackState.onEnded = () => {
        if (trackState.generation !== playbackGeneration) {
            return;
        }
        const currentState = activeTrackState.get(trackId);
        if (!currentState || currentState.source !== source) {
            return;
        }
        currentState.ended = true;
        maybeRepeatSelectedTracks();
    };

    source.addEventListener("ended", trackState.onEnded);
    activeTrackState.set(trackId, trackState);

    const normalizedOffset = normalizeOffsetForBuffer(audioBuffer, offsetSeconds);
    source.start(startAt, normalizedOffset);
}

async function startPlayback(selectedTrackIds, startOffsetSeconds) {
    const uniqueTrackIds = selectedTrackIds.filter((trackId, index, allTrackIds) => allTrackIds.indexOf(trackId) === index);

    stopAllSources();
    pendingTrackLoads.clear();

    if (uniqueTrackIds.length === 0) {
        isPlaybackActive = false;
        basePlaybackOffset = 0;
        playbackStartedAt = 0;
        stopPlaybackPositionUpdates(true);
        setLoadingIndicatorVisible(false);
        return;
    }

    const currentLoadingToken = ++loadingToken;
    setLoadingIndicatorVisible(true);

    try {
        uniqueTrackIds.forEach((trackId) => pendingTrackLoads.add(trackId));
        await Promise.all(uniqueTrackIds.map(async (trackId) => {
            await loadTrackBuffer(trackId);
            pendingTrackLoads.delete(trackId);
        }));

        if (currentLoadingToken !== loadingToken) {
            return;
        }

        await context.resume();
        ensureMasterGainNode();
        masterGainNode.gain.setValueAtTime(getGlobalVolume(), context.currentTime);

        const safeOffset = Math.max(0, startOffsetSeconds || 0);
        const startAt = context.currentTime + PLAY_START_DELAY_SECONDS;
        const sessionGeneration = playbackGeneration;

        basePlaybackOffset = safeOffset;
        playbackStartedAt = startAt;
        isPlaybackActive = true;

        uniqueTrackIds.forEach((trackId) => {
            startTrackSource(trackId, safeOffset, startAt, sessionGeneration);
        });

        startPlaybackPositionUpdates();
    } catch (error) {
        console.error("Error while starting playback:", error);
        isPlaybackActive = false;
        stopPlaybackPositionUpdates(false);
    } finally {
        setLoadingIndicatorVisible(false);
    }
}

function playSelectedTracks() {
    startPlayback(getSelectedTrackIds(), 0);
}

function areAllCheckedTracksDone() {
    const selectedTrackIds = getSelectedTrackIds();
    if (selectedTrackIds.length === 0) {
        return false;
    }
    return selectedTrackIds.every((trackId) => {
        if (pendingTrackLoads.has(trackId)) {
            return false;
        }
        const trackState = activeTrackState.get(trackId);
        return Boolean(trackState && trackState.ended);
    });
}

function maybeRepeatSelectedTracks() {
    if (!isPlaybackActive) {
        return;
    }
    const repeatCheckbox = document.getElementById("repeat");
    if (!repeatCheckbox || !repeatCheckbox.checked) {
        return;
    }
    if (!areAllCheckedTracksDone()) {
        return;
    }
    const selectedTrackIds = getSelectedTrackIds();
    if (selectedTrackIds.length > 0) {
        startPlayback(selectedTrackIds, 0);
    }
}

function stopAllTracks() {
    loadingToken += 1;
    pendingTrackLoads.clear();
    stopAllSources();
    isPlaybackActive = false;
    basePlaybackOffset = 0;
    playbackStartedAt = 0;
    stopPlaybackPositionUpdates(true);
    setLoadingIndicatorVisible(false);
}

function getGlobalVolume() {
    const globalVolume = document.getElementById("globalVolume");
    return (globalVolume && globalVolume.valueAsNumber) || 1;
}

function setGlobalVolume(value) {
    if (masterGainNode) {
        masterGainNode.gain.setValueAtTime(value, context.currentTime);
    }
}

function toggleRealTime() {
    stopAllTracks();
}

function toggleTrackRealTime(trackId) {
    const realTimeCheckbox = document.getElementById("realTime");
    if (!realTimeCheckbox || !realTimeCheckbox.checked || !isPlaybackActive) {
        return;
    }

    const trackElement = document.getElementById(trackId);
    if (!trackElement) {
        return;
    }

    const existingState = activeTrackState.get(trackId);

    if (!trackElement.checked) {
        if (existingState) {
            existingState.gainNode.gain.setValueAtTime(0, context.currentTime);
        }
        return;
    }

    if (existingState && !existingState.ended) {
        existingState.gainNode.gain.setValueAtTime(1, context.currentTime);
        return;
    }

    const generationOnToggle = playbackGeneration;
    pendingTrackLoads.add(trackId);

    loadTrackBuffer(trackId)
        .then(() => {
            pendingTrackLoads.delete(trackId);

            const refreshedRealTimeCheckbox = document.getElementById("realTime");
            const refreshedTrackElement = document.getElementById(trackId);
            if (!refreshedRealTimeCheckbox || !refreshedRealTimeCheckbox.checked) {
                return;
            }
            if (!refreshedTrackElement || !refreshedTrackElement.checked || !isPlaybackActive) {
                return;
            }
            if (generationOnToggle !== playbackGeneration) {
                return;
            }

            startTrackSource(trackId, getCurrentPlaybackOffset(), context.currentTime + REAL_TIME_ADD_DELAY_SECONDS, playbackGeneration);
        })
        .catch((error) => {
            pendingTrackLoads.delete(trackId);
            console.error("Error loading real-time track " + trackId + ":", error);
        });
}

function randomSelectTracks(trackSelector) {
    clearAllSelections();

    const selector = trackSelector || "";
    const checkboxes = Array.from(document.querySelectorAll(".trait input[type=\"checkbox\"]" + selector));
    const maxSelect = Math.min(5, checkboxes.length);

    for (let i = 0; i < maxSelect; i++) {
        const randomIndex = Math.floor(Math.random() * checkboxes.length);
        const checkbox = checkboxes.splice(randomIndex, 1)[0];
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change"));
    }
}

function randomSelectEarlyTracks() {
    randomSelectTracks(".early");
}

function randomSelectLateTracks() {
    randomSelectTracks(".late");
}

function clearAllSelections() {
    const checkboxes = document.querySelectorAll(".trait input[type=\"checkbox\"]");
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
        checkboxes[i].dispatchEvent(new Event("change"));
    }
}

function getShareableMixUrl() {
    const selectedTracks = getSelectedTrackIds();
    const shareUrl = new URL(window.location.href);
    shareUrl.search = "";
    if (selectedTracks.length > 0) {
        shareUrl.searchParams.set("selectedTracks", selectedTracks.join(","));
    }
    return shareUrl.toString().replace(/[.,]$/, "");
}

function generateShareableLink() {
    const shareUrl = getShareableMixUrl();
    navigator.clipboard.writeText(shareUrl)
        .then(() => {
            alert("Mix URL copied to clipboard!");
        })
        .catch((error) => {
            console.error("Error copying URL: ", error);
        });
}

function tweetMix() {
    const twitterUrl = "https://x.com/intent/tweet?text=Check out my TFT remix rumble music mix!: " + encodeURIComponent(getShareableMixUrl()) + "&hashtags=TFT,TFTRemixRumble";
    window.open(twitterUrl, "_blank").focus();
}

function applyPreset(presetName) {
    const checkboxes = document.querySelectorAll(".trait input[type=\"checkbox\"]");
    checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });

    const presetSelections = presets[presetName] || [];
    presetSelections.forEach((selectionId) => {
        const checkbox = document.getElementById(selectionId);
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    checkboxes.forEach((checkbox) => {
        checkbox.dispatchEvent(new Event("change"));
    });
}

function parseSelectedTrackIds(rawSelectedTracks) {
    if (!rawSelectedTracks) {
        return [];
    }

    let decodedTracks = rawSelectedTracks;
    try {
        decodedTracks = decodeURIComponent(decodedTracks);
    } catch (error) {
        // Keep the original value if decoding fails.
    }

    decodedTracks = decodedTracks
        .replace(/%2C/gi, ",")
        .replace(/%2E/gi, ".")
        .replace(/\.\,/g, ",");

    return decodedTracks
        .split(",")
        .map((trackId) => trackId.trim().replace(/\.+$/, ""))
        .filter((trackId) => trackId.length > 0 && tracks.includes(trackId));
}

function setTracksFromURL() {
    const params = new URLSearchParams(window.location.search);
    const selectedTracks = params.get("selectedTracks");
    parseSelectedTrackIds(selectedTracks).forEach((trackId) => {
        const checkbox = document.getElementById(trackId);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

function restartCurrentMix() {
    const selectedTrackIds = getSelectedTrackIds();
    if (selectedTrackIds.length === 0) {
        return;
    }
    startPlayback(selectedTrackIds, 0);
}

function seekBySeconds(secondsToSeek) {
    if (!isPlaybackActive) {
        return;
    }
    const selectedTrackIds = getSelectedTrackIds();
    if (selectedTrackIds.length === 0) {
        stopAllTracks();
        return;
    }
    const nextOffset = Math.max(0, getCurrentPlaybackOffset() + secondsToSeek);
    startPlayback(selectedTrackIds, nextOffset);
}

setTracksFromURL();
updatePlaybackPositionDisplay(0);
