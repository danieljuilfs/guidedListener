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

interface comment {
  commentNumber: number,
  startTime: number, 
  lyrics?: string,
  translation?: string,
  notes?: string
}

interface key {
  keyNumber: number,
  startTime: number,
  text: string
}

//definitions

let songId: string; 

const titleInput: HTMLInputElement = document.getElementById("trackInput") as HTMLInputElement; 

const composerInput: HTMLInputElement = document.getElementById("composerInput") as HTMLInputElement; 

const addSection: HTMLDivElement = document.getElementById("addSection") as HTMLDivElement; 

const removeSection: HTMLDivElement = document.getElementById("removeSection") as HTMLDivElement; 

const addComment: HTMLDivElement = document.getElementById("addComment") as HTMLDivElement; 

const removeComment: HTMLDivElement = document.getElementById("removeComment") as HTMLDivElement; 

const addKey: HTMLDivElement = document.getElementById("addKey") as HTMLDivElement;

const removeKey: HTMLDivElement = document.getElementById("removeKey") as HTMLDivElement; 

const save: HTMLDivElement = document.getElementById("save") as HTMLDivElement;

let selectedDiv: HTMLDivElement | null = null;

let selectedSection: section | undefined = undefined; 

let selectedComment: comment | undefined = undefined; 

let selectedKey: key | undefined = undefined; 

let trackItem: MusicKit.MediaItem; 

let listenerType: string; 

let album: string; 

let url: string; 

//hold the divs
const divMap: Map<number, HTMLDivElement> = new Map(); 

//hold the section objects
const sectionsArr: section[] = [];

//keep track of the section ids
let id: number = 0; 

let commentId: number = 0; 

let keyId: number = 0; 

//holds comment objects
const commentArr: comment[] = []; 

const keyArr: key[]  = [];

const commentMap: Map<number, HTMLDivElement> = new Map(); 

const keyMap: Map<number, HTMLDivElement> = new Map(); 

let dbID: number | undefined = undefined; 

let performer: string = ""; 

//change set the editor state on page load
updateState(); 

//the JWT for accessing the authentication 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA" 

