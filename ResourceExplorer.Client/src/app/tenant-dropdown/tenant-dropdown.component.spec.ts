import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantDropdownComponent } from './tenant-dropdown.component';

describe('TenantDropdownComponent', () => {
  let component: TenantDropdownComponent;
  let fixture: ComponentFixture<TenantDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TenantDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
