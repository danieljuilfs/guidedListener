import type { PoolConnection } from "mariaDB";
import { pool } from "./connection.js"; 

let conn: PoolConnection| undefined; 

//function to access data from the database. 
export async function read(id : number): Promise<Object | null> {
    let rows; 
    let rows2; 
    try{
        conn = await pool.getConnection();
        const sql = `SELECT * FROM annotations where pk = ?`
        rows = await conn.query(sql, id); 

        const sql2 = `SELECT * FROM SECTIONS WHERE annotationid = ?`
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