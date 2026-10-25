import express from "express";
import routes from "./routes.js";
import cors from "cors";
const app = express();
const PORT = 3001;
app.use(cors({
    origin: (origin, callback) => {
        if (!origin ||
            origin.startsWith("http://localhost:") ||
            origin.startsWith("http://192.168.1.")) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}));
app.use(express.json());
app.get("/", (_req, res) => {
    res.send("Backend running");
});
app.use("/annotations", routes);
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
//# sourceMappingURL=server.js.map