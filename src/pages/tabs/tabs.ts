import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import { AboutPage } from '../about/about';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tabHome: any = HomePage;
  tabAbout: any = AboutPage;

  constructor() { }

}
