import { EchartsModule } from './echarts.module';

describe('EchartsModule', () => {
  let echartsModule: EchartsModule;

  beforeEach(() => {
    echartsModule = new EchartsModule();
  });

  it('should create an instance', () => {
    expect(echartsModule).toBeTruthy();
  });
});
