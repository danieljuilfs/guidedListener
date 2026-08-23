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
let selectedSection = undefined;
let selectedCue = undefined;
let trackItem;
let listenerType;
//hold the divs
const divMap = new Map();
//hold the section objects
const sectionsArr = [];
//keep track of the section ids
let id = 0;
let cueId = 0;
//holds cue objects
const cueArr = [];
const cueMap = new Map();
//change set the editor state on page load
updateState();
//the JWT for accessing the authentication 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA";
document.getElementById("loadTrack").addEventListener("click", async () => {
    //get the track element
    const input = document.getElementById("trackLink");
    //get the url so you can split it. 
    const url = input.value;
    //set the listener type
    listenerType = document.querySelector('input[name="typeSelect"]:checked').value;
    console.log("listenerType: ", listenerType);
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
    //if we have an instrumental screen, remove the translation text box. 
    if (listenerType === "instrumental")
        document.getElementById("translation").style.display = "none";
    document.getElementById("playBtn")?.addEventListener("click", musicService.togglePlay);
    document.getElementById("removeSection")?.addEventListener("click", () => deleteDiv("section"));
    document.getElementById("addCue")?.addEventListener("click", createCue);
    document.getElementById("removeCue")?.addEventListener("click", () => deleteDiv("cue"));
    document.getElementById("notes")?.addEventListener("input", () => {
        //if there is no selected section, return
        if (!selectedSection && !selectedCue)
            return;
        //container to hold the notes
        const notesDiv = document.getElementById("notes")?.textContent;
        if (selectedSection) {
            //if it does exist get the notes are equal to the text content if it exists, otherwise its empty. 
            const notes = notesDiv ? notesDiv : "Add Commentary";
            selectedSection.notes = notes;
            if (listenerType === "vocal ") {
                const translationDiv = document.getElementById("translation")?.textContent;
                const translation = translationDiv ? translationDiv : "Add Translation";
                selectedSection.translation = translation;
            }
        }
        if (selectedCue) {
            const notes = notesDiv ? notesDiv : "Add Cue Comment";
            selectedCue.notes = notes;
        }
    });
    if (listenerType === "vocal") {
        document.getElementById("translation")?.addEventListener("input", () => {
            //if there is no selected section, return
            if (!selectedSection && !selectedCue)
                return;
            //container to hold the notes
            const translationDiv = document.getElementById("translation")?.textContent;
            if (selectedSection) {
                //if it does exist get the translation equal to the text content if it exists, otherwise its empty. 
                const translation = translationDiv ? translationDiv : "Add Translation";
                selectedSection.translation = translation;
                if (listenerType === "vocal ") {
                    const translationDiv = document.getElementById("translation")?.textContent;
                    const translation = translationDiv ? translationDiv : "Add Translation";
                    selectedSection.translation = translation;
                }
            }
            if (selectedCue) {
                const translation = translationDiv ? translationDiv : "Add translation Comment";
                selectedCue.translation = translation;
            }
        });
    }
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
    if (sectionsArr.length > 0)
        sectionIndex = findSectionIndex(currentTime);
    else {
        //handling the fact that currentTime will be NaN at the start. 
        currentTime = 0;
    }
    let duplicateStart = checkDuplicates(currentTime, "sections");
    if (duplicateStart) {
        alert("Cannot have two sections with the same start time!");
        return;
    }
    //define the object. 
    const newSection = {
        sectionNumber: id,
        measure: "m. #",
        sectionName: "Title Section",
        startTime: currentTime,
        lyrics: "Add Lyrics",
        translation: "Add Translation",
        notes: "Add Section Commentary",
    };
    //splice at the determined index, inserting the new section. 
    sectionsArr.splice(sectionIndex + 1, 0, newSection);
    //container to hold the section
    let sectionContainer = document.createElement("div");
    //allows the div to be selected. used so we can target the div and remove it. 
    sectionContainer.addEventListener("click", () => onFocus(sectionContainer, "section"));
    //store the id of the div in the div so we can reference it for deletion. 
    sectionContainer.dataset.sectionId = String(newSection.sectionNumber);
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
    //add the listener to update the object when the text changes. 
    measureSection.addEventListener("input", () => {
        newSection.measure = measureSection.textContent ?? "m.#";
    });
    //create container to hold section title
    let sectionTitle = document.createElement("div");
    //append it
    sectionContainer.append(sectionTitle);
    //make it editable
    sectionTitle.contentEditable = "true";
    //set its text
    sectionTitle.textContent = String(newSection.sectionName);
    //add the class to the section title
    sectionTitle.classList.add("sectionTitle");
    sectionTitle.addEventListener("input", () => {
        newSection.sectionName = sectionTitle.textContent ?? "Add Title";
    });
    //create container to hold the cues
    let cueDiv = document.createElement("div");
    //append it
    sectionContainer.append(cueDiv);
    //add the clas to it
    cueDiv.classList.add("cues");
    divMap.set(id, sectionContainer);
    //increment id now that we are done working with it
    id++;
    //render the divs
    drawDivs();
    onFocus(sectionContainer, "section");
}
//creates the cue and adds it to the cue array. drawdivs is called to draw the divs which handles the section drawin g. 
function createCue() {
    //get the current playback time. 
    let currentTime = musicService.getCurrentTime();
    if (currentTime === 0 && sectionsArr.length > 0) {
        alert("Track must be playing!");
        return;
    }
    //make sure that the cue is not being created at the start of a section.
    const badStart = sectionsArr.find(section => section.startTime === currentTime);
    if (badStart) {
        alert("Cannot add a cue at the starting point of a section");
        return;
    }
    //check for duplicates
    let duplicateStart = checkDuplicates(currentTime, "cues");
    if (duplicateStart) {
        alert("Cannot have two cues with the same start time!");
        return;
    }
    //create the cue
    const newCue = {
        cueNumber: cueId,
        startTime: currentTime,
        lyrics: "Add Lyrics",
        translation: "Add Translation",
        notes: "Add Cue Commentary"
    };
    //add the cue to the array. 
    cueArr.push(newCue);
    //increment the counter
    cueId++;
    drawDivs();
    //set the new cue to the focus. 
    if (cueMap.get(newCue.cueNumber)) {
        onFocus(cueMap.get(newCue.cueNumber), "cue");
    }
    ;
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
    if (!startTime) {
        startTime = 0;
    }
    //get the start time of the next section
    const endTime = getEndTime(index);
    //calc the length. 
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
    //return the section width
    return sectionWidth;
}
function drawDivs() {
    //get the parent container
    const sectionParent = document.getElementById("sections");
    //empty the container. 
    sectionParent.replaceChildren();
    //sort the cues array to speed up access when we go to add them to the div containers. 
    cueArr.sort((a, b) => a.startTime - b.startTime);
    //iterate over the sections, grab the divs in order, and add them to the dom by id
    sectionsArr.forEach((sec, index) => {
        //the sections div should be in order, because everything is just sliced in via insertion. 
        //needs the section number, because divs are stored in the map based on their section number. 
        const toAdd = divMap.get(sec.sectionNumber);
        //calc width needs the ARRAY INDEX, because it needs to calc relative sizes. 
        const divWidth = calcWidth(index);
        if (toAdd) {
            //set the stlye on the div
            toAdd.style.width = `${divWidth}vw`;
            sectionParent.append(toAdd);
            //fetch the cue div
            const cueDiv = toAdd.querySelector(".cues");
            //empty the cue div
            cueDiv?.replaceChildren();
            //get the array of cue divs
            const cuesToAdd = addCues(index);
            //iterate over each adding the listener to it. 
            cuesToAdd.forEach((newCue) => {
                newCue.addEventListener("click", (event) => {
                    event.stopPropagation();
                    onFocus(newCue, "cue");
                });
                cueDiv.append(newCue);
            });
            //append it
            toAdd.append(cueDiv);
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
    cueMap.clear();
    document.getElementById("translation").style.display = "";
}
function deleteDiv(type) {
    const div = selectedDiv;
    if (!div) {
        alert("Must select a section to delete");
        return;
    }
    if (type === "section") {
        if (sectionsArr.length === 1) {
            alert("There must be at least one section");
            return;
        }
        const id = Number(div.dataset.sectionId);
        //can use loose equality because checking for both null and undefined is fine!
        if (id == null) {
            alert("Must have a section selection!");
            return;
        }
        //delete the section from the map. 
        divMap.delete(id);
        //iterate over the array, find the section with the section number which is equal to the id. 
        const index = sectionsArr.findIndex(section => section.sectionNumber === id);
        //have to handle deletion of the first section, by updating the start time of the second section. 
        if (index === 0) {
            if (sectionsArr[1])
                sectionsArr[1].startTime = 0;
        }
        if (index !== -1) {
            sectionsArr.splice(index, 1);
        }
        //set the focus as the div that was just created. 
        onFocus(divMap.values().next().value, "section");
    }
    if (type === "cue") {
        //get the divs id
        const id = Number(div.dataset.cueNumber);
        //delete the cue from the map of divs
        cueMap.delete(id);
        if (id === null) {
            alert("Must have a cue selected!");
            return;
        }
        //get the index of the cue to delete. 
        const index = cueArr.findIndex(cue => cue.cueNumber === id);
        //if index esists, delete the cue. 
        if (index !== -1) {
            cueArr.splice(index, 1);
        }
    }
    drawDivs();
}
function onFocus(div, type) {
    if (!div) {
        alert("No div selected");
        return;
    }
    // Remove selection from the previous div
    if (selectedDiv) {
        selectedDiv.classList.remove("selected");
    }
    // Select this div
    selectedDiv = div;
    selectedDiv.classList.add("selected");
    if (type === "section") {
        //iterate over the array, find the section with the section number which is equal to the id. 
        const section = sectionsArr.find(section => section.sectionNumber === Number(selectedDiv?.dataset.sectionId));
        //set the section as the selected. 
        if (section) {
            selectedSection = section;
            selectedCue = undefined;
            loadComments(selectedDiv, "section");
        }
    }
    if (type === "cue") {
        const cue = cueArr.find(cue => cue.cueNumber === Number(selectedDiv?.dataset.cueNumber));
        if (cue) {
            selectedSection = undefined;
            selectedCue = cue;
            loadComments(selectedDiv, "cue");
        }
    }
}
function loadComments(div, type) {
    if (!div) {
        alert("No div selected");
        return;
    }
    let translationDiv = document.getElementById("translation");
    const notes = document.getElementById("notes");
    if (type === "section") {
        //get the section from the arr to use to get its comment. 
        if (selectedSection) {
            if (notes)
                notes.textContent = selectedSection.notes ? selectedSection.notes : "Add Section Commentary";
            if (translationDiv && listenerType === "vocal") {
                translationDiv.textContent = selectedSection.translation ? selectedSection.translation : "Add Translation";
            }
        }
    }
    if (type === "cue")
        //if the cue exists, add the cue comment. 
        if (selectedCue) {
            if (notes)
                notes.textContent = selectedCue.notes ? selectedCue.notes : "Add Cue Comment";
            if (translationDiv && listenerType === "vocal") {
                translationDiv.textContent = selectedCue.translation ? selectedCue.translation : "Add Translation";
            }
        }
}
;
function findSectionIndex(currentTime) {
    let sectionIndex = 0;
    sectionIndex = sectionsArr.findIndex((section, index) => {
        //get the next section in the array 
        const nextSection = sectionsArr[index + 1];
        return (
        /*return whether the current time is greater than the startTime of the current section, and theres either not a next section, or the next sections startTime is less than the current time,
        return true. If it is, we have found the index of the section. */
        currentTime >= section.startTime &&
            (!nextSection || currentTime < nextSection.startTime));
    });
    return sectionIndex;
}
function checkDuplicates(currentTime, type) {
    let arr;
    if (type === "cues") {
        arr = cueArr;
    }
    else {
        arr = sectionsArr;
    }
    for (const part of arr) {
        if (currentTime === part.startTime)
            return true;
    }
    return false;
}
function addCues(index) {
    const cues = [];
    //get the start time of the current section
    let curTime;
    //if the section exists, get its current time.
    if (sectionsArr[index])
        curTime = sectionsArr[index].startTime;
    //have to increment the index here or typescript gets unhappy.
    const nextIndex = index + 1;
    //set the final duration to the end, and if there is a value in the section array, use that instead. 
    let nextTime = musicService.getDuration();
    if (sectionsArr[nextIndex])
        nextTime = sectionsArr[nextIndex].startTime;
    //if the cues start time is greater than or equal to the current time, and less than the next time, it belongs in this sections array. 
    cueArr.forEach((cue) => {
        if (cue.startTime >= curTime && cue.startTime < nextTime) {
            //add the div to the section. 
            const newCue = document.createElement("div");
            //add the class to style it. 
            newCue.classList.add("cue");
            //put the marker inside the cue.
            const cueMarker = document.createElement("div");
            cueMarker.classList.add("marker");
            //add the cuemarker to the cue div. 
            newCue.append(cueMarker);
            //calculate the length of the section.
            const trackLength = nextTime - curTime;
            //adjust the time to account for the length of the section rather than the whole song
            const adjustedTime = cue.startTime - curTime;
            //get the position of the track
            const position = (adjustedTime / trackLength) * 100;
            //set the cues position
            newCue.style.left = `${position}%`;
            //set the cuenumber into the cue
            newCue.dataset.cueNumber = String(cue.cueNumber);
            //put the cue in the map
            cueMap.set(cue.cueNumber, newCue);
            //add the cue to the array
            cues.push(newCue);
        }
    });
    return cues;
}
//# sourceMappingURL=create.js.map