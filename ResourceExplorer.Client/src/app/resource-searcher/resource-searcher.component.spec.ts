import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceSearcherComponent } from './resource-searcher.component';

describe('ResourceSearcherComponent', () => {
  let component: ResourceSearcherComponent;
  let fixture: ComponentFixture<ResourceSearcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourceSearcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceSearcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
