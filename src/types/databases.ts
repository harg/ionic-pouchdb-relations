import * as PouchDB from 'pouchdb';

import { BaseCollection } from '../collections/base';

export interface Databases {
  newDatabase<T>(name: string): PouchDB.Database<T>
  getDatabase<T>(name: string): PouchDB.Database<T>
  getCollection<T>(name: string): BaseCollection<T>
}