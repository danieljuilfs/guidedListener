export function mouseLocation(movement, rect) {
    //get the mouse location within the track, then subtract its left align and the padding from the div
    const x = movement.clientX - rect.left;
    //determine how far across the screen the bar is. 
    const percent = (x / rect.width) * 100;
    const track = document.getElementById("track");
    const style = getComputedStyle(track);
    const currentRect = document.getElementById("track").getBoundingClientRect();
    console.log({
        cached: rect,
        current: currentRect,
    });
    //stop it from going over the edge. 
    return Math.max(0, Math.min(percent, 100));
}
//helper function to display time in the correct format
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}
//# sourceMappingURL=utils.js.map