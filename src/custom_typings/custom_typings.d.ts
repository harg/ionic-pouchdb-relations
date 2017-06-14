declare namespace PouchDB {
    interface Database<Content extends Core.Encodable> {
        dump(stream: any, opt?: any): Promise<any>;
        load(stream: any): Promise<any>;
        loadIt(urlOrString, options?, callback?);
    }
    interface Static {
        adapter(any: any, any2: any): any
        plugin(any: any): any
    }
}

declare module 'pouchdb-replication-stream' {
    const pouchdb_replication_stream: {
        adapters: any
        plugin: any
    };
    export = pouchdb_replication_stream;
}