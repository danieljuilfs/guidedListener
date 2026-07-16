import express from "express";
import routes from "./routes.js"; 

const app = express();
const PORT = 3001;

app.use(express.json()); 

app.get("/", (_req, res) => {
    res.send("Backend running");
});

app.use("/annotations", routes)

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});


