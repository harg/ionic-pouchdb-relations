import { Item } from './item';
import { Category } from './category';
import { BaseModel } from './base';

export class CategoryItem extends BaseModel {

  item_id: string;
  category_id: string;

  constructor() {
    super();
  }

  toJson(): string {
    let filter = new Array();
    filter[0] = '_id';
    filter[1] = '_rev';
    filter[2] = 'item_id';
    filter[3] = 'category_id';
    return JSON.stringify(this, filter);
  }

  toDoc() {
    return [];
  }
}