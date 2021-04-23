module.exports = function() { return {
    version: "1.3.3",
    common: {
        workgroup: "default",
        host: "localhost",
        port: 8000,
        publicUrl: "https://localhost:8000",
        workerManagerPort: 17900, //WorkerManager REST API is hosted on this port
        heartbeatPort: 3000, //renderfarmjs-server API collects UDP heartbeats on this port
        protocol: "http",
        sslKey: "ssl/key.pem",
        sslCert: "ssl/cert.pem",
        renderOutputDir: "/home/rfarm-api/renderoutput", // this is where /renderoutput serves files
        geometryUploadDir: "/home/rfarm-api/geometry/upload", // this is where /geometry/upload stores files
        apiKeyCheck: true,
        workspaceCheck: true,
        expireSessions: true,
        sessionTimeoutMinutes: 3,
        workerTimeoutSeconds: 3,
        mixpanelToken: "123"
    },
    dev: {
        connectionUrl: "mongodb://localhost:27017/rfarmdev",
        databaseName: "rfarmdev",
        collectionPrefix: "dev",
        sessionTimeoutMinutes: 1
    },
    test: {
        heartbeatPort: 0,
        protocol: "http",
        publicUrl: "http://localhost:8000",
        connectionUrl: "mongodb://localhost:27017/rfarmtest",
        databaseName: "rfarmtest",
        collectionPrefix: "test",
        sessionTimeoutMinutes: 5,
    },
    prod: {
        connectionUrl: "mongodb://localhost:27017/rfarmprod",
        databaseName: "rfarmprod",
        collectionPrefix: "prod",
        sessionTimeoutMinutes: 30
    }
} };
