import { NgZone } from '@angular/core';

import { BaseCollection } from './base';

import { Databases } from '../types/databases'

import { Category } from '../models/category';

//export type CategoryChange = PouchDB.Core.ChangesResponseChange<Category>;

export class CategoriesCollection extends BaseCollection {


  constructor(dbs: Databases, zone: NgZone) {
    super(dbs, 'CategoryDB', zone);
  }

  add(category: Category) {
    category._id = new Date().getTime() + '_' + Math.floor(Math.random() * 10000)
    this.dbs.CategoryDB.post(category);
  }

  remove(category: Category) {
    this.dbs.CategoryDB.remove(category._id, category._rev);
  }

  update(category: Category) {
    this.dbs.CategoryDB.put(category);
  }

  // populate(category: Category, model: string) {
  //   switch (model) {
  //     case 'items':
  //       this.dbs.items().find(item.category_id).then((cat: any) =>  item.category = cat)
  //       return category

  //     default:
  //       return category
  //   }
  // }





}
