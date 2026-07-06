const bar = document.querySelector("#progress") as HTMLDivElement; 

export function initializeBar() { }


export function updateBar(percent: number): void {
    bar.style.width = String(percent) + '%';
 }

export function getRect() { } //nerd