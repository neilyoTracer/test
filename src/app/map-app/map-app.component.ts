import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { mapMock } from './map-mock';

declare const BMap:any;
declare const BMAP_NORMAL_MAP:any;
declare const BMAP_HYBRID_MAP:any;
declare const BMAP_ANCHOR_TOP_RIGHT:any;
declare const BMAP_NAVIGATION_CONTROL_SMALL:any;
declare const BMAP_NAVIGATION_CONTROL_LARGE:any;

@Component({
  selector: 'app-map-app',
  templateUrl: './map-app.component.html',
	styleUrls: ['./map-app.component.css'],
	changeDetection:ChangeDetectionStrategy.OnPush,
	encapsulation:ViewEncapsulation.None
})
export class MapAppComponent implements OnInit {

	mockData = mapMock;

	//地图配置参数
	map_options:any = { 
		enableMapClick:false
	}

	_map:any = null;
	addressOpt:any = { 
		width:300,
		height:100,
		title:'企业信息',
		enableMessage:true
	}

  constructor(
		private ref:ChangeDetectorRef
	) { }

  ngOnInit() {
		setInterval(() => {
			this.ref.markForCheck();
		}, 1000);
	}
	
	/**
	 * 初始化地图,添加控件
	 * @param map 
	 */
	onReady(map:any) { 
		this._map = map;
		map.centerAndZoom(new BMap.Point(104.072224, 30.664599),11);
		map.enableScrollWheelZoom(true);
		

		//1.添加平移和缩放按钮控件
		const top_right_navigation = new BMap.NavigationControl({
			anchor: BMAP_ANCHOR_TOP_RIGHT,//靠左上角
			type: BMAP_NAVIGATION_CONTROL_LARGE,//启用
			enableGeolocation:true//启用显示定位
		});
		map.addControl(top_right_navigation);

		//2.添加定位控件
		const geolocationControl = new BMap.GeolocationControl();
		geolocationControl.addEventListener("locationSuccess",(e) => { 
			//定位成功事件
			let address = '';
			address += e.addressComponent.province;
			address += e.addressComponent.city;
			address += e.addressComponent.district;
			address += e.addressComponent.street;
			address += e.addressComponent.streetNumber;
			alert('当前定位地址为: ' + address);
		})

		geolocationControl.addEventListener("locationError",(e) => 
			// 定位失败事件
			alert(e.message)
		);
		map.addControl(geolocationControl);

		
		this.positionTest();

	}


	/**
	 * 设置地图标点
	 */
	private _center(lng:number,lat:number) { 
		this._map.setCenter(new BMap.Point(lng,lat));
	}
	

	/**
	 * 生成marker
	 */
	private _marker(lng:number,lat:number) { 
		return new BMap.Marker(new BMap.Point(lng,lat));
	}

	private _addClickHandler(content,marker) { 
		marker.addEventListener("click",(e) => { 
			this._openInfo(content,e)
		})
	}

	private _openInfo(content,e) { 
		let p = e.target;
		let point = new BMap.Point(p.getPosition().lng,p.getPosition().lat);
		let infoWindow = new BMap.InfoWindow(content,this.addressOpt);
		this._map.openInfoWindow(infoWindow,point);
	}

	positionTest() { 
		this.mockData.forEach((itm,idx) => { 
			if(idx === 0) { 
				this._center(+itm.longitude,+itm.latitude)
			}
			let marker = this._marker(+itm.longitude,+itm.latitude);
			let content = `
				<div>${itm.enterpriseName}</div>
				<div>地址: ${itm.addressInfo}</div>
				<div>电话: ${itm.contactNumber.trim().slice(0,-1).split(';')[0]}</div>
			`
			this._map.addOverlay(marker);
			this._addClickHandler(content,marker);
		});
	}


	private destroy() {
    if (this._map) {
      this._map.clearOverlays();
      this._map.clearHotspots();
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }

}
