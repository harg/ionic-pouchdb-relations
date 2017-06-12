import { Component } from '@angular/core';
import { ItemsPage } from '../items/items';
import { CategoriesPage } from '../categories/categories';
import { DatabasePage } from '../database/database';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tabItems: any = ItemsPage;
  tabCategories: any = CategoriesPage;
  tabDatabase: any = DatabasePage

  constructor() { }

}
