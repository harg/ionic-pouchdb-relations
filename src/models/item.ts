// export interface Item {
//   _id?: string,
//   _rev?: string,
//   title: string,
//   description: string,

//   category_id: string
// }

import { Category } from './category';
import { ItemsService } from '../services/items';

export class Item {

  _id?: string
  _rev?: string
  title: string
  description: string

  category_id: string
  category: Category = new Category

  constructor(){
  }

  populate(model: string, service: ItemsService) {
    switch (model) {
      case 'category':
        service.categoriesService.find(this.category_id).then((cat: any) =>  this.category = cat)
        break;

      default:
        break;
    }
    return this
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