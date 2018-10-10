import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-version-child',
  templateUrl: './version-child.component.html',
  styleUrls: ['./version-child.component.css']
})
export class VersionChildComponent implements OnInit {
	@Input() major:number;//专业
	@Input() minor:number;//少数
	changeLog:string[] = [];

  constructor() { }

  ngOnInit() {
	}
	
	ngOnChanges(changes: {[propKey:string]:SimpleChanges}): void {
		//Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
		//Add '${implements OnChanges}' to the class.
		let log:string[] = [];
		console.log(changes);
		for(let propName in changes) { 
			let changedProp = changes[propName];
			let to = JSON.stringify(changedProp.currentValue);

			if(changedProp.firstChange) { 
				log.push(`Initial value of ${propName} set to ${to}`);
			} else { 
				let from = JSON.stringify(changedProp.previousValue);
				log.push(`${propName} changed from ${from} to ${to}`);
			}
		}

		this.changeLog.push(log.join(', '));
	}

}
