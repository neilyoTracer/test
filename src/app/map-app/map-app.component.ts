import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

declare const BMap:any;
declare const BMAP_NORMAL_MAP:any;
declare const BMAP_HYBRID_MAP:any;

@Component({
  selector: 'app-map-app',
  templateUrl: './map-app.component.html',
	styleUrls: ['./map-app.component.css'],
	changeDetection:ChangeDetectionStrategy.OnPush,
	encapsulation:ViewEncapsulation.None
})
export class MapAppComponent implements OnInit {

	//地图配置参数
	map_options:any = { 
		enableMapClick:false
	}

  constructor() { }

  ngOnInit() {
	}
	
	//初始化地图
	onReady(map:any) { 
		map.centerAndZoom(new BMap.Point(104.072224, 30.664599),15);
		map.addControl(new BMap.MapTypeControl({ 
			mapTypes:[
				BMAP_NORMAL_MAP,
				BMAP_HYBRID_MAP
			]
		}))

		map.setCurrentCity('成都');
		map.enableScrollWheelZoom(true);
	}

}
