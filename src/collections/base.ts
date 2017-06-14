import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { File } from '@ionic-native/file';
import { BaseModel } from '../models/base';

import { Databases } from '../types/databases'

import * as PouchDB from 'pouchdb';
import * as replicationStream from 'pouchdb-replication-stream';
var MemoryStream = require('memorystream');

PouchDB.plugin(replicationStream.plugin);
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream);

export abstract class BaseCollection<T extends BaseModel> {

  protected dbs: Databases;
  protected zone: NgZone;
  //protected db_name: string;

  private static _filePlugin: File = null;

  constructor(dbs: Databases, /*db_name: string,*/ zone: NgZone) {
    this.dbs = dbs;
    this.zone = zone;
    //this.db_name = db_name;
  }

  abstract get name();

  static get filePlugin() : File {
    if(this._filePlugin == null) {
      this._filePlugin = new File();
    }
    return this._filePlugin;
  }

  protected get db() {
    return this.dbs.getDatabase<T>(this.name); // [this.db_name];
  }

  findAll(): Promise<T[]> {
    return this.db.allDocs({ include_docs: true })
      .then(docs => docs.rows.map(row => row.doc));
  }

  findByID(id: string) {
    return this.db.get(id)
      .then(doc => doc);
  }

  async dump() {
    var dumpedString = '';
    var stream = new MemoryStream();
    stream.on('data', function(chunk) {
      dumpedString += chunk.toString();
    });

    await this.db.dump(stream);
    return dumpedString;
  }

  async dumpToFile(filename: string): Promise<string>  {
    let data = await this.dump();
    const DUMPS_DIR = 'dumps/';
    let root = BaseCollection.filePlugin.externalApplicationStorageDirectory;

    let dump_path: string;
    let file_path: string;

    return BaseCollection.filePlugin.resolveDirectoryUrl(root)
      .then(dirEntry => {
        return BaseCollection.filePlugin.getDirectory(dirEntry, DUMPS_DIR, { create: true });
      })
      .then(dirEntry => {
        dump_path = dirEntry.nativeURL;
        return BaseCollection.filePlugin.createFile(dirEntry.nativeURL, filename, true);
      })
      .then(fileEntry => {
        file_path = fileEntry.nativeURL;
        return BaseCollection.filePlugin.writeExistingFile(dump_path, filename, data)
      })
      .then(() =>{
        console.log(`File wrote : ${file_path}`)
        return file_path

      })
      .catch(err => { return err.message; });
  }


  changes() {
    return new Observable<void>((subscriber: Subscriber<void>) => {
      this.db.changes({ live: true, since: 'now' })
      .on('change', (change) => { this.zone.run(() => { subscriber.next(); }); });
    });
  }

}