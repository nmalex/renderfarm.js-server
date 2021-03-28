import { IMaxscriptClient, IBakeTexturesFilenames, ISettings, ITextureVars } from "../interfaces";
import { Socket } from "net";
import { Workspace } from "../database/model/workspace";
import { Session } from "../database/model/session";

const md5 = require('md5');
const uuidv4 = require("uuid/v4");

// communicates to remote maxscript endpoint
class MaxscriptClient implements IMaxscriptClient {

    private _settings: ISettings;
    private _session: Session;
    private _responseHandler: (this: MaxscriptClient, data: any) => void;
    private _errorHandler: (this: MaxscriptClient, err: any) => void;
    private _client: Socket;

    constructor(settings: ISettings, session: Session) {
        this._settings = settings;
        this._session = session;
    }

    connect(ip: string, port: number): Promise<boolean> {

        return new Promise<boolean>(function (this: MaxscriptClient, resolve, reject) {

            this._client = new Socket();

            this._client.on('data', function (this: MaxscriptClient, data) {
                if (this._responseHandler) {
                    this._responseHandler(data);
                }
            }.bind(this));

            this._client.on('error', function (this: MaxscriptClient, err) {
                if (this._errorHandler) {
                    this._errorHandler(err);
                }
                reject(err)
            }.bind(this));

            this._client.on('close', function (this: MaxscriptClient) {
                // just ok
            }.bind(this));

            // now connect and test a connection with some simple command
            this._client.connect(port, ip, function (this: MaxscriptClient) {
                resolve(true);
            }.bind(this));

        }.bind(this));
    }

    disconnect() {
        if (this._client) {
            this._client.destroy();
            this._client = null;
        }
    }

    execMaxscript(maxscript: string, actionDesc: string, responseChecker: (resp: string) => boolean = null): Promise<boolean> {
        const startedAt = Date.now();

        return new Promise<boolean>(function (this: MaxscriptClient, resolve, reject) {
            // prepare response handlers for the command

            const actionDesc2 = actionDesc;
            const startedAt2 = startedAt;

            this._responseHandler = function (this: MaxscriptClient, data) {
                this._responseHandler = undefined;

                let maxscriptResp = data.toString();
                if (maxscriptResp && maxscriptResp !== "OK") {
                    console.log(`       >> maxscript = ${maxscript}`);
                    console.log(`   LOG | MaxscriptClient.${actionDesc} returned: ${maxscriptResp}`);
                }

                if (responseChecker) {
                    if (responseChecker(maxscriptResp)) {
                        console.log(` >> maxscript resolved: `, actionDesc2, (Date.now() - startedAt2) + "ms.")
                        resolve();
                    } else {
                        reject(Error(`Unexpected maxscript response: ${maxscriptResp}`));
                    }
                } else {
                    if (maxscriptResp.indexOf("FAIL") === -1 && maxscriptResp.indexOf("Exception") === -1) {
                        console.log(` >> maxscript resolved: `, actionDesc2, (Date.now() - startedAt2) + "ms.")
                        resolve();
                    } else {
                        reject(Error(`Unexpected maxscript response: ${maxscriptResp}`));
                    }
                }
            };

            this._errorHandler = function (this: MaxscriptClient, err) {
                console.log(`      >> maxscript = ${maxscript}`);
                console.error(`  FAIL | MaxscriptClient.${actionDesc} error: `, err);
                reject(err);
            };

            if (maxscript) {
                this._client.write(maxscript);
            } else {
                reject(Error("empty maxscript"));
            }

        }.bind(this));
    }

    resetScene(): Promise<boolean> {
        let maxscript = `resetMaxFile #noPrompt ; \r\n `
            + `enableSceneRedraw() ; `;

        console.log(" >> maxscript: \r\n", maxscript);

        return this.execMaxscript(maxscript, "resetScene");
    }

