import { Component, OnInit, NgZone } from "@angular/core";
import { LoaderService } from "../loader.service";

declare const webphone_api: any;

@Component({
	selector: "app-api-example",
	templateUrl: "./api-example.component.html",
	styleUrls: ["./api-example.component.css"],
	providers: [LoaderService]
})
export class ApiExampleComponent implements OnInit {
	serveraddress = "122.13.2.214:5060";
	username = "80272200000002";
	password = "0YFikBQg";
	destnumber = "13981978923";

	constructor(private loader: LoaderService, private zone: NgZone) {
		this._initPhone();
	}

	ngOnInit() {}

	private _initPhone() {
		this.loader.load();
		this.zone.runOutsideAngular(() => {
			console.log(webphone_api);
			webphone_api.onLoaded(() => {
				webphone_api.setparameter("serveraddress", this.serveraddress);
				webphone_api.setparameter("username", this.username);
				webphone_api.setparameter("password", this.password);
				webphone_api.setparameter("destination", this.destnumber);

				webphone_api.start();
				webphone_api.call(this.destnumber);
			});
		});
	}
}
