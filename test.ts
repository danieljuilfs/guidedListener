//declarations
declare const MusicKit: any;
let music: any; 
let isReady: boolean = false; 
let interval: number; 
let queue: any; 
const slider = document.querySelector("#slider") as HTMLDivElement; 
const bar = document.querySelector("#progress") as HTMLDivElement; 
let hoverTimer: HTMLElement; 
let rect: DOMRect; 
let isSeeking: boolean = false; 

const json: string = `[
	{ 
	"name" : "A",
	"startTime" : 0,
	"endTime" : 52
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
	"startTime": 185
	}
]`

//refresh rect on screen resize
window.addEventListener("resize", () => { rect = document.getElementById("track")!.getBoundingClientRect();});

//keep track of the bar sliding listeners
let hasListeners = false; 

//Event listener listening for the play button to be clicked. 
document.getElementById("playButton")!.addEventListener("click", togglePlay);

//event listener for sliding the slider
document.getElementById("slider")!.addEventListener("mousedown", startMove);

//event listener for the tracking bar
document.getElementById("clickTrack")!.addEventListener("click", movePlayback); 

//event listener to add the track timer display on hover over click track
document.getElementById("clickTrack")!.addEventListener("mouseenter", createTimer); 

//event listener to add the track timer display on hover over click track
document.getElementById("clickTrack")!.addEventListener("mouseleave", removeTimer); 


//the JWT for accessing the user 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA" 

if (!jwt) {
    throw new Error("JWT is missing");
}

//bootstrapping setup when music kit finishes loading. 
document.addEventListener('musickitloaded', async function () {
  try {
    await MusicKit.configure({
      developerToken: jwt,
      app: {
        name: 'Radford Guided Listening',
        build: '0.01',
      },
    });
    //instantiate music kit
    music = MusicKit.getInstance(); 

    //authorize the user
    await music.authorize()

    //add a track to the queue. 
    queue = await music.setQueue({
      song: "1110860977"
    });


    //automatically update the state of the page after the queue loads. 
    updateState(); 

    //enable the play button once music kit is loaded.
    let play = document.getElementById("playButton") as HTMLButtonElement;
    play.disabled = false; 

    //listener that updates the state of the playbutton whenever music kit updates its state. 
    music.addEventListener(MusicKit.Events.playbackStateDidChange, updateButton); 

    //used to keep track if whether we can enable playback or not. 
    isReady = true; 

    //listener that updates the state of the track.
    music.addEventListener(MusicKit.Events.nowPlayingItemDidChange, updateState);
    
  } catch (err) {

  }
}); 

//handles the playing/pausing
function togglePlay() {
  if (!isReady) return; 

  //get the music playbackstate, return out if its not playing/paused. 
  const state = music.playbackState;

  if (state === MusicKit.PlaybackStates.loading || state === MusicKit.PlaybackStates.buffering) {
    return;
  }

  if (music.isPlaying) {
    music.pause();
  }
  else {
    music.play();
  }
}

/*
  STATE HANDLING
*/

//update the play/pause button based on current playback status. checked every time the button is pressed. 
function updateButton() {
  const playBtn = document.getElementById("playBtn") as HTMLSpanElement;

  if (!playBtn || !music) return; 

  if (music.playbackState === MusicKit.PlaybackStates.playing) {
    playBtn.textContent = "pause"; } 
  else {
    playBtn.textContent = "play_arrow";
  }
}

//updates the current playback progress of the track
function updateProgress() {
  if (isSeeking) return; 

  //get the element time is stored in
  let time = document.getElementById("pbTime") as HTMLDivElement;
  
  //update its text. 
  time.textContent = formatTime(music.currentPlaybackTime); 

  //calculate how far the bar should be moved
  const percent: number = (music.currentPlaybackTime / music.currentPlaybackDuration) * 100; 

  //update the bar state
  updateBar(percent)
}

//updates the track name, duration time, composer. 
function updateState() {

  //get the div element that stores the track information. 
  const trackname = document.getElementById("trackName") as HTMLDivElement;

  //get the composer div so we can set the composer
  const header = document.getElementById("composer") as HTMLHeadingElement; 

  //set the track name
  trackname.textContent = queue.item(0).attributes.name; 

  //get the composer from the attributes section. 
  const composer = queue.item(0).attributes.composerName;

  //if there is a composer set the composer in the heading
  if (composer) header.textContent = composer; 
  
  //automatically update the playback timer every 500ms
  interval = setInterval(updateProgress, 500);

  //get the duration object from the DOM
  const duration = document.getElementById("duration") as HTMLDivElement; 

  //get the duratino from the queued object, which is in millseconds. convert to seconds. 
  const time = queue.item(0).attributes.durationInMillis / 1000

  //set the duration for the track. 
  duration.textContent = formatTime(time); 
}