    openScene(maxSceneFilename: string, workspace: Workspace): Promise<boolean> {
        let maxscript = `resetMaxFile #noPrompt ; \r\n`
            + `disableSceneRedraw(); \r\n`
            + `sceneFilename = "${workspace.homeDir}\\\\api-keys\\\\${workspace.apiKey}\\\\workspaces\\\\${workspace.guid}\\\\scenes\\\\${maxSceneFilename}" ; \r\n`
            + `if existFile sceneFilename then ( \r\n`
            + `     sceneLoaded = loadMaxFile sceneFilename useFileUnits:true quiet:true ; \r\n`
            + `     if sceneLoaded then ( \r\n`
            + `         print "OK | scene open" \r\n`
            + `     ) else ( \r\n`
            + `         print "FAIL | failed to load scene" \r\n`
            + `     ) \r\n`
            + ` ) else ( \r\n`
            + `     print "FAIL | scene file not found" \r\n`
            + ` ) `;

        console.log(" >> maxscript: \r\n", maxscript);

        return this.execMaxscript(maxscript, "openScene");
    }

    saveScene(maxSceneFilename: string, workspace: Workspace): Promise<boolean> {
        let maxscript =
            `sceneFilename = "${workspace.homeDir}\\\\api-keys\\\\${workspace.apiKey}\\\\workspaces\\\\${workspace.guid}\\\\scenes\\\\${maxSceneFilename}" ; \r\n`
            + `saveMaxFile sceneFilename quiet: true ; \r\n `;

        console.log(" >> maxscript: \r\n", maxscript);
        return this.execMaxscript(maxscript, "saveScene");
    }

    dumpScene(maxSceneFilename: string): Promise<boolean> {
        let maxscript =
            `sceneFilename = "${maxSceneFilename}" ; \r\n`
            + `saveMaxFile sceneFilename quiet: true ; \r\n `;

        console.log(" >> maxscript: \r\n", maxscript);
        return this.execMaxscript(maxscript, "dumpScene");
    }

    xrefScene(maxSceneFilename: string, workspace: Workspace, nodeName: string): Promise<boolean> {
        // see here: http://docs.autodesk.com/3DSMAX/14/ENU/MAXScript%20Help%202012//index.html?url=files/GUID-3265908F-28AB-441E-9866-071BBEDD9FF-1053.htm,topicNumber=d28e344839

        let maxscript = `xrefSceneFilename = "${workspace.homeDir}\\\\api-keys\\\\${workspace.apiKey}\\\\workspaces\\\\${workspace.guid}\\\\xrefs\\\\${maxSceneFilename}" ; \r\n`
            + `if existFile xrefSceneFilename then ( \r\n`
            + `    xrefSceneParent = Dummy() ; \r\n`
            + `    xrefSceneParent.boxsize = [1,1,1] ; \r\n`

            + `    xrefSceneParent.name = "${nodeName}" ; \r\n`

            + `    xrefSceneRoot = Dummy() ; \r\n`
            + `    xrefSceneRoot.boxsize = [1,1,1] ; \r\n`
            + `    xrefSceneRoot.name = "xref" ; \r\n`

            + `    xrefFile0 = xrefs.addNewXRefFile xrefSceneFilename ; \r\n`
            + `    xrefFile0.parent = xrefSceneRoot ; \r\n`

            + `    rotate xrefSceneRoot (eulerangles -90 0 0) ; \r\n `

            + `    xrefSceneRoot.parent = xrefSceneParent ; \r\n`

            + ` ) else ( \r\n`
            + `     print "FAIL | scene file not found" \r\n`
            + ` ) `;

        console.log(" >> maxscript: \r\n", maxscript);

        return this.execMaxscript(maxscript, "xrefScene");

        /*
dir = "E:\\1_Z200_diskE\\Evermotion\\Evermotion Archmodels Vol. 112\\Vray"
filename = "Archmodels_112_001_vray.max"

fullpath = (dir + "\\" + filename)

-- xrefs.addNewXRefObject  "$*" #proxy modifiers:#xref	manipulators: #xref dupMtlNameAction: #autoRename

<XRefScene>.autoUpdate Boolean default: false 
<XRefScene>.boxDisp Boolean default: false 
<XRefScene>.hidden Boolean default: false 
<XRefScene>.disabled Boolean default: false 
<XRefScene>.ignoreLights Boolean default: false
<XRefScene>.ignoreCameras Boolean default: false 
<XRefScene>.ignoreShapes Boolean default: false 
<XRefScene>.ignoreHelpers Boolean default: false 
<XRefScene>.ignoreAnimation Boolean default: false 

        */
        // return Promise.resolve(true);
    }

