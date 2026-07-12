export interface GuidedListener {
  title: string; 
  composer: string; 
  album: string; 
  performer: string;
  id: number; 
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

//holds the notes for the sections
const notes: string[] = []; 

const ends: number[] = [];

export function createAnnotations() {

const input: string = `
{
 "title" : "Symphony No. 88 in G Major, Hob. I:88: IV. Finale. Allegro con spirito " ,
  "composer" : "Franz Joseph Haydn" ,
  "album" : "Haydn: Symphonies Nos. 88, 101 'Clock' & 104 'London' (Live)" ,
  "performer" : "Philharmonia Baroque Orchestra & Nicholas McGegan",
  "id" : 1110860977,
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
    "endTime" : 116,
    "text" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. \\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. \\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
    "name": "C",
    "startTime": 116,
    "endTime" : 158,
    "text" : "  "
    },
    {
    "name": "A’’",
    "startTime": 158,
    "endTime": 185,
    "text" : "• The old observatory overlooked a valley where morning fog lingered long after sunrise.\\n• Copper leaves drifted across the stone path, gathering in quiet corners beneath the benches.\\n• A distant train echoed through the hills while the town slowly came to life.\\n• Every clock in the workshop ticked at a slightly different rhythm, creating a gentle chorus.\\n• Fresh bread, roasted coffee, and rain-soaked pavement filled the cool autumn air.\\n• Hidden among the shelves was a journal containing sketches, maps, and unfinished ideas.\\n• The lighthouse beam swept across the waves, disappearing briefly behind rolling mist.\\n• Bright constellations emerged one by one as the last streaks of orange faded from the horizon.\\n• Engineers adjusted the final parameters before initiating the overnight systems test.\\n• Even the smallest details often reveal the most interesting stories when examined closely."
    },
    {
    "name": "Coda",
    "startTime": 185,
    "endTime": 246,
    "text" : "Don't forget to drink your ovaltine"
    }
  ]
}`
  
  annotations = JSON.parse(input); 

  //holds the column titles for the sections
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

    //if the note isn't null, push it to the array, otherwise push an empty string. 
    notes.push( curSection.text != null ? curSection.text : " "); 

    //push the end times. 
    ends.push(curSection.endTime); 
  }

  //get the width of the clickTrack so we can dynamically compute the width of the sections
  const track: HTMLDivElement = document.getElementById("clickTrack") as HTMLDivElement; 

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