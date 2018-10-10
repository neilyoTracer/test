import { Component, OnInit, ViewEncapsulation } from '@angular/core';

declare const BMap:any;

@Component({
  selector: 'app-map-baidu',
  template: ``,
	styles: [`.angular-baidu-maps-container { display:block;width:100%;height:100%;}`],
	encapsulation:ViewEncapsulation.None,
	providers:[]
})
export class MapBaiduComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
