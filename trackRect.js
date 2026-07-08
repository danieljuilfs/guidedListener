// trackRect.ts
const track = document.getElementById("track");
let rect = track.getBoundingClientRect();
//refresh rect on screen resize
window.addEventListener("resize", () => { rect = document.getElementById("track").getBoundingClientRect(); });
export function getRect() {
    return rect;
}
//# sourceMappingURL=trackRect.js.map