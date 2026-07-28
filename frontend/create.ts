import * as musicService from "./musicService.js";
import { formatTime } from "./utils.js"; 
import "./hoverTimer.js"; 
import "./trackInfo.js"; 

let songId: string; 

const titleInput: HTMLInputElement = document.getElementById("trackInput") as HTMLInputElement; 

const composerInput: HTMLInputElement = document.getElementById("composerInput") as HTMLInputElement; 

const addSection: HTMLDivElement = document.getElementById("addSection") as HTMLDivElement; 

const removeSection: HTMLDivElement = document.getElementById("removeSection") as HTMLDivElement; 

const addCue: HTMLDivElement = document.getElementById("addCue") as HTMLDivElement; 

const removeCue: HTMLDivElement = document.getElementById("removeCue") as HTMLDivElement; 

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

    //get the track
    const track: MusicKit.MediaItem = await musicService.getTrack(); 

    //update the editor state
    updateState(); 

    //set the name
    titleInput.value = track.attributes.name;    

    //set the composer
    composerInput.value = track.attributes.composerName;

    //get the duration, divide by 1000, send to the formatter. 
    durationDiv.textContent = formatTime((track.attributes.durationInMillis/1000)); 

    document.getElementById("addSection")?.addEventListener("click", createSection); 
 
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

//update the state, enabling the title boxess and the like to be edited. 
function updateState() {

  let ready = false; 

  //if the music service instance exists, and there is a track update the state to true. otherwise, leave the inputs disabled. 
  if ( musicService.getInstance() !== null && musicService.getInstance() !== undefined && musicService.getQueue() !== null &&musicService.getTrack() !== null) ready = true; 

  titleInput.disabled = !ready;
  composerInput.disabled = !ready


  if (ready) {
    addSection.classList.remove("disabledDiv");
    removeSection.classList.remove("disabledDiv"); 
    addCue.classList.remove("disabledDiv");
    removeCue.classList.remove("disabledDiv"); 
  }
}

function createSection(): void {
  //get the current playback time. 
  const currentTime: number = musicService.getCurrentTime(); 

  //get the duration
  const duration: number = musicService.getDuration(); 

  //calc the percentage of the container
  const percent: number = currentTime / duration ; 
  
  //get the parent div
  const sectionParent: HTMLDivElement = document.getElementById("sections") as HTMLDivElement; 

  //get the parent containers bounding rect.
  const parentRect: DOMRect = sectionParent.getBoundingClientRect(); 

  //get the width of the parent container in pixels. 
  const pixelWidth: number = parentRect.width; 
  
  //calculate the width in vw
  const vw: number = pixelWidth / window.innerWidth; 

  //calculate the width of the section. have to multiply by 100 to get whole numbers. 
  const sectionWidth: number = percent * vw * 100; 

  //container to hold the section
  let sectionContainer: HTMLDivElement = document.createElement("div"); 

  //append to the parent
  sectionParent.append(sectionContainer); 

  //set the containers width
  sectionContainer.style.width = `${sectionWidth}vw`

  sectionContainer.classList.add("section")
  
  //section to add the measure number. 
  let measureSection: HTMLDivElement = document.createElement("div");

  //append it
  sectionContainer.append(measureSection); 

  //make it editable
  measureSection.contentEditable = "true"; 

  //set its text
  measureSection.textContent = "m. #";

  //set class on the measure
  measureSection.classList.add("measure"); 

  //create container to hold section
  let sectionTitle: HTMLDivElement = document.createElement("div"); 
  
  //append it
  sectionContainer.append(sectionTitle); 

  //make ite ditable
  sectionTitle.contentEditable = "true"; 

  //set its text
  sectionTitle.textContent = "Section Title";

  //add the class to the section title
  sectionTitle.classList.add("sectionTitle")



}