import type { PoolConnection } from "mariaDB";
import { pool } from "./connection.js"; 

interface section {
  sectionNumber: number,
  measure: string,  
  sectionName: string;
  startTime: number; 
  lyrics?: string; 
  translation?:  string; 
  notes?: string; 
}

interface comment {
  commentNumber: number,
  startTime: number, 
  lyrics?: string,
  translation?: string,
  notes?: string
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
  type: string; 
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
                listen.type
            ]
        );

        console.log("result is: " + Number(result.insertId)); 

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
                "INSERT INTO SECTIONS (sectionnumber, mapId,  measure, sectionName, startTime, notes) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    
                    sectionObj.sectionNumber,
                    id,
                    sectionObj.measure,
                    sectionObj.sectionName,
                    sectionObj.startTime,
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
            await connection.query("INSERT INTO KEYS (keynumber, mapid, startTIme, keyText) VALUES (?, ?, ? ,?)", 
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
