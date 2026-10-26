import type { PoolConnection } from "mariaDB";
import { pool } from "./connection.js"; 

interface section {
  sectionNumber: number,
  measure: string,  
  sectionName: string;
  startTime: number; 
  endTime: number; 
  lyrics?: string | undefined; 
  translation?:  string | undefined;  
  notes?: string | undefined; 
}

interface comment {
  commentNumber: number,
  startTime: number, 
  lyrics?: string | undefined,
  translation?: string | undefined,
  notes?: string | undefined
}

interface key {
  keyNumber: number,
  startTime: number,
  text: string
}

export interface ListeningMap {
  album: string; 
  trackid: number; 
  uri: string; 
  duration: number; 
  performer: string;
  title: string; 
  composer: string; 
  sections: section[]; 
  comments: comment[];
  keys: key[]; 
  listenerType: string; 
  }

  interface sectionRow {
    sectionnumber: number;
    measure: string | undefined;
    sectionname: string;
    starttime: number | string;
    endtime: number | string;
    lyrics: string | undefined;
    translation: string | undefined;
    notes: string | undefined ;
}

interface commentRow {
    commentNumber: number;
    startTime: number | string;
    lyrics: string | undefined;
    translation: string | undefined;
    notes: string | undefined;
}

interface keyRow {
    keyNumber: number;
    startTime: number | string;
    keyText: string;
}

let conn: PoolConnection | undefined; 

//function to access data from the database. 
export async function read(id : number): Promise<Object | null> {
    let rows; 
    let rows2; 
    try{
        conn = await pool.getConnection();
        const sql = `SELECT * FROM listeningmaps where pk = ?`
        rows = await conn.query(sql, id); 

        const sql2 = `SELECT * FROM SECTIONS WHERE mapid = ?`
        rows2 = await conn.query(sql2, id); 

        
    } catch (err) {
        console.error("Failed to connect to the database:", err);
        process.exit(1);
    } finally {
        conn?.release();
    }
     if (rows.length == 0) return null; 

    //construct the json object and return it to the API. 
    return {...rows[0], sections: rows2}

}

export async function create(listen: ListeningMap): Promise<number> {
    const connection = await pool.getConnection();
    try {
        //want the entire insert to work as one transaction
        await connection.beginTransaction();

        const result = await connection.query(
            "INSERT INTO listeningMaps (album, title, composer, performer, trackid, uri, duration, listenerType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                listen.album, 
                listen.title,
                listen.composer,
                listen.performer,
                listen.trackid,
                listen.uri,
                listen.duration,
                listen.listenerType
            ]
        );


        const id = result.insertId;

        const sectionArr: section[] = listen.sections;
        const commentArr: comment[] = listen.comments;
        const keysArr: key[] = listen.keys;

        for (const sectionObj of sectionArr) {
            let secNotes: string | undefined = sectionObj.notes; 
            let secTrans: string | undefined = sectionObj.translation; 

            //handling processing the default text. 
            if (secNotes === "Add Section Commentary") secNotes = "";  
            if (secTrans === "Add Translation") secTrans = ""; 
            
            await connection.query(
                "INSERT INTO SECTIONS (sectionnumber, mapId,  measure, sectionName, startTime, endTime, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    
                    sectionObj.sectionNumber,
                    id,
                    sectionObj.measure,
                    sectionObj.sectionName,
                    sectionObj.startTime,
                    sectionObj.endTime,
                    secNotes
                ]
            );
        }


        for (const commentObj of commentArr) {
            let comNotes: string | undefined = commentObj.notes; 
            let comLyrics: string | undefined = commentObj.lyrics
            let comTranslation: string | undefined = commentObj.translation; 

            if (comNotes === "Add Commentary") comNotes = ""; 
            if (comLyrics === "Add Lyrics") comLyrics = ""; 
            if (comTranslation == "Add Translation") comTranslation = ""; 

            await connection.query("INSERT INTO COMMENTS (commentnumber, mapid, startTime, lyrics, translation, notes) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    commentObj.commentNumber,
                    id,
                    commentObj.startTime,
                    comLyrics,
                    comTranslation,
                    comNotes
                ]
            )
        }

        for (const keyObj of keysArr) {
            let keyText: string | undefined = keyObj.text
            if (keyObj.text === "key") keyText = "",
            await connection.query("INSERT INTO mkeys (keynumber, mapid, startTIme, keyText) VALUES (?, ?, ? ,?)", 
                [
                    keyObj.keyNumber,
                    id,
                    keyObj.startTime,
                    keyText
                ])
        }

        await connection.commit();

        console.log(id);
        return id;

    } catch (error) {
        await connection.rollback();
        console.error("Error creating listening map:", error);
        throw error;

    } finally {
        connection.release();
    }
}

export async function update(id: number, listen: ListeningMap): Promise<number> {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Update the parent row
        await conn.query(
            `UPDATE listeningmaps
             SET album = ?, trackid = ?, uri = ?, duration = ?,
                 performer = ?, title = ?, composer = ?, listenerType = ?
             WHERE pk = ?`,
            [
                listen.album,
                listen.trackid,
                listen.uri,
                listen.duration,
                listen.performer,
                listen.title,
                listen.composer,
                listen.listenerType,
                id
            ]
        );

        // Delete existing child rows
        await conn.query("DELETE FROM sections WHERE mapid = ?", [id]);
        await conn.query("DELETE FROM comments WHERE mapid = ?", [id]);
        await conn.query("DELETE FROM mkeys WHERE mapid = ?", [id]);

        // Insert sections
        for (const section of listen.sections) {
            await conn.query(
                `INSERT INTO sections
                 (mapid, sectionnumber, sectionname, measure, starttime,
                  endtime, lyrics, translation, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    section.sectionNumber,
                    section.sectionName,
                    section.measure ?? null,
                    section.startTime,
                    section.endTime,
                    section.lyrics ?? null,
                    section.translation ?? null,
                    section.notes ?? null
                ]
            );
        }

        // Insert comments
        for (const comment of listen.comments) {
            await conn.query(
                `INSERT INTO comments
                 (mapid, commentNumber, startTime, lyrics, translation, notes)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    comment.commentNumber,
                    comment.startTime,
                    comment.lyrics ?? null,
                    comment.translation ?? null,
                    comment.notes ?? null
                ]
            );
        }

        for (const key of listen.keys) {
            await conn.query(
                `INSERT INTO mkeys (mapid, keyNumber, startTime, keyText)
                 VALUES (?, ?, ?, ?)`,
                [
                    id,
                    key.keyNumber,
                    key.startTime,
                    key.text
                ]
            );
        }

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
    return id; 
}

