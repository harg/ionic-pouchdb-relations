import * as PouchDB from 'pouchdb';

import { Category } from '../models/category';
import { Item } from '../models/item';

export type Databases = {
  itemDB :   PouchDB.Database<Item>
  CategoryDB :  PouchDB.Database<Category>
}