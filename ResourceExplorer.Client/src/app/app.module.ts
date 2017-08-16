import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {AngularSplitModule} from 'angular-split';
import { ExplorerHeaderComponent } from './explorer-header/explorer-header.component';
import { ExplorerBodyComponent } from './explorer-body/explorer-body.component';

@NgModule({
  declarations: [
    AppComponent,
    ExplorerHeaderComponent,
    ExplorerBodyComponent
  ],
  imports: [
    BrowserModule,
    AngularSplitModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
