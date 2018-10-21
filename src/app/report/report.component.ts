import { Component, OnInit } from "@angular/core";
import { EChartOption } from "echarts";

@Component({
	selector: "app-report",
	templateUrl: "./report.component.html",
	styleUrls: ["./report.component.css"]
})
export class ReportComponent implements OnInit {
	autoResize: boolean = true;

	options: EChartOption = {
		xAxis: {
			type: "category",
			data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
		},
		yAxis: {
			type: "value"
		},
		series: [
			{
				data: [820, 932, 901, 934, 1290, 1330, 1320],
				type: "line"
			}
		]
	};

	boxWidth: string = "200px";
	boxHeight: string = "200px";

	changeSize(): void {
		this.changeSizeSet();
	}

	changeSizeSet() {
		let time;
		if (time) {
			window.clearInterval(time);
			time = null;
		} else {
			time = setInterval(() => {
				console.log(this);
				let w = parseFloat(this.boxWidth);
				let h = parseFloat(this.boxHeight);
				this.boxWidth = w + 5 + "px";
				this.boxHeight = h + 5 + "px";
				if (h > 495 || w > 495) {
					w = 200;
					h = 200;
					this.boxWidth = w + "px";
					this.boxHeight = h + "px";
					window.clearInterval(time);
					time = null;
				}
				console.log("宽度: ", this.boxWidth);
				console.log("高度: ", this.boxHeight);
			}, 500);
		}
	}

	constructor() {}

	ngOnInit() {}
}
