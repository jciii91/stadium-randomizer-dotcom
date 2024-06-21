const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('node:path');
const cors = require('cors');

const app = express();
const port = 3000;

const upload = multer();

app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '35mb' }));
app.use(express.static('public'));
app.use(cors());

app.post('/upload', upload.single('file'), (req, res) => {
  const formData = new FormData();
  const fileBlob = new Blob([req.file.buffer], { type: 'application/octet-stream' });
  formData.append('baseStatsSliderValue', req.body.baseStatsSliderValue);
  formData.append('attacksSliderValue', req.body.attacksSliderValue);
  formData.append('seedCountValue', req.body.seedCountValue);
  formData.append('file', fileBlob, 'baseROM.z64');

  axios({
    method: 'post',
    url: 'http://localhost:5000/process',
    data: formData,
    responseType: 'stream',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(response => {
    const outputFilePath = path.join(__dirname, 'randomizer/downloads', 'test.z64');
    
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
