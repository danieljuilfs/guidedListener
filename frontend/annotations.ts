export interface GuidedListener {
  pk: number, 
  title: string; 
  composer: string; 
  album: string; 
  performer: string;
  trackid: number; 
  uri: string; 
  duration: number; 
  sections: section[]; 
}

export interface section {
  annotationid: number, 
  sectionnumber: number, 
  sectionname: string;
  starttime: number; 
  endtime: number;
  notes?: string; 
}

let annotations: GuidedListener; 

//holds the notes for the sections
const notes: string[] = []; 

const ends: number[] = [];

export function createAnnotations(request: GuidedListener) {

  annotations = request; 

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
    console.log(duration); 
    columns.push(`${duration}fr`); 

    //if the note isn't null, push it to the array, otherwise push an empty string. 
    notes.push( curSection.notes != null ? curSection.notes : " "); 

    //push the end times. 
    ends.push(curSection.endtime); 
  }

  //get the width of the clickTrack so we can dynamically compute the width of the sections
  //const track: HTMLDivElement = document.getElementById("clickTrack") as HTMLDivElement; 

  //const paddingLeft: number = parseFloat(getComputedStyle(track).paddingLeft); 

  //get the correct left padding by getting tracks Left rect and adding its padding. 
  //sectionDiv.style.paddingLeft = `${track.getBoundingClientRect().left + paddingLeft}px`; 

  //set the width based on the size of each container
  sectionDiv.style.gridTemplateColumns = columns.join(" "); 

  //set the starting text for note div. 
  const noteDiv: HTMLDivElement = document.getElementById("notes") as HTMLDivElement; 

  noteDiv.textContent = notes[0]!;
 }

export function getAnnotations(): GuidedListener {
  return annotations; 
}

export function getNotes() : string[] {
  return notes; 
}

export function getEnds() : number[] {
  return ends; 
}