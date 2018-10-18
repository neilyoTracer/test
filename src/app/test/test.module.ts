import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TestComponent } from "./test.component";
import { Routes, RouterModule } from "@angular/router";
import { NgZorroAntdModule } from "ng-zorro-antd";

const routes: Routes = [
	{
		path: "",
		component: TestComponent
	}
];

@NgModule({
	imports: [
		CommonModule, 
		NgZorroAntdModule,
		RouterModule.forChild(routes)
	],
	declarations: [TestComponent]
})
export class TestModule {}
