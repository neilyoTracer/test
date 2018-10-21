import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchComponent } from './watch.component';
import { ParentComponent } from './parent/parent.component';
import { ChildComponent } from './parent/child/child.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';

const routes = [
	{
		path:'',
		component:WatchComponent,
		children:[
			{
				path:'',
				redirectTo:'parent-watch',
				pathMatch:'full'
			},{
				path:'parent-watch',
				component:ParentComponent
			}
		]
	}
]

@NgModule({
  imports: [
		CommonModule,
		FormsModule,
		NgZorroAntdModule,
		RouterModule.forChild(routes)
  ],
  declarations: [
		WatchComponent,
		ParentComponent,
		ChildComponent
	]
})
export class WatchModule { }
