import { Component, OnInit } from '@angular/core';
import { AutoCompleteModule } from "primeng/primeng";

@Component({
  selector: 'app-explorer-header',
  templateUrl: './explorer-header.component.html',
  styleUrls: ['./explorer-header.component.css']
})
export class ExplorerHeaderComponent implements OnInit {

  text: string;
  results: string[];

  constructor() { }

  search(event) {
    this.results = ["result1", "result2"];
  }

  ngOnInit() {
    this.text = "Search";
  }

}
