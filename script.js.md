## TFT Remix Rumble Music Mixer - Internal Code Documentation

### Table of Contents

| Section | Description |
|---|---|
| [Global Variables](#global-variables) | List of global variables used in the code |
| [Functions](#functions) | Description of each function, its purpose, and parameters |
| [Event Listeners](#event-listeners) | Description of event listeners and their corresponding functions |

### Global Variables

| Variable Name | Description | Data Type |
|---|---|---|
| `presets` | An object containing predefined track selections (presets) | Object |
| `tracks` | An array of all available track IDs | Array |
| `context` | An instance of the AudioContext object for audio playback | Object |
| `sourceArray` | An array to store audio sources for each track | Array |
| `audioGainArray` | An array to store gain nodes for each track | Array |
| `activeTrackElements` | An array to store checkbox elements for currently selected tracks | Array |
| `masterGainNode` | The master gain node for controlling global volume | Object |
| `initial` | A flag indicating if the script has been initialized (to add event listeners only once) | Boolean |
| `audio_buffers` | An array to store decoded audio buffers for each track | Array |
| `startCallback` | A callback function for starting track playback | Function |
| `endedArray` | An array to track if each track has ended | Array |
| `playingArray` | An array to track if each track is currently playing | Array |
| `endedCallbackArray` | An array to store end event listeners for each track | Array |

### Functions

| Function Name | Description | Parameters |
|---|---|---|
| `playSelectedTracks()` | Plays the tracks selected by the user. Handles real-time playback, loading audio buffers, and starting playback. | None |
| `areAllCheckedTracksDone()` | Checks if all currently selected tracks have finished playing. | None |
| `stopAllTracks()` | Stops all currently playing tracks. Clears arrays and removes event listeners. | None |
| `getGlobalVolume()` | Gets the current global volume from the "globalVolume" slider. | None |
| `setGlobalVolume(value)` | Sets the global volume to the specified value. | `value`: Number |
| `toggleRealTime()` | Toggles between real-time playback and loading all tracks at once. Clears audio buffers and resets the start callback. | None |
| `toggleTrackRealTime(trackIndex)` | Toggles the playback of a specific track in real-time mode. | `trackIndex`: Number |
| `randomSelectTracks(trackSelector)` | Randomly selects a specified number of tracks (up to 5) based on the provided selector. | `trackSelector`: String (optional) |
| `randomSelectEarlyTracks()` | Randomly selects early tracks (up to 5). | None |
| `randomSelectLateTracks()` | Randomly selects late tracks (up to 5). | None |
| `clearAllSelections()` | Clears all track selections. | None |
| `generateShareableLink()` | Generates a shareable URL containing the currently selected tracks. | None |
| `tweetMix()` | Opens a new window with a pre-formatted tweet containing the current mix URL. | None |
| `applyPreset(presetName)` | Applies the selected preset by checking the corresponding track checkboxes. | `presetName`: String |
| `setTracksFromURL()` | Restores track selections based on the URL parameters. | None |

### Event Listeners

| Event | Function | Element |
|---|---|---|
| `change` | `toggleTrackRealTime(trackIndex)` | Checkbox elements for each track |
| `click` | `playSelectedTracks()` | "Play" button |
| `click` | `stopAllTracks()` | "Stop" button |
| `input` | `setGlobalVolume(value)` | "globalVolume" slider |
| `click` | `toggleRealTime()` | "realTime" checkbox |
| `click` | `randomSelectEarlyTracks()` | "randomEarlyTracks" button |
| `click` | `randomSelectLateTracks()` | "randomLateTracks" button |
| `click` | `clearAllSelections()` | "clearAllSelections" button |
| `click` | `generateShareableLink()` | "generateShareableLink" button |
| `click` | `tweetMix()` | "tweetMix" button |
| `click` | `applyPreset(presetName)` | Buttons for each preset | 

**Explanation of Key Features:**

* **Real-time Playback:** The code allows users to select tracks and listen to them in real-time without having to wait for all tracks to load.
* **Presets:** Users can choose from a variety of predefined track combinations (presets) for quick mix creation.
* **Sharing:**  Users can generate a shareable URL with their selected tracks and tweet their mixes.
* **Track Selection:** Users have fine-grained control over which tracks to include in their mixes.
* **Volume Control:** The global volume can be adjusted using a slider.
* **Looping:** The code supports looping for continuous playback.

**Notes:**

* The code uses a hacky method to add event listeners only once due to difficulties removing anonymous functions.
* The code uses asynchronous loading of audio buffers for efficient playback.
* The code includes error handling for situations like URL copying failures.
* The code is optimized for performance and user experience. 
