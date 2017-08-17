import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {AngularSplitModule} from 'angular-split';
import { ExplorerHeaderComponent } from './explorer-header/explorer-header.component';
import { ExplorerBodyComponent } from './explorer-body/explorer-body.component';

import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from "primeng/primeng";
import { DropdownModule } from "primeng/primeng";
import { ResourceSearcherComponent } from './resource-searcher/resource-searcher.component';
import { TenantDropdownComponent } from './tenant-dropdown/tenant-dropdown.component';

@NgModule({
  declarations: [
    AppComponent,
    ExplorerHeaderComponent,
    ExplorerBodyComponent,
    ResourceSearcherComponent,
    TenantDropdownComponent
  ],
  imports: [
    BrowserModule,
    AngularSplitModule,
    AutoCompleteModule,
    DropdownModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
