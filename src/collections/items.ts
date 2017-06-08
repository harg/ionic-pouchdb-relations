import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

import { Databases } from '../types/databases'

import { Item } from '../models/item';

//export type ItemChange = PouchDB.Core.ChangesResponseChange<Item>;

export class ItemsCollection {


  constructor(private dbs: Databases, private zone: NgZone) {
    //this.db.sync('http://localhost:5984/items', { live: true, retry: false });
  }

  findAll() {
    return this.dbs.itemDB.allDocs({ include_docs: true }).then(docs => docs.rows.map(row => Item.fromDoc(row.doc)));
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

  changes() {
    return new Observable<void>((subscriber: Subscriber<void>) => {
      this.dbs.itemDB.changes({ live: true, since: 'now' })
      .on('change', (change) => { this.zone.run(() => { subscriber.next(); }); });
    });
  }

}