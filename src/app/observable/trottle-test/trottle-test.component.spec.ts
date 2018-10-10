import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrottleTestComponent } from './trottle-test.component';

describe('TrottleTestComponent', () => {
  let component: TrottleTestComponent;
  let fixture: ComponentFixture<TrottleTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrottleTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrottleTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
