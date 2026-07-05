let music;
let isReady = false;
let queue;
//initializes the musicKit and returns a promise 
export function initMusicKit(developerToken, songId, updateButton, updateTrack) {
    return new Promise((resolve, reject) => {
        document.addEventListener('musickitloaded', async () => {
            try {
                await MusicKit.configure({
                    developerToken,
                    app: { name: 'Radford Guided Listening',
                        build: '0.01'
                    },
                });
                music = MusicKit.getInstance();
                await music.authorize();
                queue = await music.setQueue({ song: songId });
                updateTrack();
                //enable the play button once music kit is loaded.
                let play = document.getElementById("playButton");
                play.disabled = false;
                isReady = true;
                //listener that updates the state of the playbutton whenever music kit updates its state. 
                music.addEventListener(MusicKit.Events.playbackStateDidChange, updateButton);
                //listener that updates the state of the track.
                music.addEventListener(MusicKit.Events.nowPlayingItemDidChange, updateTrack);
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
export function togglePlay() {
    //handles the playing/pausing
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
export function checkReady() {
    return isReady;
}
export function getCurrentTime() {
    return music.currentPlaybackTime;
}
export function getDuration() {
    if (!music)
        return 0;
    return music.currentPlaybackDuration;
}
export function seekToTime(time) {
    music.seekToTime(time);
}
export function getPlaybackState() {
    return music.playbackState;
}
export function getQueue() {
    return queue;
}
//# sourceMappingURL=musicService.js.map