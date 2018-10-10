/* import { Component, OnInit } from '@angular/core';


@Component({
  selector: "app-countdown-parent-lv",
  template: `
    <h3>Countdown to Liftoff(via local variable)</h3>
    <button (click)="timer.start()">Start</button>
    <button (click)="timer.stop()">Stop</button>
    <div class="seconds">{{timer.seconds}}</div>
    <app-countdown-timer #timer></app-countdown-timer>
  `
})
export class CountdownParentComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
} */

import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { CountdownTimerComponent } from "../countdown-timer/countdown-timer.component";

@Component({
  selector: "app-countdown-parent-vc",
  template: `
    <h3>Countdown to Liftoff(via ViewChild)</h3>
    <button (click)="start()">Start</button>
    <button (click)="stop()">Stop</button>
    <div class="seconds">{{seconds()}}</div>
    <app-countdown-timer></app-countdown-timer>
  `
})
export class CountdownParentComponent implements AfterViewInit {
  @ViewChild(CountdownTimerComponent)
  private timerComponent: CountdownTimerComponent;

  constructor() {}
  seconds() {
    return 0;
  }

  start() {
    this.timerComponent.start();
  }
  stop() {
    this.timerComponent.stop();
  }

  ngAfterViewInit() {
    setTimeout(() => (this.seconds = () => this.timerComponent.seconds), 0);
  }

  ngOnInit() {}
}
