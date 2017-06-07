// export interface Item {
//   _id?: string,
//   _rev?: string,
//   title: string,
//   description: string,

//   category_id: string
// }

import { Category } from './category';

export class Item {

  _id?: string
  _rev?: string
  title: string
  description: string

  category_id: string
  category: Promise<Category>

  constructor(){
  }

  log() {
    console.log(this.title, this.description);
  }

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