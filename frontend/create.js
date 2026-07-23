import * as musicService from "./musicService.js";
//import { updateTrack } from "./trackInfo.js";
//the JWT for accessing the authentication 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA";
document.getElementById("loadTrack").addEventListener("click", async () => {
    //if the user isn't authorized, auth
    //if (!musicService.isAuthorized()) await musicService.authorize(); 
    const input = document.getElementById("trackLink");
    const url = input.value;
    let songId;
    if (!url.includes("?i=")) {
        alert("That is not a valid track address");
    }
    else {
        const track = url.split("?i=")[1];
        songId = track;
        console.log(songId);
    }
    /*//if the song isnt in the queue, que it.
    if (musicService.getQueue() !== songId) await musicService.setQueue(songId);
  
     if (!document.fullscreenElement && window.matchMedia("(max-width: 767)").matches) {
          await document.documentElement.requestFullscreen();
      }
  
    //otherwise, just play/pause.
    await musicService.togglePlay(); */
});
//# sourceMappingURL=create.js.map