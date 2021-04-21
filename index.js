const express = require("express")
const bodyParser = require('body-parser')
const AWS = require('aws-sdk')
const archiver = require('archiver')
const fs = require('fs')

const app = express();

app.use(bodyParser.json());


const ID = '';
const SECRET = '';
const BUCKET_NAME = '';


const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
})

app.get('/zip', async function (req, res) {
    const fileNamesInBucket = await s3.listObjects({Bucket: BUCKET_NAME}).promise().then((function (resp) {
        return resp.Contents.map(c => c.Key);
    }));

    res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-disposition': `attachment; filename=zip_${Date.now().toString()}.zip`
    });
    let archive = archiver('zip', {
        zlib: {level: 9}
    });
    archive.pipe(res);

    for (const fileName of fileNamesInBucket) {
        const stream = s3.getObject({Bucket: BUCKET_NAME, Key: fileName})
            .createReadStream();
        archive = archive.append(stream, {name: fileName});
    }
    archive.finalize();
})


app.listen(3000, () => console.log("Application Started"))
