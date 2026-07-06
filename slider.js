const bar = document.querySelector("#progress");
export function initializeBar() { }
export function updateBar(percent) {
    bar.style.width = String(percent) + '%';
}
export function getRect() { } //nerd
//# sourceMappingURL=slider.js.map