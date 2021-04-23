import { Database } from "./database/database";
import { Settings } from "./settings";
import { JasmineSpecHelpers } from "./jasmine.helpers";
import { ApiKey } from "./database/model/api_key";
import { Workspace } from "./database/model/workspace";
import { Job } from "./database/model/job";
import { Session } from "./database/model/session";
import { Worker } from "./database/model/worker";

let env: string = null;
try {
    env = process.argv.find(e => e.match(/env=(\w+)/) !== null ).split("=")[1];
} catch {
}

if (!env) {
    env = process.env.NODE_ENV || "dev";
}

(async function() {
    console.log(`Creating database for env: ${env}`);

    const settings = new Settings(env);
    const database = new Database(settings);
    await database.connect();
    await database.createCollections();

    const helpers = new JasmineSpecHelpers(database, settings);
    const apiKey = new ApiKey(helpers.existingApiKey);
    try { await database.upsertOne("api-keys", apiKey); } catch (exc) { /* do nothing */ }

    const workspace = new Workspace({
        guid:      helpers.existingWorkspaceGuid,
        apiKey:    helpers.existingApiKey.apiKey,
        workgroup: helpers.existingWorkgroup,
        homeDir:   "C:\\Temp",
        name:      helpers.existingWorkgroup,
        lastSeen:  new Date(),
    });
    try { await database.upsertOne("workspaces", workspace); } catch (exc) { /* do nothing */ }

    const session = new Session({
        apiKey: helpers.existingApiKey.apiKey,
        guid: helpers.existingSessionGuid,
        ttl: 300,
        workerGuid: helpers.existingWorkerGuid,
        sceneFilename: "empty.max",
        firstSeen: new Date("2019-01-08T12:25:07.029Z"),
        lastSeen: new Date(),
        workspaceGuid: helpers.existingWorkspaceGuid,
    });
    try { await database.upsertOne("sessions", session); } catch (exc) { /* do nothing */ }

    const job = new Job({
        guid:       helpers.existingJobGuid,
        apiKey:     helpers.existingApiKey.apiKey,
        jobType:    "someJobType",
        workerGuid: helpers.existingWorkerGuid,
        createdAt:  new Date("1999-12-31T23:00:00.000Z"),
        updatedAt:  new Date("1999-12-31T23:00:00.000Z"),
        state: "pending",
        urls: [
            "https://dev1.renderfarmjs.com/v1/renderoutput/123456-color.png",
            "https://dev1.renderfarmjs.com/v1/renderoutput/123456-alpha.png",
        ]

    });
    try { await database.upsertOne("jobs", job); } catch (exc) { /* do nothing */ }

    const worker1 = new Worker({
        guid:      helpers.existingWorkerGuid,
        mac:       "001122334455",
        ip:        "192.168.88.100",
        port:      34092,
        endpoint:  `192.168.88.100:34092`,
        workgroup: helpers.existingWorkgroup,
        firstSeen: new Date("1999-12-31T23:00:00.000Z"),
        lastSeen:  new Date("1999-12-31T23:00:00.000Z"),
        cpuUsage:  0.19,
        ramUsage:  0.51,
        totalRam:  15.9,
        sessionGuid: helpers.existingSessionGuid,
    });
    try { await database.upsertWorker(worker1); } catch (exc) { /* do nothing */ }

    const worker2 = new Worker({
        guid:      "00000000-cccc-0000-0000-000000000002",
        mac:       "001122334455",
        ip:        "192.168.88.100",
        port:      34093,
        endpoint:  `192.168.88.100:34093`,
        workgroup: helpers.existingWorkgroup,
        firstSeen: new Date("1999-12-31T23:00:00.000Z"),
        lastSeen:  new Date("1999-12-31T23:00:00.000Z"),
        cpuUsage:  0.29,
        ramUsage:  0.51,
        totalRam:  15.9,
        sessionGuid: null,
    });
    try { await database.upsertWorker(worker2); } catch (exc) { /* do nothing */ }

    const worker3 = new Worker({
        guid:      "00000000-cccc-0000-0000-000000000003",
        mac:       "001122334455",
        ip:        "192.168.88.100",
        port:      34094,
        endpoint:  `192.168.88.100:34094`,
        workgroup: helpers.existingWorkgroup,
        firstSeen: new Date("1999-12-31T23:00:00.000Z"),
        lastSeen:  new Date("1999-12-31T23:00:00.000Z"),
        cpuUsage:  0.39,
        ramUsage:  0.51,
        totalRam:  15.9,
        sessionGuid: null,
    });
    try { await database.upsertWorker(worker3); } catch (exc) { /* do nothing */ }

    const worker4 = new Worker({
        guid:      "00000000-cccc-0000-0000-000000000004",
        mac:       "001122334455",
        ip:        "192.168.88.100",
        port:      34095,
        endpoint:  `192.168.88.100:34095`,
        workgroup: helpers.existingWorkgroup,
        firstSeen: new Date("1999-12-31T23:00:00.000Z"),
        lastSeen:  new Date("1999-12-31T23:00:00.000Z"),
        cpuUsage:  0.49,
        ramUsage:  0.51,
        totalRam:  15.9,
        sessionGuid: null,
    });
    try { await database.upsertWorker(worker4); } catch (exc) { /* do nothing */ }

    const worker5 = new Worker({
        guid:      "00000000-cccc-0000-0000-000000000005",
        mac:       "0011223344FF",
        ip:        "192.168.88.101",
        port:      34096,
        endpoint:  `192.168.88.100:34096`,
        workgroup: "other",
        firstSeen: new Date("1999-12-31T23:00:00.000Z"),
        lastSeen:  new Date("1999-12-31T23:00:00.000Z"),
        cpuUsage:  0.59,
        ramUsage:  0.51,
        totalRam:  15.9,
        sessionGuid: null,
    });
    try { await database.upsertWorker(worker5); } catch (exc) { /* do nothing */ }

    const worker6 = new Worker({
        guid:      "00000000-cccc-0000-0000-000000000006",
        mac:       "0011223344FF",
        ip:        "192.168.88.101",
        port:      34097,
        endpoint:  `192.168.88.100:34097`,
        workgroup: "other",
        firstSeen: new Date("1999-12-31T23:00:00.000Z"),
        lastSeen:  new Date("1999-12-31T23:00:00.000Z"),
        cpuUsage:  0.69,
        ramUsage:  0.51,
        totalRam:  15.9,
        sessionGuid: null,
    });
    try { await database.upsertWorker(worker6); } catch (exc) { /* do nothing */ }

    console.log(`Done!`);
    process.exit(0);
})();
