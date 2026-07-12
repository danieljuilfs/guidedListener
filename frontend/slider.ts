//imports

//function to track the progress of the bar
import { updateProgress } from "./trackInfo.js"

//utility for calulcation of the mouse's location
import { mouseLocation } from "./utils.js"; 

//imports the duration and seek functions from the music service
import {getDuration, seekToTime } from "./musicService.js";

//returns the pages DomRect
import { getRect } from "./trackRect.js"; 

//declarations
const bar: HTMLDivElement = document.querySelector("#progress") as HTMLDivElement; 

//get the DomRect
let rect: DOMRect = getRect(); 

//initialize interval to run update progress every 500 ms. 
let interval: number = setInterval(updateProgress, 500);

//keep track of the bar sliding listeners
let hasListeners: boolean = false; 

//event listener for sliding the slider
document.getElementById("slider")!.addEventListener("mousedown", startMove);

//event listener for the tracking bar
document.getElementById("clickTrack")!.addEventListener("click", movePlayback); 

//update the bars width
export function updateBar(percent: number): void {
    bar.style.width = String(percent) + '%';
 }

//starts the movement of the slider
function startMove(): void  {
  clearInterval(interval); 
  interval = 0; 

  document.addEventListener("mouseup", selectTime);
  hasListeners = true; 
}

//selects the time on click. 
async function selectTime(movement: MouseEvent): Promise<void> { 

  rect = getRect(); 
  
  //get the percentage of progress
  const percent: number = mouseLocation(movement, rect); 

  //calculate where the song should be. have to divide by 100 here as we need to return a percent. 
  const time = Math.floor(percent * getDuration()/ 100); 

  //have to account for the fact I have to round inside of time when using the percents
  const fixedPercent = time / getDuration() * 100; 

  //update the bar state
  updateBar(fixedPercent)

  //move to the new time
  await seekToTime(time);

  //restart the timer to udpate the interval
  interval = setInterval(updateProgress, 500);

  //if listeners exist, remove them. 
  if (hasListeners) {
    document.removeEventListener("mouseup", selectTime);
    hasListeners = false; 
  }

}

//moves the playback fill when you click a place on the bar. 
function movePlayback(click: MouseEvent): void {
    clearInterval(interval); 
    interval = 0;
    selectTime(click); 
}


