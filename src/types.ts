const TYPES = {
    // core interfaces
    IApp: Symbol.for("IApp"),
    IMixpanel: Symbol.for("IMixpanel"),
    ISettings: Symbol.for("ISettings"),
    IDatabase: Symbol.for("IDatabase"),
    IEndpoint: Symbol.for("IEndpoint"),

    // factories
    IMaxscriptClientFactory: Symbol.for("IFactory<IMaxscriptClient>"),
    IThreeMaxscriptBridgeFactory: Symbol.for("IFactory<IThreeMaxscriptBridge>"),
    ISceneObjectBindingFactory: Symbol.for("ISceneObjectBindingFactory"),

    IGeometryBindingFactory: Symbol.for("IFactory<IGeometryBinding>"),
    IMaterialBindingFactory: Symbol.for("IFactory<IMaterialBinding>"),
    ITextureBindingFactory: Symbol.for("IFactory<ITextureBinding>"),
    IImageBindingFactory: Symbol.for("IFactory<IImageBinding>"),

    IGeometryCacheFactory: Symbol.for("IFactory<IGeometryCache>"),
    IMaterialCacheFactory: Symbol.for("IFactory<IMaterialCache>"),
    ITextureCacheFactory: Symbol.for("IFactory<ITextureCache>"),
    IImageCacheFactory: Symbol.for("IFactory<IImageCache>"),

    // services
    IWorkerService: Symbol.for("IWorkerService"),
    IJobService: Symbol.for("IJobService"),
    ITaskSchedulerService: Symbol.for("ITaskSchedulerService"),
    ISessionService: Symbol.for("ISessionService"),
    IMaxscriptClientPool: Symbol.for("ISessionPool<IMaxscriptClient>"),
    IThreeMaxscriptBridgePool: Symbol.for("ISessionPool<IThreeMaxscriptBridge>"),
    IGeometryCachePool: Symbol.for("ISessionPool<IGeometryCache>"),
    IMaterialCachePool: Symbol.for("ISessionPool<IMaterialCache>"),
    ITextureCachePool: Symbol.for("ISessionPool<ITextureCache>"),
    IImageCachePool: Symbol.for("ISessionPool<IImageCache>"),
};

export { TYPES };
