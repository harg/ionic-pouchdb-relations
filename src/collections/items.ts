import { NgZone } from '@angular/core';

import { BaseCollection } from './base';
import { IDatabases } from '../types/databases'
import { CategoryItem } from '../models/category-item';
import { Item } from '../models/item';
import { Category } from '../models/category';

export class ItemsCollection extends BaseCollection<Item> {

  constructor(dbService, zone: NgZone) {
    super(dbService, zone);
  }

  get name() { return 'items' }

  findByCategoryId(category_id: string) {
    return this.dbService.getDatabase<Item>('items').find({
      selector: {
        category_id: category_id
      }
    })
    .then(findResponse => findResponse.docs.map(doc => <Item>doc));
  }

  populateRelationships(items: Item[]){
    for(let item of items) {
        this.dbService.categoriesItemsCollection.findByItemId(item._id)
      .then(category_item_list => {
        return category_item_list.map(category_item => category_item.category_id)
      })
      .then(category_ids => {
        return Promise.all(category_ids.map(category_id => this.dbService.categoriesCollection.findByID(category_id) ))
      })
      .then(categories => item.categories = categories)
    }
    return items
  }


}