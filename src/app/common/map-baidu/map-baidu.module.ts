import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgZorroAntdModule } from "ng-zorro-antd";
import { MapBaiduComponent } from "./map-baidu.component";
import { FormsModule } from "@angular/forms";
import { AbmConfig, LoaderService } from "./loader.service";

const COMPONENT = [MapBaiduComponent];

@NgModule({
	declarations: COMPONENT,
	imports: [CommonModule, NgZorroAntdModule, FormsModule],
	exports: [COMPONENT]
})
export class MapBaiduModule {
	static forRoot(config: AbmConfig): ModuleWithProviders {
		return {
			ngModule: MapBaiduModule,
			providers: [LoaderService, { provide: 'AbmConfig', useValue: config }]
		};
	}
}

export { AbmConfig } from "./loader.service";
export { MapBaiduComponent } from "./map-baidu.component";
