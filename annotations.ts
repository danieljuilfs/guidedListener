export interface GuidedListener {
  title: string; 
  composer: string; 
  album: string; 
  performer: string;
  url: string; 
  duration: number; 
  sections: section[]; 
}

export interface section {
  name: string;
  startTime: number; 
  endTime: number;
  text?: string; 
}

let annotations: GuidedListener; 

export function createAnnotations() {

const input: string = `
{
 "title" : "Symphony No. 88 in G Major, Hob. I:88: IV. Finale. Allegro con spirito " ,
  "composer" : "Franz Joseph Haydn" ,
  "album" : "Haydn: Symphonies Nos. 88, 101 'Clock' & 104 'London' (Live)" ,
  "performer" : "Philharmonia Baroque Orchestra & Nicholas McGegan",
  "url" : "https://music.apple.com/us/album/symphony-no-88-in-g-major-hob-i-88-iv-finale-allegro/1110860778?i=1110860977",
  "duration": 246, 
  "sections" : [{ 
    "name" : "A",
    "startTime" : 0,
    "endTime" : 52, 
    "text" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. "
    },
    {
    "name" : "B",
    "startTime" : 52,
    "endTime" : 96
    },
    {
    "name" : "A’",
    "startTime" : 96,
    "endTime" : 116
    },
    {
    "name": "C",
    "startTime": 116,
    "endTime" : 158
    },
    {
    "name": "A’’",
    "startTime": 158,
    "endTime": 185
    },
    {
    "name": "Coda",
    "startTime": 185,
    "endTime": 246
    }
  ]
}`
  
  annotations = JSON.parse(input); 

  const columns: string[] = []; 
  //get the div element that stores the track information. 
  const sectionDiv: HTMLDivElement = document.getElementById("sections") as HTMLDivElement;

  for (const curSection of annotations.sections ) {
    //create the div, append it to the dom, set its text
    let newDiv: HTMLDivElement = document.createElement("div"); 
    sectionDiv.append(newDiv); 
    newDiv.textContent = curSection.name; 

    //calculate how long each section is, and then add it to the array for doing output. 
    const duration: number = curSection.endTime - curSection.startTime;
    columns.push(`${duration}fr`); 
  }

  //get the playbuttons so we can get its width
  const track: HTMLDivElement = document.getElementById("clickTrack") as HTMLDivElement; 

  //get the computed left padding. 
  sectionDiv.style.paddingLeft = getComputedStyle(track).paddingLeft; 

  //set the width based on the size of each container
  sectionDiv.style.gridTemplateColumns = columns.join(" "); 
 }

export function getAnnotations(): GuidedListener {
  return annotations; 
}
