const path = require("path");
const multer = require("multer");
const { MulterError } = require("multer");
const sharp = require("sharp");

module.exports = (req, res, next) => {
  const upload = multer({
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") {
        return cb(new MulterError("LIMIT_INVALID_TYPE"));
      }

      return cb(null, true);
    },
    limits: {
      fileSize: 1024 * 1024 * 2,
    },
    storage: multer.memoryStorage(),
  }).single("image");

  upload(req, res, async (err) => {
    if (err) {
      try {
        switch (err.code) {
          case "LIMIT_INVALID_TYPE":
            throw new Error("Invalid file type! Only PNG and JPEG are allowed");

          case "LIMIT_FILE_SIZE":
            throw new Error("File size is too large! Max size is 2MB");

          default:
            throw new Error("Something went wrong!");
        }
      } catch (err) {
        res.status(400).json({ message: err.message });
        return;
      }
    }

    try {
      const filename = `${Date.now()}${path.extname(req.file.originalname)}`;
      const saveTo = path.resolve(__dirname, "public", "images");
      const filePath = path.join(saveTo, filename);

      await sharp(req.file.buffer)
        .resize({ width: 300, height: 300 })
        .jpeg({ quality: 30 })
        .toFile(filePath);

      req.file.filename = filename;

      next();
    } catch (err) {
      res.status(400).json({ message: err.message });
      return;
    }
  });
};

// const multer = require("multer");

// const MIME_TYPES = {
//   "image/jpg": "jpg",
//   "image/jpeg": "jpg",
//   "image/png": "png",
// };

// const storage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, "images");
//   },
//   filename: (req, file, callback) => {
//     const name = file.originalname.split(" ").join("_");
//     const extension = MIME_TYPES[file.mimetype];
//     callback(null, name + Date.now() + "." + extension);
//   },
// });

// module.exports = multer({ storage: storage }).single("image");
