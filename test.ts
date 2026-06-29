//declarations
declare const MusicKit: any;
let music: any; 
let isReady: boolean = false; 
let interval: number; 
const slider = document.querySelector("#slider") as HTMLDivElement; 
const bar = document.querySelector("#progress") as HTMLDivElement; 
const body = document.body; 
let hoverTimer: HTMLElement; 
let rect: DOMRect = document.getElementById("clickTrack")!.getBoundingClientRect();

let rafId: number; 



//refresh rect on screen resize
window.addEventListener("resize", () => { rect = document.getElementById("clickTrack")!.getBoundingClientRect();});

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


//event listener to remove mouseover timer when you leave the track
document.getElementById("clickTrack")!.addEventListener("mouseleave",  () => document.getElementById("clickTrack")!.removeEventListener("mousemove", updateTimer)); 


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
    await music.setQueue({
      song: "1110860977"
    });

    //enable the play button once music kit is loaded.
    let play = document.getElementById("playButton") as HTMLButtonElement;

    play.disabled = false; 

    //listener that updates the state of the playbutton whenever music kit updates its state. 
    music.addEventListener(MusicKit.Events.playbackStateDidChange, updateButton); 

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
  const playBtn = document.getElementById("playButton") as HTMLButtonElement;

  if (!playBtn || !music) return; 

  if (music.playbackState === MusicKit.PlaybackStates.playing) {
    playBtn.textContent = "Pause"; } 
  else {
    playBtn.textContent = "Play";
  }
}

//updates the current playback progress of the track
function updateProgress() {
  console.log("update prog fired")
  let time = document.getElementById("pbTime") as HTMLDivElement;
  time.textContent = formatTime(music.currentPlaybackTime); 

  //calculate how far the bar should be moved
  const percent: number = (music.currentPlaybackTime / music.currentPlaybackDuration) * 100; 

  //color the progress bar
  bar.style.width = String(percent) + '%'; 

  //move the slider
  slider.style.left = String(percent) + '%'; 
}

//updates the state of the duration, sets the timer interval
function updateState() {

  //get the div element that stores the track information. 
  const trackname = document.getElementById("trackName") as HTMLDivElement;

  //set the track name
  trackname.textContent = music.nowPlayingItem.title; 

  //automatically update the playback timer every 250ms
  interval = setInterval(updateProgress, 500);

  const duration = document.getElementById("duration") as HTMLDivElement; 

  //set the duration for the track. 
  duration.textContent = formatTime(music.currentPlaybackDuration); 
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

  //move the slider to the right percent
  slider.style.left = String(percent) + '%'; 

  //update the progress bar to the right fill
  bar.style.width = String(percent) + '%';
}

/* 
  FUNCTIONS RELATED TO THE DISPLAY OF THE MOUSEOVER PLAYBACK TIMER
*/

//selects the time on click. 
function selectTime(movement: MouseEvent) { 

  //get the percentage of progress
  const percent: number = mouseLocation(movement); 

  //calculate where the song should be. have to divide by 100 here as mouselocation returns a whole number. 
  const time = Math.floor(percent * music.currentPlaybackDuration / 100); 
  
  //move the slider
  slider.style.left = String(percent) + '%'; 

  //update the progress bar
  bar.style.width = String(percent) + '%';

  //move to the new time
  music.seekToTime(time);

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

  //listener to keep track of mouse movement
  document.addEventListener("mousemove", updateTimer); 

  //create the div to show the timer
  hoverTimer = document.createElement("div"); 
  
  //append to the dom. 
  document.body.appendChild(hoverTimer);


  hoverTimer.style.position = "fixed";
  hoverTimer.style.left = "0";
  hoverTimer.style.top = `${rect.top - 30}px`;

  //set its color to white. 
  //hoverTimer.style.background = "white"; 

  //do all the calculations by calling timer position
  timerPosition(movement); 

}


function timerPosition(movement: MouseEvent) {
    //calculate the percent of the bar it should have filled
  let percent = mouseLocation(movement);

  //calculate what the time display should be and format it. 
  const time = formatTime(Math.floor(percent * music.currentPlaybackDuration / 100));

  //calculate the left px value
  const left = movement.clientX - rect.left; 


cancelAnimationFrame(rafId); 
//using a requestAnimationFrame to try to fix ghosting occuring when tracking with the cursor. 
rafId = requestAnimationFrame(() => {
  hoverTimer.textContent = time; 
  hoverTimer.style.transform = `translateX(${left}px)`;
 }); 
}

//removes the timer when you leave the bar. 
function removeTimer() {
  if (!hoverTimer) return; 
  hoverTimer.textContent = ""; 
  hoverTimer.remove(); 

}

function mouseLocation(movement: MouseEvent): number {
  //get the mouse location
  const x = movement.clientX; 

  //determine how far across the screen the bar is. 
  const percent: number = (x / window.innerWidth) * 100; 

  return percent; 
}


//helper function to display time in the correct format
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
}