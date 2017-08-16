import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerHeaderComponent } from './explorer-header.component';

describe('ExplorerHeaderComponent', () => {
  let component: ExplorerHeaderComponent;
  let fixture: ComponentFixture<ExplorerHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExplorerHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorerHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
