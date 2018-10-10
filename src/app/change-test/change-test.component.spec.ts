import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeTestComponent } from './change-test.component';

describe('ChangeTestComponent', () => {
  let component: ChangeTestComponent;
  let fixture: ComponentFixture<ChangeTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
