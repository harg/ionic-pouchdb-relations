import { Item } from './item';
import { BaseModel } from './base';

export class Category extends BaseModel {

  title: string
  description: string

  items: Item[]

  constructor() {
    super();
  }

  get doc_properties(): string[] { return ['_id', '_rev', 'title', 'description']; }

  toJson(): string {
    return JSON.stringify(this, this.doc_properties);
  }
}