    setObjectWorldMatrix(nodeName, matrixWorldArray): Promise<boolean> {
        let m = matrixWorldArray;
        let maxscript = `in coordsys world $${nodeName}.transform = (matrix3 [${m[0]},${m[1]},${m[2]}] [${m[4]},${m[5]},${m[6]}] [${m[8]},${m[9]},${m[10]}] [${m[12]},${m[13]},${m[14]}])`;
        console.log(" >> setObjectWorldMatrix: ");
        console.log(" >> maxscript: \r\n", maxscript);
        return this.execMaxscript(maxscript, "setObjectWorldMatrix");
    }

    setObjectMatrix(nodeName, matrixArray): Promise<boolean> {
        let m = matrixArray;
        let maxscript = `$${nodeName}.transform = `
            + ` (matrix3 [${m[0]},${m[1]},${m[2]}] [${m[4]},${m[5]},${m[6]}] [${m[8]},${m[9]},${m[10]}] [${m[12]},${m[13]},${m[14]}]) `
            + ` * $${nodeName}.parent.transform`;

        console.log(" >> setObjectMatrix: ");
        console.log(" >> maxscript: \r\n", maxscript);
        return this.execMaxscript(maxscript, "setObjectMatrix");
    }

    linkToParent(nodeName: string, parentName: string): Promise<boolean> {
        let maxscript = `$${nodeName}.parent = $${parentName}`;
        console.log(" >> linkToParent: ");
        console.log(" >> maxscript: \r\n", maxscript);
        return this.execMaxscript(maxscript, "linkToParent");
    }

    renameObject(nodeName: string, newName: string): Promise<boolean> {
        let maxscript = `$${nodeName}.name = "${newName}"`;
        return this.execMaxscript(maxscript, "renameObject");
    }

    setSession(sessionGuid: string): Promise<boolean> {
        let maxscript = `SessionGuid = "${sessionGuid}"`;
        return this.execMaxscript(maxscript, "setSession");
    }

    setWorkspace(workspaceInfo: any): Promise<boolean> {
        let w = workspaceInfo;

        let maxscript = `for i=1 to pathConfig.mapPaths.count() do ( pathConfig.mapPaths.delete 1 )\r\n`
            + `for i=1 to pathConfig.xrefPaths.count() do ( pathConfig.xrefPaths.delete 1 )\r\n`
            + `pathConfig.mapPaths.add "${w.homeDir}\\\\api-keys\\\\${w.apiKey}\\\\workspaces\\\\${w.guid}\\\\maps"\r\n`
            + `pathConfig.xrefPaths.add "${w.homeDir}\\\\api-keys\\\\${w.apiKey}\\\\workspaces\\\\${w.guid}\\\\xrefs"`;

        return this.execMaxscript(maxscript, "setWorkspace");
    }

    createSceneRoot(maxName: string): Promise<boolean> {
        let maxscript = `aSceneRoot = Dummy() ; \r\n`
            + ` aSceneRoot.boxsize = [1,1,1] ; \r\n`
            + ` aSceneRoot.name = \"${maxName}\" ; \r\n`
            + ` rotate aSceneRoot (eulerangles 90 0 0)`;

        console.log(" >> SCENE ROOT: ", maxscript);

        return this.execMaxscript(maxscript, "createSceneRoot");
    }

    createDummy(maxName: string): Promise<boolean> {
        let maxscript = `aDummy = Dummy() ; \r\n`
            + ` aDummy.boxsize = [1,1,1] ; \r\n`
            + ` aDummy.name = \"${maxName}\" ;`;

        console.log(" >> DUMMY: ", maxscript);

        return this.execMaxscript(maxscript, "createDummy");
    }

    createObject(maxName: string, objectName: string, objectJson: any): Promise<boolean> {
        let maxscript =
            `aDummy = Dummy() ; \r\n`
            + `aDummy.boxsize = [1,1,1] ; \r\n`
            + `aDummy.name = \"${maxName}\" ; \r\n`
            + `aObj = ${objectJson.type}() ; \r\n`
            + `aObj.name = \"${objectName}\" ; \r\n`
            + `rotate aObj (eulerangles -90 0 0) ; \r\n `
            + `aObj.parent = aDummy ; \r\n`

        const keys = Object.keys(objectJson.params);
        for (let key of keys) {
            const value = objectJson.params[key];
            if (typeof value === "string") {
                const maxscriptValue = value.replace(/\\/g, "\\\\");
                objectJson.params[key] = maxscriptValue;
            } else {
                const maxscriptValue = value;
                objectJson.params[key] = maxscriptValue;
            }
        }

        for (let key in objectJson.params) {
            const value = objectJson.params[key];
            maxscript += `  try ( aObj.${key} = ${value} ; ) catch ( false ) \r\n`;
        }

        console.log(" >> OBJECT: ", maxscript);

        return this.execMaxscript(maxscript, "createObject");
    }

