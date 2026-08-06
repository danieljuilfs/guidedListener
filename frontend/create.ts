import * as musicService from "./musicService.js";
import { formatTime } from "./utils.js"; 
import "./hoverTimer.js"; 
import "./trackInfo.js"; 

interface section {
  sectionNumber: number,
  measure: string,  
  sectionName: string;
  startTime: number; 
  lyrics?: string; 
  translation?:  string; 
  notes?: string; 
}

//definitions

let songId: string; 

const titleInput: HTMLInputElement = document.getElementById("trackInput") as HTMLInputElement; 

const composerInput: HTMLInputElement = document.getElementById("composerInput") as HTMLInputElement; 

const addSection: HTMLDivElement = document.getElementById("addSection") as HTMLDivElement; 

const removeSection: HTMLDivElement = document.getElementById("removeSection") as HTMLDivElement; 

const addCue: HTMLDivElement = document.getElementById("addCue") as HTMLDivElement; 

const removeCue: HTMLDivElement = document.getElementById("removeCue") as HTMLDivElement; 

let selectedDiv: HTMLDivElement | null = null;

let selectedSection: section | undefined = undefined; 

let trackItem: MusicKit.MediaItem; 

//hold the divs
const divMap: Map<number, HTMLDivElement> = new Map(); 

//hold the section objects
const sectionsArr: section[] = [];

//keep track of the section ids
let id: number = 0; 

//change set the editor state on page load
updateState(); 

//the JWT for accessing the authentication 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA" 

document.getElementById("loadTrack")!.addEventListener("click", async () => {
    //get the track element
    const input: HTMLInputElement = document.getElementById("trackLink") as HTMLInputElement; 

    //get the url so you can split it. 
    const url: string = input.value; 

    //if the url is malformed, alert the user

    if (!url.includes("?i=")) {
        alert("That is not a valid track address"); 
        return
    }
    else { 
        //split the track at the identifier, grab it, and set song id. 
        const track = url.split("?i=")[1];
        songId = track!; 
    }

    
    //initialize music kit once they authorize.
    await musicService.initMusicKit(jwt, updateButton, displayTrack, "create"); 


    //if the user isn't authorized, auth
    if (!musicService.isAuthorized()) await musicService.authorize(); 

    //reset on track load. 
    resetSections(); 

    document.getElementById("playBtn")?.addEventListener("click", musicService.togglePlay); 
    document.getElementById("removeSection")?.addEventListener("click", deleteDiv); 
    document.getElementById("notes")?.addEventListener("input", () => {
      //if there is no selected section, return
      if (!selectedSection) return

      //if it does exist get the notes are equal to the text content if it exists, otherwise its empty. 
      const secNotes: string | undefined = document.getElementById("notes")?.textContent
      const notes = secNotes ? secNotes : "Add Comment"; 
      selectedSection.notes = notes; 

      console.log(selectedSection.notes); 
    });
});

async function displayTrack() {
    //queue the track. 
    await musicService.setQueue(songId); 

    const durationDiv: HTMLDivElement = document.getElementById("duration") as HTMLDivElement; 

    //get the track
    trackItem = await musicService.getTrack(); 

    //update the editor state
    updateState(); 

    //set the name
    titleInput.value = trackItem.attributes.name;    

    //set the composer
    composerInput.value = trackItem.attributes.composerName;

    //get the duration, divide by 1000, send to the formatter. 
    durationDiv.textContent = formatTime((trackItem.attributes.durationInMillis/1000)); 

    document.getElementById("addSection")?.addEventListener("click", createSection); 


    //create the first section. 
    createSection(); 
}

