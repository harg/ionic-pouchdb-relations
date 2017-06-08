import { Component } from '@angular/core'
import { AlertController } from 'ionic-angular'

import { DbService } from '../../services/databases'

import { Category } from '../../models/category'


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  categories: Category[] = [];

  constructor(private alertCtrl: AlertController, private dbService: DbService) {
    this.dbService.categories().changes().subscribe(() => { this.refresh(); });
    this.refresh();
  }

  private async refresh() {
    let docs =  await this.dbService.categories().findAll();
    docs.forEach((category, i) => {
      this.dbService.items().findByCategoryId(category._id).then(its => category.items = its)
    })
    this.categories = docs;
  }

  newCategory() {
    this.alertCtrl.create({
      title: 'New category',
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
          handler: (category: Category) => { this.dbService.categories().add(category); }
        }
      ]
    }).present();
  }

  editCategory(category: Category) {
    this.alertCtrl.create({
      title: 'Edit category',
      inputs: [
        {
          name: 'title',
          placeholder: 'Title',
          value: category.title
        },
        {
          name: 'description',
          placeholder: 'Description',
          value: category.description
        }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (newCategory: Category) => { newCategory._id = category._id; newCategory._rev = category._rev; this.dbService.categories().update(newCategory); }
        }
      ]
    }).present();
  }

  deleteCategory(category: Category) {
    this.dbService.categories().remove(category);
  }

}
