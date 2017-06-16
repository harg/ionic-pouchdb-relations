import * as PouchDB from 'pouchdb';

import { BaseCollection } from '../collections/base';
import { BaseModel } from '../models/base';

export interface IDatabases {
  /**
   * Permet de créer une nouvelle instance de base de données
   */
  newDatabase<T>(name: string): PouchDB.Database<T>

  /**
   * renvois la base de données par son nom
   */
  getDatabase<T>(name: string): PouchDB.Database<T>

  /**
   * renvois une collection par son nom
   */
  getCollection<T extends BaseModel>(name: string): BaseCollection<T>

}