import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerBodyComponent } from './explorer-body.component';

describe('ExplorerBodyComponent', () => {
  let component: ExplorerBodyComponent;
  let fixture: ComponentFixture<ExplorerBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExplorerBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorerBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
