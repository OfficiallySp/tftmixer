## TFT Remix Rumble Music Player: Internal Code Documentation

**Table of Contents**

| Section | Description |
|---|---|
| [1. Introduction](#1-introduction) |  Overview of the Music Player |
| [2. Global Variables](#2-global-variables) |  Description of all global variables |
| [3. Functions](#3-functions) |  Detailed breakdown of all functions |
| [4. Presets](#4-presets) |  Description of available music presets |
| [5. Tracks](#5-tracks) |  List of all available music tracks |

### 1. Introduction

This code implements a music player for the TFT Remix Rumble game. Users can select individual tracks or presets, and the player will play the selected tracks. The player also supports real-time playback and repeating the selected tracks.

### 2. Global Variables

| Variable | Description | Type |
|---|---|---|
| `presets` | An object containing pre-defined sets of tracks. | Object |
| `tracks` | An array containing the names of all available music tracks. | Array |
| `context` | The AudioContext object for handling audio playback. | AudioContext |
| `sourceArray` | An array to store audio source nodes. | Array |
| `audioGainArray` | An array to store audio gain nodes. | Array |
| `activeTrackElements` | An array to store elements for active tracks. | Array |
| `masterGainNode` | The master gain node for controlling global volume. | GainNode |
| `initial` | A flag to indicate whether this is the first time the player is initialized. | Boolean |
| `audio_buffers` | An array to store decoded audio buffers. | Array |
| `startCallback` | A callback function to start playback of a track. | Function |
| `endedArray` | An array to track whether each track has ended. | Array |
| `playingArray` | An array to track whether each track is currently playing. | Array |
| `endedCallbackArray` | An array to store callback functions for track end events. | Array |

### 3. Functions

**3.1. `playSelectedTracks()`**

* This function plays the tracks selected by the user.
* It first stops any currently playing tracks using `stopAllTracks()`.
* It then fetches the audio data for the selected tracks and decodes it using the AudioContext.
* For each track, it creates an AudioBufferSourceNode, connects it to the audio graph, and starts playback.
* It also sets up event listeners for track end events to handle repeating tracks.

**3.2. `areAllCheckedTracksDone()`**

* This function checks if all selected tracks have finished playing.
* It uses the `playingArray` to determine if any track is still playing.

**3.3. `stopAllTracks()`**

* This function stops all currently playing tracks.
* It stops each AudioBufferSourceNode and removes event listeners.
* It also clears the arrays used to store audio nodes and track information.

**3.4. `getGlobalVolume()`**

* This function retrieves the current global volume from the UI.
* It uses `document.getElementById('globalVolume').valueAsNumber` to get the volume value.

**3.5. `setGlobalVolume(value)`**

* This function sets the global volume to the specified value.
* It uses `masterGainNode.gain.setValueAtTime(value, context.currentTime)` to set the gain value.

**3.6. `toggleRealTime()`**

* This function toggles the real-time playback mode.
* It stops all tracks and clears the audio buffer array.

**3.7. `toggleTrackRealTime(trackIndex)`**

* This function toggles the playback of a specific track in real-time mode.
* It gets the gain node for the track and sets its gain value based on the track's checkbox state.

**3.8. `randomSelectTracks(trackSelector = '')`**

* This function randomly selects tracks for playback.
* It selects up to 5 tracks randomly and checks their checkboxes.
* It then triggers the `change` event for the selected checkboxes to initiate playback.

**3.9. `randomSelectEarlyTracks()`**

* This function selects random tracks with the "early" class.

**3.10. `randomSelectLateTracks()`**

* This function selects random tracks with the "late" class.

**3.11. `clearAllSelections()`**

* This function clears all selected tracks.
* It unchecks all checkboxes and triggers the `change` event for each checkbox.

**3.12. `generateShareableLink()`**

* This function generates a shareable link containing the selected tracks.
* It collects the IDs of the selected tracks and encodes them.
* It then adds the encoded track IDs as a query parameter to the current URL.

**3.13. `tweetMix()`**

* This function generates a link to tweet the current mix.
* It collects the IDs of the selected tracks and encodes the URL.
* It then opens a new window with the Twitter share link.

**3.14. `applyPreset(presetName)`**

* This function applies a pre-defined preset.
* It first clears all selections.
* Then it sets the checkboxes for the tracks included in the specified preset.

**3.15. `setTracksFromURL()`**

* This function sets the track selections based on the URL parameters.
* It reads the `selectedTracks` query parameter from the URL and checks the corresponding checkboxes.

### 4. Presets

| Preset Name | Track List |
|---|---|
| `preset0` | `kda_late_secondary`, `punk_late_main`, `edm_late_drums`, `pentakill_late_main`, `pentakill_late_secondary` |
| `preset1` | `edm_late_main`, `hyperpop_late_drums`, `illbeats_late`, `truedamage_late_secondary` |
| `preset2` | `kda_late_main`, `kda_late_secondary`, `punk_late_main`, `maestro_late`, `8bit_late_main`, `country_late_main`, `disco_late_main`, `edm_late_drums`, `edm_late_main`, `emo_late_main`, `heartsteel_late_main`, `hyperpop_late`, `illbeats_late`, `jazz_late_main`, `pentakill_late_main`, `pentakill_late_secondary`, `truedamage_late_main`, `truedamage_late_secondary` |
| `preset3` | `maestro_late`, `country_late_main`, `edm_late_drums`, `edm_late_main` |
| `preset4` | `maestro_early`, `mixmaster_early` |
| `preset5` | `disco_late_drums`, `heartsteel_late_secondary`, `hyperpop_late_drums`, `jazz_late_main` |
| `preset6` | `punk_early_drums`, `pentakill_early_main`, `pentakill_early_secondary` |
| `preset7` | `kda_late_secondary`, `edm_late_main`, `hyperpop_late_drums`, `illbeats_late` |
| `preset8` | `punk_late_main`, `maestro_late`, `emo_late_drums`, `emo_late_main` |
| `preset9` | `kda_late_main`, `hyperpop_late`, `hyperpop_late_drums` |
| `preset10` | `punk_late_main`, `country_late_main`, `emo_late_main`, `pentakill_late_drums` |
| `preset11` | `punk_early_main`, `maestro_early`, `country_early_drums`, `disco_early_drums`, `pentakill_early_drums` |
| `preset12` | `maestro_late`, `country_late_main`, `emo_late_drums`, `piano_late` |
| `preset13` | `disco_early_drums`, `disco_early_main`, `edm_early_main`, `jazz_early_main`, `mixmaster_early` |
| `preset14` | `8bit_early_drums`, `8bit_early_main`, `edm_early_main`, `hyperpop_early`, `truedamage_early_drums` |
| `preset15` | `kda_late_drums`, `kda_late_secondary`, `kda_late_main`, `emo_late_main`, `heartsteel_late_drums`, `hyperpop_late` |

### 5. Tracks

* `8bit_early_drums`
* `8bit_early_main`
* `8bit_late_drums`
* `8bit_late_main`
* `country_early_drums`
* `country_early_main`
* `country_late_drums`
* `country_late_main`
* `death1`
* `death2`
* `death3`
* `death4`
* `death5`
* `death6`
* `disco_early_drums`
* `disco_early_main`
* `disco_late_drums`
* `disco_late_main`
* `edm_early_drums`
* `edm_early_main`
* `edm_late_drums`
* `edm_late_main`
* `emo_early_drums`
* `emo_early_main`
* `emo_late_drums`
* `emo_late_main`
* `heartsteel_early_drums`
* `heartsteel_early_main`
* `heartsteel_early_secondary`
* `heartsteel_late_drums`
* `heartsteel_late_main`
* `heartsteel_late_secondary`
* `hyperpop_early`
* `hyperpop_late`
* `hyperpop_late_drums`
* `illbeats_early`
* `illbeats_late`
* `jazz_early_main`
* `jazz_late_main`
* `kda_early_drums`
* `kda_early_main`
* `kda_early_secondary`
* `kda_late_drums`
* `kda_late_main`
* `kda_late_secondary`
* `maestro_early`
* `maestro_late`
* `mixmaster_early`
* `mixmaster_late`
* `pentakill_early_drums`
* `pentakill_early_main`
* `pentakill_early_secondary`
* `pentakill_late_drums`
* `pentakill_late_main`
* `pentakill_late_secondary`
* `piano_early`
* `piano_late`
* `punk_early_drums`
* `punk_early_main`
* `punk_late_drums`
* `punk_late_main`
* `starting_carousel`
* `truedamage_early_drums`
* `truedamage_early_main`
* `truedamage_early_secondary`
* `truedamage_late_drums`
* `truedamage_late_main`
* `truedamage_late_secondary`
