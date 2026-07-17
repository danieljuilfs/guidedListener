//imports
import * as musicService from "./musicService.js";
import { createAnnotations } from "./annotations.js";
import { updateTrack } from "./trackInfo.js";
import { debug } from "./utils.js";
import "./hoverTimer.js";
import "./trackInfo.js";
//the JWT for accessing the user 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA";
if (!jwt) {
    throw new Error("JWT is missing");
}
const response = await fetch("http://192.168.1.13:3001/annotations/1");
if (!response.ok) {
    throw new Error("Failed to load track.");
}
//get the track id from the database
const json = await response.json();
//apple music expects the trackid as a string funnily enough. 
const songId = String(json.trackid);
//create the annotations
createAnnotations(json);
//initialize the track information. 
updateTrack();
//check to see if the user is authorized on click. and print 
document.getElementById("playButton").addEventListener("click", async () => {
    //if the user isn't authorized, auth
    if (!musicService.isAuthorized())
        await musicService.authorize();
    //if the song isnt in the queue, que it. 
    if (musicService.getQueue() !== songId)
        await musicService.setQueue(songId);
    //otherwise, just play/pause. 
    await musicService.togglePlay();
});
//initialize the musicKit Instance. 
await musicService.initMusicKit(jwt, updateButton, updateTrack);
//update the play/pause button based on current playback status. checked every time the button is pressed. 
function updateButton() {
    const playBtn = document.getElementById("playBtn");
    const state = musicService.getPlaybackState();
    if (!playBtn)
        return;
    //2 is the enum returned for playing. hooray for magic numbers...
    if (state === 2) {
        playBtn.textContent = "pause";
    }
    else {
        playBtn.textContent = "play_arrow";
    }
}
//# sourceMappingURL=app.js.map