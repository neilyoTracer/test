import { MapAppComponent } from "./map-app.component";
import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgZorroAntdModule } from "ng-zorro-antd";
import { MapBaiduModule } from "../common/map-baidu/map-baidu.module";


const routes:Routes = [
	{
		path:'',
		component:MapAppComponent
	}
]


@NgModule({
	imports: [ 
		CommonModule,
		RouterModule,
		FormsModule,
		NgZorroAntdModule,
		MapBaiduModule.forRoot({apiKey:'qOz9QmXd4l6hAOY4SFAUst4P'}),
		RouterModule.forChild(routes)
	],
	declarations: [
		MapAppComponent
	],
})
export class MapAppModule {}