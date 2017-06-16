import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { File } from '@ionic-native/file';
import { BaseModel } from '../models/base';

import { IDatabases } from '../types/databases'
import { DbService } from '../services/databases'

import * as PouchDB from 'pouchdb';
import * as replicationStream from 'pouchdb-replication-stream';
var MemoryStream = require('memorystream');

PouchDB.plugin(replicationStream.plugin);
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream);

export abstract class BaseCollection<T extends BaseModel> {

  protected dbService: DbService;
  protected zone: NgZone;
  private _no_events = false;
  private perpage: number = 50;

  // TODO utiliser helper FileUtils
  private static _filePlugin: File = null;

  constructor(dbService: DbService, zone: NgZone) {
    this.dbService = dbService;
    this.zone = zone;
  }

  /**
   * retourne le nom de la collection
   */
  abstract get name();

  static get filePlugin() : File {
    if(this._filePlugin == null) {
      this._filePlugin = new File();
    }
    return this._filePlugin;
  }

  addBulk(items: T[]): Promise<any> {
    return this.db.bulkDocs(items.map(item => <T>item.toDoc()));
  }

  add(item: T) {
    if(item.toDoc)
      this.db.post(<T>item.toDoc());
    else
      this.db.post(item);
  }

  remove(item: T) {
    this.db.remove(item._id, item._rev);
  }

  update(item: T) {
    if(item.toDoc)
      this.db.put(<T>item.toDoc());
    else
      this.db.put(item);
  }

  disableEvents() {
    this._no_events = true;
  }

  restoreEvents() {
    this._no_events = false;
  }

  /**
   * retourne la database pour cette collection
   */
  protected get db() {
    return this.dbService.getDatabase<T>(this.name);
  }

  /**
   * renvois tous les éléments de la collection
   */
  findAll(): Promise<T[]> {
    return this.db.allDocs({ include_docs: true})
    .then(docs => docs.rows.map(row => row.doc));
  }

  findAllPerPage(page: number = 1): Promise<T[]> {
    return this.db.allDocs({
      include_docs: true,
      limit: this.perpage,
      skip: page * this.perpage
    })
    .then(docs => docs.rows.map(row => row.doc));
  }

  /**
   * renvois l'élément de la collection par son identifiant
   * null si non trouvé
   * @param id identifiant
   */
  findByID(id: string): Promise<T> {
    return this.db.get(id)
      .then(doc => doc);
  }

  public async toJson(): Promise<string>{
    let docs = await this.findAll();
    // return JSON.stringify(docs.map(doc => (<BaseModel>doc).toJson()));
    return JSON.stringify(docs.map(doc => JSON.stringify(doc)));
  }

  /**
   * renvois le dump du contenu de la base en string
   */
  async dump(): Promise<string> {
    console.log('dump begin')
    var dumpedString = '';
    var stream = new MemoryStream();
    stream.on('data', function(chunk) {
      dumpedString += chunk.toString();
    });
    await this.db.dump(stream);
    console.log('dump to end')
    return dumpedString;
  }

  /**
   * Crée un fichier avec le dump de la base sous forme d'une string
   * renvois le chemin natif du fichier
   * @param filename le nom du fichier
   */
  async dumpToFile(filename: string): Promise<string>  {
    console.log('dump to file')
    let data = await this.toJson(); // this.dump();
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

  /**
   * notifie les modifications de la collection aux observers
   */
  changes() {
    return new Observable<void>((subscriber: Subscriber<void>) => {
      this.db.changes({ live: true, since: 'now' })
        .on('change', (change) => {
          if(!this._no_events)
            this.zone.run(() => {
              console.log('collection changed')
              subscriber.next();
            });
        });
    });
  }

}