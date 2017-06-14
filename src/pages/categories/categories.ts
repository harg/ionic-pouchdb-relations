import { Component } from '@angular/core'
import { AlertController } from 'ionic-angular'

import { DbService } from '../../services/databases'

import { Category } from '../../models/category'


@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html'
})
export class CategoriesPage {

  categories: Category[] = [];

  constructor(private alertCtrl: AlertController, private dbService: DbService) {
    this.dbService.categoriesCollection.changes().subscribe(() => { this.refresh(); });
    this.dbService.itemsCollection.changes().subscribe(() => { this.refresh(); });
    this.refresh();
  }

  private async refresh() {
    let docs =  await this.dbService.categoriesCollection.findAll();
    docs.forEach((category, i) => {
      this.dbService.itemsCollection.findByCategoryId(category._id).then(its => category.items = its)
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
          handler: (category: Category) => {
            this.dbService.categoriesCollection.add(category);
          }
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
          handler: (newCategory: Category) => {
            newCategory._id = category._id;
            newCategory._rev = category._rev;
            this.dbService.categoriesCollection.update(newCategory);
          }
        }
      ]
    }).present();
  }

  deleteCategory(category: Category) {
    this.dbService.categoriesCollection.remove(category);
  }

}
