let annotations;
export function createAnnotations() {
    const input = `
{
 "title" : "Symphony No. 88 in G Major, Hob. I:88: IV. Finale. Allegro con spirito " ,
  "composer" : "Franz Joseph Haydn" ,
  "album" : "Haydn: Symphonies Nos. 88, 101 'Clock' & 104 'London' (Live)" ,
  "performer" : "Philharmonia Baroque Orchestra & Nicholas McGegan",
  "url" : "www.butts.com",
  "parts" : [{ 
    "name" : "A",
    "startTime" : 0,
    "endTime" : 52, 
    "text" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. "
    },
    {
    "name" : "B",
    "startTime" : 52,
    "endTime" : 96
    },
    {
    "name" : "A’",
    "startTime" : 96,
    "endTime" : 116
    },
    {
    "name": "C",
    "startTime": 116,
    "endTime" : 158
    },
    {
    "name": "A’’",
    "startTime": 158,
    "endTime": 185
    },
    {
    "name": "Coda",
    "startTime": 185
    }
  ]
}`;
    annotations = JSON.parse(input);
    return annotations;
}
//# sourceMappingURL=annotations.js.map