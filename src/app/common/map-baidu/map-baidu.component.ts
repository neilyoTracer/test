import { Component, OnInit, ViewEncapsulation, Input, OnDestroy, EventEmitter, Output, ElementRef, NgZone, SimpleChanges } from '@angular/core';
import { LoaderService, AbmConfig } from './loader.service';

declare const BMap:any;

@Component({
	selector: 'hr-map-baidu',
	template:``,
	styles: [`.angular-baidu-maps-container { display:block;width:100%;height:100%}; `],
	encapsulation:ViewEncapsulation.None,
	providers:[LoaderService,AbmConfig]
})
export class MapBaiduComponent implements OnInit,OnDestroy {

	@Input() options:any = {};
	@Output() ready = new EventEmitter<any>();

	private map:any = null;

	constructor(
		private el:ElementRef,
		private COG:AbmConfig,
		private loader:LoaderService,
		private zone:NgZone
	) { 
		this._initMap()
	}

	ngOnChanges(changes: SimpleChanges): void {
		//Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
		//Add '${implements OnChanges}' to the class.
		if('options' in changes) { this._updateOptions(); }
	}

	ngOnInit(): void { }

	private _initMap() { 
		if(this.map) {return;}
		this.loader.load().then(() => { 
			this.zone.runOutsideAngular(() => { 
				try { 
					this.map = new BMap.Map(this.el.nativeElement,this.options);
				} catch(ex) { 
					console.warn('地图初始化失败',ex);
				}
			});
			this.ready.emit(this.map);
		});
	}

	private _updateOptions() { 
		this.options = Object.assign({},this.COG.mapOptions,this.options);
		if(this.map) { 
			this.map.setOptions(this.options);
		}
	}

	private destroy() {
    if (this.map) {
      this.map.clearOverlays();
      this.map.clearHotspots();
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
