//imports
import type { GuidedListener } from "./annotations.js";
import type { section } from "./annotations.js";
import { parseAnnotations } from "./annotations.js";
import * as musicService from "./musicService.js";


//declarations
declare const MusicKit: any;
let music: any; 
let interval: number; 
let queue: any; 
const slider = document.querySelector("#slider") as HTMLDivElement; 
const bar = document.querySelector("#progress") as HTMLDivElement; 
let hoverTimer: HTMLElement; 
let rect: DOMRect; 
let isSeeking: boolean = false; 

const songId: string = "1110860977"

const input: string = `
{
 "title" : "Symphony No. 88 in G Major, Hob. I:88: IV. Finale. Allegro con spirito " ,
  "composer" : "Franz Joseph Haydn" ,
  "album" : "Haydn: Symphonies Nos. 88, 101 'Clock' & 104 'London' (Live)" ,
  "performer" : "Philharmonia Baroque Orchestra & Nicholas McGegan",
  "url" : "www.butts.com",
  "parts" : [{ 
    "name" : "A",
    "startTime" : 0,
    "endTime" : 52, 
    "text" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. "
    },
    {
    "name" : "B",
    "startTime" : 52,
    "endTime" : 96
    },
    {
    "name" : "A’",
    "startTime" : 96,
    "endTime" : 116
    },
    {
    "name": "C",
    "startTime": 116,
    "endTime" : 158
    },
    {
    "name": "A’’",
    "startTime": 158,
    "endTime": 185
    },
    {
    "name": "Coda",
    "startTime": 185
    }
  ]
}`

//create the guidedlistener object by passing it the input json. 
const annotations: GuidedListener = parseAnnotations(input);

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


//the JWT for accessing the user 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA" 

if (!jwt) {
    throw new Error("JWT is missing");
}

//initialize the musicKit Instance. 
await musicService.initMusicKit(jwt, songId, updateButton, updateTrack); 

//update the play/pause button based on current playback status. checked every time the button is pressed. 
function updateButton() {
  const playBtn = document.getElementById("playBtn") as HTMLSpanElement;
  const state = musicService.getPlaybackState; 

  if (!playBtn || !music) return; 

  if (state === MusicKit.PlaybackStates.playing) {
    playBtn.textContent = "pause"; } 
  else {
    playBtn.textContent = "play_arrow";
  }
}

//updates the current playback progress of the track
function updateProgress() {
  if (isSeeking) return; 

  //get the element time is stored in
  let time = document.getElementById("pbTime") as HTMLDivElement;
  
  //update its text. 
  time.textContent = formatTime(musicService.getCurrentTime()); 

  //calculate how far the bar should be moved
  const percent: number = (musicService.getCurrentTime()/ musicService.getDuration()) * 100; 

  //update the bar state
  updateBar(percent)
}

//updates the track name, duration time, composer. 
function updateTrack() {

  //get the div element that stores the track information. 
  const trackname: HTMLDivElement = document.getElementById("trackName") as HTMLDivElement;

  //get the composer div so we can set the composer
  const header: HTMLHeadingElement= document.getElementById("composer") as HTMLHeadingElement; 

  const album: HTMLDivElement = document.getElementById("album") as HTMLDivElement
 
  //set the track name
  trackname.textContent = annotations.title;  

  //set the album name
  album.textContent = annotations.album; 

  //get the composer from the attributes section. 
  const composer: string = annotations.composer; 

  //if there is a composer set the composer in the heading
  if (composer) header.textContent = composer; 
  
  //automatically update the playback timer every 500ms
  interval = setInterval(updateProgress, 500);

  //get the duration object from the DOM
  const duration: HTMLDivElement = document.getElementById("duration") as HTMLDivElement; 

  //get the duratino from the queued object, which is in millseconds. convert to seconds. 
  const time: number = musicService.getQueue().item(0).attributes.durationInMillis / 1000

  //set the duration for the track. 
  duration.textContent = formatTime(time); 
}

//starts the movement of the slider
function startMove() {
  clearInterval(interval); 
  interval = 0; 
  
  document.addEventListener("mousemove", dragSlider); 
  document.addEventListener("mouseup", selectTime);
  hasListeners = true; 
}

//updates the position of the slider as your cursor moves
function dragSlider(movement: MouseEvent) {

  //calculate the percent of the bar it should have filled
  let percent = mouseLocation(movement);  

  //update the bar state
  updateBar(percent)
}

/* 
  FUNCTIONS RELATED TO THE DISPLAY OF THE MOUSEOVER PLAYBACK TIMER
*/

//selects the time on click. 
async function selectTime(movement: MouseEvent) { 

  //get the percentage of progress
  const percent: number = mouseLocation(movement); 

  //calculate where the song should be. have to divide by 100 here as we need to return a percent. 
  const time = Math.floor(percent * musicService.getDuration()/ 100); 

  //have to account for the fact I have to round inside of time when using the percents
  const fixedPercent = time / musicService.getDuration() * 100; 

  //update the bar state
  updateBar(fixedPercent)

  //this is here to prevent the track from running the update while the seek is still happening, otherwise you
  isSeeking = true; 

  //move to the new time
  await musicService.seekToTime(time);

  isSeeking = false; 

  //restart the timer to udpate the interval
  interval = setInterval(updateProgress, 500);

  //if listeners exist, remove them. 
  if (hasListeners) {
    document.removeEventListener("mousemove", dragSlider);
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

function updateBar(percent: number) {
  //updates the colored transition
  bar.style.width = String(percent) + '%';

  //sets the slider to the ride location
  slider.style.left = `${percent}%`;

}


function timerPosition(movement: MouseEvent) {

  //calculate the percent of the bar it should have filled
  let percent = mouseLocation(movement);

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

function mouseLocation(movement: MouseEvent): number {
  
  //get the mouse location within the track, then subtract its left align and the padding from the div
  const x = movement.clientX - rect.left 

  //determine how far across the screen the bar is. 
  const percent: number = (x / rect.width) * 100; 

  //stop it from going over the edge. 
  return Math.max(0, Math.min(percent, 100));
}


//helper function to display time in the correct format
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
}