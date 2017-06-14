import { NgZone } from '@angular/core';

import { BaseCollection } from './base';
import { Databases } from '../types/databases'

import { Item } from '../models/item';
import { Category } from '../models/category';

export class ItemsCollection extends BaseCollection<Item> {

  constructor(dbs: Databases, zone: NgZone) {
    super(dbs, zone);
  }

  get name() { return 'items' }

  findByCategoryId(category_id: string) {
    return this.dbs.getDatabase<Item>('items').find({
      selector: {
        category_id: category_id
      }
    }).then(findResponse => findResponse.docs.map(doc => Item.fromDoc(doc)));
  }

  add(item: Item) {
    this.db.post(item);
  }

  remove(item: Item) {
    this.db.remove(item._id, item._rev);
  }

  update(item: Item) {
    this.db.put(item);
  }

  populateRelationships(items: Item[]){
      items.forEach((item, i) => {
         this.dbs.getDatabase<Category>('categories').get(item.category_id)
         .then(category => item.category = category)
     })
     return items
  }


}