import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EchartsComponent } from './echarts.component';

const COMPONENT = [ 
	EchartsComponent
]

@NgModule({
  imports: [
		CommonModule,
		FormsModule
  ],
	declarations: COMPONENT,
	exports:COMPONENT
})
export class EchartsModule { }
