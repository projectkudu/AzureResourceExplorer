import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-resource-searcher',
  templateUrl: './resource-searcher.component.html',
  styleUrls: ['./resource-searcher.component.css']
})
export class ResourceSearcherComponent implements OnInit {

  text: string;
  results: string[];

  search(event) {
    this.results = ["result1", "result2"];
  }

  constructor() { }

  ngOnInit() {
    this.text = "Resource Search";
  }

}