document.getElementById("loadTrack")!.addEventListener("click", async () => {
    //get the track element
    const input: HTMLInputElement = document.getElementById("trackLink") as HTMLInputElement; 

    //get the url so you can split it. 
    url = input.value; 

    const selectedType = document.querySelector<HTMLInputElement>('input[name="typeSelect"]:checked');

    if (!selectedType) {
         alert("Please select a listener type.");
        return; // Or handle the error however you want
    }
    //set the listener type
    listenerType = document.querySelector<HTMLInputElement>('input[name="typeSelect"]:checked')!.value; 
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

    //if we have an instrumental screen, remove the translation text box. 
    if (listenerType === "instrumental") document.getElementById("translation")!.style.display = "none"; 

    document.getElementById("playBtn")?.addEventListener("click", musicService.togglePlay); 
    document.getElementById("removeSection")?.addEventListener("click", () => deleteDiv("section")); 
    document.getElementById("addComment")?.addEventListener("click", createComment); 
    document.getElementById("removeComment")?.addEventListener("click", () =>  deleteDiv("comment"))
    document.getElementById("addKey")?.addEventListener("click", createKey); 
    document.getElementById("removeKey")?.addEventListener("click", () => deleteDiv("key")); 
    document.getElementById("save")?.addEventListener("click", async () => saveFcn()); 
    document.getElementById("notes")?.addEventListener("input", () => {
      //if there is no selected section, return
      if (!selectedSection && !selectedComment) return

      //container to hold the notes
      const notesDiv: string | undefined = document.getElementById("notes")?.textContent

      if (selectedSection) {
      //if it does exist get the notes are equal to the text content if it exists, otherwise its empty. 
        const notes = notesDiv ? notesDiv : "Add Commentary"; 
        selectedSection.notes = notes; 

        if (listenerType === "vocal ") {
          const translationDiv = document.getElementById("translation")?.textContent
          const translation = translationDiv ? translationDiv : "Add Translation"
          selectedSection.translation = translation;
        }
    }
      if (selectedComment) {
        const notes = notesDiv ? notesDiv : "Add Comment"
        selectedComment.notes = notes; 
      }
    });

  if (listenerType === "vocal") {
    document.getElementById("translation")?.addEventListener("input", () => {
      //if there is no selected section, return
      if (!selectedSection && !selectedComment) return

      //container to hold the notes
      const translationDiv: string | undefined = document.getElementById("translation")?.textContent

      if (selectedSection) {
      //if it does exist get the translation equal to the text content if it exists, otherwise its empty. 
        const translation = translationDiv ? translationDiv : "Add Translation"; 
        selectedSection.translation = translation; 

        if (listenerType === "vocal") {
          const translationDiv = document.getElementById("translation")?.textContent
          const translation = translationDiv ? translationDiv : "Add Translation"
          selectedSection.translation = translation;
        }
    }
      if (selectedComment) {
        const translation = translationDiv ? translationDiv : "Add translation Comment"
        selectedComment.translation = translation; 
      }
    });
  }
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

    //set the performer for use in saving
    performer = trackItem.attributes.artistName; 
    console.log(performer); 

    //set the album for use in saving
    album = trackItem.attributes.albumName; 
    console.log("albumName:" + album); 

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
    addComment.classList.remove("disabledDiv");
    removeComment.classList.remove("disabledDiv"); 
    addKey.classList.remove("disabledDiv"); 
    removeKey.classList.remove("disabledDiv"); 
    save.classList.remove("disabledDiv"); 
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
  
  if (sectionsArr.length > 0) sectionIndex = findSectionIndex(currentTime); 
  else {
  //handling the fact that currentTime will be NaN at the start. 
  currentTime = 0; 
  }

  let duplicateStart = checkDuplicates(currentTime, "sections");

 if (duplicateStart) {
  alert("Cannot have two sections with the same start time!")
  return; 
 }

  //define the object. 
  const newSection: section = {
    sectionNumber: id, 
    measure: "m. #", 
    sectionName: "Section Label",
    startTime: currentTime, 
    lyrics: "Add Lyrics", 
    translation:  "Add Translation", 
    notes: "Add Section Commentary",
  }

  //splice at the determined index, inserting the new section. 
  sectionsArr.splice(sectionIndex+1, 0, newSection); 

  //container to hold the section
  let sectionContainer: HTMLDivElement = document.createElement("div"); 

  //allows the div to be selected. used so we can target the div and remove it. 
  sectionContainer.addEventListener("click", () => onFocus(sectionContainer, "section")); 

  //store the id of the div in the div so we can reference it for deletion. 
  sectionContainer.dataset.sectionId = String(newSection.sectionNumber); 

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
    newSection.measure = measureSection.textContent ?? "m.#"
  })
    

  //create container to hold section title
  let sectionTitle: HTMLDivElement = document.createElement("div"); 
  
  //append it
  sectionContainer.append(sectionTitle); 

  //make it editable
  sectionTitle.contentEditable = "true"; 

  //set its text
  sectionTitle.textContent = String(newSection.sectionName);

  //add the class to the section title
  sectionTitle.classList.add("sectionTitle")

  sectionTitle.addEventListener("input", () => {
    newSection.sectionName = sectionTitle.textContent ?? "Section Label"; 
  })

  //create container to hold the comments
  let commentDiv: HTMLDivElement = document.createElement("div"); 

  //append it
  sectionContainer.append(commentDiv); 

  //add the class to it
  commentDiv.classList.add("comments"); 

  divMap.set(id, sectionContainer); 

  //increment id now that we are done working with it
  id++; 
  
  //render the divs
  drawDivs(); 

  onFocus(sectionContainer, "section"); 

} 

//creates the comment and adds it to the comment array. drawdivs is called to draw the divs which handles the section drawin g. 
function createComment(): void {
  //get the current playback time. 
  let currentTime: number = musicService.getCurrentTime(); 

  if (currentTime === 0 && sectionsArr.length > 0) {
    alert("Track must be playing!"); 
    return; 
  }

  //make sure that the comment is not being created at the start of a section.
  const badStart: section | undefined = sectionsArr.find(section => section.startTime === currentTime)

  if (badStart) {
    alert("Cannot add a comment at the starting point of a section");
    return; 
  }

  //check for duplicates
  let duplicateStart = checkDuplicates(currentTime, "comments");

  if (duplicateStart) {
    alert("Cannot have two comments with the same start time!")
    return; 
  }


  let commentDist: boolean = checkCommentDistance(currentTime); 
  if (commentDist) {
    alert("Cannot have two comments that close to each other!");
    return;  
  }
  
  //create the comment
  const newComment: comment = {
    commentNumber: commentId,
    startTime: currentTime, 
    lyrics: "Add Lyrics",
    translation: "Add Translation",
    notes: "Add Commentary"
    
  }
  
  //add the comment to the array. 
  commentArr.push(newComment)

  //increment the counter
  commentId++; 

  drawDivs(); 

  //set the new comment to the focus. 
  if (commentMap.get(newComment.commentNumber)) {
    onFocus(commentMap.get(newComment.commentNumber), "comment")
  }; 

}

