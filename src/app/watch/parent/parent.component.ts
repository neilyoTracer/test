import { Component, OnInit, KeyValueDiffers } from '@angular/core';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css']
})
export class ParentComponent implements OnInit {

	obj:any = {
		firstName:'黄',
		lastName:'华睿',
		score:99,
		sex:'male',
		info:{id:1,pn:'13981978923'},
		address:'here',
		work:'web'
	};

  constructor() { 
	}

  ngOnInit() {
	}
	
	changeRef():void { 
		this.obj = {
			firstName:'黄',
			lastName:'华睿',
			score:99,
			sex:'male',
			info:{id:1,pn:'13981978923'}
		};
	}

	changePro():void { 
		this.obj.score++;
	}

	/* ngDoCheck(): void {
		//Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.
		//Add 'implements DoCheck' to the class.
		console.log('父组件数据的属性变化了')
	} */

}
