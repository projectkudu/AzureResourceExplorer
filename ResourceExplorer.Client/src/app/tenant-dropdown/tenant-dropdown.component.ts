import { Component, OnInit } from '@angular/core';
import { DropdownModule } from "primeng/primeng";

@Component({
  selector: 'app-tenant-dropdown',
  templateUrl: './tenant-dropdown.component.html',
  styleUrls: ['./tenant-dropdown.component.css']
})
export class TenantDropdownComponent implements OnInit {

  cities: string[];
  selectedCity: string;

  constructor() {
    this.cities = [];
    this.cities.push("A");
    this.cities.push("B");
    this.cities.push("C");
    this.cities.push("4");
  }

  ngOnInit() {
    
  }

}
