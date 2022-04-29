const FileController = {
  uploadFile(req, res) {
    if (req.file) {
      return res.send({
        path: req.file.path
      });
    }
  }

};
module.exports = FileController;