//imports
import * as musicService from "./musicService.js";
import { updateTrack } from "./trackInfo.js"
import "./hoverTimer.js"; 
import { createAnnotations} from "./annotations.js"; 

//the JWT for accessing the user 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA" 

if (!jwt) {
    throw new Error("JWT is missing");
}

//temporary hardcoded song id
const songId: string = "1110860977"

//create the annotations
createAnnotations(); 

//Event listener listening for the play button to be clicked. 
document.getElementById("playButton")!.addEventListener("click", musicService.togglePlay);

//initialize the musicKit Instance. 
await musicService.initMusicKit(jwt, songId, updateButton, updateTrack); 

//update the play/pause button based on current playback status. checked every time the button is pressed. 
function updateButton() {
  const playBtn = document.getElementById("playBtn") as HTMLSpanElement;
  const state: number = musicService.getPlaybackState(); 

  if (!playBtn) return; 

  //2 is the enum returned for playing. hooray for magic numbers...
  if (state === 2) {
    playBtn.textContent = "pause"; } 
  else {
    playBtn.textContent = "play_arrow";
  }
}