    createTargetCamera(cameraName: string, cameraJson: any): Promise<boolean> {
        let maxscript = `aFreeCamera = FreeCamera `
            + ` nearclip:1 farclip:1000 nearrange:0 farrange:1000 `
            + ` mpassEnabled:off mpassRenderPerPass:off `
            + ` isSelected:on name:\"${cameraName}\" ; \r\n`
            + ` aFreeCamera.fovType = 2 ; \r\n`
            + ` aFreeCamera.curFOV = ${cameraJson.fov}`;

        console.log(" >> createTargetCamera: ");
        console.log(" >> maxscript: \r\n", maxscript);

        return this.execMaxscript(maxscript, "createTargetCamera");
    }

    updateTargetCamera(cameraName: string, cameraJson: any): Promise<boolean> {
        let maxscript = `aFreeCamera = $${cameraName} ; \r\n`
            + ` aFreeCamera.fovType = 2 ; \r\n`
            + ` aFreeCamera.curFOV = ${cameraJson.fov}`;

        console.log(" >> updateTargetCamera: ");
        console.log(" >> maxscript: \r\n", maxscript);

        return this.execMaxscript(maxscript, "updateTargetCamera");
    }

    cloneInstance(nodeName: string, cloneName: string): Promise<boolean> {
        let maxscript = `aClone = instance $${nodeName} name:"${cloneName}" ; \r\n`
            + `aClone.parent = null ; \r\n`
            + `aClone.transform = (matrix3 [1,0,0] [0,1,0] [0,0,1] [0,0,0])`;

        return this.execMaxscript(maxscript, "cloneInstance");
    }

    deleteObjects(mask: string): Promise<boolean> {
        let maxscript = `delete $${mask}`;
        return this.execMaxscript(maxscript, "deleteObjects");
    }

    createSpotlight(spotlightJson: any): Promise<boolean> {
        let m = spotlightJson.matrix;
        let r = (spotlightJson.color >> 16) & 0xFF;
        let g = (spotlightJson.color >> 8) & 0xFF;
        let b = (spotlightJson.color) & 0xFF;

        let hotspot = 180.0 / (Math.PI / spotlightJson.angle);
        let falloff = hotspot + 5;

        let t = spotlightJson.target;

        let maxscript = `aTargetSpot = TargetSpot name: "${spotlightJson.name}" `
            + ` transform: (matrix3 [${m[0]},${m[1]},${m[2]}] [${m[4]},${m[5]},${m[6]}] [${m[8]},${m[9]},${m[10]}] [${m[12]},${m[13]},${m[14]}]) `
            + ` multiplier: ${spotlightJson.intensity} `
            + ` rgb: (color ${r} ${g} ${b}) `
            + ` hotspot: ${hotspot} `
            + ` falloff: ${falloff} `
            + ` target: (Targetobject transform: (matrix3 [${t[0]},${t[1]},${t[2]}] [${t[4]},${t[5]},${t[6]}] [${t[8]},${t[9]},${t[10]}] [${t[12]},${t[13]},${t[14]}])); `
            + ` aTargetSpot.shadowGenerator = shadowMap(); aTargetSpot.baseObject.castShadows = true; `
            + ` aTargetSpot.parent = threejsSceneRoot; `
            + ` aTargetSpot.target.parent = threejsSceneRoot; `;

        if (spotlightJson.shadow && spotlightJson.shadow.mapsize > 0) {
            maxscript += ` aTargetSpot.mapSize = ${spotlightJson.shadow.mapsize}; `;
        }

        return this.execMaxscript(maxscript, "createSkylight");
    }

