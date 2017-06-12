import { NgZone } from '@angular/core';

import { BaseCollection } from './base';
import { Databases } from '../types/databases'

import { Item } from '../models/item';

//export type ItemChange = PouchDB.Core.ChangesResponseChange<Item>;

export class ItemsCollection extends BaseCollection {


  constructor(dbs: Databases, zone: NgZone) {
    super(dbs, 'itemDB', zone);
  }

  // findAllPopulated() {
  //   return this.db.allDocs({ include_docs: true }).then(docs => docs.rows.map(row => Item.fromDoc(row.doc)/*.populate('category', this)*/));
  // }

  findByCategoryId(category_id: string) {
    return this.dbs.itemDB.find({
      selector: {
        category_id: category_id
      }
    }).then(findResponse => findResponse.docs.map(doc => Item.fromDoc(doc)));
  }

  add(item: Item) {
    this.dbs.itemDB.post(item);
  }

  remove(item: Item) {
    this.dbs.itemDB.remove(item._id, item._rev);
  }

  update(item: Item) {
    this.dbs.itemDB.put(item);
  }

  populateRelationships(items: Item[]){
    // return pItems

    // .then((items) => {
      items.forEach((item, i) => {
         this.dbs.CategoryDB.get(item.category_id).then(category => item.category = category)
     })
     return items
    // })

    // other populate
    // .then(items => {
    //   // mutate items
    //   return items
    // })
  }


}