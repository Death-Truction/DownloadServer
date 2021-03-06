import express from 'express';
import fs from "fs";
import path from "path";
import formidable from "formidable";
const router = express.Router();

const fileFolder = path.join(__dirname, "/../Files/Public");

router.get('/', (req, res) => {
    let existingFiles:Array<Object> = [];
    let files = fs.readdirSync(fileFolder, 'utf8');
    files.forEach((filename:string) => {
        let fileInfo = fs.statSync(path.join(fileFolder, filename));
        let file = { name: filename, size: fileInfo.size };
        existingFiles.push(file);
    });
    res.json(existingFiles);
});

router.get('/downloadFile', (req, res) => {
    let file = path.join(fileFolder, req.query.filename as string);
    if (fs.existsSync(file)) {
        console.log(`${req.query.filename} download started`);
        res.download(file, function (err) {
            if (err) {
                console.log(`An error occured downloading the file ${file}`);
            } else
                console.log(`The file ${req.query.filename} has been downloaded successfully`);
        });
    } else {
        res.sendStatus(404);
    }
});

router.delete('/deleteFile', (req, res) => {
    if (!req.query.filename) {
        res.send(404);
        return;
    }
    let file = path.join(fileFolder, req.query.filename as string);
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

router.delete('/deleteAllFiles', (req, res) => {
    fs.readdir(fileFolder, (err, files) => {
        if (err) throw err;
        for (const file of files) {
        fs.unlink(path.join(fileFolder, file), error => {
            if (error) throw error;
        });
  }
    });
    res.sendStatus(200);
});

router.post('/uploadFile', (req, res) => {
    // create an incoming form object
    var form = new formidable.IncomingForm();
    // set max filesize
    form.maxFileSize = 5000 * 1024 * 1024;
    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;
    // store all uploads in the /uploads directory
    form.uploadDir = fileFolder;
    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('fileBegin', (filename, file) => {
        //handle files before upload
    });
    form.on('file', function (field, file) {       
        fs.renameSync(file.path, path.join(form.uploadDir, file.name));
    });
    // log any errors that occur
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });
    // once all the files have been uploaded, send a response to the client
    form.on('end', function () {
        res.end('success');
    });
    // parse the incoming request containing the form data
    form.parse(req);
});

export { router }