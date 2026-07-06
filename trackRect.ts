// trackRect.ts
const track = document.getElementById("clickTrack") as HTMLDivElement;

let rect: DOMRect = track.getBoundingClientRect();

//refresh rect on screen resize
window.addEventListener("resize", () => { rect = document.getElementById("track")!.getBoundingClientRect();});

export function getRect(): DOMRect { //nerd
  return rect;
}