
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