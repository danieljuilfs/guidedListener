
export function mouseLocation(movement: MouseEvent, rect: DOMRect): number {
  
  //get the mouse location within the track, then subtract its left align and the padding from the div
  const x = movement.clientX - rect.left 

  //determine how far across the screen the bar is. 
  const percent: number = (x / rect.width) * 100; 

  //stop it from going over the edge. 
  return Math.max(0, Math.min(percent, 100));
}


//helper function to display time in the correct format
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function debug(msg: string) {
  console.log("inside debug");
    const div = document.createElement("div");
    div.textContent = msg;
    div.style.position = "fixed";
    div.style.top = "0";
    div.style.left = "0";
    div.style.background = "white";
    div.style.color = "black";
    div.style.zIndex = "9999";
    document.body.appendChild(div);
}