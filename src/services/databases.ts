import { Injectable, NgZone } from '@angular/core'

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
      itemDB : new PouchDB<Item>('items'),
      CategoryDB : new PouchDB<Category>('categories'),
    }

 private _categories: CategoriesCollection
 private _items: ItemsCollection

  constructor(private zone: NgZone) {
    this._categories = new CategoriesCollection(this._databases, this.zone)
    this._items = new ItemsCollection(this._databases, this.zone)
  }

  categoriesCollection() {
      return this._categories
  }

  itemsCollection() {
      return this._items
  }


}