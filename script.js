const tracks = ['8bit_early_drums.', '8bit_early_main.', '8bit_late_drums.', '8bit_late_main.', 'country_early_drums.', 'country_early_main.', 'country_late_drums.', 'country_late_main.', 'death1.', 'death2.', 'death3.', 'death4.', 'death5.', 'death6.', 'disco_early_drums.', 'disco_early_main.', 'disco_late_drums.', 'disco_late_main.', 'edm_early_drums.', 'edm_early_main.', 'edm_late_drums.', 'edm_late_main.', 'emo_early_drums.', 'emo_early_main.', 'emo_late_drums.', 'emo_late_main.', 'heartsteel_early_drums.', 'heartsteel_early_main.', 'heartsteel_early_secondary.', 'heartsteel_late_drums.', 'heartsteel_late_main.', 'heartsteel_late_secondary.', 'hyperpop_early.', 'hyperpop_late.', 'hyperpop_late_drums.', 'illbeats_early.', 'illbeats_late.', 'jazz_early_main.', 'jazz_late_main.', 'kda_early_drums.', 'kda_early_main.', 'kda_early_secondary.', 'kda_late_drums.', 'kda_late_main.', 'kda_late_secondary.', 'maestro_early.', 'maestro_late.', 'mixmaster_early.', 'mixmaster_late.', 'pentakill_early_drums.', 'pentakill_early_main.', 'pentakill_early_secondary.', 'pentakill_late_drums.', 'pentakill_late_main.', 'pentakill_late_secondary.', 'piano_early.', 'piano_late.', 'punk_early_drums.', 'punk_early_main.', 'punk_late_drums.', 'punk_late_main.', 'starting_carousel.', 'truedamage_early_drums.', 'truedamage_early_main.', 'truedamage_early_secondary.', 'truedamage_late_drums.', 'truedamage_late_main.', 'truedamage_late_secondary.'];
const context = new(window.AudioContext || window.webkitAudioContext)();
var sourceArray = [];
var audioGainArray = [];
var activeTrackElements = [];
var masterGainNode = null
var initial = true;

function playSelectedTracks() {
    stopAllTracks();
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    var playlist = [];
    sourceArray = [];
    audioGainArray = [];
    activeTrackElements = [];

    var currentGlobalVolume = getGlobalVolume(); // Get the current global volume
    for (var i = 0; i < tracks.length; i++) {
        // Hacky way to only add the listeners once bc they are annoying to remove 
        // when using an anon func (but anon func makes indexing the tracks easy)
        const trackElement = document.getElementById(tracks[i])
        if (initial) {
            const trackIndex = i;
            trackElement.addEventListener('change', () => toggleTrackRealTime(trackIndex));
        }
        // Collect tracks to load (all if real time mode)
        if (document.getElementById('realTime').checked || trackElement.checked) {
            activeTrackElements.push(trackElement);
            playlist.push("tracks/" + tracks[i] + "ogg");
        }
    }
    initial = false;

    (async () => {
        const urls = playlist;
        // first, fetch each file's data
        const data_buffers = await Promise.all(
            urls.map((url) => fetch(url).then((res) => res.arrayBuffer()))
        );
        // get our AudioContext
        // decode the data
        const audio_buffers = await Promise.all(
            data_buffers.map((buf) => context.decodeAudioData(buf))
        );
        // to enable the AudioContext we need to handle a user gesture
        const current_time = context.currentTime;
        masterGainNode = context.createGain();
        masterGainNode.connect(context.destination);
        masterGainNode.gain.setValueAtTime(currentGlobalVolume, context.currentTime);
        audio_buffers.forEach((buf, i) => {
            // a buffer source is a really small object
            // don't be afraid of creating and throwing it
            const source = context.createBufferSource();
            // we only connect the decoded data, it's not copied
            source.buffer = buf;
            // make it loop?
            //source.loop = true;
            // start them all 0.25s after we began, so we're sure they're in sync
            const gainNode = context.createGain();
            source.start(current_time + 0.25);
            source.connect(gainNode);
            gainNode.connect(masterGainNode);
            sourceArray.push(source);
            audioGainArray.push(gainNode);
            gainNode.gain.setValueAtTime(activeTrackElements[i].checked ? 1 : 0, context.currentTime);
            document.getElementById('loadingIndicator').style.display = 'none';
        });
        // Avoid appearing to infinite load when playing with no tracks selected
        if (audio_buffers.length == 0) {
            stopAllTracks();
        }
    })();
}

function stopAllTracks() {
    document.getElementById('loadingIndicator').style.display = 'none';
    for (var i = 0; i < sourceArray.length; i++) {
        sourceArray[i].stop();
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

function toggleTrackRealTime(trackIndex) {
    if (document.getElementById('realTime').checked) {
        const gainNode = audioGainArray[trackIndex];
        if (gainNode != null) {
            const track = activeTrackElements[trackIndex];
            gainNode.gain.setValueAtTime(track.checked ? 1 : 0, context.currentTime);
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
            selectedTracks.push(encodeURIComponent(checkbox.id));
        }
    });

    var url = window.location.href.split('?')[0];
    var params = selectedTracks.join('%2E%2C'); // Encoding dot and comma

    // Add the parameters to the URL
    url += '?selectedTracks=' + params;

    // Remove any trailing dot or comma for legacy URLs
    url = url.replace(/[.,]$/, '');

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

    var twitterUrl = 'https://twitter.com/intent/tweet?text=Check out my TFT remix rumble music mix!: ' + encodeURIComponent(url) + '&hashtags=TFT,TFTRemixRumble';
    window.open(twitterUrl, '_blank').focus();
}

function setTracksFromURL() {
    var params = new URLSearchParams(window.location.search);
    var selectedTracks = params.get('selectedTracks');

    if (selectedTracks) {
        selectedTracks.split(',').forEach(function(trackId) {
            var checkbox = document.getElementById(trackId);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
}

setTracksFromURL();