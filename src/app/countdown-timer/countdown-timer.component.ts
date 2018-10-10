import { Component, OnInit,OnDestroy } from '@angular/core';

@Component({
  selector: 'app-countdown-timer',
  template: '<p>{{message}}</p>'
})
export class CountdownTimerComponent implements OnInit,OnDestroy {

  intervalId = 0;
  message = '';
  seconds = 11;

  constructor() { }

  clearTimer() { 
    clearInterval(this.intervalId);
  }

  start() {this.countDown();}
  stop() { 
    this.clearTimer();
    this.message = `Holding at T-${this.seconds} seconds`;
  }

  private countDown() { 
    this.clearTimer();
    this.intervalId = window.setInterval(() => { 
      this.seconds -= 1;
      if(this.seconds === 0) { 
        this.message = 'Blast off!';
      } else { 
        if(this.seconds < 0) { this.seconds = 10; }//reset
        this.message = `T-${this.seconds} seconds and counting`;
      }
    },1000)
  }

  ngOnInit() {
    this.start();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.clearTimer();
  }

}
