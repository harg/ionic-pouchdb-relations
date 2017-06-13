import { Injectable, NgZone } from '@angular/core'
import { File } from '@ionic-native/file';

import { Databases } from '../types/databases'

import { Item } from '../models/item'
import { Category } from '../models/category'

import { CategoriesCollection } from '../collections/categories'
import { ItemsCollection } from '../collections/items'

import * as PouchDB from 'pouchdb'
import * as PouchDBFind from 'pouchdb-find'
PouchDB.plugin(PouchDBFind)

import * as JSZip from 'jszip';
var MemoryStream = require('memorystream');

import { FileUtils } from '../helpers/file-utils';

@Injectable()
export class DbService {

  private _databases: Databases = {
    itemDB: new PouchDB<Item>('items'),
    CategoryDB: new PouchDB<Category>('categories'),
  }

  public static DUMPS_DIR = 'dumps/';

  private _categories: CategoriesCollection
  private _items: ItemsCollection

  constructor(private zone: NgZone, private filePlugin: File) {
    this._categories = new CategoriesCollection(this._databases, this.zone)
    this._items = new ItemsCollection(this._databases, this.zone);
  }

  categoriesCollection() {
    return this._categories
  }

  itemsCollection() {
    return this._items
  }

  async dump() {
    return Promise.all([
      this._categories.dumpToFile('categories'),
      this._items.dumpToFile('items')
    ]).then(paths => paths);
  }

  async dumpAllToFiles() {
    let paths = await this.dump();
    //console.log(paths);
    var zip = new JSZip();
    let data;

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

  importArchive(dir: string, zip_file: string) {
    let root = this.filePlugin.externalApplicationStorageDirectory;
    this.filePlugin.resolveDirectoryUrl(root)
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
      .then(zip => {
        return Promise.all([
          zip.file('items').async("string"),
          zip.file('categories').async("string")
        ]).then(_ => _)
      })
      .then(contents => {
        for (let content of contents){
          console.log(content);
          let stream = new MemoryStream(content);
          if(content.indexOf('items') > -1){
            console.log('load items')
            this._databases.itemDB.destroy();
            this._databases.itemDB.load(stream).then(res => console.log(res));
          }
          if(content.indexOf('categories') > -1){
            this._databases.CategoryDB.destroy()
            .then(_ => {
              return this._databases.CategoryDB.load(stream)
            })
            .then(res => console.log("result = " + res));
          }
        }
      })
      .catch(err => { console.log(err.message); return 'Error!' });
  }

}
