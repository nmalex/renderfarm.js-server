import { injectable, inject } from "inversify";
import * as express from "express";
import { IEndpoint, IDatabase, ISettings, ISessionService, ITaskSchedulerService } from "../interfaces";
import { TYPES } from "../types";
import { Task } from "../database/model/task";
import { Session } from "../database/model/session";

@injectable()
class TaskEndpoint implements IEndpoint {
    private _settings: ISettings;
    private _database: IDatabase;
    private _taskService: ITaskSchedulerService;
    private _sessionService: ISessionService;

    constructor(
        @inject(TYPES.ISettings) settings: ISettings,
        @inject(TYPES.IDatabase) database: IDatabase,
        @inject(TYPES.ITaskSchedulerService) taskService: ITaskSchedulerService,
        @inject(TYPES.ISessionService) sessionService: ISessionService,
    ) {
        this._settings = settings;
        this._database = database;
        this._taskService = taskService;
        this._sessionService = sessionService;
    }

    bind(express: express.Application) {
        express.get(`/v${this._settings.majorVersion}/task`, async function (this: TaskEndpoint, req: express.Request, res: express.Response) {
            // get all tasks by given filter
            console.log(`GET on ${req.path}`);

            //todo: let user get all tasks, consider filters

            res.status(200);
            res.end(JSON.stringify({ ok: true, type: "tasks", data: null }, null, 2));
        }.bind(this));

        express.get(`/v${this._settings.majorVersion}/task/:uid`, async function (this: TaskEndpoint, req: express.Request, res: express.Response) {
            let jobGuid = req.params.uid;
            console.log(`GET on ${req.path} with task guid: ${jobGuid}`);

            //todo: let user get actual task state

            res.status(200);
            res.end(JSON.stringify({ ok: true, type: "tasks", data: null }, null, 2));
        }.bind(this));

        express.post(`/v${this._settings.majorVersion}/task`, async function (this: TaskEndpoint, req: express.Request, res: express.Response) {
            let sessionGuid = req.body.session_guid;
            console.log(`POST on ${req.path} with session: ${sessionGuid}`);

            //todo: check api key
            //todo: add task to task scheduler

            res.status(200);
            res.end(JSON.stringify({ ok: true, type: "tasks", data: null }, null, 2));
        }.bind(this));

        express.put('/task/:uid', async function (this: TaskEndpoint, req: express.Request, res: express.Response) {
            console.log(`PUT on ${req.path}`);

            //todo: let user cancel task
            //todo: cancel task in task scheduler
            //todo: if task has a job, - cancel the job too

            res.status(200);
            res.end(JSON.stringify({ ok: true, type: "tasks", data: null }, null, 2));
        }.bind(this));
    }
}

export { TaskEndpoint };
