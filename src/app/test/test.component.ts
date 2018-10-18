import { Component, OnInit } from "@angular/core";

@Component({
	selector: "app-test",
	templateUrl: "./test.component.html",
	styleUrls: ["./test.component.css"]
})
export class TestComponent implements OnInit {
	tabIndex: number = 0;

	constructor() {}

	ngOnInit() {}

	tabChanges(_e: any) {
		console.log(_e);
		this.tabIndex = _e.index;
	}
}
