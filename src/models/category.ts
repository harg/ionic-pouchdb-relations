// export interface Category {
//   _id?: string,
//   _rev?: string,
//   title: string,
//   description: string
// }

import { Item } from './item';

export class Category {

  _id?: string
  _rev?: string
  title: string
  description: string

  items: Item[]

  constructor(){
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