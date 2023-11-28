const tracks = ['8bit_early_drums.','8bit_early_main.','8bit_late_drums.','8bit_late_main.','country_early_drums.','country_early_main.','country_late_drums.','country_late_main.','death1.','death2.','death3.','death4.','death5.','death6.','disco_early_drums.','disco_early_main.','disco_late_drums.','disco_late_main.','edm_early_drums.','edm_early_main.','edm_late_drums.','edm_late_main.','emo_early_drums.','emo_early_main.','emo_late_drums.','emo_late_main.','heartsteel_early_drums.','heartsteel_early_main.','heartsteel_early_secondary.','heartsteel_late_drums.','heartsteel_late_main.','heartsteel_late_secondary.','hyperpop_early.','hyperpop_late.','hyperpop_late_drums.','illbeats_early.','illbeats_late.','jazz_early_main.','jazz_late_main.','kda_early_drums.','kda_early_main.','kda_early_secondary.','kda_late_drums.','kda_late_main.','kda_late_secondary.','maestro_early.','maestro_late.','mixmaster_early.','pentakill_early_drums.','pentakill_early_main.','pentakill_early_secondary.','pentakill_late_drums.','pentakill_late_main.','pentakill_late_secondary.','piano_early.','piano_late.','punk_early_drums.','punk_early_main.','punk_late_drums.','punk_late_main.','starting_carousel.','truedamage_early_drums.','truedamage_early_main.','truedamage_early_secondary.','truedamage_late_drums.','truedamage_late_main.','truedamage_late_secondary.'];
const context = new (window.AudioContext || window.webkitAudioContext)();
var sourceArray = [];
var audioGainArray = [];

function playSelectedTracks() {
    stopAllTracks();
    var playlist = [];
    sourceArray = [];
    for (var i = 0; i < tracks.length; i++)
    {
        if (document.getElementById(tracks[i]).checked) {
            playlist.push("tracks/" + tracks[i] + "ogg");
        }
    }
    (async() => {
        const urls = playlist;
        // first, fetch each file's data
        const data_buffers = await Promise.all(
          urls.map( (url) => fetch( url ).then( (res) => res.arrayBuffer() ) )
        );
        // get our AudioContext
        // decode the data
        const audio_buffers = await Promise.all(
          data_buffers.map( (buf) => context.decodeAudioData( buf ) )
        );
        // to enable the AudioContext we need to handle a user gesture
        const current_time = context.currentTime;
        audio_buffers.forEach( (buf) => {
        // a buffer source is a really small object
        // don't be afraid of creating and throwing it
        const source = context.createBufferSource();
        // we only connect the decoded data, it's not copied
        source.buffer = buf;
        // in order to make some noise
        source.connect( context.destination );
        // make it loop?
        //source.loop = true;
        // start them all 0.25s after we began, so we're sure they're in sync
        const gainNode = context.createGain();
        source.start( current_time + 0.25 );
        source.connect(gainNode);
        gainNode.connect(context.destination);
        sourceArray.push(source);
        audioGainArray.push(gainNode);
        } );
      })();
}

function stopAllTracks() {
    for (var i = 0; i < sourceArray.length; i++) {
        sourceArray[i].stop();
    }
}

function setGlobalVolume(value) {
    for (var i = 0; i < audioGainArray.length; i++) {
        audioGainArray[i].gain.setValueAtTime(value, context.currentTime);
    }
}

function randomSelectTracks() {
    clearAllSelections();
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    var maxSelect = Math.min(5, checkboxes.length);

    for (var i = 0; i < maxSelect; i++) {
        var randomIndex = Math.floor(Math.random() * checkboxes.length);
        checkboxes[randomIndex].checked = true;
    }
}

function clearAllSelections() {
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
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
    url += '?selectedTracks=' + selectedTracks.join(',') + ',';

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
