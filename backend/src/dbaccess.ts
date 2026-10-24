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

interface listeningMap {
  pk: number, 
  title: string; 
  composer: string; 
  album: string; 
  performer: string;
  trackid: number; 
  uri: string; 
  duration: number; 
  sections: section[]; 
  }

let conn: PoolConnection| undefined; 

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

export async function create(listen: listeningMap) {
    
    const createListeningMap = conn?.query("INSERT INTO listeningMaps (title, composer, performer, trackid, uri, duration) VALUES (?, ?, ?, ?, ?, ?)", [
        listen.title, 
        listen.composer, 
        listen.performer, 
        listen.trackid, 
        listen.uri, 
        listen.duration
    ]
) 
}