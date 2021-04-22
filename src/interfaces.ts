"use strict";

import * as express from "express";
import { ApiKey } from "./database/model/api_key";
import { Workspace } from "./database/model/workspace";
import { Session } from "./database/model/session";
import { Worker } from "./database/model/worker";
import { Job } from "./database/model/job";
import { Task } from "./database/model/task";

export interface IGetSessionOptions {
    allowClosed?: boolean;
    readOnly?: boolean;
    resolveRefs?: boolean;
}

export interface IDatabase {
    connect(): Promise<any>;
    disconnect(): Promise<any>;

    createCollections(): Promise<any>;
    dropCollections(): Promise<any>;

    //api keys
    getApiKey(apiKey: string): Promise<ApiKey>;

    //sessions
    getSession(sessionGuid: string, options?: any): Promise<Session>;
    touchSession(sessionGuid: string): Promise<Session>;
    createSession(apiKey: ApiKey, workgroup: string, workspace: string, sceneFilename?: string, debug?: boolean): Promise<Session>;
    expireSessions(olderThanMinutes: number): Promise<Session[]>;
    closeSession(sessionGuid: string): Promise<Session>;
    failSession(sessionGuid: string, failReason?: string | undefined): Promise<Session>;

    //workspaces
    getWorkspace(workspaceGuid: string): Promise<Workspace>;

    //workers
    getWorker(workerGuid: string): Promise<Worker>;
    insertWorker(worker: Worker): Promise<Worker>;
    upsertWorker(worker: Worker): Promise<boolean>;
    updateWorker(worker: Worker, setter: any): Promise<Worker>;
    getRecentWorkers(workgroup: string): Promise<Worker[]>;
    getAvailableWorkers(workgroup?: string): Promise<Worker[]>;

    //storeVraySpawner(vraySpawnerInfo: VraySpawnerInfo): Promise<VraySpawnerInfo>;

    //jobs
    getJob(jobGuid: string): Promise<Job>;
    getActiveJobs(workgroup: string): Promise<Job[]>;
    createJobRender(apiKey: ApiKey, workerGuid: string, cameraJson: any, renderWidth: number, renderHeight: number, alpha: boolean, renderSettings: any): Promise<Job>;
    createJobConvert(apiKey: ApiKey, workerGuid: string, inputUrl: string, settings: any): Promise<Job>;
    updateJob(job: Job, setter: any): Promise<Job>;
    completeJob(job: Job, urls: string[]): Promise<Job>;
    cancelJob(job: Job): Promise<Job>;
    failJob(job: Job, error: string): Promise<Job>;
}

export interface ISettings {
    version: string;
    majorVersion: number;
    current: any;
    env: string;
}

export interface IApp {
    express: express.Application;
}

export interface IEndpoint {
    bind(express: express.Application);
}

export interface IMixpanel {
    trackRequest(req: any, res: any): void;
}

export interface IMaxscriptClient {
    connect(ip: string, port: number): Promise<boolean>;
    disconnect(): void;

    execMaxscript(maxscript: string, actionDesc: string): Promise<boolean>;

    resetScene(): Promise<boolean>;
    openScene(maxSceneFilename: string, workspace: Workspace): Promise<boolean>;
    saveScene(maxSceneFilename: string, workspace: Workspace): Promise<boolean>;
    dumpScene(maxSceneFilename: string): Promise<boolean>;
    xrefScene(maxSceneFilename: string, workspace: Workspace, nodeName: string): Promise<boolean>;

    setObjectWorldMatrix(nodeName, matrixWorldArray): Promise<boolean>;
    setObjectMatrix(nodeName, matrixArray): Promise<boolean>;
    linkToParent(nodeName: string, parentName: string): Promise<boolean>;
    renameObject(nodeName: string, newName: string): Promise<boolean>;

    setSession(sessionGuid: string): Promise<boolean>;
    setWorkspace(workspaceInfo: any): Promise<boolean>;

    createSceneRoot(maxName: string): Promise<boolean>;
    createDummy(maxName: string): Promise<boolean>;
    createObject(maxName: string, objectName: string, objectJson: any): Promise<boolean>;

    createTargetCamera(cameraName, cameraJson): Promise<boolean>;
    updateTargetCamera(cameraName, cameraJson: any): Promise<boolean>;

    deleteObjects(mask: string): Promise<boolean>;
    cloneInstance(nodeName: string, cloneName: string): Promise<boolean>;

    createSpotlight(spotlightJson: any): Promise<boolean>;

    createBitmapTexture(maxName: string, varName: string, threeJson: any, filepath: string): Promise<boolean>;
    createMaterial(materialName: string, materialType: string, materialParams: any): Promise<boolean>;

    downloadJson(url: string, path: string): Promise<boolean>;

    importMesh(path: string, nodeName: string): Promise<boolean>;
    exportMesh(path: string, nodeName: string, uuid: string): Promise<boolean>;

    downloadFile(url: string, path: string, mimeType: string): Promise<boolean>;
    uploadFile(url: string, path: string): Promise<boolean>;
    extractZip(fullpath: string, destDir: string): Promise<boolean>;

    assignMaterial(nodeName: string, materialName: string, materialJson?: any): Promise<boolean>;
    assignMultiSubMaterial(nodeName: string, materialNames: string[], materialJson?: any): Promise<boolean>;

