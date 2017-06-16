import { NgZone } from '@angular/core';

import { BaseCollection } from './base';

import { IDatabases } from '../types/databases'

import { Category } from '../models/category';

export class CategoriesCollection extends BaseCollection<Category> {

  constructor(dbService, zone: NgZone) {
    super(dbService, zone);
  }

  get name() { return 'categories' }

}
