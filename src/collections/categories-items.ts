import { NgZone } from '@angular/core';

import { BaseCollection } from './base';
import { IDatabases } from '../types/databases'

import { CategoryItem } from '../models/category-item';

export class CategoriesItemsCollection extends BaseCollection<CategoryItem> {

  constructor(dbService, zone: NgZone) {
    super(dbService, zone);
  }

  get name() { return 'categories_items' }

  findByCategoryId(category_id: string) {
    return this.dbService.getDatabase<CategoryItem>('categories_items').find({
      selector: {
        category_id: category_id
      }
    })
    .then(findResponse => findResponse.docs.map(doc => <CategoryItem>doc));
  }

  findByItemId(item_id: string) {
    return this.dbService.getDatabase<CategoryItem>('categories_items').find({
      selector: {
        item_id: item_id
      }
    })
    .then(findResponse => findResponse.docs.map(doc => <CategoryItem>doc));
  }


}