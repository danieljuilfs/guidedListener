import * as musicService from "./musicService.js";
import { formatTime } from "./utils.js";
import "./hoverTimer.js";
import "./trackInfo.js";
let songId;
const titleInput = document.getElementById("trackInput");
const composerInput = document.getElementById("composerInput");
const addSection = document.getElementById("addSection");
const removeSection = document.getElementById("removeSection");
const addCue = document.getElementById("addCue");
const removeCue = document.getElementById("removeCue");
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
    const track = await musicService.getTrack();
    //update the editor state
    updateState();
    //set the name
    titleInput.value = track.attributes.name;
    //set the composer
    composerInput.value = track.attributes.composerName;
    //get the duration, divide by 1000, send to the formatter. 
    durationDiv.textContent = formatTime((track.attributes.durationInMillis / 1000));
    document.getElementById("addSection")?.addEventListener("click", createSection);
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
    const currentTime = musicService.getCurrentTime();
    //get the duration
    const duration = musicService.getDuration();
    //calc the percentage of the container
    const percent = currentTime / duration;
    //get the parent div
    const sectionParent = document.getElementById("sections");
    //get the parent containers bounding rect.
    const parentRect = sectionParent.getBoundingClientRect();
    //get the width of the parent container in pixels. 
    const pixelWidth = parentRect.width;
    //calculate the width in vw
    const vw = pixelWidth / window.innerWidth;
    //calculate the width of the section. have to multiply by 100 to get whole numbers. 
    const sectionWidth = percent * vw * 100;
    //container to hold the section
    let sectionContainer = document.createElement("div");
    //append to the parent
    sectionParent.append(sectionContainer);
    //set the containers width
    sectionContainer.style.width = `${sectionWidth}vw`;
    sectionContainer.classList.add("section");
    //section to add the measure number. 
    let measureSection = document.createElement("div");
    //append it
    sectionContainer.append(measureSection);
    //make it editable
    measureSection.contentEditable = "true";
    //set its text
    measureSection.textContent = "m. #";
    //set class on the measure
    measureSection.classList.add("measure");
    //create container to hold section
    let sectionTitle = document.createElement("div");
    //append it
    sectionContainer.append(sectionTitle);
    //make ite ditable
    sectionTitle.contentEditable = "true";
    //set its text
    sectionTitle.textContent = "Section Title";
    //add the class to the section title
    sectionTitle.classList.add("sectionTitle");
}
//# sourceMappingURL=create.js.map