import * as musicService from "./musicService.js";
import { formatTime } from "./utils.js";
import "./hoverTimer.js";
import "./trackInfo.js";
//definitions
let songId;
const titleInput = document.getElementById("trackInput");
const composerInput = document.getElementById("composerInput");
const addSection = document.getElementById("addSection");
const removeSection = document.getElementById("removeSection");
const addCue = document.getElementById("addCue");
const removeCue = document.getElementById("removeCue");
let trackItem;
//hold the divs
const divMap = new Map();
//hold the section objects
const sections = [];
//keep track of the section ids
let id = 0;
//change set the editor state on page load
updateState();
//the JWT for accessing the authentication 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA";
document.getElementById("loadTrack").addEventListener("click", async () => {
    //get the track element
    const input = document.getElementById("trackLink");
    //get the url so you can split it. 
    const url = input.value;
    //if the url is malformed, alert the user
    if (!url.includes("?i=")) {
        alert("That is not a valid track address");
        return;
    }
    else {
        //split the track at the identifier, grab it, and set song id. 
        const track = url.split("?i=")[1];
        songId = track;
        console.log(songId);
    }
    //initialize music kit once they authorize.
    await musicService.initMusicKit(jwt, updateButton, displayTrack, "create");
    //if the user isn't authorized, auth
    if (!musicService.isAuthorized())
        await musicService.authorize();
    document.getElementById("playBtn")?.addEventListener("click", musicService.togglePlay);
});
async function displayTrack() {
    //queue the track. 
    await musicService.setQueue(songId);
    const durationDiv = document.getElementById("duration");
    //get the track
    trackItem = await musicService.getTrack();
    //update the editor state
    updateState();
    //set the name
    titleInput.value = trackItem.attributes.name;
    //set the composer
    composerInput.value = trackItem.attributes.composerName;
    //get the duration, divide by 1000, send to the formatter. 
    durationDiv.textContent = formatTime((trackItem.attributes.durationInMillis / 1000));
    document.getElementById("addSection")?.addEventListener("click", createSection);
    //create the first section. 
    createSection();
    console.log(sections);
}
//update the play/pause button based on current playback status. checked every time the button is pressed. 
export function updateButton() {
    const playBtn = document.getElementById("playBtn");
    const state = musicService.getPlaybackState();
    if (!playBtn)
        return;
    //2 is the enum returned for playing. hooray for magic numbers...
    if (state === 2) {
        playBtn.textContent = "pause";
    }
    else {
        playBtn.textContent = "play_arrow";
    }
}
//update the state, enabling the title boxess and the like to be edited. 
function updateState() {
    let ready = false;
    //if the music service instance exists, and there is a track update the state to true. otherwise, leave the inputs disabled. 
    if (musicService.getInstance() !== null && musicService.getInstance() !== undefined && musicService.getQueue() !== null && musicService.getTrack() !== null)
        ready = true;
    titleInput.disabled = !ready;
    composerInput.disabled = !ready;
    if (ready) {
        addSection.classList.remove("disabledDiv");
        removeSection.classList.remove("disabledDiv");
        addCue.classList.remove("disabledDiv");
        removeCue.classList.remove("disabledDiv");
    }
}
function createSection() {
    //get the current playback time. 
    let currentTime = musicService.getCurrentTime();
    let sectionIndex = 0;
    //find index determines the index of the item it is looking for. the arrow function determines if the individual section is what you are looking for. 
    if (sections.length > 0) {
        sectionIndex = sections.findIndex((section, index) => {
            //get the next section in the array 
            const nextSection = sections[index + 1];
            return (
            /*return whether the current time is greater than the startTime of the current section, and theres either not a next section, or the next sections startTime is less than the current time,
            return true. If it is, we have found the index of the section. */
            currentTime >= section.startTime &&
                (!nextSection || currentTime < nextSection.startTime));
        });
    }
    else {
        //handling the fact that currentTime will be NaN at the start. 
        currentTime = 0;
    }
    //create the object, store the data.
    const newSection = {
        sectionNumber: id++,
        measure: "m. #",
        sectionName: "Title Section",
        startTime: currentTime,
        lyrics: "",
        translation: "",
        notes: "",
    };
    //splice at the determined index, inserting the new section. 
    sections.splice(sectionIndex + 1, 0, newSection);
    //get the width of the div 
    const divWidth = calcWidth(sectionIndex + 1);
    /*
    
      
    
    
    
      console.log("width: " + sectionWidth + " percent: " + percent + ' vw: ' + vw);
    
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
    */
}
function getEndTime(index) {
    //get the next section from the array of sections
    const nextSection = sections[index + 1];
    console.log("next section: " + nextSection);
    //if that section exists, its start time is our current divs end time.
    if (nextSection) {
        return nextSection.startTime;
    }
    console.log("duration: " + musicService.getDuration());
    //if not, the end time is the end of the track. 
    return trackItem.attributes.durationInMillis / 1000;
}
function calcWidth(index) {
    //get the current playback time
    const currentTime = musicService.getCurrentTime();
    //get the start time of the next section
    const endTime = getEndTime(index);
    //calc the length
    const length = endTime - currentTime;
    console.log("length is " + length + " currentTime is: " + currentTime + " endTime is: " + endTime);
    //get the duration
    const duration = musicService.getDuration();
    //calc the percentage of the container
    const percent = currentTime / duration;
    //get the parent container
    const sectionParent = document.getElementById("sections");
    //get the parent containers bounding rect.
    const parentRect = sectionParent.getBoundingClientRect();
    const pixelWidth = parentRect.width;
    //calculate the width in vw
    const vw = pixelWidth / window.innerWidth;
    //calculate the width of the section. have to multiply by 100 to get whole numbers. 
    const sectionWidth = percent * vw * 100;
}
//# sourceMappingURL=create.js.map