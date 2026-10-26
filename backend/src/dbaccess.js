import { pool } from "./connection.js";
let conn;
//function to access data from the database. 
export async function read(id) {
    let rows;
    let rows2;
    try {
        conn = await pool.getConnection();
        const sql = `SELECT * FROM listeningmaps where pk = ?`;
        rows = await conn.query(sql, id);
        const sql2 = `SELECT * FROM SECTIONS WHERE mapid = ?`;
        rows2 = await conn.query(sql2, id);
    }
    catch (err) {
        console.error("Failed to connect to the database:", err);
        process.exit(1);
    }
    finally {
        conn?.release();
    }
    if (rows.length == 0)
        return null;
    //construct the json object and return it to the API. 
    return { ...rows[0], sections: rows2 };
}
export async function create(listen) {
    const connection = await pool.getConnection();
    try {
        //want the entire insert to work as one transaction
        await connection.beginTransaction();
        const result = await connection.query("INSERT INTO listeningMaps (album, title, composer, performer, trackid, uri, duration, listenerType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
            listen.album,
            listen.title,
            listen.composer,
            listen.performer,
            listen.trackid,
            listen.uri,
            listen.duration,
            listen.type
        ]);
        const id = result.insertId;
        const sectionArr = listen.sections;
        const commentArr = listen.comments;
        const keysArr = listen.keys;
        for (const sectionObj of sectionArr) {
            let secNotes = sectionObj.notes;
            let secTrans = sectionObj.translation;
            //handling processing the default text. 
            if (secNotes === "Add Section Commentary")
                secNotes = "";
            if (secTrans === "Add Translation")
                secTrans = "";
            await connection.query("INSERT INTO SECTIONS (sectionnumber, mapId,  measure, sectionName, startTime, endTime, notes) VALUES (?, ?, ?, ?, ?, ?, ?)", [
                sectionObj.sectionNumber,
                id,
                sectionObj.measure,
                sectionObj.sectionName,
                sectionObj.startTime,
                sectionObj.endTime,
                secNotes
            ]);
        }
        for (const commentObj of commentArr) {
            let comNotes = commentObj.notes;
            let comLyrics = commentObj.lyrics;
            let comTranslation = commentObj.translation;
            if (comNotes === "Add Commentary")
                comNotes = "";
            if (comLyrics === "Add Lyrics")
                comLyrics = "";
            if (comTranslation == "Add Translation")
                comTranslation = "";
            await connection.query("INSERT INTO COMMENTS (commentnumber, mapid, startTime, lyrics, translation, notes) VALUES (?, ?, ?, ?, ?, ?)", [
                commentObj.commentNumber,
                id,
                commentObj.startTime,
                comLyrics,
                comTranslation,
                comNotes
            ]);
        }
        for (const keyObj of keysArr) {
            let keyText = keyObj.text;
            if (keyObj.text === "key")
                keyText = "",
                    await connection.query("INSERT INTO mkeys (keynumber, mapid, startTIme, keyText) VALUES (?, ?, ? ,?)", [
                        keyObj.keyNumber,
                        id,
                        keyObj.startTime,
                        keyText
                    ]);
        }
        await connection.commit();
        console.log(id);
        return id;
    }
    catch (error) {
        await connection.rollback();
        console.error("Error creating listening map:", error);
        throw error;
    }
    finally {
        connection.release();
    }
}
//# sourceMappingURL=dbaccess.js.map