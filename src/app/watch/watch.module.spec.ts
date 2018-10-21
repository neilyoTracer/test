import { WatchModule } from './watch.module';

describe('WatchModule', () => {
  let watchModule: WatchModule;

  beforeEach(() => {
    watchModule = new WatchModule();
  });

  it('should create an instance', () => {
    expect(watchModule).toBeTruthy();
  });
});
