const {
  v2: cloudinary,
} = require("cloudinary");

const requiredConfig = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingConfig = requiredConfig.filter(
  (key) => !process.env[key]
);

if (missingConfig.length) {
  console.error(
    `Missing Cloudinary environment variables: ${missingConfig.join(", ")}`
  );
}

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;