//creates the key and adds it to the key array. drawdivs is called to draw the divs which handles the section drawin g. 
function createKey(): void {
  //get the current playback time. 
  let currentTime: number = musicService.getCurrentTime(); 

  //check for duplicates
  let duplicateStart = checkDuplicates(currentTime, "key");

  if (duplicateStart) {
    alert("Cannot have two keys with the same start time!")
    return; 
  }

  let keyDist: boolean = checkKeyDistance(currentTime); 
  console.log("keyDist:" + keyDist)
  if (keyDist) {
    alert("Cannot have two keys that close to each other!");
    return;  
  }
  
  //create the key
  const newKey: key = {
    keyNumber: keyId,
    startTime: currentTime, 
    text: "key"
  }
  
  //add the key to the array. 
  keyArr.push(newKey)

  //increment the counter
  keyId++; 

  drawDivs(); 

  //set the new key to the focus. 
  if (keyMap.get(newKey.keyNumber)) {
    onFocus(keyMap.get(newKey.keyNumber), "key")
  }; 

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

  //calc the length. 
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

  //sort the comments array to speed up access when we go to add them to the div containers. 
  commentArr.sort((a, b) => a.startTime - b.startTime ); 

  //iterate over the sections, grab the divs in order, and add them to the dom by id
  sectionsArr.forEach((sec: section, index: number) => {
    //the sections div should be in order, because everything is just sliced in via insertion. 
    //needs the section number, because divs are stored in the map based on their section number. 
    const toAdd: HTMLDivElement | undefined = divMap.get(sec.sectionNumber);

    //calc width needs the ARRAY INDEX, because it needs to calc relative sizes. 
    const divWidth = calcWidth(index);  
    if (toAdd) {

      //set the stlye on the div
        toAdd.style.width = `${divWidth}vw`; 
        sectionParent.append(toAdd); 

      //fetch the comment div
      const commentDiv: HTMLDivElement | null = toAdd.querySelector(".comments"); 

      //empty the comment div
      commentDiv?.replaceChildren(); 

      //get the array of comment divs
       const commentsToAdd: HTMLDivElement[] = addComments(index); 

       //iterate over each adding the listener to it. 
       commentsToAdd.forEach((newComment) => {
        newComment.addEventListener("click", (event) => {
          event.stopPropagation(); 
          onFocus(newComment, "comment")
        }); 
        commentDiv!.append(newComment); 
       })
        //append it
        toAdd.append(commentDiv!); 
    }
  })

  //sort the key array 
  keyArr.sort((a, b) => a.startTime - b.startTime ); 

  //get the containers width
  const keyContainer: HTMLDivElement = document.getElementById("keyBar") as HTMLDivElement;

  //empty the key container
  keyContainer.replaceChildren(); 

  keyArr.forEach((key: key, index: number) => {
      //get key, get its time, use that time to determine where it belongs on the page. create the div with the information in it, set its left to wherever it needs to align. 
      
      //get the key time
      const time: number = key.startTime; 

      const length: number = musicService.getDuration(); 

      const left: number = (time / length) * 100; 

      //create the div to hold the key
      const keyDiv: HTMLDivElement = document.createElement("div"); 

      //set its text
      keyDiv.textContent = key.text; 

      //need to assign its position to be relative to its parent
      keyDiv.style.position = "absolute"; 
      keyDiv.style.left = `${left}%`

      //make the div editable
      keyDiv.contentEditable = "true";

      //set its width
      keyDiv.style.width = "60px"; 

      //set its key number
      keyDiv.dataset.keyNumber = String(key.keyNumber); 

      keyDiv.classList.add("key"); 

      keyDiv.addEventListener("click", (event) => {
          event.stopPropagation(); 
          onFocus(keyDiv, "key")
        }); 

      //append the container to its parent
      keyContainer.appendChild(keyDiv);

      //add the key to the map
      keyMap.set(index,keyDiv); 
    })
  }

function resetSections() {

  //empty the divs
  const sectionParent: HTMLDivElement = document.getElementById("sections") as HTMLDivElement; 
  sectionParent.replaceChildren(); 
  id = 0; 

  //reset the array and maps
  sectionsArr.length = 0;
  divMap.clear(); 
  commentMap.clear(); 
  keyMap.clear(); 
  
  document.getElementById("translation")!.style.display = ""; 

}

