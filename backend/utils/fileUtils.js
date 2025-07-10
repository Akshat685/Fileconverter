const fs = require('fs');
function deleteFile(path) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}
module.exports = { deleteFile };
