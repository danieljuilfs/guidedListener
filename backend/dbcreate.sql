use guidedlistener; 

DROP TABLE IF EXISTS sections; 
DROP TABLE IF EXISTS comments; 
DROP TABLE IF EXISTS mkeys; 
DROP TABLE IF EXISTS listeningMaps; 


CREATE TABLE listeningMaps (
    pk int NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    album varchar(255), 
    trackid int NOT NULL, 
    uri varchar(255) NOT NULL,
    duration int NOT NULL,
    performer varchar(255),
    title varchar(200) NOT NULL,
    composer varchar(1000),
    listenerType varchar(50) NOT NULL   
); 

CREATE TABLE sections (
    mapid int NOT NULL, 
    sectionnumber int NOT NULL,
    PRIMARY KEY (mapid, sectionnumber),
    sectionname varchar(200) NOT NULL,
    starttime INT NOT NULL,
    endtime INT NOT NULL,
    notes VARCHAR(2000), 
    FOREIGN KEY (mapID) REFERENCES listeningMaps(pk)
);

CREATE TABLE comments (
    commentNumber int not null,
    mapid int not null,
    PRIMARY KEY (mapid, commentnumber),
    startTime int NOT NULL, 
    lyrics varchar(2000),
    translation varchar(2000), 
    notes varchar(2000),
    FOREIGN KEY (mapid) references listeningMaps(pk)
);

CREATE TABLE mkeys (
    keyNumber INT NOT NULL,
    mapid int not null,
    PRIMARY KEY (keyNumber, mapid),
    startTime int not null,
    keyText varchar(3),
    FOREIGN KEY (mapid) references listeningMaps(pk)
);

INSERT INTO listeningMaps(album, trackid, uri, duration, performer, title, composer, listenerType) VALUES ("Haydn: Symphonies Nos. 88, 101 'Clock' & 104 'London' (Live)",  1110860977,"https://music.apple.com/us/album/symphony-no-88-in-g-major-hob-i-88-iv-finale-allegro/1110860778?i=1110860977", 246, "Philharmonia Baroque Orchestra & Nicholas McGegan", "Symphony No. 88 in G Major, Hob. I:88: IV. Finale. Allegro con spirito", "Franz Joseph Haydn" , "instrumental");


INSERT INTO SECTIONS(mapid, sectionnumber, sectionname, starttime, endtime, notes) VALUES (1, 1, "A", 0, 52, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."); 
INSERT INTO SECTIONS(mapid, sectionnumber, sectionname, starttime, endtime) VALUES (1, 2, "B", 52, 96);
INSERT INTO SECTIONS(mapid, sectionnumber, sectionname, starttime, endtime, notes) VALUES (1, 3, "A’", 96, 116, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. \nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. \nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
INSERT INTO SECTIONS(mapid, sectionnumber, sectionname, starttime, endtime, notes) VALUES (1, 4, "C", 116, 158, " ");
INSERT INTO SECTIONS(mapid, sectionnumber, sectionname, starttime, endtime, notes) VALUES (1, 5, "A’’", 158, 185, "• The old observatory overlooked a valley where morning fog lingered long after sunrise.\n• Copper leaves drifted across the stone path, gathering in quiet corners beneath the benches.\n• A distant train echoed through the hills while the town slowly came to life.\n• Every clock in the workshop ticked at a slightly different rhythm, creating a gentle chorus.\n• Fresh bread, roasted coffee, and rain-soaked pavement filled the cool autumn air.\n• Hidden among the shelves was a journal containing sketches, maps, and unfinished ideas.\n• The lighthouse beam swept across the waves, disappearing briefly behind rolling mist.n• Bright constellations emerged one by one as the last streaks of orange faded from the horizon.n• Engineers adjusted the final parameters before initiating the overnight systems test.\n• Even the smallest details often reveal the most interesting stories when examined closely" );
INSERT INTO SECTIONS(mapid, sectionnumber, sectionname, starttime, endtime, notes) VALUES (1, 6, "Coda", 185, 246, "Don't forget to drink your ovaltine")

