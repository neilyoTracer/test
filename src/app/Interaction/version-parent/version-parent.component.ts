import { Component, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-version-parent',
  templateUrl: './version-parent.component.html',
  styleUrls: ['./version-parent.component.css']
})
export class VersionParentComponent implements OnInit {

	major = 1;
	minor = 23;
	throttler:any = new Subject<any>();
	subscription:Subscription;

  constructor() { }

  ngOnInit() {
		this.subscription = this.throttler.asObservable().pipe(
			throttleTime(1000)
		).subscribe((fn) => this.eventDelaHandle(fn,this))
	}
	
	newMinor() { 
		this.trottleHandle(this.newMinorHandle);
	}
	newMinorHandle() { 
		this.minor++;
	}


	newMajor() { 
		this.trottleHandle(this.newMajorHandle);
	}
	newMajorHandle() { 
		this.major++;
		this.minor = 0;
	}

	trottleHandle(handler) { 
		this.throttler.next(handler);
	}

	eventDelaHandle(hander,context) { 
		hander.call(context);
	}

	ngOnDestroy(): void {
		//Called once, before the instance is destroyed.
		//Add 'implements OnDestroy' to the class.
		this.subscription.unsubscribe();
	}

}
