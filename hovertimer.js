//imports 
import { formatTime, mouseLocation } from "./utils.js";
import { getRect } from "./trackRect.js";
import * as musicService from "./musicService.js";
//declarations
let hoverTimer;
let rect = getRect();
//event listener to add the track timer display on hover over click track
document.getElementById("clickTrack").addEventListener("mouseenter", createTimer);
//event listener to add the track timer display on hover over click track
document.getElementById("clickTrack").addEventListener("mouseleave", removeTimer);
//updates the timer display on mousemove
function updateTimer(movement) {
    timerPosition(movement);
}
//creates the timer display on the mouse cursor on enter
function createTimer(movement) {
    rect = getRect();
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
function timerPosition(movement) {
    //calculate the percent of the bar it should have filled
    let percent = mouseLocation(movement, rect);
    //calculate what the time display should be and format it. 
    const time = formatTime(percent * musicService.getDuration() / 100);
    //calculate the left px value
    let left = movement.clientX;
    if (left < 0 || left > rect.width) {
        hoverTimer.style.display = "none";
        return;
    }
    //update the css of the hovertimer
    hoverTimer.style.display = "";
    hoverTimer.textContent = time;
    hoverTimer.style.transform = `translateX(${left}px) translateX(-50%)`;
}
//removes the timer when you leave the bar. 
function removeTimer() {
    if (!hoverTimer)
        return;
    document.removeEventListener("mousemove", updateTimer);
    hoverTimer.textContent = "";
    hoverTimer.remove();
}
//# sourceMappingURL=hovertimer.js.map