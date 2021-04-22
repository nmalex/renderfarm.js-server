import { IDbEntity } from "./base/IDbEntity";

export class Task extends IDbEntity {
    public guid: string;
    public apiKey: string;

    constructor(obj: any) {
        super();
        if (obj) {
            this.parse(obj);
        }
    }

    public parse(obj: any) {
        this.guid       = obj.guid;
        this.apiKey     = obj.apiKey;
    }

    public toJSON() {
        let result: any = {
            guid:       this.guid,
            apiKey:     this.apiKey,
        };

        return this.dropNulls(result);
    }

    public get filter(): any {
        return {
            guid:       this.guid
        }
    }
}