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
  private page: number = 0;

  constructor(private zone: NgZone,public navCtrl: NavController, private alertCtrl: AlertController,
              private dbService: DbService) {
    this.dbService.itemsCollection.changes().subscribe(() => { this.loadItems(); });
    this.dbService.categoriesCollection.changes().subscribe(() => { this.loadItems(); });
    this.loadItems();
  }

  ngOnInit() {
    //this.refresh();
  }

  // private async refresh() {
  //   this.items = await this.dbService.itemsCollection.findAll()
  //   this.items = await this.dbService.itemsCollection.populateRelationships(this.items)
  // }

  loadItems() {
    return new Promise(resolve => {
      this.dbService.itemsCollection.findAll(this.page)
      .then(data => {
        return this.dbService.itemsCollection.populateRelationships(data)
      })
      .then( items => {
        for(let item of items) {
          this.items.push(item);
        }
        resolve(true)
      });
    });
  }

  doInfinite(infiniteScroll) {
    console.log('doInfinite, page = '+this.page);
    this.page += 1;

    this.loadItems().then(()=>{
      infiniteScroll.complete();
    });
  }

  newItem() {
    this.navCtrl.push(ItemNewPage, {});
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
