import { Injectable, NgZone } from '@angular/core'

import { IDatabases } from '../types/databases'

import { BaseModel } from '../models/base'
import { Item } from '../models/item'
import { Category } from '../models/category'
import { CategoryItem } from '../models/category-item';

import { CategoriesCollection } from '../collections/categories'
import { ItemsCollection } from '../collections/items'
import { CategoriesItemsCollection } from '../collections/categories-items'

import * as PouchDB from 'pouchdb'
import * as PouchDBFind from 'pouchdb-find'
PouchDB.plugin(PouchDBFind)
import * as PouchDBLoad from 'pouchdb-load';
PouchDB.plugin({
  loadIt: PouchDBLoad.load
});

import * as JSZip from 'jszip';

import { FileUtils } from '../helpers/file-utils';
import { BaseCollection } from '../collections/base';

@Injectable()
export class DbService implements IDatabases {

  public static DUMPS_DIR = 'dumps/';

  private _db_names = ['items', 'categories', 'categories_items'];

  private _databases: PouchDB.Database<BaseModel>[] = [];

  private _collections: BaseCollection<any>[] = [];

  constructor(private zone: NgZone) {

    this._initDatabases();

    this._collections['categories'] = new CategoriesCollection(this, this.zone);
    this._collections['items'] = new ItemsCollection(this, this.zone);
    this._collections['categories_items'] = new CategoriesItemsCollection(this, this.zone);

    //this._initData()
  }

  private async _initData() {
    console.log('init data')
    let items = []; //this.itemsCollection;
    let categories = []; //this.categoriesCollection;
    console.log('begin init data')
    //items.disableEvents();
    //categories.disableEvents();
    try {
      for(let i = 1; i < 2000; i++){
        console.log('idx = ' + i);
        let item = new Item();
        item.title = 'Item #' + i;
        items.push(item);
        let cat = new Category();
        cat.title = 'Category #' + i;
        categories.push(cat);
      }
      console.log('end init data')
    }
    finally
    {
      //items.restoreEvents();
      //categories.restoreEvents();
      this.itemsCollection.addBulk(items);
      this.categoriesCollection.addBulk(categories);
    }

  }

  private _initDatabases() {
    this._db_names.forEach(db_name => {
      console.log('init database ' + db_name);
      this._databases[db_name] = this.newDatabase<BaseModel>(db_name);
    });
  }

  /**
   * Création d'une nouvelle base de données
   * @param name le nom de la base de données
   */
  public newDatabase<T>(name: string): PouchDB.Database<T> {
    if(this._db_names.indexOf(name) > -1)
      return new PouchDB<T>(name);
    else
      throw new Error('error')
  }

  /**
   * Retourne l'instance de la base de données par son nom
   * @param name le nom de la base de données
   */
  public getDatabase<T extends BaseModel>(name: string): PouchDB.Database<T> {
    if(this._db_names.indexOf(name) > -1)
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

  get categoriesItemsCollection(): CategoriesItemsCollection {
    return <CategoriesItemsCollection>this.getCollection<CategoryItem>('categories_items');
  }

  async dump() {
    return Promise.all([
      this.categoriesCollection.dumpToFile('categories'),
      this.itemsCollection.dumpToFile('items'),
      this.categoriesItemsCollection.dumpToFile('categories_items')
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
      //console.log(content);
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
      return FileUtils.saveFile(DbService.DUMPS_DIR, 'dump.zip', blob);
    });
  }

  public loadArchive(dir: string, zip_file): Promise<JSZip>{
    return FileUtils.loadFileAsBinaryString(dir, zip_file)
      .then(zip_content => {
        let archive = new JSZip();
        return archive.loadAsync(zip_content)
      });
  }

  public destroyAndLoadDatabase(obj_content): Promise<any> {
    let db_name = obj_content.db_name;
    if(db_name != 'ERROR') {
      let db = this.getDatabase<BaseModel>(db_name);
      return db.destroy()
      .then( _ => {
        console.log("création de la db " + db_name);
        const new_db = this.newDatabase<BaseModel>(db_name);
        //return new_db.loadIt(obj_content.content);
        return new_db.bulkDocs(
          JSON.parse(obj_content.content).map(doc => {
            let o = JSON.parse(doc);
            delete o._rev;
            return o;
          })
        );
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
      return Promise.all(obj_contents.map(obj_content =>
        this.destroyAndLoadDatabase(obj_content)))
    })
    .catch(err => { console.log(err.message); return 'ERROR' });
  }

}
