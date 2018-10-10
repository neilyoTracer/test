import { Component, OnInit } from "@angular/core";
import { from, interval, observable, fromEvent, of, pipe, Observable } from "rxjs";
import { ajax } from "rxjs/ajax";
import { map, filter } from "rxjs/operators";

@Component({
    selector: "app-rxjs-lib",
    templateUrl: "./rxjs-lib.component.html",
    styleUrls: ["./rxjs-lib.component.css"]
})
export class RxjsLibComponent implements OnInit {
    //Naming observables
	stopwatchValue:number;
	stopwatchValue$:Observable<number>;

	start() { 
		this.stopwatchValue$.subscribe(num => 
			this.stopwatchValue = num	
		);
	}

    constructor() {
		
	}

    ngOnInit() {
        this.test();
    }

    test() {
        //Create an observable from a promise
        const data = from(fetch("/api/endpoint"));

        data.subscribe({
            next(res) {
                console.log(res);
            },
            error(err) {
                console.log("Error: " + err);
            },
            complete() {
                console.log("Completed");
            }
        });

        //Create an observable from a counter
        /* const secondsCounter = interval(1000);

	secondsCounter.subscribe(n => 
		console.log(`It's been ${n} seconds since subscribing!`)); */

        // Create an observable from an event
        const el = document.getElementById("my-element");
        const mouseMoves = fromEvent(el, "mousemove");

        const subscription = mouseMoves.subscribe((evt: MouseEvent) => {
            console.log(`Coords:${evt.offsetX} X ${evt.offsetY}`);

            if (evt.offsetX < 40 && evt.offsetY < 40) {
                subscription.unsubscribe();
            }
        });

        //Create an observable that creates an AJAX request
        /* const apiData = ajax('/api/data');

	apiData.subscribe(res => console.log(res.status,res.response)); */

        /* const nums = of(1,2,3);
	
	const squareValues = map((val:number) => val*val);
	const squareNums = squareValues(nums);

	squareNums.subscribe(x => { console.log(x) }); */

        const nums = of(1, 2, 3, 4, 5);

        const squareOddVals = pipe(
            filter((n: number) => n % 2 !== 0),
            map(n => n * n)
        );

        const squareOdd = squareOddVals(nums);

        squareOdd.subscribe(x => console.log(x));
    }
}
