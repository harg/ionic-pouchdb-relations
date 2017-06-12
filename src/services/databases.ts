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

@Injectable()
export class DbService {

  private _databases: Databases = {
    itemDB: new PouchDB<Item>('items'),
    CategoryDB: new PouchDB<Category>('categories'),
  }

  private _categories: CategoriesCollection
  private _items: ItemsCollection

  constructor(private zone: NgZone, private filePlugin: File) {
    this._categories = new CategoriesCollection(this._databases, this.zone)
    this._items = new ItemsCollection(this._databases, this.zone)
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
    console.log(paths);
  }

}
