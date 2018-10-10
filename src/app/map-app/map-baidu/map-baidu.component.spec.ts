import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapBaiduComponent } from './map-baidu.component';

describe('MapBaiduComponent', () => {
  let component: MapBaiduComponent;
  let fixture: ComponentFixture<MapBaiduComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapBaiduComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapBaiduComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
