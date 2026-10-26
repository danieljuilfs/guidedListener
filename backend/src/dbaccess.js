import { pool } from "./connection.js";
let conn;
//function to access data from the database. 
export async function read(id) {
    let rows;
    let sectionsArr;
    let keysArr;
    let commentsArr;
    try {
        conn = await pool.getConnection();
        const sql = `SELECT * FROM listeningmaps where pk = ?`;
        rows = await conn.query(sql, id);
        const sql2 = `SELECT * FROM SECTIONS WHERE mapid = ?`;
        sectionsArr = await conn.query(sql2, id);
        const sql3 = `Select * FROM mkeys where mapid = ?`;
        keysArr = await conn.query(sql3, id);
        const sql4 = `Select * from comments where mapid = ?`;
        commentsArr = await conn.query(sql4, id);
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
    return { ...rows[0], sections: sectionsArr, comments: commentsArr, keys: keysArr };
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
            listen.listenerType
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
            await connection.query("INSERT INTO SECTIONS (sectionnumber, mapId,  measure, sectionname, starttime, endtime, notes) VALUES (?, ?, ?, ?, ?, ?, ?)", [
                sectionObj.sectionnumber,
                id,
                sectionObj.measure,
                sectionObj.sectionname,
                sectionObj.starttime,
                sectionObj.endtime,
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
                commentObj.commentnumber,
                id,
                commentObj.starttime,
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
                        keyObj.keynumber,
                        id,
                        keyObj.starttime,
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
export async function update(id, listen) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        // Update the parent row
        await conn.query(`UPDATE listeningmaps
             SET album = ?, trackid = ?, uri = ?, duration = ?,
                 performer = ?, title = ?, composer = ?, listenerType = ?
             WHERE pk = ?`, [
            listen.album,
            listen.trackid,
            listen.uri,
            listen.duration,
            listen.performer,
            listen.title,
            listen.composer,
            listen.listenerType,
            id
        ]);
        // Delete existing child rows
        await conn.query("DELETE FROM sections WHERE mapid = ?", [id]);
        await conn.query("DELETE FROM comments WHERE mapid = ?", [id]);
        await conn.query("DELETE FROM mkeys WHERE mapid = ?", [id]);
        // Insert sections
        for (const section of listen.sections) {
            await conn.query("INSERT INTO SECTIONS (sectionnumber, mapId,  measure, sectionName, startTime, endTime, notes) VALUES (?, ?, ?, ?, ?, ?, ?)", [
                section.sectionnumber,
                id,
                section.measure ?? null,
                section.sectionname,
                section.starttime,
                section.endtime,
                section.notes ?? null
            ]);
        }
        // Insert comments
        for (const comment of listen.comments) {
            await conn.query(`INSERT INTO COMMENTS (commentNumber, mapid, startTime, lyrics, translation, notes) VALUES (?, ?, ?, ?, ?, ?)`, [
                comment.commentnumber,
                id,
                comment.starttime,
                comment.lyrics ?? null,
                comment.translation ?? null,
                comment.notes ?? null
            ]);
        }
        for (const key of listen.keys) {
            await conn.query(`INSERT INTO mkeys (mapid, keyNumber, startTime, keyText) VALUES (?, ?, ?, ?)`, [
                id,
                key.keynumber,
                key.starttime,
                key.text
            ]);
        }
        await conn.commit();
    }
    catch (error) {
        await conn.rollback();
        throw error;
    }
    finally {
        conn.release();
    }
    return id;
}
//# sourceMappingURL=dbaccess.js.map