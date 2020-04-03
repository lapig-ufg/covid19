import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestrictedAreaAccessComponent } from './restricted-area-access.component';

describe('RestrictedAreaAccessComponent', () => {
  let component: RestrictedAreaAccessComponent;
  let fixture: ComponentFixture<RestrictedAreaAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestrictedAreaAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestrictedAreaAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
