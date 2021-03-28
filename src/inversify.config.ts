import { Container, decorate, injectable } from "inversify";

import { TYPES } from "./types";

import "reflect-metadata";
///<reference path="./typings/node/node.d.ts" />
import { EventEmitter } from "events";
decorate(injectable(), EventEmitter);

import { Database } from "./database/database";
import { App } from "./app";
import { Mixpanel } from "./mixpanel";
import { Settings } from "./settings";

import * as factories from "./factories/index";
import * as endpoints from "./endpoints/index";
import * as services from "./services/index"
import * as interfaces from "./interfaces";

const myContainer = new Container();

// core
myContainer.bind<interfaces.IDatabase>(TYPES.IDatabase).to(Database).inSingletonScope();
myContainer.bind<interfaces.IMixpanel>(TYPES.IMixpanel).to(Mixpanel).inSingletonScope();
myContainer.bind<interfaces.IApp>(TYPES.IApp).to(App).inSingletonScope();

// endpoints
myContainer.bind<interfaces.IEndpoint>(TYPES.IEndpoint).to(endpoints.SessionEndpoint).inSingletonScope();
myContainer.bind<interfaces.IEndpoint>(TYPES.IEndpoint).to(endpoints.JobEndpoint).inSingletonScope();
myContainer.bind<interfaces.IEndpoint>(TYPES.IEndpoint).to(endpoints.WorkerEndpoint).inSingletonScope();
myContainer.bind<interfaces.IEndpoint>(TYPES.IEndpoint).to(endpoints.WorkspaceFileEndpoint).inSingletonScope();
myContainer.bind<interfaces.IEndpoint>(TYPES.IEndpoint).to(endpoints.RenderOutputEndpoint).inSingletonScope();
myContainer.bind<interfaces.IEndpoint>(TYPES.IEndpoint).to(endpoints.ConvertOutputEndpoint).inSingletonScope();
myContainer.bind<interfaces.IEndpoint>(TYPES.IEndpoint).to(endpoints.ExternalAssetEndpoint).inSingletonScope();
myContainer.bind<interfaces.IEndpoint>(TYPES.IEndpoint).to(endpoints.ThreeObjectEndpoint).inSingletonScope();
myContainer.bind<interfaces.IEndpoint>(TYPES.IEndpoint).to(endpoints.ThreeGeometryEndpoint).inSingletonScope();
myContainer.bind<interfaces.IEndpoint>(TYPES.IEndpoint).to(endpoints.ThreeMaterialEndpoint).inSingletonScope();
myContainer.bind<interfaces.IEndpoint>(TYPES.IEndpoint).to(endpoints.ThreeTextureEndpoint).inSingletonScope();
myContainer.bind<interfaces.IEndpoint>(TYPES.IEndpoint).to(endpoints.ThreeImageEndpoint).inSingletonScope();

// services
myContainer.bind<interfaces.IWorkerService>(TYPES.IWorkerService).to(services.WorkerService).inSingletonScope();
myContainer.bind<interfaces.IJobService>(TYPES.IJobService).to(services.JobService).inSingletonScope();
myContainer.bind<interfaces.ISessionService>(TYPES.ISessionService).to(services.SessionService).inSingletonScope();

// pools
myContainer.bind<interfaces.ISessionPool<interfaces.IMaxscriptClient>>(TYPES.IMaxscriptClientPool).to(services.MaxScriptClientPool).inSingletonScope();
myContainer.bind<interfaces.ISessionPool<interfaces.IThreeMaxscriptBridge>>(TYPES.IThreeMaxscriptBridgePool).to(services.ThreeMaxscriptBridgePool).inSingletonScope();
myContainer.bind<interfaces.ISessionPool<interfaces.IGeometryCache>>(TYPES.IGeometryCachePool).to(services.GeometryCachePool).inSingletonScope();
myContainer.bind<interfaces.ISessionPool<interfaces.IMaterialCache>>(TYPES.IMaterialCachePool).to(services.MaterialCachePool).inSingletonScope();
myContainer.bind<interfaces.ISessionPool<interfaces.ITextureCache>>(TYPES.ITextureCachePool).to(services.TextureCachePool).inSingletonScope();
myContainer.bind<interfaces.ISessionPool<interfaces.IImageCache>>(TYPES.IImageCachePool).to(services.ImageCachePool).inSingletonScope();