    createBitmapTexture(maxName: string, threeJson: any, filepath: string, varName: string): Promise<boolean> {
        console.log(` >> createBitmapTexture: `, maxName, threeJson, filepath, varName);

        /*
            b = BitmapTexture()
            Bitmaptexture:Bitmap
            showProperties b
            .clipu (Clip_U_Offset) : float
            .clipv (Clip_V_Offset) : float
            .clipw (Clip_U_Width) : float
            .cliph (Clip_V_Width) : float
            .jitter (Jitter_Placement) : float
            .useJitter : boolean
            .apply : boolean
            .cropPlace : integer
            .filtering : integer
            .monoOutput : integer
            .rgbOutput : integer
            .alphaSource : integer
            .preMultAlpha : boolean
            .bitmap : bitmap
            .coords (Coordinates) : maxObject
            .output : maxObject
            .fileName (File_Name) : filename
            .startTime : time
            .playBackRate : float
            .endCondition : integer
            .tieTimeToMatIDs (Tie_Time_to_Mat_IDs) : boolean
            false
        */
        const maxscript = `${varName} = BitmapTexture name:"${maxName}" fileName:"${filepath}"; \r\n`
            + `${varName}.fileName`;

        console.log(` >> creating BitmapTexture: \r\n`);
        console.log(" >> maxscript: " + maxscript);

        return this.execMaxscript(maxscript, "createBitmapTexture");
    }

    createMaterial(materialName: string, materialType: string, materialParams: any, textureVars?: ITextureVars): Promise<boolean> {
        console.log(` >> createMaterial: `, materialName, materialType, materialParams);

        const supportedMaterialTypes = [
            'StandardMaterial',
            'MatteShadow',
            'InkNPaint',
            'RaytraceMaterial',
            'VRayMtl',
            'VRayCarPaintMtl',
            'PhysicalMaterial',
        ];

        if (!supportedMaterialTypes.includes(materialType)) {
            return Promise.resolve(false);
        }

        let maxscript = `mat = rayysFindMaterialByName "${materialName}" ; \r\n`
            + `if mat != false then ( \r\n`
            + `  -- do nothing \r\n`
            //   do not create it, as this material exist
            + `) else ( \r\n`
            + `  mat = ${materialType} name:"${materialName}" ; \r\n`
            + `) \r\n`

        for (let key in materialParams) {
            const value = materialParams[key];
            maxscript += `mat.${key} = ${value} ; \r\n`
        }

        if (textureVars.map) {
            maxscript += `mat.texmap_diffuse = ${textureVars.map} ; \r\n`
            maxscript += `mat.texmap_diffuse_on = on ; \r\n`
        }

        console.log(` >> creating material: \r\n`);
        console.log(" >> maxscript: " + maxscript);

        return this.execMaxscript(maxscript, "createMaterial");
    }

    downloadJson(url: string, path: string): Promise<boolean> {
        console.log(" >> Downloading json from:\n" + url);

        const curlPath = "C:\\\\bin\\\\curl";
        let maxscript = `cmdexRun "${curlPath} -k -s -H \\\"Accept: application/json\\\" \\\"${url}\\\" -o \\\"${path}\\\" "`;

        console.log(" >> maxscript: " + maxscript);

        return this.execMaxscript(maxscript, "downloadJson");
    }

    downloadFile(url: string, path: string, mimeType: string): Promise<boolean> {
        console.log(" >> Downloading file from:\n" + url);

        const curlPath = "C:\\\\bin\\\\curl";
        let maxscript = `cmdexRun "${curlPath} -k -s -H \\\"Accept: ${mimeType}\\\" \\\"${url}\\\" -o \\\"${path}\\\" "`;

        console.log(" >> maxscript: " + maxscript);

        return this.execMaxscript(maxscript, "downloadFile");
    }

    extractZip(fullpath: string, destDir: string): Promise<boolean> {
        console.log(" >> Extracting file from:\n" + fullpath);

        const _7zPath = "7z";
        let maxscript = `cmdexRun "${_7zPath} e -aoa ${fullpath} -o${destDir}"`;

        console.log(" >> maxscript: " + maxscript);

        return this.execMaxscript(maxscript, "downloadFile");
    }

    uploadFile(url: string, path: string): Promise<boolean> {
        console.log(" >> Uploading file to:\n" + url);

        let escapedFilename = path.replace(/\\/g, "\\\\");

        const curlPath = "C:\\\\bin\\\\curl";
        let maxscript = `cmdexRun "${curlPath} -F file=@${escapedFilename} ${url}" `;

        console.log(" >> maxscript: " + maxscript);

        return this.execMaxscript(maxscript, "uploadFile");
    }

