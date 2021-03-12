import { injectable, inject } from "inversify";
import * as express from "express";
import { IEndpoint, ISettings, IFactory, IGeometryCache, ISessionPool, ISessionService, IGeometryBinding } from "../../interfaces";
import { TYPES } from "../../types";
import { isArray } from "util";
import { Session } from "../../database/model/session";

import multer = require('multer');
import fs = require('fs');
import LZString = require("lz-string");
var JSZip = require("jszip");

@injectable()
class ThreeGeometryEndpoint implements IEndpoint {
    private _settings: ISettings;
    private _sessionService: ISessionService;
    private _geometryBindingFactory: IFactory<IGeometryBinding>;
    private _geometryCachePool: ISessionPool<IGeometryCache>;
    private _upload: any;

    constructor(@inject(TYPES.ISettings) settings: ISettings,
                @inject(TYPES.ISessionService) sessionService: ISessionService,
                @inject(TYPES.IGeometryBindingFactory) geometryBindingFactory: IFactory<IGeometryBinding>,
                @inject(TYPES.IGeometryCachePool) geometryCachePool: ISessionPool<IGeometryCache>,
    ) {
        this._settings = settings;
        this._sessionService = sessionService;
        this._geometryBindingFactory = geometryBindingFactory;
        this._geometryCachePool = geometryCachePool;

        this._upload = multer({ dest: this._settings.current.geometryUploadDir });
    }

    bind(express: express.Application) {
        express.get(`/v${this._settings.majorVersion}/three/geometry/:uuid`, async function (this: ThreeGeometryEndpoint, req, res) {
            console.log(`GET on ${req.path}`);

            let uuid = req.params.uuid;

            let zipFile = this._settings.current.geometryUploadDir + '/' + uuid + '.zip';
            if (!fs.existsSync(zipFile)) {
                res.status(404);
                res.end(JSON.stringify({ ok: false, message: "geometry not found", error: null }, null, 2));
            }

            res.status(200);
            fs.readFile(zipFile, (err, data) => {
                if (err) throw err;
                res.end(data, 'binary');
            });
        }.bind(this));

        express.post(`/v${this._settings.majorVersion}/three/geometry`, async function (this: ThreeGeometryEndpoint, req, res) {
            let sessionGuid = req.body.session_guid;
            console.log(`POST on ${req.path} with session: ${sessionGuid}`);

            // check that session is actually open
            let session: Session = await this._sessionService.GetSession(sessionGuid, false, true);
            if (!session) {
                res.status(404);
                res.end(JSON.stringify({ ok: false, message: "session expired", error: null }, null, 2));
                return;
            }

            // check that session has no active job, i.e. it is not being rendered
            if (session.workerRef && session.workerRef.jobRef) {
                res.status(403);
                res.end(JSON.stringify({ ok: false, message: "changes forbidden, session is being rendered", error: null }, null, 2));
                return;
            }

            let uuid = req.body.uuid; // this is the UUID of threejs BufferGeometry
            let compressedJson = req.body.compressed_json; // this is to create scene or add new obejcts to scene
            let buff = Buffer.from(compressedJson, 'base64');

            let zipTarget = this._settings.current.geometryUploadDir + '/' + uuid + '.zip';
            fs.writeFile(zipTarget, buff, (err) => {
                if (err) throw err;
                console.log(' >> saved mesh to ' + zipTarget);
            });

            let plainJson = req.body.json; // this is uncompressed json
            if (!compressedJson && !plainJson) {
                res.status(400);
                res.end(JSON.stringify({ ok: false, message: "body missing .compressed_json or .json", error: null }, null, 2));
                return;
            }

            let geometryJson = plainJson ? JSON.parse(plainJson) : { uuid: uuid, compressed_json: compressedJson } // await __decompress(compressedJson); //LZString.decompressFromBase64(compressedJson);

            let makeDownloadUrl = function(this: ThreeGeometryEndpoint, geometryJson: any) {
                return `${this._settings.current.publicUrl}/v${this._settings.majorVersion}/three/geometry/${geometryJson.uuid}`;
            }.bind(this);

            let geometryCache = await this._geometryCachePool.Get(session);

            let newGeomBinding = await this._geometryBindingFactory.Create(session, geometryJson);
            geometryCache.Geometries[geometryJson.uuid] = newGeomBinding;
            let downloadUrl = makeDownloadUrl(geometryJson);

            res.status(201);
            res.end(JSON.stringify({ ok: true, type: "url", data: [ downloadUrl ] }));
        }.bind(this));

        express.put(`/v${this._settings.majorVersion}/three/geometry/:uuid`, async function (this: ThreeGeometryEndpoint, req, res) {
            let sessionGuid = req.body.session;
            console.log(`PUT on ${req.path} with session: ${sessionGuid}`);

            let uuid = req.params.uuid;
            console.log(`todo: // accept updated geometry ${uuid}`);

            res.status(200);
            res.end(JSON.stringify({}));
        }.bind(this));

        express.post(`/v${this._settings.majorVersion}/three/geometry/upload`, this._upload.single('file'), async function (this: ThreeGeometryEndpoint, req, res) {
            console.log(`POST on ${req.path} with: `, req.file ? req.file : "undefined");

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

            let filename = `${this._settings.current.geometryUploadDir}/${req.file.filename}`;
            let exists = fs.existsSync(filename);
            // let newFilename = `${this._settings.current.renderOutputDir}/${req.file.originalname}`;

            //fs.renameSync(oldFilename, newFilename);

            console.log(" >> TODO: now parse BufferGeometry from: ", filename, ", file exists: ", exists);
            let uploadedData = fs.readFileSync(filename);
            let json = JSON.parse(uploadedData.toString());

            console.log(" >> Parsed BufferGeometry: ", json);

            let geometryCache = await this._geometryCachePool.FindOne( 
                cacheItem => Object.keys(cacheItem.Geometries).find(key => key === json.uuid) !== undefined 
            );

            console.log(" >> Updating BufferGeometry in cache: ", json.uuid);
            await geometryCache.Geometries[json.uuid].Put(json, false);

            // let fileUrl = `${this._settings.current.publicUrl}/v${this._settings.majorVersion}/fbxgeometry/${req.file.originalname}`;

            res.status(201);
            res.end(JSON.stringify({ ok: true, type: "url", data: {  } }));
        }.bind(this))

        express.delete(`/v${this._settings.majorVersion}/three/geometry/:uuid`, async function (this: ThreeGeometryEndpoint, req, res) {
            let sessionGuid = req.body.session;
            console.log(`DELETE on ${req.path} with session: ${sessionGuid}`);

            let uuid = req.params.uuid;
            console.log(`todo: // delete geometry ${uuid}`);

            res.status(200);
            res.end(JSON.stringify({}));
        }.bind(this));
    }
}

export { ThreeGeometryEndpoint };
