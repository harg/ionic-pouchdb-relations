import { NgZone } from '@angular/core';

import { BaseCollection } from './base';

import { Databases } from '../types/databases'

import { Category } from '../models/category';

export class CategoriesCollection extends BaseCollection<Category> {

  constructor(dbs: Databases, zone: NgZone) {
    super(dbs, zone);
  }

  get name() { return 'categories' }

  add(category: Category) {
    category._id = new Date().getTime() + '_' + Math.floor(Math.random() * 10000)
    this.db.post(category);
  }

  remove(category: Category) {
    this.db.remove(category._id, category._rev);
  }

  update(category: Category) {
    this.db.put(category);
  }


}