    importMesh(path: string, nodeName: string): Promise<boolean> {
        console.log(" >> importing mesh from ", path);
        let maxscript = `threejsImportBufferGeometry \"${path}\" \"${nodeName}\" ;\r\n`
            + `$${nodeName}.wireColor = (color 255 255 255); \r\n`;

        console.log(" >> maxscript: " + maxscript);

        return this.execMaxscript(maxscript, "importMesh");
    }

    exportMesh(path: string, nodeName: string, uuid: string): Promise<boolean> {
        console.log(" >> exporting mesh to ", path);
        let maxscript = `threejsExportBufferGeometry \"${path}\" \"${nodeName}\" \"${uuid}\"`;

        console.log(" >> maxscript: " + maxscript);

        return this.execMaxscript(maxscript, "exportMesh");
    }

    __maxscriptMaterialFromMaterialJson(materialName: string, materialJson: any, targetVarName: string): string {
        let scope = "__scope" + Math.floor(99999 * Math.random()) + "_";
        let materialCopyName = this.getObjectName(materialJson);

        const keys = Object.keys(materialJson.params);
        for (let key of keys) {
            const value = materialJson.params[key];
            if (typeof value === "string") {
                const maxscriptValue = value.replace(/\\/g, "\\\\");
                materialJson.params[key] = maxscriptValue;
            } else {
                const maxscriptValue = value;
                materialJson.params[key] = maxscriptValue;
            }
        }

        delete materialJson["$"];

        let maxscript = `${scope}mat = rayysFindMaterialByName "${materialName}"; \r\n`
            + `${scope}matCopy = 0; \r\n`
            + `if (${scope}mat != false) then ( \r\n`
            + `  ${scope}matCopy = copy ${scope}mat; \r\n`
            + `) else ( \r\n`
            + `  ${scope}matCopy = VrayMtl(); \r\n`
            + `) \r\n`
            + `${scope}matCopy.name = "${materialCopyName}"; \r\n `;

        for (let key in materialJson.params) {
            const value = materialJson.params[key];

            if (key.match(/texmap_\w+\.fileName$/g)) {
                const subKey = key.replace(".fileName", "");
                maxscript +=
                    `if ${scope}matCopy.${subKey} == undefined then ( \r\n `
                    + `  ${scope}matCopy.${subKey} = BitmapTexture(); \r\n `
                    + `) \r\n `;
            }

            // is value direct file URL ?
            if (typeof value === "string"
                && (
                    (value.toLowerCase().indexOf("http://") === 0
                        || value.toLowerCase().indexOf("https://") === 0
                    ) && (value.toLowerCase().endsWith(".png")
                        || value.toLowerCase().endsWith(".jpg")
                        || value.toLowerCase().endsWith(".jpeg")
                        || value.toLowerCase().endsWith(".exr")
                        || value.toLowerCase().endsWith(".hdr")
                        || value.toLowerCase().endsWith(".psd")
                        || value.toLowerCase().endsWith(".bmp")
                        || value.toLowerCase().endsWith(".tga")
                        || value.toLowerCase().endsWith(".tif")
                        || value.toLowerCase().endsWith(".gif")
                    )
                )
            ) {
                const fileExt = value.split(".").pop();
                const randomFilename = uuidv4() + "." + fileExt;
                const curlPath = "C:\\\\bin\\\\curl";
                const downloadUrl = `${this._settings.current.publicUrl}/v${this._settings.majorVersion}/externalasset/${randomFilename}?api_key=${this._session.apiKey}&url=${value}`;
                // for example:
                // cmdexRun "C:\\bin\\curl -v -O \"https://api2.renderfarmjs.com/v1/externalasset/1.png?api_key=0dc0-4324-aacd&url=http://renderfarmjs.com/img/vray.png\" "

                const downloadedMapPath = "C:\\\\Temp\\\\" + randomFilename;
                maxscript += `res = cmdexRun "${curlPath} -k -s \\\"${downloadUrl}\\\" -o \\\"${downloadedMapPath}\\\" " ; \r\n`;
                maxscript += `if res then (\r\n `
                    + `  try ( \r\n `
                    + `    ${scope}matCopy.${key} = \"${downloadedMapPath}\" ; \r\n `
                    + `  ) \r\n `
                    + `  catch ( false ) \r\n `
                    + `) \r\n `;

            } else {
                maxscript += `  try ( ${scope}matCopy.${key} = ${value} ; ) catch ( false ) \r\n`;
            }
        }

        maxscript += `${targetVarName} = ${scope}matCopy; \r\n`;
        maxscript += `${scope}matCopy = 0; \r\n`;

        return maxscript;
    }

