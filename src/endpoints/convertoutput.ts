import { injectable, inject } from "inversify";
import * as express from "express";
import { IEndpoint, ISettings } from "../interfaces";
import { TYPES } from "../types";

import multer = require('multer');
import fs = require('fs');

@injectable()
class ConvertOutputEndpoint implements IEndpoint {

    private _settings: ISettings;
    private _upload: any;

    constructor(@inject(TYPES.ISettings) settings: ISettings) 
    {
        this._settings = settings;
        this._upload = multer({ dest: this._settings.current.convertOutputDir });
    }

    bind(express: express.Application) {
        express.get(`/v${this._settings.majorVersion}/convertoutput/:filename`, async function (this: ConvertOutputEndpoint, req, res) {
            console.log(`GET on /convertoutput/${req.params.filename}`);

            let mime = require('mime-types');
            let mimeType = mime.lookup(req.params.filename);

            console.log(` >> Looking up file ${req.params.filename} in folder ${this._settings.current.convertOutputDir}`);

            let fileName = req.params.filename;
            const fs = require('fs');
            fs.readFile(`${this._settings.current.convertOutputDir}/${fileName}`, function(err, content) {
                if (err) {
                    console.error(err);
                    res.status(404);
                    res.end();
                } else {
                    console.log('Sent:', fileName);
                    res.writeHead(200, { 
                        'Content-Type': mimeType, 
                        'x-timestamp': Date.now(), 
                        'x-sent': true 
                    });
                    res.end(content);
                }
            });

        }.bind(this));

        express.post(`/v${this._settings.majorVersion}/convertoutput`, this._upload.single('file'), async function (this: ConvertOutputEndpoint, req, res) {
            console.log(`POST on /convertoutput with: `, req.file ? req.file : "undefined");

            if (!req.file) {
                res.status(400);
                res.end(JSON.stringify({ ok: false, message: "missing file", error: null }, null, 2));
                return;
            }

            /* for example: { fieldname: 'file',
            originalname: 'GUID-0B096929-58A7-4DE1-A0FD-776BEE5E3CB5.png',
            encoding: '7bit',
            mimetype: 'image/png',
            destination: 'C:\\Temp',
            filename: '2bfa6fb80365cb8c0ceeaef158b4f99a',
            path: 'C:\\Temp\\2bfa6fb80365cb8c0ceeaef158b4f99a',
            size: 3233 } */

            let oldFilename = `${this._settings.current.convertOutputDir}/${req.file.filename}`;
            let newFilename = `${this._settings.current.convertOutputDir}/${req.file.originalname}`;

            fs.renameSync(oldFilename, newFilename);

            let fileUrl = `${this._settings.current.publicUrl}/v${this._settings.majorVersion}/convertoutput/${req.file.originalname}`;

            res.status(201);
            res.end(JSON.stringify({ ok: true, type: "convertoutput", data: { url: fileUrl } }));
        }.bind(this))
    }
}

export { ConvertOutputEndpoint };