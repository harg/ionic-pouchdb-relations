import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { DbService } from '../../services/databases'

import { Item } from '../../models/item';
import { Category } from '../../models/category';


@Component({
  selector: 'page-item_new',
  templateUrl: 'item_new.html'
})
export class ItemNewPage {

  item: Item
  categories: Category[] = []

  constructor(public navCtrl: NavController, private dbService: DbService) {
    this.item = new Item()
    this.dbService.categoriesCollection().findAll().then(docs => { this.categories = docs; })
  }

  addItem() {
    this.dbService.itemsCollection().add(this.item)
    this.navCtrl.pop()
  }

}
