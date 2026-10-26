export interface ListeningMap {
  title: string; 
  composer: string; 
  album: string; 
  performer: string;
  trackid: number; 
  uri: string; 
  duration: number; 
  sections: section[];
  comments: comment[];
  keys: key[];
  listenerType: string; 

}

export interface comment {
  commentNumber: number,
  starttime: number, 
  lyrics?: string,
  translation?: string,
  notes?: string
}

export interface key {
  keyNumber: number,
  starttime: number,
  text: string
}

export interface section {
  sectionnumber: number,
  measure: string,  
  sectionname: string;
  starttime: number; 
  endtime: number; 
  lyrics?: string; 
  translation?:  string; 
  notes?: string; 
}


let annotations: ListeningMap; 

//holds the notes for the sections
const notes: string[] = []; 

const ends: number[] = [];

export function createAnnotations(request: ListeningMap) {

  annotations = request; 

  console.log("Annotations: ", annotations); 

  //holds the column titles for the sections
  const columns: string[] = []; 

  //get the div element that stores the track information. 
  const sectionDiv: HTMLDivElement = document.getElementById("sections") as HTMLDivElement;

  for (const curSection of annotations.sections ) {
    //create the div, append it to the dom, set its text
    let newDiv: HTMLDivElement = document.createElement("div"); 
    sectionDiv.append(newDiv); 
    newDiv.textContent = curSection.sectionname; 

    //calculate how long each section is, and then add it to the array for doing output. 
    const duration: number = curSection.endtime - curSection.starttime;
    columns.push(`${duration}fr`); 

    //if the note isn't null, push it to the array, otherwise push an empty string. 
    notes.push( curSection.notes != null ? curSection.notes : " "); 

    //push the end times. 
    ends.push(curSection.endtime); 
  }

  //set the width based on the size of each container
  sectionDiv.style.gridTemplateColumns = columns.join(" "); 

  //set the starting text for note div. 
  const noteDiv: HTMLDivElement = document.getElementById("notes") as HTMLDivElement; 

  noteDiv.textContent = notes[0]!;
 }

export function getAnnotations(): ListeningMap {
  return annotations; 
}

export function getNotes() : string[] {
  return notes; 
}

export function getEnds() : number[] {
  return ends; 
}