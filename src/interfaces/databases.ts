import * as PouchDB from 'pouchdb';

import { Category } from '../models/category';
import { Item } from '../models/item';

export interface Databases {
  items :   PouchDB.Database<Item>
  categories :  PouchDB.Database<Category>
}