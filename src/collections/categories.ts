import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

import { Databases } from '../types/databases'

import { Category } from '../models/category';

//export type CategoryChange = PouchDB.Core.ChangesResponseChange<Category>;

//@Injectable()
export class CategoriesCollection {


  constructor(private dbs: Databases, private zone: NgZone) {
    //this.db.sync('http://localhost:5984/categories', { live: true, retry: false });
  }

  findAll() {
    return this.dbs.CategoryDB.allDocs({ include_docs: true }).then(docs => docs.rows.map(row => row.doc));
  }

  find(id: string) {
    return this.dbs.CategoryDB.get(id).then(doc => doc);
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

  changes() {
    return new Observable<void>((subscriber: Subscriber<void>) => {
      this.dbs.CategoryDB.changes({ live: true, since: 'now' })
      .on('change', (change) => { this.zone.run(() => { subscriber.next(); }); });
    });
  }

}
