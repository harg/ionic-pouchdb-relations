import { Item } from './item';
import { BaseModel } from './base';

export class Category extends BaseModel {

  _id?: string
  _rev?: string
  title: string
  description: string

  items: Item[]

  constructor() {
    super();
  }

  static fromDoc(doc:any): Category {
    const category = new Category()
    category._id = doc._id
    category._rev = doc._rev
    category.title = doc.title
    category.description = doc.description

    return category;
  }

}