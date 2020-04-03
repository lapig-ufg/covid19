import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestrictedAreaFormComponent } from './restricted-area-form.component';

describe('RestrictedAreaFormComponent', () => {
  let component: RestrictedAreaFormComponent;
  let fixture: ComponentFixture<RestrictedAreaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestrictedAreaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestrictedAreaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
