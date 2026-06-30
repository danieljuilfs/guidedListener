let music;
let isReady = false;
let interval;
let queue;
const slider = document.querySelector("#slider");
const bar = document.querySelector("#progress");
let hoverTimer;
let rect = document.getElementById("clickTrack").getBoundingClientRect();
let rafId;
//refresh rect on screen resize
window.addEventListener("resize", () => { rect = document.getElementById("clickTrack").getBoundingClientRect(); });
//keep track of the bar sliding listeners
let hasListeners = false;
//Event listener listening for the play button to be clicked. 
document.getElementById("playButton").addEventListener("click", togglePlay);
//event listener for sliding the slider
document.getElementById("slider").addEventListener("mousedown", startMove);
//event listener for the tracking bar
document.getElementById("clickTrack").addEventListener("click", movePlayback);
//event listener to add the track timer display on hover over click track
document.getElementById("clickTrack").addEventListener("mouseenter", createTimer);
//event listener to add the track timer display on hover over click track
document.getElementById("clickTrack").addEventListener("mouseleave", removeTimer);
//the JWT for accessing the user 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA";
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
        await music.authorize();
        //add a track to the queue. 
        queue = await music.setQueue({
            song: "1110860977"
        });
        //automatically update the state of the page after the queue loads. 
        updateState();
        //enable the play button once music kit is loaded.
        let play = document.getElementById("playButton");
        play.disabled = false;
        //listener that updates the state of the playbutton whenever music kit updates its state. 
        music.addEventListener(MusicKit.Events.playbackStateDidChange, updateButton);
        //used to keep track if whether we can enable playback or not. 
        isReady = true;
        //listener that updates the state of the track.
        music.addEventListener(MusicKit.Events.nowPlayingItemDidChange, updateState);
    }
    catch (err) {
    }
});
//handles the playing/pausing
function togglePlay() {
    if (!isReady)
        return;
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
    const playBtn = document.getElementById("playBtn");
    if (!playBtn || !music)
        return;
    if (music.playbackState === MusicKit.PlaybackStates.playing) {
        playBtn.textContent = "pause";
    }
    else {
        playBtn.textContent = "play_arrow";
    }
}
//updates the current playback progress of the track
function updateProgress() {
    let time = document.getElementById("pbTime");
    time.textContent = formatTime(music.currentPlaybackTime);
    //calculate how far the bar should be moved
    const percent = (music.currentPlaybackTime / music.currentPlaybackDuration) * 100;
    //color the progress bar
    bar.style.width = String(percent) + '%';
    //move the slider
    slider.style.left = String(percent) + '%';
}
//updates the track name, duration time, composer. 
function updateState() {
    //get the div element that stores the track information. 
    const trackname = document.getElementById("trackName");
    const header = document.getElementById("composer");
    //set the track name
    trackname.textContent = queue.item(0).attributes.name;
    console.log(queue.item(0).attributes);
    const composer = queue.item(0).attributes.composerName;
    //if there is a composer set the composer in the heading
    if (composer)
        header.textContent = composer;
    //automatically update the playback timer every 500ms
    interval = setInterval(updateProgress, 500);
    const duration = document.getElementById("duration");
    const time = queue.item(0).attributes.durationInMillis / 1000;
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
function dragSlider(movement) {
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
function selectTime(movement) {
    //get the percentage of progress
    const percent = mouseLocation(movement);
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
function movePlayback(click) {
    clearInterval(interval);
    interval = 0;
    selectTime(click);
}
//updates the timer display on mousemove
function updateTimer(movement) {
    timerPosition(movement);
}
//creates the timer display on the mouse cursor on enter
function createTimer(movement) {
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
function timerPosition(movement) {
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
    if (!hoverTimer)
        return;
    document.removeEventListener("mousemove", updateTimer);
    hoverTimer.textContent = "";
    hoverTimer.remove();
}
function mouseLocation(movement) {
    //get the div
    const clickTrack = document.getElementById("clickTrack");
    //get its styling so we can get its padding
    const style = getComputedStyle(clickTrack);
    //get the mouse location within the track, then subtract its left align and the padding from the div
    const x = movement.clientX - rect.left - parseFloat(style.paddingLeft);
    //calculate the padding from both sides to calculate the container size. 
    const padded = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const divSize = rect.width - padded;
    //determine how far across the screen the bar is. 
    const percent = (x / (divSize)) * 100;
    return percent;
}
//helper function to display time in the correct format
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}
export {};
//# sourceMappingURL=test.js.map