import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { ISettings, IDatabase, IJobService, ISessionPool, IMaxscriptClient, IGeometryCache } from "../interfaces";
import { Task } from "../database/model/task";
import { ITaskSchedulerService } from "../interfaces";

///<reference path="./typings/node/node.d.ts" />
import { EventEmitter } from "events";

@injectable()
export class TaskSchedulerService extends EventEmitter implements ITaskSchedulerService {
    private _settings: ISettings;
    private _database: IDatabase;
    private _jobService: IJobService;
    private _maxscriptClientPool: ISessionPool<IMaxscriptClient>;
    private _geometryCachePool: ISessionPool<IGeometryCache>;

    constructor(
        @inject(TYPES.ISettings) settings: ISettings,
        @inject(TYPES.IDatabase) database: IDatabase,
        @inject(TYPES.IJobService) jobService: IJobService,
        @inject(TYPES.IMaxscriptClientPool) maxscriptClientPool: ISessionPool<IMaxscriptClient>,
        @inject(TYPES.IGeometryCachePool) geometryCachePool: ISessionPool<IGeometryCache>,
    ) {
        super();

        this._settings = settings;
        this._database = database;
        this._jobService = jobService;
        this._maxscriptClientPool = maxscriptClientPool;
        this._geometryCachePool = geometryCachePool;

        this.id = Math.random();
        console.log(" >> TaskSchedulerService: ", this.id);

        // todo: subscribe on job service, and listen when jobs are complete/failed => update task accordingly
        // todo: subscribe on worker service, and listen when new worker is added => pick task and run immediately
        // todo: start timer and check jobs and workers also by interval (fallback mechanism, just in case events do not work for whatever reason)
    }

    public id: number;

    public Push(newTask: Task): string {
        throw new Error("Method not implemented.");
    }

    public Pop(): Task {
        throw new Error("Method not implemented.");
    }

    public Cancel(task: Task): void {
        throw new Error("Method not implemented.");
    }

    public GetAll(): Task[] {
        throw new Error("Method not implemented.");
    }

    // todo: check pending tasks, compare against available workers and create jobs if possible
    // todo: for failed jobs, make possible to retry N attempts
}