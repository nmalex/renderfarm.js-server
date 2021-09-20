import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { IFactory, IMaxscriptClient, ISessionService } from "../../interfaces";

import { Session } from "../../database/model/session";
import { SessionPoolBase } from "../../core/session_pool_base";

const uuidv4 = require("uuid/v4");

@injectable()
export class MaxScriptClientPool extends SessionPoolBase<IMaxscriptClient> {

    constructor(
        @inject(TYPES.ISessionService) sessionService: ISessionService,
        @inject(TYPES.IMaxscriptClientFactory) maxscriptClientFactory: IFactory<IMaxscriptClient>,
    ) {
        super(sessionService, maxscriptClientFactory.Create.bind(maxscriptClientFactory));

        this.id = Math.random();
        console.log(" >> MaxScriptConnectionPool: ", this.id);
    }

    public id: number;

    protected async onBeforeItemAdd(session: Session, maxscript: IMaxscriptClient): Promise<boolean> {
        console.log(` >> onBeforeItemAdd: `, session);

        // try to connect to worker remote maxscript endpoint
        try {
            await maxscript.connect(session.workerRef.ip, session.workerRef.port);
            console.log(`    OK | SessionEndpoint connected to maxscript client`);
        } catch (err) {
            console.log(`  FAIL | failed to connect to worker, `, err);
            throw new Error("failed to connect to worker");
        }

        // try to set maxscript SessionGuid global variable
        try {
            await maxscript.setSession(session.guid);
            console.log(`    OK | SessionGuid on worker was updated`);
        } catch (err) {
            maxscript.disconnect();
            console.log(`  FAIL | failed to update SessionGuid on worker, `, err);
            throw new Error("failed to update SessionGuid on worker");
        }

        // try to configure 3ds max folders from workspace
        try {
            await maxscript.setWorkspace(session.workspaceRef);
            console.log(`    OK | workspace ${session.workspaceGuid} assigned to session ${session.guid}`);
        } catch (err) {
            console.log(`  FAIL | failed to set workspace on worker, `, err);
            maxscript.disconnect();
            throw new Error("failed to set workspace on worker");
        }

        //try to open scene if defined
        if (session.sceneFilename) {
            try {
                await maxscript.openScene(session.sceneFilename, session.workspaceRef);
                console.log(`    OK | scene open: ${session.sceneFilename}`);
            } catch (err) {
                maxscript.disconnect();
                console.log(`  FAIL | failed to open scene, `, err);
                throw new Error("failed to open scene");
            }
        } else {
            try {
                await maxscript.resetScene();
                console.log(`    OK | scene reset`);
            } catch (err) {
                maxscript.disconnect();
                console.log(`  FAIL | failed to reset scene, `, err);
                throw new Error("failed to rest scene");
            }
        }

        // all went fine, let base class add maxscript client to inner cache
        return true;
    }

    protected async onBeforeItemRemove(closedSession: Session, maxscript: IMaxscriptClient): Promise<any> {
        try {
            console.log(` >> onBeforeItemRemove: `, closedSession);
            const dumpSceneAs = `dump_apiKey=${closedSession.apiKey}_sessionGuid=${closedSession.guid}.max`;
            if (closedSession.debug) {
                await maxscript.saveScene(dumpSceneAs, closedSession.workspaceRef);
            }
            await maxscript.dumpScene(`C:\\\\Temp\\\\${dumpSceneAs}`);
            await maxscript.exitApp();
            maxscript.disconnect();
        } catch (err) {
            console.log(`  WARN | client.disconnect threw exception, `, err);
        }
    }
}
