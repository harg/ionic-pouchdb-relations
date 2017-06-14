import { Injectable, NgZone } from '@angular/core'
import { File } from '@ionic-native/file';

import { Databases } from '../types/databases'

import { Item } from '../models/item'
import { Category } from '../models/category'
import { BaseModel } from '../models/base'

import { CategoriesCollection } from '../collections/categories'
import { ItemsCollection } from '../collections/items'

import * as PouchDB from 'pouchdb'
import * as PouchDBFind from 'pouchdb-find'
PouchDB.plugin(PouchDBFind)
import * as PouchDBLoad from 'pouchdb-load';
PouchDB.plugin({
  loadIt: PouchDBLoad.load
});

import * as JSZip from 'jszip';
var MemoryStream = require('memorystream');

import { FileUtils } from '../helpers/file-utils';
import { BaseCollection } from '../collections/base';

@Injectable()
export class DbService implements Databases {

  public static DUMPS_DIR = 'dumps/';

  private _db_names = ['items', 'categories'];

  private _databases = {
    categories: new PouchDB<Category>('categories'),
    items: new PouchDB<Item>('items')
  };

  private _collections: BaseCollection<any>[] = [];

  constructor(private zone: NgZone, private filePlugin: File) {
    this._collections['categories'] = new CategoriesCollection(this, this.zone);
    this._collections['items'] = new ItemsCollection(this, this.zone);
  }

  /**
   * Création d'une nouvelle base de données
   * @param name le nom de la base de données
   */
  public newDatabase<T>(name: string): PouchDB.Database<T> {
    if(this._databases[name] != undefined)
      return new PouchDB<T>(name);
    else
      throw new Error('error')
  }

  /**
   * Retourne l'instance de la base de données par son nom
   * @param name le nom de la base de données
   */
  public getDatabase<T extends BaseModel>(name: string): PouchDB.Database<T> {
    if(this._databases[name] != undefined)
      return <PouchDB.Database<T>>this._databases[name];
    else
      throw new Error('error')
  }

  /**
   *
   * @param name
   */
  public getCollection<T extends BaseModel>(name: string): BaseCollection<T> {
    if(this._collections[name] != undefined)
      return <BaseCollection<T>>this._collections[name];
    else
      throw new Error('error')
  }

  get allCollections(): BaseCollection<any>[] {
    return this._collections
  }

  get categoriesCollection(): CategoriesCollection {
    return <CategoriesCollection>this.getCollection<Category>('categories');
  }

  get itemsCollection(): ItemsCollection {
    return <ItemsCollection>this.getCollection<Item>('items');
  }

  async dump() {
    return Promise.all([
      this.categoriesCollection.dumpToFile('categories'),
      this.itemsCollection.dumpToFile('items')
    ]).then(paths => paths);
  }

  async dumpAllToFiles() {
    let paths = await this.dump();
    //console.log(paths);
    var zip = new JSZip();

    // marche pas
    // paths.forEach(path => {
    //   var filename = path.replace(/.*\//g, "");
    //   FileUtils.getFileContent(path).then(content => {
    //     console.log(content);
    //     zip.file(filename, content, { binary: true });
    //   })
    // });

    // marche
    // await Promise.all(paths.map(path => {
    //   let filename = path.replace(/.*\//g, "");
    //   return FileUtils.getFileContent(path).then(content => {
    //     console.log(content);
    //     return zip.file(filename, content, { binary: true });
    //   })
    // })
    // )

    // marche
    // for(let i = 0; i < paths.length; i++){
    //   let content = await FileUtils.getFileContent(paths[i]);
    //   console.log(content);
    //   var filename = paths[i].replace(/.*\//g, "");
    //   zip.file(filename, content, { binary: true });
    // }

    // marche
    for (let path of paths) {
      let content = await FileUtils.getFileContent(path);
      console.log(content);
      var filename = path.replace(/.*\//g, "");
      zip.file(filename, content, { binary: true });
    }

    zip.generateAsync({ type: "blob" }, metadata => {
      var msg = "progression : " + metadata.percent.toFixed(2) + " %";
      if (metadata.currentFile) {
        msg += ", current file = " + metadata.currentFile;
      }
      console.log(msg);
    })
      .then(blob => {
        let root = this.filePlugin.externalApplicationStorageDirectory;
        let filename = 'dump.zip';
        let dump_path: string;
        let file_path: string;

        this.filePlugin.resolveDirectoryUrl(root)
          .then(dirEntry => {
            return this.filePlugin.getDirectory(dirEntry, DbService.DUMPS_DIR, { create: true });
          })
          .then(dirEntry => {
            dump_path = dirEntry.nativeURL;
            return this.filePlugin.createFile(dirEntry.nativeURL, filename, true);
          })
          .then(fileEntry => {
            file_path = fileEntry.nativeURL;
            return this.filePlugin.writeExistingFile(dump_path, filename, blob)
          })
          .then(() => {
            console.log(`File wrote : ${file_path}`)
            return file_path

          })
          .catch(err => { console.log(err.message); return 'Error!' });
      });
  }

  public loadArchive(dir: string, zip_file): Promise<JSZip>{
    let root = this.filePlugin.externalApplicationStorageDirectory;
    return this.filePlugin.resolveDirectoryUrl(root)
      .then(dirEntry => {
        return this.filePlugin.getDirectory(dirEntry, DbService.DUMPS_DIR, { create: false });
      })
      .then(dirEntry => {
        return this.filePlugin.getFile(dirEntry, zip_file, { create: false });
      })
      .then(fileEntry => {
        return this.filePlugin.readAsBinaryString(root + dir, zip_file);
      })
      .then(zip_content => {
        let archive = new JSZip();
        return archive.loadAsync(zip_content)
      })
  }

  public destroyAndLoadDatabase(obj_content): Promise<any> {
    let db_name = obj_content.db_name;
    if(db_name != 'ERROR') {
      let db = this.getDatabase<BaseModel>(db_name);
      return db.destroy()
      .then( _ => {
        const new_db = this.newDatabase<BaseModel>(db_name);
        return new_db.loadIt(obj_content.content);
      })
    } else {
      return Promise.reject('invalid database name');
    }
  }

  importArchive(dir: string, zip_file: string) {
      return this.loadArchive(dir, zip_file)
      .then(zip => {
        return Promise.all(this._db_names.map(
          db_name => zip.file(db_name).async("string")
          .then(content => {
            return { db_name: db_name, content: content}
          })
        )
      )})
      .then(obj_contents => {
        return Promise.all(obj_contents.map(obj_content => this.destroyAndLoadDatabase(obj_content)))
      })
      .catch(err => { console.log(err.message); return 'ERROR' });
  }

}
