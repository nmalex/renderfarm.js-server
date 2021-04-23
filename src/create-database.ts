import { Database } from "./database/database";
import { Settings } from "./settings";
import { JasmineSpecHelpers } from "./jasmine.helpers";
import { ApiKey } from "./database/model/api_key";
import { Workspace } from "./database/model/workspace";
import { Job } from "./database/model/job";
import { Session } from "./database/model/session";

let env: string = null;
try {
    env = process.argv.find(e => e.match(/env=(\w+)/) !== null ).split("=")[1];
} catch {
}

if (!env) {
    env = process.env.NODE_ENV || "dev";
}

(async function() {
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
        firstSeen: new Date(),
        lastSeen: new Date(),
        workspaceGuid: helpers.existingWorkspaceGuid,
    });
    try { await database.upsertOne("sessions", session); } catch (exc) { /* do nothing */ }

    const job = new Job({
        guid:       helpers.existingJobGuid,
        apiKey:     helpers.existingApiKey.apiKey,
        jobType:    "someJobType",
        workerGuid: helpers.existingWorkerGuid,
    });
    try { await database.upsertOne("jobs", job); } catch (exc) { /* do nothing */ }

    process.exit(0);
})();
