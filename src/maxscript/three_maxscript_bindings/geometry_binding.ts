import { IGeometryBinding, IMaxscriptClient, ISettings, PostResult, IMaxInstanceInfo } from "../../interfaces";

export class GeometryBinding implements IGeometryBinding {
    private _settings: ISettings;
    private _maxscriptClient: IMaxscriptClient;
    private _geometryJson: any;
    private _generateUv2: boolean;

    private _maxInstances: IMaxInstanceInfo[] = [];

    public constructor(
        settings: ISettings,
        maxscriptClient: IMaxscriptClient,
        geometryJson: any,
        generateUv2: boolean,
    ) {
        this._settings = settings;
        this._maxscriptClient = maxscriptClient;
        this._geometryJson = geometryJson;
        this._generateUv2 = generateUv2;
    }

    public get ThreeJson(): any {
        return this._geometryJson;
    }

    public get MaxInstances(): IMaxInstanceInfo[] {
        return this._maxInstances;
    }

    public async Get(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async Post(meshUuid: string, maxName: string): Promise<PostResult> {
        let result: PostResult = {};

        console.log(" >> GeometryBinding takes json, and sends it to remote maxscript");
        if (this._maxInstances.length === 0) {
            let downloadUrl = this._geometryJson.downloadUrl;
            let filename = `${this._geometryJson.uuid}.json.zip`;

            console.log(` >> tell 3dsmax to download from ${downloadUrl} into ${maxName}`);
            let tempDir = `C:\\\\Temp`;
            await this._maxscriptClient.downloadJson(downloadUrl, `${tempDir}\\\\${filename}`);

            console.log(` >> tell 3dsmax to extract ${filename}`);
            let meshDir = `${tempDir}\\\\${this._geometryJson.uuid}`;
            await this._maxscriptClient.extractZip(`${tempDir}\\\\${filename}`, meshDir);

            console.log(` >> tell 3dsmax to import mesh from ${meshDir}`);
            await this._maxscriptClient.importMesh(`${meshDir}\\\\BufferGeometry.json`, maxName);

            //if (this._generateUv2) {
            //    await this._maxscriptClient.unwrapUV2(maxName);
            //    let jsonFilename = `C:\\\\Temp\\\\${this._geometryJson.uuid}.json`;
            //    await this._maxscriptClient.exportMesh(jsonFilename, maxName, this._geometryJson.uuid);

            //    let uploadUrl = `${this._settings.current.publicUrl}/v${this._settings.majorVersion}/three/geometry/upload`;
            //    await this._maxscriptClient.uploadFile(uploadUrl, jsonFilename);
            //    result.url = `${this._settings.current.publicUrl}/v${this._settings.majorVersion}/three/geometry/${this._geometryJson.uuid}`;
            //}

            //let resm = await this._maxscriptClient.assignMaterial(maxName, "15 - Default"); // todo: what default material to assign?
            //console.log(resm);
        } else {
            console.log(` >> todo: // instantiate BufferGeometr as ${maxName} from existing 3dsmax node ${this._maxInstances[0]}`);
            let resc = await this._maxscriptClient.cloneInstance(this._maxInstances[0].MaxName, maxName);
        }
        this._maxInstances.push({
            MeshUuid: meshUuid,
            MaxName: maxName,
        });

        return result;
    }

    public async Put(geometryJson: any, upload: boolean): Promise<any> {
        this._geometryJson = geometryJson;
        if (upload) {
            throw new Error("Method not implemented.");
        } else {
            return true;
        }
    }

    public async Delete(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    protected getObjectName(obj: any) {
        let parts = obj.uuid.split("-");
        return `${obj.type}_${parts[0]}`;
    }
}
