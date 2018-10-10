import { Component, OnInit, ViewChild } from '@angular/core';
import { CountdownTimerAgComponent } from '../countdown-timer/countdown-timer.component';

@Component({
  selector: 'app-countdown-ag-parent',
  templateUrl: './countdown-parent.component.html',
  styleUrls: ['../../../assets/demo.css']
})
export class CountdownParentAgComponent implements OnInit {

	@ViewChild(CountdownTimerAgComponent)
	private timerComponent:CountdownTimerAgComponent;

	seconds() { return 0; }

  constructor() { }

  ngOnInit() {
	}
	
	ngAfterViewInit(): void {
		//Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
		//Add 'implements AfterViewInit' to the class.
		setTimeout(() => this.seconds = () => this.timerComponent.seconds,0);
	}

	start() { this.timerComponent.start(); }
	stop() { this.timerComponent.stop(); }

}
