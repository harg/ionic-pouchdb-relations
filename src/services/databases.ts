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

  private _databases = {
    categories: new PouchDB<Category>('categories'),
    items: new PouchDB<Category>('items')
  };

  private _collections: BaseCollection<any>[] = [];

  constructor(private zone: NgZone, private filePlugin: File) {
    this._collections['categories'] = new CategoriesCollection(this, this.zone);
    this._collections['items'] = new ItemsCollection(this, this.zone);
  }

  public newDatabase<T>(name: string): PouchDB.Database<T> {
    if(this._databases[name] != undefined)
      return new PouchDB<T>(name);
    else
      throw new Error('error')
  }


  public getDatabase<T extends BaseModel>(name: string): PouchDB.Database<T> {
    if(this._databases[name] != undefined)
      return <PouchDB.Database<T>>this._databases[name];
    else
      throw new Error('error')
  }

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
        console.log('getDirectory')
        return this.filePlugin.getDirectory(dirEntry, DbService.DUMPS_DIR, { create: false });
      })
      .then(dirEntry => {
        console.log('getFile')
        return this.filePlugin.getFile(dirEntry, zip_file, { create: false });
      })
      .then(fileEntry => {
        console.log('readAsBinary')
        return this.filePlugin.readAsBinaryString(root + dir, zip_file);
      })
      .then(zip_content => {
        let archive = new JSZip();
        return archive.loadAsync(zip_content)
      })
  }



  getDatabaseName(dump_data: string): string {
    const regex = /"db_name":"(\w+)"/;
    let m = regex.exec(dump_data);
    if (m !== null) {
      return m[1];
    }
    return 'ERROR';
  }

  public destroyAndLoadDatabase(content): Promise<any> {
    let db_name = this.getDatabaseName(content);
    if(db_name != 'ERROR') {
      let db = this.getDatabase<BaseModel>(db_name);
      return db.destroy()
      .then( _ => {
        const new_db = this.newDatabase<BaseModel>(db_name);
        return new_db.loadIt(content);
      })
    } else {
      return Promise.reject('invalid database name');
    }
  }

  importArchive(dir: string, zip_file: string) {
      this.loadArchive(dir, zip_file)
      .then(zip => {
        return Promise.all([
          zip.file('items').async("string"),
          zip.file('categories').async("string")
        ])//.then(_ => _)
      })
      .then(contents => {
        return Promise.all(contents.map(content => this.destroyAndLoadDatabase(content)))
      })
      .then(_ => document.location.reload())

        // for (let content of contents) {
        //   let db_name = this.getDatabaseName(content);
        //   if(db_name != 'ERROR') {
        //     let db = this.getDatabase<BaseModel>(db_name);
        //     db.destroy()
        //     .then( _ => {
        //       const new_db = this.newDatabase<BaseModel>(db_name);
        //       return new_db.loadIt(content);
        //     })
        //     .then(() => {
        //       console.log(`${db_name} loaded`)
        //       document.location.reload();
        //     })
        //   }

        //   /*console.log(content);
        //   let stream = new MemoryStream(content);
        //   if(content.indexOf('items') > -1){
        //     this._databases.itemDB.destroy()
        //     .then(()=> {
        //       const db = new PouchDB<Item>('items');
        //       this._databases.itemDB = db;
        //       return db.loadIt(content)
        //     })
        //     .then(() => {
        //       console.log("items loaded")
        //       return this._databases.itemDB.allDocs({ include_docs: true })
        //     })
        //     .then(docs => console.dir(docs.rows.map(row => Item.fromDoc(row.doc))))
        //     .catch(err => { console.log(err.message); return 'Error!' });
        //   }
        //   if(content.indexOf('categories') > -1){
        //     // this._databases.CategoryDB.destroy()
        //     // .then(_ => {
        //     //   const CategoryDB = new PouchDB<Category>('categories');
        //     //   return CategoryDB.load(stream)
        //     // })
        //     this._databases.CategoryDB.destroy()
        //     .then(()=> {
        //       const db = new PouchDB<Category>('categories');
        //       this._databases.CategoryDB = db;
        //       return db.loadIt(content)
        //     })
        //     .then(() => {
        //       console.log("categories loaded")
        //       return this._databases.CategoryDB.allDocs({ include_docs: true })
        //     })
        //   }*/
        // }
      // })
      .catch(err => { console.log(err.message); return 'ERROR' });
  }

}
