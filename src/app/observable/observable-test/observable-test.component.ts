import { Component, OnInit } from "@angular/core";
import {
	of,
	Observable,
	ObjectUnsubscribedError,
	Observer,
	timer,
	from
} from "rxjs";
import { map, first, last } from "rxjs/operators";

@Component({
	selector: "app-observable-test",
	templateUrl: "./observable-test.component.html",
	styleUrls: ["./observable-test.component.css"]
})
export class ObservableTestComponent implements OnInit {
	constructor() {}

	ngOnInit() {
		this.test();
	}

	test(): void {
		//Observe geolocation updates
		const location = new Observable(observer => {
			const { next, error } = observer;

			let watchId;

			if ("geolocation" in navigator) {
				watchId = navigator.geolocation.watchPosition(next, error);
			} else {
				error("Geolocation not available");
			}

			return {
				unsubscribe() {
					navigator.geolocation.clearWatch(watchId);
				}
			};
		});

		const locationsSubscription = location.subscribe({
			next(position) {
				console.log("Current Position");
			},
			error(msg) {
				console.log("Error Getting Location: ", msg);
			}
		});

		setTimeout(() => {
			locationsSubscription.unsubscribe();
		}, 10000);

		//Subscribe using observer
		const myObservable = of(1, 2, 3);

		const myObserver = {
			next: x => console.log("Observer got a next value: " + x),
			error: err => console.error("Observer got an error: " + err),
			complete: () => console.log("Observer got a complete notification")
		};

		myObservable.subscribe(myObserver);

		// Create observable with constructor
		/* function sequenceSubscriber(observer) {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
  
    return { unsubscribe() {} };
  }
  
  const sequence = new Observable(sequenceSubscriber);
  
  sequence.subscribe({
    next(num) {
      console.log(num);
    },
    complete() {
      console.log("Finished sequence");
    }
  }); */

		// Create with custom fromEvent function
		/* function fromEventObserver(target, eventName) {
      return new Observable(observer => {
        const handler = e => observer.next(e);

        //Add the event handler to the target
        target.addEventListener(eventName, handler);

        return () => {
          target.removeEventListener(eventName, handler);
        };
      });
    }

    //Use custom fromEvent function
    const ESC_KEY = 27;
    const nameInput = document.getElementById("name") as HTMLInputElement;

    const subscription = fromEventObserver(nameInput, "keydown").subscribe(
      (e: KeyboardEvent) => {
        nameInput.value = "";
      }
    ); */

		//多播
		function sequenceSubscriber(observer) {
			const seq = [1, 2, 3];
			let timeoutId;

			function doSequence(arr, idx) {
				timeoutId = setTimeout(() => {
					observer.next(arr[idx]);

					if (idx === arr.length - 1) {
						observer.complete();
					} else {
						doSequence(arr, ++idx);
					}
				}, 1000);
			}

			doSequence(seq, 0);

			return {
				unsubscribe() {
					clearTimeout(timeoutId);
				}
			};
		}

		const sequence = new Observable(sequenceSubscriber);

		/* sequence.subscribe({
      next(num) {
        console.log(num);
      },
      complete() {
        console.log("Finished sequence");
      }
    }); */

		//Two subcriptions
		sequence.subscribe({
			next(num) {
				console.log("1st subcribe: " + num);
			},
			complete() {
				console.log("1st sequence finsished.");
			}
		});
		// After 1/2 second, subscribe again.
		setTimeout(() => {
			sequence.subscribe({
				next(num) {
					console.log("2nd subscribe: " + num);
				},
				complete() {
					console.log("2nd sequence finished.");
				}
			});
		}, 500);

		//修改这个可观察对象以支持多播
		//Create a multicast subscriber
		function multicastSequenceSubscriber() {
			const seq = [1, 2, 3];

			const observers = [];

			let timeoutId;

			return observer => {
				observers.push(observer);

				if (observers.length === 1) {
					timeoutId = doSequence(
						{
							next(val) {
								observers.forEach(obs => obs.next(val));
							},
							complete() {
								observers.slice(0).forEach(obs => obs.complete());
							}
						},
						seq,
						0
					);
				}

				return {
					unsubscribe() {
						observers.splice(observers.indexOf(observer), 1);

						if (observers.length === 0) {
							clearTimeout(timeoutId);
						}
					}
				};
			};
		}

		//Run through an array of numbers,emitting one value
		//per second until it gets to the end of the array.

		function doSequence(observer, arr, idx) {
			return setTimeout(() => {
				observer.next(arr[idx]);
				if (idx === arr.length - 1) {
					observer.complete();
				} else {
					doSequence(observer, arr, ++idx);
				}
			}, 1000);
		}

		//Create a new Observable that will deliver the above sequence
		const multicastSequence = new Observable(multicastSequenceSubscriber());

		// Subscribe starts the clock, and begins to emit after 1 second
		multicastSequence.subscribe({
			next(num) {
				console.log("1st subscribe(multicastSequence): " + num);
			},
			complete() {
				console.log("1st sequence finished.(multicastSequence)");
			}
		});

		// After 1 1/2 seconds, subscribe again (should "miss" the first value).
		setTimeout(() => {
			multicastSequence.subscribe({
				next(num) {
					console.log("2nd subscribe(multicastSequence): " + num);
				},
				complete() {
					console.log("2nd sequence finished.(multicastSequence)");
				}
			});
		}, 1500);

		this.test2();
	}

	onOpen(data) {
		console.log(data);
	}
	onClose(data) {
		console.log(data);
	}

	test2() {
		let testArr = 1;
		let myObservable$ = of(testArr).pipe(map(n => n * n));
		myObservable$.subscribe(res => { 
			console.log(res);
		})

		let getValue$ = Observable.create((observer: Observer<any>) => {
			myObservable$.subscribe(res => { 
				observer.next(res);
				observer.complete();
			});
		}).pipe(last());

		getValue$.subscribe(res => console.log(res));
	}
}
