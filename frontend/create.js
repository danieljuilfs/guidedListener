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
let selectedDiv = null;
let trackItem;
//hold the divs
const divMap = new Map();
//hold the section objects
const sectionsArr = [];
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
    }
    //initialize music kit once they authorize.
    await musicService.initMusicKit(jwt, updateButton, displayTrack, "create");
    //if the user isn't authorized, auth
    if (!musicService.isAuthorized())
        await musicService.authorize();
    //reset on track load. 
    resetSections();
    document.getElementById("playBtn")?.addEventListener("click", musicService.togglePlay);
    document.getElementById("removeSection")?.addEventListener("click", deleteDiv);
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
    if (currentTime === 0 && sectionsArr.length > 0) {
        alert("Track must be playing!");
        return;
    }
    let sectionIndex = 0;
    //find index determines the index of the item it is looking for. the arrow function determines if the individual section is what you are looking for. 
    if (sectionsArr.length > 0) {
        sectionIndex = sectionsArr.findIndex((section, index) => {
            //get the next section in the array 
            const nextSection = sectionsArr[index + 1];
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
    //define the object. 
    const newSection = {
        sectionNumber: id,
        measure: "m. #",
        sectionName: "Title Section",
        startTime: currentTime,
        lyrics: "",
        translation: "",
        notes: "",
    };
    //splice at the determined index, inserting the new section. 
    sectionsArr.splice(sectionIndex + 1, 0, newSection);
    //container to hold the section
    let sectionContainer = document.createElement("div");
    //allows the div to be selected. used so we can target the div and remove it. 
    sectionContainer.addEventListener("click", () => {
        // Remove selection from the previous div
        if (selectedDiv) {
            selectedDiv.classList.remove("selected");
        }
        // Select this div
        selectedDiv = sectionContainer;
        selectedDiv.classList.add("selected");
    });
    //store the id of the div in the div so we can reference it for deletion. 
    sectionContainer.dataset.sectionId = newSection.sectionNumber.toString();
    //add the section class to it. 
    sectionContainer.classList.add("section");
    //section to add the measure number. 
    let measureSection = document.createElement("div");
    //append it
    sectionContainer.append(measureSection);
    //make it editable
    measureSection.contentEditable = "true";
    //set its text
    measureSection.textContent = newSection.measure;
    //set class on the measure
    measureSection.classList.add("measure");
    //create container to hold section
    let sectionTitle = document.createElement("div");
    //append it
    sectionContainer.append(sectionTitle);
    //make it editable
    sectionTitle.contentEditable = "true";
    //set its text
    sectionTitle.textContent = String(newSection.sectionNumber);
    //add the class to the section title
    sectionTitle.classList.add("sectionTitle");
    divMap.set(id, sectionContainer);
    //increment id now that we are done working with it
    id++;
    //render the divs
    drawDivs();
}
function getEndTime(index) {
    //get the next section from the array of sections
    const nextSection = sectionsArr[index + 1];
    let time = 0;
    //if that section exists, its start time is our current divs end time.
    if (nextSection) {
        time = nextSection.startTime;
    }
    else
        time = trackItem.attributes.durationInMillis / 1000;
    //if not, the end time is the end of the track. 
    return time;
}
function calcWidth(index) {
    //get the current playback time
    let startTime = sectionsArr[index]?.startTime;
    const sectionId = sectionsArr[index]?.sectionNumber;
    if (!startTime) {
        startTime = 0;
    }
    //get the start time of the next section
    const endTime = getEndTime(index);
    //calc the length. this calc is wrong. 
    const length = endTime - startTime;
    //get the duration
    const duration = trackItem.attributes.durationInMillis / 1000;
    //calc the percentage of the container
    const percent = length / duration;
    //get the parent container
    const sectionParent = document.getElementById("sections");
    //get the parent containers bounding rect.
    const parentRect = sectionParent.getBoundingClientRect();
    const pixelWidth = parentRect.width;
    //calculate the width in vw
    const vw = pixelWidth / window.innerWidth;
    //calculate the width of the section. have to multiply by 100 to get whole numbers. 
    const sectionWidth = percent * vw * 100;
    //console.log("sectionWidth: " + sectionWidth + " percent: " + percent + " vw: " + vw);
    //return the section width
    return sectionWidth;
}
function drawDivs() {
    console.log("inside drawDivs");
    //get the parent container
    const sectionParent = document.getElementById("sections");
    //empty the container. 
    sectionParent.replaceChildren();
    //iterate over the sections, grab the divs in order, and add them to the dom by id
    sectionsArr.forEach((sec, index) => {
        //the sections div should be in order, because everything is just sliced in via insertion. 
        //needs the section number, because divs are stored in the map based on their section number. 
        const toAdd = divMap.get(sec.sectionNumber);
        //calc width needs the ARRAY INDEX, because it needs to calc relative sizes. 
        const divWidth = calcWidth(index);
        if (toAdd) {
            toAdd.style.width = `${divWidth}vw`;
            sectionParent.append(toAdd);
        }
    });
}
function resetSections() {
    //empty the divs
    const sectionParent = document.getElementById("sections");
    sectionParent.replaceChildren();
    id = 0;
    //reset the array and map
    sectionsArr.length = 0;
    divMap.clear();
}
function deleteDiv() {
    const div = selectedDiv;
    console.log(div);
    if (!div) {
        console.log("Inside If");
        alert("Must select a section to delete");
        return;
    }
    if (sectionsArr.length === 1) {
        alert("There must be at least one section");
        return;
    }
    const id = Number(div.dataset.sectionId);
    if (!id) {
        alert("Must have a section selection!");
        return;
    }
    //delete the section from the map. 
    divMap.delete(id);
    //iterate over the array, find the section with the section number which is equal to the id. 
    const index = sectionsArr.findIndex(section => section.sectionNumber === id);
    if (index !== -1) {
        sectionsArr.splice(index, 1);
    }
    drawDivs();
}
//# sourceMappingURL=create.js.map