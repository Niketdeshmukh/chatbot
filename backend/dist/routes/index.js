const fileRoute = require("./File");

const express = require("express");

const router = express.Router();
router.use("/upload", fileRoute);
module.exports = router;