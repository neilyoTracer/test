import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-zippy',
  templateUrl: './zippy.component.html',
  styleUrls: ['./zippy.component.css']
})
export class ZippyComponent implements OnInit {

	visible = true;
	@Output() open = new EventEmitter<any>();
	@Output() close = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
	}
	
	toggle() { 
		this.visible = !this.visible;
		if(this.visible) { 
			this.open.emit(null);
		} else { 
			this.close.emit(null);
		}
	}

}