    assignMaterial(nodeName: string, materialName: string, materialJson?: any): Promise<boolean> {
        let maxscript = "";
        if (materialJson) { // material must be cloned and renamed (not reuse existing one)
            maxscript += this.__maxscriptMaterialFromMaterialJson(materialJson.name || materialName, materialJson, "clonedMat");
            maxscript += `$${nodeName}.Material = clonedMat; \r\n`;
        } else {
            maxscript = `mat = rayysFindMaterialByName "${materialName}"; `
                + `if (mat != false) then (`
                + `  $${nodeName}.Material = mat`
                + `) `;
        }

        return this.execMaxscript(maxscript, "assignMaterial");
    }

    assignMultiSubMaterial(nodeName: string, materialNames: string[], materialJson?: any): Promise<boolean> {

        const numSubs = materialNames.length;
        if (numSubs === 0) {
            console.log(` WARN | Can't create multi-sub material with zero subs: `, nodeName, materialNames);
            return Promise.resolve(true);
        }

        const materialName = "multiSub_" + md5(materialNames.map(el => el ? el : "<empty>").join("_")).substr(0, 6).toUpperCase();
        console.log(` >> assignMultiSubMaterial\n    nodeName: `, nodeName,
            `\n    materialNames: `, materialNames,
            `\n    materialName (hash): `, materialName);

        let maxscript = `mat = rayysFindMaterialByName "${materialName}" ;\n`

            + `if (mat != false) then (\n`
            + `  $${nodeName}.Material = mat ;\n`
            + `) else (\n`
            + `  mat = multiSubMaterial numsubs: ${numSubs} ;\n`

            + (materialNames.map((matName, matIdx) => {
                if (materialJson) {
                    if (materialJson[matIdx]) {
                        let matVarName = "subMat" + matIdx;
                        let maxscript0 = `  ` + this.__maxscriptMaterialFromMaterialJson(materialJson[matIdx].name || matName, materialJson[matIdx], matVarName);
                        maxscript0 += `  mat.materialList[${matIdx + 1}] = ${matVarName} ;\n`
                        return maxscript0;
                    }
                } else {
                    return (
                        `  submat = rayysFindMaterialByName "${matName}" ;\n`
                        + `  if (submat != false) then (\n`
                        + `    mat.materialList[${matIdx + 1}] = submat ;\n`
                        + `  )\n`)
                }
            }) //== end of .map
                .join("\n"))

            + `  $${nodeName}.Material = mat ;\n`

            + `) ` //== end of else

        console.log(` >> xor 1 maxscript: \n`, maxscript, "\n\n");

        return this.execMaxscript(maxscript, "assignMultiSubMaterial");
    }

    unwrapUV2(nodeName: string): Promise<boolean> {
        let maxscript = `rayysFlattenUV2 $${nodeName}`;

        console.log(" >> maxscript: " + maxscript);

        return this.execMaxscript(maxscript, "unwrapUv2");
    }

