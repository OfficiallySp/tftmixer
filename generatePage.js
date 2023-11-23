var fs = require('fs');
var path = require('path');
var { htmlStart, htmlEnd, jsStart, jsEnd } = require('./pageElements')
// In newer Node.js versions where process is already global this isn't necessary.
var process = require("process");

// Loop through all the files in the temp directory
fs.readdir("tracks", function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }
  var htmlText = htmlStart;
  var jsText = jsStart;

  files.forEach(function (file, index) {
    // Make one pass and make the file complete
    var fileId = file.slice(0, -3);
    htmlText += `<input type="checkbox" id="`+ fileId + `" name="` + fileId + `">
    <label for="unknown1">` + fileId + `</label>
    <audio id="audio` + fileId + `" src="tracks/` + file + `" preload="auto"></audio>`;
    jsText += `playIfChecked('` + fileId + `', 'audio` + fileId + `');`;
  });

  htmlText += htmlEnd;
    jsText += jsEnd;

    fs.writeFile('index.html', htmlText, err => {
      if (err) {
        console.error(err);
      }
    });
    fs.writeFile('script.js', jsText, err => {
      if (err) {
        console.error(err);
      }
    });
});