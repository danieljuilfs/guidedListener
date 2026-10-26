let annotations;
//holds the notes for the sections
const notes = [];
const ends = [];
export function createAnnotations(request) {
    annotations = request;
    console.log("Annotations: ", annotations);
    //holds the column titles for the sections
    const columns = [];
    //get the div element that stores the track information. 
    const sectionDiv = document.getElementById("sections");
    for (const curSection of annotations.sections) {
        //create the div, append it to the dom, set its text
        let newDiv = document.createElement("div");
        sectionDiv.append(newDiv);
        newDiv.textContent = curSection.sectionname;
        //calculate how long each section is, and then add it to the array for doing output. 
        const duration = curSection.endtime - curSection.starttime;
        columns.push(`${duration}fr`);
        //if the note isn't null, push it to the array, otherwise push an empty string. 
        notes.push(curSection.notes != null ? curSection.notes : " ");
        //push the end times. 
        ends.push(curSection.endtime);
    }
    //set the width based on the size of each container
    sectionDiv.style.gridTemplateColumns = columns.join(" ");
    //set the starting text for note div. 
    const noteDiv = document.getElementById("notes");
    noteDiv.textContent = notes[0];
}
export function getAnnotations() {
    return annotations;
}
export function getNotes() {
    return notes;
}
export function getEnds() {
    return ends;
}
//# sourceMappingURL=annotations.js.map