    renderScene(cameraJson: any, size: number[], filename: string, alpha: boolean, renderSettings: any): Promise<boolean> {
        console.log(` >> renderScene: `,
            `\r\n    cameraJson: `, cameraJson,
            `\r\n    size: `, size,
            `\r\n    filename: `, filename,
            `\r\n    renderSettings: `, renderSettings);

        let escapedFilename = filename.replace(/\\/g, "\\\\");

        let maxscript = ` pngio.settype(#true24) ;\r\n`  // enums: {#paletted|#true24|#true48|#gray8|#gray16} 
            + ` pngio.setAlpha ${alpha} ;\r\n`
            + ` vr = renderers.current ;\r\n`;

        for (let k in renderSettings) {
            maxscript = maxscript + ` vr.${k} = ${renderSettings[k]} ; \r\n`
        }

        // hey that's nasty code duplicate, try to remove it
        let cameraName = (function getObjectName(obj) {
            let parts = obj.uuid.split("-");
            if (obj.name) {
                let safeName = obj.name.replace(/\W/g, '');
                if (safeName) {
                    return `${safeName}_${parts[0]}`;
                }
            }
            return `${obj.type}_${parts[0]}`;
        })(cameraJson);

        maxscript = maxscript
            + ` viewport.setLayout #layout_1 ;\r\n`
            + ` viewport.setCamera $${cameraName} ;\r\n`
            + ` renderWidth  = ${size[0]} ;\r\n`
            + ` renderHeight = ${size[1]} ;\r\n`
            + ` rendUseActiveView = true ;\r\n`
            + ` rendSaveFile = true ;\r\n`
            + ` rendOutputFilename = "${escapedFilename}" ;\r\n`
            + ` $${cameraName}.fovType = 2 ; \r\n `
            + ` $${cameraName}.curFOV = ${cameraJson.fov} ; \r\n`
            + ` max quick render ;\r\n`
            + ` cmdexRun "C:\\\\bin\\\\curl.exe -F file=@${escapedFilename} ${this._settings.current.publicUrl}/v1/renderoutput" `;

        // see here: http://help.autodesk.com/view/3DSMAX/2018/ENU/?guid=__files_GUID_9175301C_13E6_488B_ABA6_D27CD804B205_htm
        // can also use: JPEG.setQuality(5); JPEG.setSmoothing(1);

        console.log(" >> maxscript: " + maxscript);

        return this.execMaxscript(maxscript, "renderScene");
    }

    convertFile(inputUrl: string, filename: string, settings: any): Promise<boolean> {
        console.log(` >> convertFile: `,
            `\r\n    inputUrl: `, inputUrl,
            `\r\n    filename: `, filename,
            `\r\n    settings: `, settings);

        let escapedFilename = filename.replace(/\\/g, "\\\\");

        // curl -o do-bots.txt  https://www.digitalocean.com/robots.txt

        let maxscript
            + ` cmdexRun "C:\\\\bin\\\\curl.exe -o ${escapedFilename} ${inputUrl}" `;


        console.log(" >> maxscript: " + maxscript);

        return this.execMaxscript(maxscript, "convertFile");
    }

    bakeTextures(bakeObjectName: string, size: number, filenames: IBakeTexturesFilenames, renderSettings: any): Promise<boolean> {
        let escapedLightmap = filenames.lightmap.replace(/\\/g, "\\\\");

        let maxscript = ` pngio.settype(#true24) ;\r\n`  // enums: {#paletted|#true24|#true48|#gray8|#gray16} 
            + ` pngio.setAlpha false ;\r\n`
            + ` vr = renderers.current ;\r\n`;

        for (let k in renderSettings) {
            maxscript = maxscript + ` vr.${k} = ${renderSettings[k]} ; \r\n`
        }

        maxscript = maxscript
            + ` viewport.setLayout #layout_1 ;\r\n`
            + ` size = ${size} ;\r\n`
            + ` outputNames = #( \"${escapedLightmap}\" ) ;\r\n`
            + ` rayysBakeVrayLightShadowMaps $${bakeObjectName} outputNames size ;\r\n`
            + ` select $${bakeObjectName} ; \r\n`
            + ` render rendertype:#bakeSelected vfb:on progressBar:true outputSize:[size,size] ;\r\n`
            + ` cmdexRun "C:\\\\bin\\\\img_morphology.exe 2 2 0 \\\"${escapedLightmap}\\\" \\\"${escapedLightmap}\\\"" ;\r\n`
            + ` cmdexRun "C:\\\\bin\\\\curl.exe -F file=@${escapedLightmap} https://acc.renderfarmjs.com/v1/renderoutput" `

        console.log(" >> maxscript: " + maxscript);

        return this.execMaxscript(maxscript, "bakeTextures");
    }

    getObjectName(obj: any) {
        let parts = obj.uuid.split("-");

        if (obj.name) {
            let safeName = obj.name.replace(/\W/g, '');
            if (safeName) {
                return `${safeName}_${parts[0]}`;
            }
        }

        return `${obj.type}_${parts[0]}`;
    }
}

export { MaxscriptClient };
