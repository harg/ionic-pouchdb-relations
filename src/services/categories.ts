import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Category } from '../models/category';
import * as PouchDB from 'pouchdb';

export type CategoryChange = PouchDB.Core.ChangesResponseChange<Category>;

@Injectable()
export class CategoriesService {

  private db = new PouchDB<Category>('categories');

  constructor(private zone: NgZone) {
    //this.db.sync('http://localhost:5984/categories', { live: true, retry: false });
  }

  findAll() {
    return this.db.allDocs({ include_docs: true }).then(docs => docs.rows.map(row => row.doc));
  }

  find(id: string) {
    return this.db.get(id).then(doc => doc);
  }

  add(category: Category) {
    this.db.post(category);
  }

  remove(category: Category) {
    this.db.remove(category._id, category._rev);
  }

  update(category: Category) {
    this.db.put(category);
  }

  changes() {
    return new Observable<void>((subscriber: Subscriber<void>) => {
      this.db.changes({ live: true, since: 'now' })
      .on('change', (change) => { this.zone.run(() => { subscriber.next(); }); });
    });
  }

}
