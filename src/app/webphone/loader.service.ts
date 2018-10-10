import { Injectable } from '@angular/core';

declare const document:any;

@Injectable()
export class LoaderService {

	constructor() { }
	
	load():void { 

		const script = document.createElement('script');
		script.type = 'text/javascript'
		script.src = 'assets/webphone/webphone/webphone_api.js'

		document.body.appendChild(script);
	}
}
