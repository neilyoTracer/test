import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Routable2Component } from './routable2.component';

describe('Routable2Component', () => {
  let component: Routable2Component;
  let fixture: ComponentFixture<Routable2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Routable2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Routable2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
