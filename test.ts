//imports
import * as musicService from "./musicService.js";
import { formatTime, mouseLocation} from "./utils.js"; 
import { updateTrack, updateProgress} from "./trackInfo.js"
import { updateBar } from "./slider.js"; 


//declarations
let interval: number; 
let hoverTimer: HTMLElement; 
let rect: DOMRect = document.getElementById("track")!.getBoundingClientRect(); 

//the JWT for accessing the user 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA" 

if (!jwt) {
    throw new Error("JWT is missing");
}

//temporary hardcoded song id
const songId: string = "1110860977"

//automatically update the playback timer every 500ms
interval = setInterval(updateProgress, 500);

//refresh rect on screen resize
window.addEventListener("resize", () => { rect = document.getElementById("track")!.getBoundingClientRect();});

//keep track of the bar sliding listeners
let hasListeners = false; 

//Event listener listening for the play button to be clicked. 
document.getElementById("playButton")!.addEventListener("click", musicService.togglePlay);

//event listener for sliding the slider
document.getElementById("slider")!.addEventListener("mousedown", startMove);

//event listener for the tracking bar
document.getElementById("clickTrack")!.addEventListener("click", movePlayback); 

//event listener to add the track timer display on hover over click track
document.getElementById("clickTrack")!.addEventListener("mouseenter", createTimer); 

//event listener to add the track timer display on hover over click track
document.getElementById("clickTrack")!.addEventListener("mouseleave", removeTimer); 

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

//starts the movement of the slider
function startMove() {
  clearInterval(interval); 
  interval = 0; 

  document.addEventListener("mouseup", selectTime);
  hasListeners = true; 
}

/* 
  FUNCTIONS RELATED TO THE DISPLAY OF THE MOUSEOVER PLAYBACK TIMER
*/

//selects the time on click. 
async function selectTime(movement: MouseEvent) { 

  //get the percentage of progress
  const percent: number = mouseLocation(movement, rect); 

  //calculate where the song should be. have to divide by 100 here as we need to return a percent. 
  const time = Math.floor(percent * musicService.getDuration()/ 100); 

  //have to account for the fact I have to round inside of time when using the percents
  const fixedPercent = time / musicService.getDuration() * 100; 

  //update the bar state
  updateBar(fixedPercent)

  //move to the new time
  await musicService.seekToTime(time);

  //restart the timer to udpate the interval
  interval = setInterval(updateProgress, 500);

  //if listeners exist, remove them. 
  if (hasListeners) {
    document.removeEventListener("mouseup", selectTime);
    hasListeners = false; 
  }

}

//moves the playback fill when you click a place on the bar. 
function movePlayback(click: MouseEvent) {
    clearInterval(interval); 
    interval = 0;
    selectTime(click); 
}

//updates the timer display on mousemove
function updateTimer(movement: MouseEvent) {
  timerPosition(movement); 
}

//creates the timer display on the mouse cursor on enter
function createTimer(movement: MouseEvent) {

  //recalculate rect
  rect = document.getElementById("track")!.getBoundingClientRect();

  //listener to keep track of mouse movement
  document.addEventListener("mousemove", updateTimer); 

  //create the div to show the timer
  hoverTimer = document.createElement("div"); 
  
  //append to the dom. 
  document.body.appendChild(hoverTimer);

  //style the div
  hoverTimer.style.background = "#333333";
  hoverTimer.style.color = "white";
  hoverTimer.style.padding = "2px 6px";
  hoverTimer.style.borderRadius = "4px";
  hoverTimer.style.pointerEvents = "none";

  //sets the divs position
  hoverTimer.style.position = "fixed";
  hoverTimer.style.left = "0";
  hoverTimer.style.top = `${rect.top - 30}px`;

  //do all the calculations by calling timer position
  timerPosition(movement); 

}

function timerPosition(movement: MouseEvent) {

  //calculate the percent of the bar it should have filled
  let percent = mouseLocation(movement, rect);

  //calculate what the time display should be and format it. 
  const time = formatTime(percent * musicService.getDuration() / 100);

  //calculate the left px value
  let left: number = movement.clientX; 

  if (left < 0 || left > rect.width ) {
    hoverTimer.style.display = "none";
    return;
  }
  //update the css of the hovertimer
  hoverTimer.style.display= ""; 
  hoverTimer.textContent = time; 
  hoverTimer.style.transform = `translateX(${left}px) translateX(-50%)`;
  
}

//removes the timer when you leave the bar. 
function removeTimer() {
  if (!hoverTimer) return; 
  document.removeEventListener("mousemove", updateTimer);
  hoverTimer.textContent = ""; 
  hoverTimer.remove(); 

}

