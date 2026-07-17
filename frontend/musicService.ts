declare const MusicKit: any;
let music: any; 
let isReady: boolean = false; 
let queue: any; 

//initializes the musicKit and returns a promise 
export function initMusicKit(developerToken: string, updateButton:() => void, updateTrack: () => void ): Promise<void> {
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

        //listener that updates the state of the track.
        music.addEventListener(MusicKit.Events.nowPlayingItemDidChange, updateTrack);

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
  }

  else {
    music.play();
  }
}

export function checkReady(): boolean { 
    return isReady; 
}

export function getCurrentTime(): number { 
    if (!music) return 0; 
    return music.currentPlaybackTime;
}

export function getDuration(): number { 
    if (!music) return 0; 
    return music.currentPlaybackDuration; 
}

export function seekToTime(time: number) {
  music.seekToTime(time); 
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

