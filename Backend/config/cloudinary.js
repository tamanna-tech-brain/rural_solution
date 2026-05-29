import "./env.js";

import { v2 as cloudinary } from "cloudinary";

console.log("Cloud Name:", process.env.CLOUD_NAME);
console.log("Cloud API Key:", process.env.CLOUD_API_KEY);
console.log("Cloud API Secret:", process.env.CLOUD_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export default cloudinary;