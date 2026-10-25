import mariaDB, {} from "mariaDB";
import dotenv from "dotenv";
dotenv.config();
//have to validate that the environmental variables exist, or typescript will error. so confirm they exist, if they don't throw an error it works. if they do, output the error. 
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}
export const pool = mariaDB.createPool({
    host: requireEnv("DB_HOST"),
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    database: requireEnv("DB_NAME"),
    port: Number(process.env.DB_PORT),
    connectionLimit: 10
});
//# sourceMappingURL=connection.js.map