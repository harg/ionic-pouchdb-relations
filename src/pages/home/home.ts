import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { ItemsService } from '../../services/items';
import { Item } from '../../models/item';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  items: Item[] = [];

  constructor(private alertCtrl: AlertController, private itemsService: ItemsService) {
    this.itemsService.changes().subscribe(() => { this.refresh(); });
    this.refresh();
  }

  private refresh() {
    this.itemsService.findAll().then(docs => { this.items = docs; });
  }

  newItem() {
    this.alertCtrl.create({
      title: 'New item',
      inputs: [
        {
          name: 'title',
          placeholder: 'Title'
        },
        {
          name: 'description',
          placeholder: 'Description'
        }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (item: Item) => { this.itemsService.add(item); }
        }
      ]
    }).present();
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
