import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NameChildComponent } from './name-child.component';

describe('NameChildComponent', () => {
  let component: NameChildComponent;
  let fixture: ComponentFixture<NameChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NameChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NameChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
