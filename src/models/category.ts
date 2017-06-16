import { Item } from './item';
import { BaseModel } from './base';

export class Category extends BaseModel {

  title: string
  description: string

  items: Item[]

  constructor() {
    super();
  }

  toJson(): string {
    let filter = new Array();
    filter[0] = '_id';
    filter[1] = '_rev';
    filter[2] = 'title';
    filter[3] = 'description';
    return JSON.stringify(this, filter);
  }

}