import { Component, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';


@Component({
  selector: 'app-trottle-test',
  templateUrl: './trottle-test.component.html',
  styleUrls: ['./trottle-test.component.css']
})
export class TrottleTestComponent implements OnInit {

	throttleBtn:any = new Subject<any>();
	throttleTime:number = 2000;
	subscription:Subscription;

  constructor() { }

  ngOnInit() {
		this.subscription = this.throttleBtn.asObservable().pipe(
			throttleTime(this.throttleTime)
		).subscribe(data => this.handleData());
	}
	
	test() { 
		this.throttleBtn.next()
	}

	handleData() { 
		console.log('节流,no data');
	}

	ngOnDestroy(): void {
		//Called once, before the instance is destroyed.
		//Add 'implements OnDestroy' to the class.
		this.subscription.unsubscribe();
	}

}
