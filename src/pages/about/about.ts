import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { CategoriesService } from '../../services/categories';
import { Category } from '../../models/category';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  categories: Category[] = [];

  constructor(private alertCtrl: AlertController, private categoriesService: CategoriesService) {
    this.categoriesService.changes().subscribe(() => { this.refresh(); });
    this.refresh();
  }

  private refresh() {
    this.categoriesService.findAll().then(docs => { this.categories = docs; });
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
