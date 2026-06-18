import fs from "fs";
import jwt from "jsonwebtoken";

const privateKey = fs.readFileSync(
  "C:\\GLK\\AuthKey_3VQL8TUGAK.p8",
  "utf8"
);

const teamId = "MWB4K6F3B3";
const keyId = "3VQL8TUGAK";

const token = jwt.sign(
  {},
  privateKey,
  {
    algorithm: "ES256",
    issuer: teamId,
    expiresIn: "180d",
    header: {
      alg: "ES256",
      kid: keyId
    }
  }
);

console.log(token);