    unwrapUV2(nodeName: string): Promise<boolean>;

    renderScene(cameraJson: any, size: number[], filename: string, alpha: boolean, renderSettings: any): Promise<boolean>;
    convertFile(inputUrl: string, filename: string, outputname: string, settings: any): Promise<boolean>;
    bakeTextures(bakeObjectName: string, size: number, filenames: IBakeTexturesFilenames, renderSettings: any): Promise<boolean>;
}

export interface IBakeTexturesFilenames {
    lightmap: string;
}

export interface IFactory<T> {
    Create(session: Session, ...args: any[]): Promise<T>;
}

export interface ISessionPool<T> {
    Get(session: Session): Promise<T>;
    FindOne(lookup: (obj: T) => boolean): T;
    FindAll(lookup: (obj: T) => boolean): T[];
}

export interface IWorkerService {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

export interface IJobService {
    Start(session: Session, job: Job): void;
    Cancel(job: Job): void;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

export interface ITaskSchedulerService {
    Push(newTask: Task): string;
    Pop(): Task;
    Cancel(task: Task): void;
    GetAll(): Task[];
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

export interface ISessionService {
    GetSession(sessionGuid: string, allowClosed?: boolean, letTouch?: boolean, resolveRefs?: boolean): Promise<Session>;
    CreateSession(apiKey: ApiKey, workgroup: string, workspaceGuid: string, sceneFilename?: string, debug?: boolean): Promise<Session>;
    KeepSessionAlive(sessionGuid: string): Promise<Session>;
    CloseSession(sessionGuid: string): Promise<Session>;
    ExpireSessions(sessionTimeoutMinutes: number): Promise<Session[]>;
    FailSession(sessionGuid: string, failReason?: string): Promise<Session>;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

export enum SessionServiceEvents {
    Created = "session:created",
    Updated = "session:updated",
    Closed = "session:closed",
    Expired = "session:expired",
    Failed = "session:failed",
    WatchdogStarted = "session-watchdog:started",
}

export interface IThreeMaxscriptBridge {
    PostScene(session: Session, sceneJson: any): Promise<PostSceneResult>;
    PutObject(objectJson: any): Promise<any>;
}

export interface PostSceneResult {
    readonly UnwrappedGeometry: {
        [uuid: string]: string; // map geometry uuid => fbx download url
    }
}

export interface ISceneObjectBinding {
    Get(): Promise<any>;
    Post(objectJson: any, parent: any): Promise<PostResult>;
    Put(objectJson: any): Promise<any>;
    Delete(): Promise<any>;
}

export interface PostResult {
    url?: string; // is set when posted geometry was unwrapped
    path?: string; // where file is uploaded
}

export interface ISceneObjectBindingFactory extends IFactory<ISceneObjectBinding> {
    readonly SrcType: string;
    readonly DstType: string;
}

export interface IGeometryBinding {
    readonly ThreeJson: any;
    readonly MaxInstances: IMaxInstanceInfo[];

    Get(): Promise<any>;
    Post(meshUuid: string, maxName: string): Promise<any>;
    Put(geometryJson: any, upload: boolean): Promise<any>;
    Delete(): Promise<any>;
}

export interface IMaxInstanceInfo {
    MeshUuid: string; // uuid of Mesh object, not BufferGeometry
    MaxName: string;
}

export interface IGeometryCache {
    readonly Geometries: {
        [uuid: string]: IGeometryBinding;
    }
}

export interface IGeometryCacheFactory {
    Create(maxscriptClient: IMaxscriptClient): IGeometryCache;
}

export interface ITextureVars {
    map: string;
    alphaMap: string;
    bumpMap: string;
    displacementMap: string;
    emissiveMap: string;
    metalnessMap: string;
    normalMap: string;
    roughnessMap: string;
}

export interface IMaterialBinding {
    readonly ThreeJson: any;
    Get(): Promise<any>;
    Post(materialJson: any): Promise<PostResult>;
    Put(materialJson: any): Promise<any>;
    Delete(): Promise<any>;
}

export interface IMaterialCache {
    readonly Materials: {
        [uuid: string]: IMaterialBinding;
    }
}

export interface IMaterialCacheFactory {
    Create(maxscriptClient: IMaxscriptClient): IMaterialCache;
}

export interface ITextureBinding {
    readonly ThreeJson: any;
    Get(): Promise<any>;
    Post(filepath: string, varName: string): Promise<any>;
    Put(textureJson: any, filepath: string, varName: string): Promise<any>;
    Delete(): Promise<any>;
}

export interface ITextureCache {
    readonly Textures: {
        [uuid: string]: ITextureBinding;
    }
}

export interface ITextureCacheFactory {
    Create(maxscriptClient: IMaxscriptClient): ITextureCache;
}

export interface IImageBinding {
    readonly ThreeJson: any;
    Get(): Promise<any>;
    Post(): Promise<any>;
    Put(imageJson: any): Promise<any>;
    Delete(): Promise<any>;
}

export interface IImageCache {
    readonly Images: {
        [uuid: string]: IImageBinding;
    }
}

export interface IImageCacheFactory {
    Create(maxscriptClient: IMaxscriptClient): IImageCache;
}

