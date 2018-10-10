import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapAppComponent } from './map-app.component';

describe('MapAppComponent', () => {
  let component: MapAppComponent;
  let fixture: ComponentFixture<MapAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
