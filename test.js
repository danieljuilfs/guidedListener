let music;
let isReady = false;
let pbTime;
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
        console.log("loaded");
        //instantiate music kit
        music = MusicKit.getInstance();
        //authorize the user
        await music.authorize();
        //add a track to the queue. 
        await music.setQueue({
            song: "1110860977"
        });
        //enable the play button once music kit is loaded.
        let play = document.getElementById("playButton");
        play.disabled = false;
        //listener that updates the state of the playbutton whenever music kit updates its state. 
        music.addEventListener(MusicKit.Events.playbackStateDidChange, updateButton);
        isReady = true;
        //listener that updates the state of the track.
        music.addEventListener(MusicKit.Events.nowPlayingItemDidChange, updateState);
    }
    catch (err) {
    }
});
//Event listener listening for the play button to be clicked. 
document.getElementById("playButton").addEventListener("click", togglePlay);
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
//update the play/pause button based on current playback status. checked every time the button is pressed. 
function updateButton() {
    const playBtn = document.getElementById("playButton");
    if (!playBtn || !music)
        return;
    if (music.playbackState === MusicKit.PlaybackStates.playing) {
        playBtn.textContent = "Pause";
    }
    else {
        playBtn.textContent = "Play";
    }
}
//updates the current playback time of the track
function updateTime() {
    let time = document.getElementById("pbTime");
    time.textContent = formatTime(music.currentPlaybackTime);
}
//updates the state of the duration, sets the timer interval
function updateState() {
    //set the track name
    const trackname = document.getElementById("trackName");
    console.log(music.nowPlayingItem);
    trackname.textContent = music.nowPlayingItem.title;
    //automatically update the playback timer every 250ms
    setInterval(updateTime, 250);
    const duration = document.getElementById("duration");
    //set the duration for the track. 
    duration.textContent = formatTime(music.currentPlaybackDuration);
}
//helper function to display time in the correct format
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}
export {};
//# sourceMappingURL=test.js.map