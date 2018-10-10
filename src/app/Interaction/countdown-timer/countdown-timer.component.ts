import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-countdown-ag-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.css']
})
export class CountdownTimerAgComponent implements OnInit {

	intervalId = 0;
	message = '';
	seconds = 10;

	clearTimer() { clearInterval(this.intervalId); }

  constructor() { }

  ngOnInit() {
		this.start();
	}
	ngOnDestroy(): void {
		//Called once, before the instance is destroyed.
		//Add 'implements OnDestroy' to the class.
		this.clearTimer();
	}

	start() { this.countDown(); }
	stop() { 
		this.clearTimer();
		this.message = `Holding at T-${this.seconds} seconds`;
	}

	private countDown() { 
		this.clearTimer();
		this.intervalId = window.setInterval(() => {
			this.seconds--;
			if(this.seconds === 0) { 
				this.message = 'Blast off!'
			} else { 
				if(this.seconds < 0) {this.seconds = 10;}
				this.message = `T-${this.seconds} seconds and counting`;
			}
		},1000);
	}

}
