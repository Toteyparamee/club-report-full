require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { startCron } = require('./cron');

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { s3 } = require('./storage');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

app.use('/files', async (req, res) => {
  const key = req.path.replace(/^\//, '');
  try {
    const obj = await s3.send(new GetObjectCommand({
      Bucket: process.env.MINIO_BUCKET,
      Key: key,
    }));
    res.setHeader('Content-Type', obj.ContentType || 'application/octet-stream');
    if (obj.ContentLength) res.setHeader('Content-Length', obj.ContentLength);
    obj.Body.pipe(res);
  } catch (e) {
    res.status(404).json({ error: 'File not found' });
  }
});

app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  startCron();
});
