import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {TablesService} from '../../providers/tables.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ToolbarComponent implements OnInit {

  @ViewChild('searchBar') searchBar;

  loadedPageUrl;
  searchQueryString = '';

  constructor(private router: Router, private tablesService: TablesService) {
    router.events.subscribe((event: NavigationEnd) => {
      if (event instanceof NavigationEnd) {
        this.loadedPageUrl = event.url;
        this.searchBar.close();
      }
    });
  }

  ngOnInit() {
  }

  onSearchFieldChange(query) {
    this.tablesService.search(query);
  }

}
