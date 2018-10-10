import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Routable1Component } from './routable1.component';

describe('Routable1Component', () => {
  let component: Routable1Component;
  let fixture: ComponentFixture<Routable1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Routable1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Routable1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
