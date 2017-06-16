import { Category } from './category';
import { BaseModel } from './base';

export class Item extends BaseModel {

  title: string
  description: string

  categories: Category[];
  parent_item: Item

  constructor() {
    super()
  }

  get doc_properties(): string[] { return ['_id', '_rev', 'title', 'description']; }

  toJson(): string {
    return JSON.stringify(this, this.doc_properties);
  }


}