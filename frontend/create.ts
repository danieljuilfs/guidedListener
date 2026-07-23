import * as musicService from "./musicService.js";
let songId: string; 

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
    }

    //initialize music kit once they authorize.
    await musicService.initMusicKit(jwt, updateButton, displayTrack, "create"); 

    //if the user isn't authorized, auth
    if (!musicService.isAuthorized()) await musicService.authorize(); 






});

async function displayTrack() {
    //title, composer, album, , duration 
    const titleDiv: HTMLDivElement = document.getElementById("trackName") as HTMLDivElement; 

    const composerDiv: HTMLDivElement = document.getElementById("composer") as HTMLDivElement; 

    const albumDiv: HTMLDivElement = document.getElementById("album") as HTMLDivElement; 

    //queue the track. 
    await musicService.setQueue(songId); 

    const attributes: MusicKit.MediaItem = musicService.getAttributes(); 

    console.log(attributes); 
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