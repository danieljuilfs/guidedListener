import { Router } from "express";
import * as dbAccess from "./dbaccess.js";
//create a router to route API calls
const router = Router();
router.get("/:id", async (req, res) => {
    //get the track id out of the query parameter
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({
            error: "Error invalid annotation id"
        });
    }
    //pull the annotations from the db. 
    const json = await dbAccess.read(id);
    //if the result is null, send a 404 error. 
    if (!json)
        return res.sendStatus(404);
    res.json(json);
});
router.post("/", async (req, res) => {
    const body = req.body;
    //console.log("POST / received");
    //console.log("Request body:", req.body);
    console.log({
        bodyType: typeof body,
        bodyIsNull: body === null,
        title: typeof body.title,
        composer: typeof body.composer,
        album: typeof body.album,
        performer: typeof body.performer,
        trackid: typeof body.trackid,
        uri: typeof body.uri,
        duration: typeof body.duration,
        type: typeof body.listenerType,
        sectionsIsArray: Array.isArray(body.sections),
        commentsIsArray: Array.isArray(body.comments),
        keysIsArray: Array.isArray(body.keys)
    });
    if (typeof body !== "object" ||
        body === null ||
        typeof body.title !== "string" ||
        typeof body.composer !== "string" ||
        typeof body.album !== "string" ||
        typeof body.performer !== "string" ||
        typeof body.trackid !== "number" ||
        typeof body.uri !== "string" ||
        typeof body.duration !== "number" ||
        typeof body.listenerType !== "string" ||
        !Array.isArray(body.sections) ||
        !Array.isArray(body.comments) ||
        !Array.isArray(body.keys)) {
        return res.status(400).json({
            error: "Invalid listening map"
        });
    }
    console.log("BEFORE AWAIT");
    let id = await dbAccess.create(body);
    console.log("ID IS: " + id);
    return res.status(201).json({ id: Number(id) });
});
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const body = req.body;
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "Invalid listening map ID" });
        }
        if (typeof body !== "object" ||
            body === null ||
            typeof body.title !== "string" ||
            typeof body.composer !== "string" ||
            typeof body.album !== "string" ||
            typeof body.performer !== "string" ||
            typeof body.trackid !== "number" ||
            typeof body.uri !== "string" ||
            typeof body.duration !== "number" ||
            typeof body.listenerType !== "string" ||
            !Array.isArray(body.sections) ||
            !Array.isArray(body.comments) ||
            !Array.isArray(body.keys)) {
            return res.status(400).json({
                error: "Invalid listening map"
            });
        }
        const updated = await dbAccess.update(id, body);
        if (!updated) {
            return res.status(404).json({ error: "Listening map not found" });
        }
        return res.status(200).json({ success: true });
    }
    catch (error) {
        console.error("Error updating listening map:", error);
        return res.status(500).json({ error: "Failed to update listening map" });
    }
});
export default router;
//# sourceMappingURL=routes.js.map