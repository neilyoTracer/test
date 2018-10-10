import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RxjsLibComponent } from './rxjs-lib.component';

describe('RxjsLibComponent', () => {
  let component: RxjsLibComponent;
  let fixture: ComponentFixture<RxjsLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RxjsLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RxjsLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
