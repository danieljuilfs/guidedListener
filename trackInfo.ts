import type { GuidedListener } from "./annotations.js";
import { getAnnotations } from "./annotations.js"; 
import { formatTime } from "./utils.js"; 
import { getCurrentTime, getDuration, getQueue } from "./musicService.js"; 
import { updateBar } from "./slider.js"


//updates the track name, duration time, composer. 
export function updateTrack(): void {

  const annotations: GuidedListener = getAnnotations(); 

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

  //get the duration object from the DOM
  const duration: HTMLDivElement = document.getElementById("duration") as HTMLDivElement; 

  //get the duratino from the queued object, which is in millseconds. convert to seconds. 
  const time: number = getQueue().item(0).attributes.durationInMillis / 1000

  //set the duration for the track. 
  duration.textContent = formatTime(time); 
}

export function updateProgress(): void {

  //get the element time is stored in
  let time = document.getElementById("pbTime") as HTMLDivElement;
  
  //update its text. 
  time.textContent = formatTime(getCurrentTime()); 

  //calculate how far the bar should be moved
  const percent: number = (getCurrentTime()/ getDuration()) * 100; 

  //update the bar state
  updateBar(percent)
}
