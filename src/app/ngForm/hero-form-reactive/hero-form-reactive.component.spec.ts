import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroFormReactiveComponent } from './hero-form-reactive.component';

describe('HeroFormReactiveComponent', () => {
  let component: HeroFormReactiveComponent;
  let fixture: ComponentFixture<HeroFormReactiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeroFormReactiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroFormReactiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
