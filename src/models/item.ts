import { Category } from './category';
import { BaseModel } from './base';

export class Item extends BaseModel {

  _id?: string
  _rev?: string
  title: string
  description: string

  category_id: string
  category: Category = new Category

  constructor() {
    super()
  }

  static get tableName() { return 'items' }

  static fromDoc(doc:any): Item {
    const item = new Item()
    item._id = doc._id
    item._rev = doc._rev
    item.title = doc.title
    item.description = doc.description
    item.category_id = doc.category_id

    return item;
  }

}