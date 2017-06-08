import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Item } from '../models/item';
import { CategoriesService} from './categories'

import * as PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find'
PouchDB.plugin(PouchDBFind)


//export type ItemChange = PouchDB.Core.ChangesResponseChange<Item>;

@Injectable()
export class ItemsService {

  private db = new PouchDB<Item>('items');

  constructor(private zone: NgZone, public categoriesService: CategoriesService) {
    //this.db.sync('http://localhost:5984/items', { live: true, retry: false });
  }

  findAll() {
    return this.db.allDocs({ include_docs: true }).then(docs => docs.rows.map(row => Item.fromDoc(row.doc)));
  }

  findAllPopulated() {
    return this.db.allDocs({ include_docs: true }).then(docs => docs.rows.map(row => Item.fromDoc(row.doc).populate('category', this)));
  }

  findByCategoryId(category_id: string) {
    return this.db.find({
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

  populateRelationships(pItems: Promise<Item[]>){
    return pItems

    .then((items) => {
      items.forEach((item, i) => {
         this.categoriesService.find(item.category_id).then(category => item.category = category)
     })
     return items
    })

    // other populate
    // .then(items => {
    //   // mutate items
    //   return items
    // })
  }

  changes() {
    return new Observable<void>((subscriber: Subscriber<void>) => {
      this.db.changes({ live: true, since: 'now' })
      .on('change', (change) => { this.zone.run(() => { subscriber.next(); }); });
    });
  }

}