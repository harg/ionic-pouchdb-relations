import { Component, OnInit, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AlertController } from 'ionic-angular';
import { NavController } from 'ionic-angular';

import { ItemNewPage } from '../item_new/item_new';

import { CategoriesService } from '../../services/categories';
import { Category } from '../../models/category';
import { ItemsService } from '../../services/items';
import { Item } from '../../models/item';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit{

  items: Item[] = [];
  data: Observable<Array<Item>>;

  constructor(private zone: NgZone,public navCtrl: NavController, private alertCtrl: AlertController,
              private itemsService: ItemsService, private categoriesService: CategoriesService) {
    //this.zone.run(() => {  })
    this.itemsService.changes().subscribe(() => { this.refresh(); });
    this.refresh();
  }

  ngOnInit() {
    this.refresh();
  }

   private async refresh() {
    this.items =  await this.itemsService.populateRelationships( this.itemsService.findAll() )

    //let docs =  await this.itemsService.findAll()
    // docs.forEach((item, i) => {
    //   item.category = this.categoriesService.find(item.category_id)
    // })
    //this.items = docs

  }


  newItem() {

    this.navCtrl.push(ItemNewPage, {});

    // this.alertCtrl.create({
    //   title: 'New item',
    //   inputs: [
    //     {
    //       name: 'title',
    //       placeholder: 'Title'
    //     },
    //     {
    //       name: 'description',
    //       placeholder: 'Description'
    //     }],
    //   buttons: [
    //     {
    //       text: 'Cancel',
    //       role: 'cancel'
    //     },
    //     {
    //       text: 'Add',
    //       handler: (item: Item) => { this.itemsService.add(item); }
    //     }
    //   ]
    // }).present();
  }

  editItem(item: Item) {
    this.alertCtrl.create({
      title: 'Edit item',
      inputs: [
        {
          name: 'title',
          placeholder: 'Title',
          value: item.title
        },
        {
          name: 'description',
          placeholder: 'Description',
          value: item.description
        }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (newItem: Item) => { newItem._id = item._id; newItem._rev = item._rev; this.itemsService.update(newItem); }
        }
      ]
    }).present();
  }

  deleteItem(item: Item) {
    this.itemsService.remove(item);
  }

}
