import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { CategoriesService } from '../../services/categories';
import { Category } from '../../models/category';
import { ItemsService } from '../../services/items';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  categories: Category[] = [];

  constructor(private alertCtrl: AlertController, private categoriesService: CategoriesService, private itemsService: ItemsService) {
    this.categoriesService.changes().subscribe(() => { this.refresh(); });
    this.refresh();
  }

  private async refresh() {
    let docs =  await this.categoriesService.findAll();
    docs.forEach((category, i) => {
      this.itemsService.findByCategoryId(category._id).then(its => category.items = its)
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
          handler: (category: Category) => { this.categoriesService.add(category); }
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
          handler: (newCategory: Category) => { newCategory._id = category._id; newCategory._rev = category._rev; this.categoriesService.update(newCategory); }
        }
      ]
    }).present();
  }

  deleteCategory(category: Category) {
    this.categoriesService.remove(category);
  }

}
