import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Item } from '../models/item';
import * as PouchDB from 'pouchdb';

export type ItemChange = PouchDB.Core.ChangesResponseChange<Item>;

@Injectable()
export class ItemsService {

  private db = new PouchDB<Item>('items');

  constructor(private zone: NgZone) {
    //this.db.sync('http://localhost:5984/items', { live: true, retry: false });
  }

  findAll() {
    return this.db.allDocs({ include_docs: true }).then(docs => docs.rows.map(row => row.doc));
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

  changes() {
    return new Observable<void>((subscriber: Subscriber<void>) => {
      this.db.changes({ live: true, since: 'now' })
      .on('change', (change) => { this.zone.run(() => { subscriber.next(); }); });
    });
  }

}
