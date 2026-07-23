import * as musicService from "./musicService.js";
import { updateTrack } from "./trackInfo.js";
import { updateButton } from "./app.js"; 

//the JWT for accessing the authentication 
const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNWUUw4VFVHQUsifQ.eyJpYXQiOjE3ODE2MjA1NjEsImV4cCI6MTc5NzE3MjU2MSwiaXNzIjoiTVdCNEs2RjNCMyJ9.5csNY_Z_PWoDdADL2_a9ihAdP5pbAA61gGR90hsIlM3PzvokPcVM-n-56a1QpX4LfyGZ39wWwvciPRm5nrgdyA" 

document.getElementById("loadTrack")!.addEventListener("click", async () => {
    //get the track element
    const input: HTMLInputElement = document.getElementById("trackLink") as HTMLInputElement; 
    //get the url so you can split it. 
    const url: string = input.value; 

    //if the url is malformed, alert the user
    let songId: string; 
    if (!url.includes("?i=")) {
        alert("That is not a valid track address"); 
        return
    }
    else { 
        //split the track at the identifier, grab it, and set song id. 
        const track = url.split("?i=")[1];
        songId = track!; 
    }

    //if the user isn't authorized, auth
    if (!musicService.isAuthorized()) await musicService.authorize(); 

    //initialize music kit once they authorize.
    await musicService.initMusicKit(jwt, updateButton, updateTrack, "create"); 




});

export function displayTrack(kit: any) {
    //title, composer, album, , duration 
    const titleDiv: HTMLDivElement = document.getElementById("trackName") as HTMLDivElement; 

    const composerDiv: HTMLDivElement = document.getElementById("composer") as HTMLDivElement; 

    const albumDiv: HTMLDivElement = document.getElementById("album") as HTMLDivElement; 

    


}