//starts the movement of the slider
function startMove() {
  clearInterval(interval); 
  interval = 0; 
  
  document.addEventListener("mousemove", dragSlider); 
  document.addEventListener("mouseup", selectTime);
  hasListeners = true; 
}


//updates the position of the slider as your cursor moves
function dragSlider(movement: MouseEvent) {

  //calculate the percent of the bar it should have filled
  let percent = mouseLocation(movement);  

  //update the bar state
  updateBar(percent)
}

/* 
  FUNCTIONS RELATED TO THE DISPLAY OF THE MOUSEOVER PLAYBACK TIMER
*/

//selects the time on click. 
async function selectTime(movement: MouseEvent) { 

  //get the percentage of progress
  const percent: number = mouseLocation(movement); 

  //calculate where the song should be. have to divide by 100 here as we need to return a percent. 
  const time = Math.floor(percent * music.currentPlaybackDuration / 100); 

  //have to account for the fact I have to round inside of time when using the percents
  const fixedPercent = time / music.currentPlaybackDuration * 100; 

  //update the bar state
  updateBar(fixedPercent)

  //this is here to prevent the track from running the update while the seek is still happening, otherwise you
  isSeeking = true; 

  //move to the new time
  await music.seekToTime(time);

  isSeeking = false; 

  //restart the timer to udpate the interval
  interval = setInterval(updateProgress, 500);

  //if listeners exist, remove them. 
  if (hasListeners) {
    document.removeEventListener("mousemove", dragSlider);
    document.removeEventListener("mouseup", selectTime);
    hasListeners = false; 
  }

}

//moves the playback fill when you click a place on the bar. 
function movePlayback(click: MouseEvent) {
    clearInterval(interval); 
    interval = 0;
    selectTime(click); 
}

//updates the timer display on mousemove
function updateTimer(movement: MouseEvent) {
  timerPosition(movement); 
}

//creates the timer display on the mouse cursor on enter
function createTimer(movement: MouseEvent) {

  //recalculate rect
  rect = document.getElementById("track")!.getBoundingClientRect();

  //listener to keep track of mouse movement
  document.addEventListener("mousemove", updateTimer); 

  //create the div to show the timer
  hoverTimer = document.createElement("div"); 
  
  //append to the dom. 
  document.body.appendChild(hoverTimer);

  //style the div
  hoverTimer.style.background = "#333333";
  hoverTimer.style.color = "white";
  hoverTimer.style.padding = "2px 6px";
  hoverTimer.style.borderRadius = "4px";
  hoverTimer.style.pointerEvents = "none";

  //sets the divs position
  hoverTimer.style.position = "fixed";
  hoverTimer.style.left = "0";
  hoverTimer.style.top = `${rect.top - 30}px`;

  //do all the calculations by calling timer position
  timerPosition(movement); 

}

function updateBar(percent: number) {
  //updates the colored transition
  bar.style.width = String(percent) + '%';

  //sets the slider to the ride location
  slider.style.left = `${percent}%`;

}


function timerPosition(movement: MouseEvent) {

  //calculate the percent of the bar it should have filled
  let percent = mouseLocation(movement);

  //calculate what the time display should be and format it. 
  const time = formatTime(percent * music.currentPlaybackDuration / 100);

  //calculate the left px value
  let left: number = movement.clientX; 

  if (left < 0 || left > rect.width ) {
    hoverTimer.style.display = "none";
    return;
  }
  //update the css of the hovertimer
  hoverTimer.style.display= ""; 
  hoverTimer.textContent = time; 
  hoverTimer.style.transform = `translateX(${left}px) translateX(-50%)`;
  
}

//removes the timer when you leave the bar. 
function removeTimer() {
  if (!hoverTimer) return; 
  document.removeEventListener("mousemove", updateTimer);
  hoverTimer.textContent = ""; 
  hoverTimer.remove(); 

}

function mouseLocation(movement: MouseEvent): number {
  
  //get the mouse location within the track, then subtract its left align and the padding from the div
  const x = movement.clientX - rect.left 

  //determine how far across the screen the bar is. 
  const percent: number = (x / rect.width) * 100; 

  //stop it from going over the edge. 
  return Math.max(0, Math.min(percent, 100));
}


//helper function to display time in the correct format
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
}