// factories
myContainer.bind<interfaces.IFactory<interfaces.IMaxscriptClient>>(TYPES.IMaxscriptClientFactory).to(factories.MaxscriptClientFactory).inSingletonScope();
myContainer.bind<interfaces.IFactory<interfaces.IThreeMaxscriptBridge>>(TYPES.IThreeMaxscriptBridgeFactory).to(factories.ThreeMaxscriptBridgeFactory).inSingletonScope();

myContainer.bind<interfaces.ISceneObjectBindingFactory>(TYPES.ISceneObjectBindingFactory).to(factories.SceneBindingFactory).inSingletonScope();
myContainer.bind<interfaces.ISceneObjectBindingFactory>(TYPES.ISceneObjectBindingFactory).to(factories.SpotLightBindingFactory).inSingletonScope();
myContainer.bind<interfaces.ISceneObjectBindingFactory>(TYPES.ISceneObjectBindingFactory).to(factories.PerspectiveCameraBindingFactory).inSingletonScope();
myContainer.bind<interfaces.ISceneObjectBindingFactory>(TYPES.ISceneObjectBindingFactory).to(factories.MeshBindingFactory).inSingletonScope();
myContainer.bind<interfaces.ISceneObjectBindingFactory>(TYPES.ISceneObjectBindingFactory).to(factories.SkinnedMeshBindingFactory).inSingletonScope();
myContainer.bind<interfaces.ISceneObjectBindingFactory>(TYPES.ISceneObjectBindingFactory).to(factories.LineSegmentsBindingFactory).inSingletonScope();
myContainer.bind<interfaces.ISceneObjectBindingFactory>(TYPES.ISceneObjectBindingFactory).to(factories.Object3DBindingFactory).inSingletonScope();
myContainer.bind<interfaces.ISceneObjectBindingFactory>(TYPES.ISceneObjectBindingFactory).to(factories.GroupBindingFactory).inSingletonScope();
myContainer.bind<interfaces.ISceneObjectBindingFactory>(TYPES.ISceneObjectBindingFactory).to(factories.BoneBindingFactory).inSingletonScope();

myContainer.bind<interfaces.IFactory<interfaces.IGeometryCache>>(TYPES.IGeometryCacheFactory).to(factories.GeometryCacheFactory).inSingletonScope();
myContainer.bind<interfaces.IFactory<interfaces.IMaterialCache>>(TYPES.IMaterialCacheFactory).to(factories.MaterialCacheFactory).inSingletonScope();
myContainer.bind<interfaces.IFactory<interfaces.ITextureCache>>(TYPES.ITextureCacheFactory).to(factories.TextureCacheFactory).inSingletonScope();
myContainer.bind<interfaces.IFactory<interfaces.IImageCache>>(TYPES.IImageCacheFactory).to(factories.ImageCacheFactory).inSingletonScope();

myContainer.bind<interfaces.IFactory<interfaces.IGeometryBinding>>(TYPES.IGeometryBindingFactory).to(factories.GeometryBindingFactory).inSingletonScope();
myContainer.bind<interfaces.IFactory<interfaces.IMaterialBinding>>(TYPES.IMaterialBindingFactory).to(factories.MaterialBindingFactory).inSingletonScope();
myContainer.bind<interfaces.IFactory<interfaces.ITextureBinding>>(TYPES.ITextureBindingFactory).to(factories.TextureBindingFactory).inSingletonScope();
myContainer.bind<interfaces.IFactory<interfaces.IImageBinding>>(TYPES.IImageBindingFactory).to(factories.ImageBindingFactory).inSingletonScope();

// tip: this is how to export same instance with different interfaces
// EXAMPLE: myContainer.bind<ISessionObserver>(TYPES.ISessionObserver).toService(TYPES.ISessionObserver);
// ===

// now bind settings
//  > export NODE_ENV=staging
//  > pm2 start app.js

let env: string = null;
try {
    env = process.argv.find(e => e.match(/env=(\w+)/) !== null ).split("=")[1];
} catch {
}

if (!env) {
    env = process.env.NODE_ENV || "dev";
}

console.log("Current Environment: ", env);
myContainer.bind<interfaces.ISettings>(TYPES.ISettings).toConstantValue(new Settings(env));

export { myContainer };