//update the play/pause button based on current playback status. checked every time the button is pressed. 
export function updateButton() {
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

//update the state, enabling the title boxess and the like to be edited. 
function updateState() {

  let ready = false; 

  //if the music service instance exists, and there is a track update the state to true. otherwise, leave the inputs disabled. 
  if ( musicService.getInstance() !== null && musicService.getInstance() !== undefined && musicService.getQueue() !== null &&musicService.getTrack() !== null) ready = true; 

  titleInput.disabled = !ready;
  composerInput.disabled = !ready


  if (ready) {
    addSection.classList.remove("disabledDiv");
    removeSection.classList.remove("disabledDiv"); 
    addCue.classList.remove("disabledDiv");
    removeCue.classList.remove("disabledDiv"); 
  }
}

function createSection(): void {
  //get the current playback time. 
  let currentTime: number = musicService.getCurrentTime(); 

  if (currentTime === 0 && sectionsArr.length > 0) {
    alert("Track must be playing!"); 
    return; 
  }

  let sectionIndex: number = 0; 

  //find index determines the index of the item it is looking for. the arrow function determines if the individual section is what you are looking for. 
  if (sectionsArr.length > 0) { sectionIndex = sectionsArr.findIndex((section, index) => {

    //get the next section in the array 
    const nextSection = sectionsArr[index + 1];

    return (
      /*return whether the current time is greater than the startTime of the current section, and theres either not a next section, or the next sections startTime is less than the current time, 
      return true. If it is, we have found the index of the section. */
        currentTime >= section.startTime &&
        (!nextSection || currentTime < nextSection.startTime)
    );
  });
 }
 else {
  //handling the fact that currentTime will be NaN at the start. 
  currentTime = 0; 
 }


  //define the object. 
  const newSection: section = {
    sectionNumber: id, 
    measure: "m. #", 
    sectionName: "Title Section",
    startTime: currentTime, 
    lyrics: "", 
    translation:  "", 
    notes: "Add Text Comment",
  }

  //splice at the determined index, inserting the new section. 
  sectionsArr.splice(sectionIndex+1, 0, newSection); 

  //container to hold the section
  let sectionContainer: HTMLDivElement = document.createElement("div"); 

  //allows the div to be selected. used so we can target the div and remove it. 
  sectionContainer.addEventListener("click", () => onFocus(sectionContainer)); 

  //store the id of the div in the div so we can reference it for deletion. 
  sectionContainer.dataset.sectionId = newSection.sectionNumber.toString(); 

  //add the section class to it. 
  sectionContainer.classList.add("section")
  
  //section to add the measure number. 
  let measureSection: HTMLDivElement = document.createElement("div");

  //append it
  sectionContainer.append(measureSection); 

  //make it editable
  measureSection.contentEditable = "true"; 

  //set its text
  measureSection.textContent = newSection.measure;

  //set class on the measure
  measureSection.classList.add("measure"); 

  //add the listener to update the object when the text changes. 
  measureSection.addEventListener("input" , () => {
    newSection.measure = measureSection.textContent ?? ""
  })

  //create container to hold section title
  let sectionTitle: HTMLDivElement = document.createElement("div"); 
  
  //append it
  sectionContainer.append(sectionTitle); 

  //make it editable
  sectionTitle.contentEditable = "true"; 

  //set its text
  sectionTitle.textContent = String(newSection.sectionNumber);

  //add the class to the section title
  sectionTitle.classList.add("sectionTitle")

  sectionTitle.addEventListener("input", () => {
    newSection.sectionName = sectionTitle.textContent ?? ""; 
 
  })

  divMap.set(id, sectionContainer); 

  //increment id now that we are done working with it
  id++; 
  
  //render the divs
  drawDivs(); 

  onFocus(sectionContainer); 

} 

function getEndTime(index: number): number {

  //get the next section from the array of sections
  const nextSection = sectionsArr[index + 1]; 

  let time = 0; 
  //if that section exists, its start time is our current divs end time.
  if (nextSection) {
    time = nextSection.startTime; 
  }
  else time = trackItem.attributes.durationInMillis/1000;

  //if not, the end time is the end of the track. 
  return time; 
}

function calcWidth(index: number): number  {

  //get the current playback time
  let startTime = sectionsArr[index]?.startTime; 



  if (!startTime) {
    startTime = 0; 
  }

  //get the start time of the next section
  const endTime = getEndTime(index)

  //calc the length. this calc is wrong. 
  const length = endTime - startTime; 

  //get the duration
  const duration: number = trackItem.attributes.durationInMillis/1000;

  //calc the percentage of the container
  const percent: number = length / duration ; 
    
  //get the parent container
  const sectionParent: HTMLDivElement = document.getElementById("sections") as HTMLDivElement; 

  //get the parent containers bounding rect.
  const parentRect: DOMRect = sectionParent.getBoundingClientRect(); 

  const pixelWidth: number = parentRect.width; 

  //calculate the width in vw
  const vw: number = pixelWidth / window.innerWidth; 
  
  //calculate the width of the section. have to multiply by 100 to get whole numbers. 
  const sectionWidth: number = percent * vw * 100; 

  //return the section width
  return sectionWidth; 
  
}

function drawDivs() {

  //get the parent container
  const sectionParent: HTMLDivElement = document.getElementById("sections") as HTMLDivElement; 

  //empty the container. 
  sectionParent.replaceChildren(); 

  //iterate over the sections, grab the divs in order, and add them to the dom by id
  
  sectionsArr.forEach((sec: section, index: number) => {
    //the sections div should be in order, because everything is just sliced in via insertion. 

    //needs the section number, because divs are stored in the map based on their section number. 
    const toAdd: HTMLDivElement | undefined = divMap.get(sec.sectionNumber);
  
    //calc width needs the ARRAY INDEX, because it needs to calc relative sizes. 
    const divWidth = calcWidth(index);  
    if (toAdd) {
         toAdd.style.width = `${divWidth}vw`; 
         sectionParent.append(toAdd); 
    }
  })
}

function resetSections() {

  //empty the divs
    const sectionParent: HTMLDivElement = document.getElementById("sections") as HTMLDivElement; 
    sectionParent.replaceChildren(); 
    id = 0; 

  //reset the array and map
    sectionsArr.length = 0;
    divMap.clear(); 
}

function deleteDiv() {
  const div: HTMLDivElement | null = selectedDiv; 

  if (!div) {
    alert("Must select a section to delete");
    return
  }

  if (sectionsArr.length === 1) {
    alert("There must be at least one section");
    return
  }

 
  const id: number | undefined = Number(div.dataset.sectionId); 

  console.log(id); 

  //can use loose equality because checking for both null and undefined is fine!
  if (id == null) {
    alert("Must have a section selection!"); 
    return 
  }

  //delete the section from the map. 
  divMap.delete(id)

  //iterate over the array, find the section with the section number which is equal to the id. 
  const index = sectionsArr.findIndex(
    section => section.sectionNumber === id
  );


  //have to handle deletion of the first section, by updating the start time of the second section. 
  if (index === 0 ) {
    if (sectionsArr[1]) sectionsArr[1].startTime = 0; 
  }
  if (index !== -1) {
    sectionsArr.splice(index, 1); 
  }



  drawDivs(); 

  onFocus(divMap.values().next().value)
}

function onFocus(div: HTMLDivElement | undefined) {

    if (!div) {
    console.log("No div selected")
    return; 
  }
  // Remove selection from the previous div
  if (selectedDiv) {
      selectedDiv.classList.remove("selected");
  }

  // Select this div
  selectedDiv = div;
  selectedDiv.classList.add("selected");


  //set the selected section
  //iterate over the array, find the section with the section number which is equal to the id. 
  const section = sectionsArr.find(
    section => section.sectionNumber === Number(selectedDiv?.dataset.sectionId) 
  );

  if (section) {
    selectedSection = section; 
    loadComments(selectedDiv); 
  }
}

function loadComments(div: HTMLDivElement | undefined) {
  console.log("inside loadComments")
  
  if (!div) {
    console.log("No div selected")
    return; 
  }
    //get the section id out of the div passed in. 
    const sectionId: number = Number(div.dataset.sectionId);

    console.log(sectionsArr); 
    console.log("sectionID: " + sectionId )
    //get the section from the arr to use to get its comment. 
   

    if (selectedSection){
      const notes: HTMLDivElement | undefined = document.getElementById("notes") as HTMLDivElement;
      console.log("textContent: " + notes.textContent); 
      if (notes) notes.textContent  = selectedSection.notes ? selectedSection.notes : "Add Comment"; 
    }


}; 
