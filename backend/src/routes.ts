import { Router } from "express"; 
import * as dbAccess from "./dbaccess.js"
import type { ListeningMap } from "./dbaccess.js";

//create a router to route API calls
const router = Router(); 

router.get("/:id", async(req, res) => {

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
    if (!json) return res.sendStatus(404); 

    res.json(json); 
}); 

router.post("/", async(req,res) => {
    const body: ListeningMap = req.body; 
    console.log("POST / received");
    console.log("Request body:", req.body);
    if (
        typeof body !== "object" ||
        body === null ||
        typeof body.title !== "string" ||
        typeof body.composer !== "string" ||
        typeof body.album !== "string" ||
        typeof body.performer !== "string" ||
        typeof body.trackid !== "number" ||
        typeof body.uri !== "string" ||
        typeof body.duration !== "number" ||
        typeof body.type !== "string" ||
        !Array.isArray(body.sections) ||
        !Array.isArray(body.comments) ||
        !Array.isArray(body.keys)
    ) {
        return res.status(400).json({
            error: "Invalid listening map"
        });
    }
    let id = await dbAccess.create(body); 
    return id; 
})

export default router; 