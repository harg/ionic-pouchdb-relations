import { Item } from './item';
import { Category } from './category';
import { BaseModel } from './base';

export class CategoryItem extends BaseModel {

  item_id: string;
  category_id: string;

  constructor() {
    super();
  }

  get doc_properties(): string[] { return ['_id', '_rev', 'item_id', 'category_id']; }

  toJson(): string {
    return JSON.stringify(this, this.doc_properties);
  }

}