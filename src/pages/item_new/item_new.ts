import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ItemsService } from '../../services/items';
import { Item } from '../../models/item';
import { CategoriesService } from '../../services/categories';
import { Category } from '../../models/category';

@Component({
  selector: 'page-item_new',
  templateUrl: 'item_new.html'
})
export class ItemNewPage {

  item: Item;
  categories: Category[] = [];

  constructor(public navCtrl: NavController, private itemsService: ItemsService, private categoriesService: CategoriesService) {
    this.item = new Item();//{title: '', description: '', category_id:''};
    this.categoriesService.findAll().then(docs => { this.categories = docs; });
  }

  addItem() {
    this.itemsService.add(this.item);
    this.navCtrl.pop();
  }

}
