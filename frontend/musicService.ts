declare const MusicKit: any;
let music: any; 
let isReady: boolean = false; 
let queue: any; 
let startTime: number = 0; 
let elapsedTime: number = 0;
let started: boolean = false; 

//having to set my own variable because it takes longer for music kit to recognize it is not playing, than it does for it to stop playing. 
let playing = false; 


//initializes the musicKit and returns a promise 
export function initMusicKit(developerToken: string, updateButton:() => void, updateTrack: () => void, type: string ): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const initialize = async () => {
      try {
        await MusicKit.configure({
          developerToken,
          app: { name: 'Radford Guided Listening', 
                 build: '0.01' 
            },
        });

        //create the musicKit
        music = MusicKit.getInstance();

        //enable the play button once music kit is loaded.
        let play = document.getElementById("playButton") as HTMLButtonElement;
        play.disabled = false; 

        //isREady allows used to handle only allowing things to fire once music kit is initialized. 
        isReady = true;

        //listener that updates the state of the playbutton whenever music kit updates its state. 
        music.addEventListener(MusicKit.Events.playbackStateDidChange, updateButton); 

        //listener that resets the state of the track when it ends. 
        music.addEventListener(MusicKit.Events.playbackStateDidChange, () => {
          if (music.playbackState === 10) {
            started = false; 
            elapsedTime = 0; 
          }
        }); 
        
        //listener that updates the state of the track.
        if (type === "load") {
          music.addEventListener(MusicKit.Events.nowPlayingItemDidChange, updateTrack)
        };

        if (type === "create") updateTrack(); 

        resolve();

      } catch (err) {
        reject(err);
      }
    };

    if (typeof MusicKit !== "undefined") {
      // MusicKit already exists
        await initialize();
    } else {
      // Wait for MusicKit to load
      document.addEventListener(
        "musickitloaded",
        initialize,
        { once: true }
      );
    }
  });
}

export async function authorize(): Promise<void> {
  await music.authorize();
}

export async function setQueue(songId: string): Promise<void> {
  //add the track to the queue
  queue = await music.setQueue({ song: songId });
}

export async function togglePlay(): Promise<void> { 
//handles the playing/pausing
  if (!isReady) return; 

  //get the music playbackstate, return out if its not playing/paused. 
  const state = music.playbackState;

  if (state === MusicKit.PlaybackStates.loading || state === MusicKit.PlaybackStates.buffering) {
    return;
  }

  if (music.isPlaying) {
    music.pause();
    playing = false; 
    syncTime(); 
  }

  else {
    await music.play();
    playing = true; 
    syncTime(); 
  }
}

export function checkReady(): boolean { 
    return isReady; 
}

export function getCurrentTime(): number { 
    if (!music) return 0; 
    if (!playing) return Math.max(0,elapsedTime); 

    //when the song is completed, return the final duration. 
    if (music.playbackState === 10) return getDuration();
    

    else {
      //in all other cases, calculate the elapsed time and return it. 
      return ((elapsedTime * 1000 )+ (performance.now() - startTime)) / 1000; 
    }
}

export function getDuration(): number { 
    if (!music) return 0; 
    return music.currentPlaybackDuration; 
}

export function seekToTime(time: number) {
  music.seekToTime(time); 
  elapsedTime = time; 
  startTime = performance.now(); 
 }

export function getInstance() {
  return music; 
}

export function getPlaybackState() {
    return music.playbackState
 }

export function getQueue() {
    return music.nowPlayingItem?.id
 }

 export function isAuthorized(): boolean {
  return music.isAuthorized; 
 }

 export function getAttributes(): MusicKit.MediaItem{
    return music.MediaItem; 
 }

//returns a promise to get the track as the now playing item once the track has resolved. 
export async function getTrack(): Promise<MusicKit.MediaItem>{
    return music.queue.items[0]; 
}

function syncTime() {

  if (music.playbackState === 1) {
    startTime = performance.now();
    started = true; 
  }

  if (!started) {
    startTime = performance.now();
    started = true; 
  }

  //if the music isn't playing, update the elapsed time by adding elapsed time
  if (!playing) {
    elapsedTime += (performance.now() - startTime) / 1000;
  }

  //when it starts, update the start time. 
  startTime = performance.now(); 
  
}

