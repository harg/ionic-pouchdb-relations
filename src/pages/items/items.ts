import { Component, OnInit, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AlertController } from 'ionic-angular';
import { NavController } from 'ionic-angular';

import { ItemNewPage } from '../item_new/item_new';

import { DbService } from '../../services/databases';

import { Item } from '../../models/item';

@Component({
  selector: 'page-items',
  templateUrl: 'items.html'
})
export class ItemsPage implements OnInit{

  items: Item[] = [];
  data: Observable<Array<Item>>;

  constructor(private zone: NgZone,public navCtrl: NavController, private alertCtrl: AlertController,
              private dbService: DbService) {
    this.dbService.itemsCollection.changes().subscribe(() => { this.refresh(); });
    this.dbService.categoriesCollection.changes().subscribe(() => { this.refresh(); });
  }

  ngOnInit() {
    this.refresh();
  }

   private async refresh() {
    this.items = await this.dbService.itemsCollection.findAll()
    this.items = await this.dbService.itemsCollection.populateRelationships(this.items)
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
          handler: (newItem: Item) => {
            newItem._id = item._id;
            newItem._rev = item._rev;
            this.dbService.itemsCollection.update(newItem); }
        }
      ]
    }).present();
  }

  deleteItem(item: Item) {
    this.dbService.itemsCollection.remove(item);
  }

}
