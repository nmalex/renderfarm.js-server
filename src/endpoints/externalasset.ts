import { injectable, inject } from "inversify";
import * as express from "express";
import { IEndpoint, ISettings, IDatabase } from "../interfaces";
import { TYPES } from "../types";
import axios from "axios";

@injectable()
class ExternalAssetEndpoint implements IEndpoint {
    private _settings: ISettings;
    private _database: IDatabase;

    constructor(
        @inject(TYPES.ISettings) settings: ISettings,
        @inject(TYPES.IDatabase) database: IDatabase,
    ) {
        this._settings = settings;
        this._database = database;
    }

    bind(express: express.Application) {
        express.get(`/v${this._settings.majorVersion}/externalasset/:filename`, async function (this: ExternalAssetEndpoint, req, res) {
            console.log(`GET on /externalasset/${req.params.filename}`);

            let apiKey = req.query.api_key;
            console.log(`GET on ${req.path} with api_key: ${apiKey}`);

            if (!apiKey) {
                console.log(`REJECT | api_key empty`);
                res.status(400);
                res.end(JSON.stringify({ ok: false, message: "api_key is missing", error: {} }, null, 2));
                return;
            }

            try {
                await this._database.getApiKey(apiKey);
            }
            catch (err) {
                res.status(403);
                res.end(JSON.stringify({ ok: false, message: "api_key rejected", error: err.message }, null, 2));
                return;
            }

            let url = req.query.url;
            if (!url) {
                console.log(`REJECT | url empty`);
                res.status(400);
                res.end(JSON.stringify({ ok: false, message: "url is missing", error: {} }, null, 2));
                return;
            }

            console.log(` >> requested URL: axios.get: `, url);
            await axios({
                method: 'GET',
                url: url,
                responseType: 'stream'
            }).then(function (response) {
                console.log(` >> response: `, response.status, response.statusText);
                res.set('content-length', response.headers['content-length'])
                res.set('content-type', response.headers['content-type'])
                response.data.pipe(res);
            }).catch(function (err) {
                console.log(`FAIL   | `, err);
                res.status(404);
                res.end(JSON.stringify({ ok: false, message: err.message, error: err.message }, null, 2));
            });

        }.bind(this));
    }
}

export { ExternalAssetEndpoint };
