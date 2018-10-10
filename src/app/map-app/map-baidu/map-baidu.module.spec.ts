import { MapBaiduModule } from './map-baidu.module';

describe('MapBaiduModule', () => {
  let mapBaiduModule: MapBaiduModule;

  beforeEach(() => {
    mapBaiduModule = new MapBaiduModule();
  });

  it('should create an instance', () => {
    expect(mapBaiduModule).toBeTruthy();
  });
});
