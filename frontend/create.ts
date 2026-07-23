import * as musicService from "./musicService.js";
import { formatTime } from "./utils.js"; 
import { updateProgress } from "./trackInfo.js";
import "./hoverTimer.js"; 
import "./trackInfo.js"; 

let songId: string; 

const titleInput: HTMLInputElement = document.getElementById("trackInput") as HTMLInputElement; 

const composerInput: HTMLInputElement = document.getElementById("composerInput") as HTMLInputElement; 

const albumInput: HTMLInputElement = document.getElementById("albumInput") as HTMLInputElement; 


//change set the editor state on page load
updateState(); 

//the JWT for accessing the authentication 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA" 

document.getElementById("loadTrack")!.addEventListener("click", async () => {
    //get the track element
    const input: HTMLInputElement = document.getElementById("trackLink") as HTMLInputElement; 
    //get the url so you can split it. 
    const url: string = input.value; 

    //if the url is malformed, alert the user

    if (!url.includes("?i=")) {
        alert("That is not a valid track address"); 
        return
    }
    else { 
        //split the track at the identifier, grab it, and set song id. 
        const track = url.split("?i=")[1];
        songId = track!; 
        console.log(songId)
    }
    
    //initialize music kit once they authorize.
    await musicService.initMusicKit(jwt, updateButton, displayTrack, "create"); 


    //if the user isn't authorized, auth
    if (!musicService.isAuthorized()) await musicService.authorize(); 

    document.getElementById("playBtn")?.addEventListener("click", musicService.togglePlay); 

});

async function displayTrack() {
    //queue the track. 
    await musicService.setQueue(songId); 

    const durationDiv: HTMLDivElement = document.getElementById("duration") as HTMLDivElement; 

    console.log("past song id")

    //get the track
    const track: MusicKit.MediaItem = await musicService.getTrack(); 

    console.log(track); 

    //update the editor state
    updateState(); 

    //set the name
    titleInput.value = track.attributes.name;    

    //set the composer
    composerInput.value = track.attributes.composerName;

    //set the composer
    albumInput.value = track.attributes.albumName; 

    //get the duration, divide by 1000, send to the formatter. 
    durationDiv.textContent = formatTime((track.attributes.durationInMillis/1000)); 
}

//update the play/pause button based on current playback status. checked every time the button is pressed. 
export function updateButton() {
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

//update the state, enabling the title boxers and the like to be edited. 
function updateState() {

  let ready = false; 

  //if the music service instance exists, and there is a track update the state to true. otherwise, leave the inputs disabled. 
  if ( musicService.getInstance() != null && musicService.getTrack() !== null) ready = true; 

  titleInput.disabled = !ready;
  composerInput.disabled = !ready
  albumInput.disabled = !ready;
}