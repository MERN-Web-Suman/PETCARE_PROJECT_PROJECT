import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "your_cloud",
  api_key: "your_key",
  api_secret: "your_secret"
});

export default cloudinary;
