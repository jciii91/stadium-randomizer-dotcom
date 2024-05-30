const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('node:path');
const cors = require('cors');

const app = express();
const port = 3000;

const upload = multer({ dest: 'api/uploads/' });

app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '35mb' }));
app.use(express.static('public'));
app.use(cors());

app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = path.join(__dirname, 'randomizer/uploads', 'baseROM.z64');
    fs.writeFileSync(filePath, req.body);
    const fileBuffer = fs.readFileSync(filePath);
  
  axios({
    method: 'post',
    url: 'http://localhost:5000/process',
    data: fileBuffer,
    responseType: 'stream',
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  })
  .then(response => {
    const outputFilePath = path.join(__dirname, 'randomizer/downloads', 'PKseed.z64');
    
    // create an empty file for writing
    try {
      fs.closeSync(fs.openSync(outputFilePath, 'w'));
    } catch (error) {
      console.log(error)
    }

    const writer = fs.createWriteStream(outputFilePath);
    response.data.pipe(writer);
    
    writer.on('finish', () => {
      res.download(outputFilePath, err => {
        if (err) {
          console.error(err);
        }
        fs.unlinkSync(filePath);
        fs.unlinkSync(outputFilePath);
      });
    });
  })
  .catch(error => {
    console.error(error);
    res.status(500).send('Error processing file');
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
