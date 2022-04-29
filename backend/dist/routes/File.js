const FileController = require("../controllers/FileController");

const {
  v4: uuidv4
} = require("uuid");

const express = require("express");

const router = express.Router();

const multer = require("multer");

var path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./static/media/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const mt = file.mimetype;

  if (mt === "application/pdf") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});
router.post("/singleFile", upload.single("file"), FileController.uploadFile);
module.exports = router;