function deleteDiv(type: string) {
  const div: HTMLDivElement | null = selectedDiv; 

  if (!div?.classList.contains(type)) {
    alert("types must match to delete")
    return; 
  }

  if (!div) {
    alert("Must select something to delete");
    return
  }

  if (type === "section") {
    if (sectionsArr.length === 1) {
      alert("There must be at least one section");
      return
    }
    const id: number | undefined = Number(div.dataset.sectionId); 

    //can use loose equality because checking for both null and undefined is fine!
    if (id == null) {
      alert("Must have a section selected!"); 
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
    //set the focus as the div that was just created. 
    onFocus(divMap.values().next().value, "section")
  }

  if (type === "comment") {

    //get the divs id
    const id: number | undefined = Number(div.dataset.commentNumber); 

    if (id === null) {
      alert("Must have a comment selected!");
      return; 
    }

    //delete the comment from the map of divs
    commentMap.delete(id); 

    //get the index of the comment to delete. 
    const index = commentArr.findIndex( comment => comment.commentNumber === id)

    //if index esists, delete the comment. 
    if (index !== -1) {
      commentArr.splice(index, 1); 
    }
  }

  if (type === "key") {
    //get the divs id
    const id: number | undefined = Number(div.dataset.keyNumber); 

    if (id === null) {
      alert("Must have a key selected!");
      return; 
    }

    //delete the key from the map of divs
    keyMap.delete(id); 

    //get the index of the key to delete. 
    const index = keyArr.findIndex( key => key.keyNumber === id)
    //if index exists, delete the key. 
    if (index !== -1) {
      keyArr.splice(index, 1); 
    }
  }
  drawDivs(); 
}

function onFocus(div: HTMLDivElement | undefined, type: string): void {

    if (!div) {
    alert("No div selected")
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
    const section = sectionsArr.find(
      section => section.sectionNumber === Number(selectedDiv?.dataset.sectionId) 
    );

    //set the section as the selected. 
    if (section) {
      selectedSection = section; 
      selectedComment = undefined; 
      loadComments(selectedDiv, "section"); 
    }
  }

  if (type === "comment") {
    const comment = commentArr.find(
      comment => comment.commentNumber === Number(selectedDiv?.dataset.commentNumber)
    );
    if (comment) {
      selectedSection = undefined; 
      selectedComment = comment; 
      loadComments(selectedDiv, "comment")
    }
  }
  if (type === "key") {
    const key = keyArr.find(key => key.keyNumber === Number(selectedDiv?.dataset.keyNumber)); 
    if (key) {
      selectedSection = undefined; 
      selectedComment = undefined;
      selectedKey = key; 
    }
  }
}

function loadComments(div: HTMLDivElement | undefined, type: string): void {

  if (!div) {
    alert("No div selected")
    return; 
  }

  let translationDiv: HTMLDivElement | undefined = document.getElementById("translation") as HTMLDivElement; 
  const notes: HTMLDivElement | undefined = document.getElementById("notes") as HTMLDivElement;

  if (type === "section") {
    //get the section from the arr to use to get its comment. 
    if (selectedSection){
      if (notes) notes.textContent  = selectedSection.notes ? selectedSection.notes : "Add Section Commentary"; 
      if (translationDiv && listenerType === "vocal") { 
        translationDiv.textContent = selectedSection.translation ? selectedSection.translation : "Add Translation";
      }
    }
  }

  if (type === "comment")

    //if the comment exists, add the comment. 
    if (selectedComment) {
      if (notes) notes.textContent = selectedComment.notes ? selectedComment.notes : "Add Comment"
      if (translationDiv && listenerType === "vocal") { 
        translationDiv.textContent = selectedComment.translation ? selectedComment.translation : "Add Translation";
      }
    }
}; 

function findSectionIndex(currentTime: number): number{

  let sectionIndex = 0; 

  sectionIndex = sectionsArr.findIndex((section, index) => {

    //get the next section in the array 
    const nextSection = sectionsArr[index + 1];

    return (
      /*return whether the current time is greater than the startTime of the current section, and theres either not a next section, or the next sections startTime is less than the current time, 
      return true. If it is, we have found the index of the section. */
        currentTime >= section.startTime &&
        (!nextSection || currentTime < nextSection.startTime)
    );
  });
    return sectionIndex; 
 }

function checkDuplicates(currentTime: number, type: string): boolean {
  let arr; 

  if (type === "comment") { 
    arr = commentArr
  }
  else if (type === "key") {
    arr = keyArr;
  }
  else { 
    arr = sectionsArr; 
  }

  for (const part of arr) {
    if (currentTime === part.startTime) return true; 
  }

  return false; 
}

function addComments(index: number): HTMLDivElement[] {

  const comments: HTMLDivElement[] = []; 
  //get the start time of the current section
  let curTime: number;  

  //if the section exists, get its current time.
  if (sectionsArr[index]) curTime = sectionsArr[index].startTime; 

  //have to increment the index here or typescript gets unhappy.
  const nextIndex = index+1; 

  //set the final duration to the end, and if there is a value in the section array, use that instead. 
  let nextTime: number = musicService.getDuration(); 
  if (sectionsArr[nextIndex]) nextTime = sectionsArr[nextIndex].startTime; 

  //if the comments start time is greater than or equal to the current time, and less than the next time, it belongs in this sections array. 
  commentArr.forEach((comment: comment) => {
    if (comment.startTime >= curTime && comment.startTime < nextTime ) {

      //add the div to the section. 
      const newComment: HTMLDivElement = document.createElement("div"); 

      //add the class to style it. 
      newComment.classList.add("comment");

      //put the marker inside the comment.
      const commentMarker = document.createElement("div");
      commentMarker.classList.add("marker"); 

      //add the commentmarker to the comment div. 
      newComment.append(commentMarker); 
      
      //calculate the length of the section.
      const trackLength: number = nextTime - curTime; 

      //adjust the time to account for the length of the section rather than the whole song
      const adjustedTime: number = comment.startTime - curTime; 

      //get the position of the track
      const position: number = (adjustedTime / trackLength) * 100;

      //set the comments position
      newComment.style.left = `${position}%`; 

      //set the commentnumber into the comment
      newComment.dataset.commentNumber = String(comment.commentNumber); 

      //put the comment in the map
      commentMap.set(comment.commentNumber, newComment); 

      //add the comment to the array
      comments.push(newComment); 
    }
  })
      return comments; 
} 

function checkCommentDistance(currentTime: number): boolean {
  
  let commentDistance = false; 

  //get the sections container
  const sections = document.getElementById("sections"); 

  //get the track length
  const trackDuration: number = musicService.getDuration();

  //get the width of the container
  const containerWidth: number | undefined = sections?.clientWidth; 

  //how many seconds make up 10 pixels
  let secondsPerTen: number = 1; 

  if (containerWidth) {

    //calculates how many seconds make up ten pixels, because 10 is the default pixel size of a comment. 
    secondsPerTen = 10 * trackDuration / containerWidth ; 

    //iterate over the comment arr, compare the difference between the current time and the comments time, if its too small, return true
     commentArr.forEach((comment: comment) => {
        if (Math.abs(currentTime - comment.startTime) < secondsPerTen)
          commentDistance = true; 
      }
    )
  }
  return commentDistance; 
}

function checkKeyDistance(currentTime: number): boolean {
  let keyDistance = false; 

  //get the keys container
  const keys: HTMLDivElement | null = document.getElementById("keyBar") as HTMLDivElement; 

  //get the track length
  const trackDuration: number = musicService.getDuration();

  //get the width of the container
  const containerWidth: number | undefined = keys?.clientWidth; 

  //how many seconds make up 10 pixels. setting a default number. 
  let secondsPerTen: number = 1; 

  if (containerWidth) {

    //calculates how many seconds make up 60 pixels, because 60 is the default pixel size of a comment. 
    secondsPerTen = 60 * trackDuration / containerWidth ; 

    //iterate over the key arr, compare the difference between the current time and the comments time, if its too small, return true
     keyArr.forEach((key: key) => {
        if (Math.abs(currentTime - key.startTime) < secondsPerTen)
          keyDistance = true; 
      }
    )
  }
  return keyDistance; 
}

async function saveFcn(): Promise<void> {

  //create the object
  const listeningMap = {


    album: album,
    trackid: songId, 
    uri: url,  
    duration: musicService.getDuration(),
    performer: performer,
    songId: songId,
    title: titleInput.value,
    composer: composerInput.value,
    sections: sectionsArr,
    comments: commentArr,
    keys: keyArr
  }

  console.log(listeningMap); 


  //if dbID is still undefined then we have yet to save once. 
  if (dbID === undefined) {
    const response = await fetch("http://localhost:3001/annotations", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(listeningMap)
  });
    const data = await response.json();
    dbID = data.id; 
  } 
}