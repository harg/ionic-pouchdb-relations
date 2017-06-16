
/**
 *
 */
export abstract class BaseModel {

  public _id?: string
  public _rev?: string

  public created_at: string;

  constructor() {
    this._id = new Date().getTime() + '_' + Math.floor(Math.random() * 10000);
    this.created_at = (new Date()).toJSON();
  }

  get doc_properties(): Array<string> { return []; }

  toDoc(): object {
    let clone = Object.assign({}, this)
    for (let invalid_key of Object.keys(this).filter(key => key in this.doc_properties) ){
      delete clone[invalid_key]
    }
    return clone
  }

  abstract toJson(): string;
}