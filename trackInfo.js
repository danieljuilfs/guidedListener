import { getAnnotations } from "./annotations.js";
import { formatTime } from "./utils.js";
import { getCurrentTime, getDuration, getQueue } from "./musicService.js";
import { updateBar } from "./slider.js";
//updates the track name, duration time, composer. 
export function updateTrack() {
    const annotations = getAnnotations();
    //get the div element that stores the track information. 
    const trackname = document.getElementById("trackName");
    //get the composer div so we can set the composer
    const header = document.getElementById("composer");
    const album = document.getElementById("album");
    //set the track name
    trackname.textContent = annotations.title;
    //set the album name
    album.textContent = annotations.album;
    //get the composer from the attributes section. 
    const composer = annotations.composer;
    //if there is a composer set the composer in the heading
    if (composer)
        header.textContent = composer;
    //get the duration object from the DOM
    const duration = document.getElementById("duration");
    //get the duratino from the queued object, which is in millseconds. convert to seconds. 
    const time = getQueue().item(0).attributes.durationInMillis / 1000;
    //set the duration for the track. 
    duration.textContent = formatTime(time);
}
export function updateProgress() {
    //get the element time is stored in
    let time = document.getElementById("pbTime");
    //update its text. 
    time.textContent = formatTime(getCurrentTime());
    //calculate how far the bar should be moved
    const percent = (getCurrentTime() / getDuration()) * 100;
    //update the bar state
    updateBar(percent);
}
//# sourceMappingURL=trackInfo.js.map