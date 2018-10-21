import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { ReportComponent } from "./report.component";
// import { EchartsModule } from "../common/echarts/echarts.module";
import { NgxEchartsModule } from 'ngx-echarts';
import { NgZorroAntdModule } from "ng-zorro-antd";

const routes = [
	{
		path: "",
		component: ReportComponent
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		NgZorroAntdModule,
		NgxEchartsModule,
		RouterModule.forChild(routes)
	],
	declarations: [ReportComponent]
})
export class ReportModule {}
