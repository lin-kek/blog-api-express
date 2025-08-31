import cors from "cors";

/* 
Open dev for easy testing. In production, restrict origins.
Add the port your local front end is running on (e.g. localhost:3001)
and your actual domain when available.

const allowedOrigins = [
  "http://localhost:3001",
  "https://mywebsite.com"
];

export const corsConfig = cors({
  origin: allowedOrigins,
});
*/

export const corsConfig = cors();
