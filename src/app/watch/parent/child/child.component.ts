import {
	Component,
	OnInit,
	Input,
	SimpleChanges,
	KeyValueDiffers,
	KeyValueDiffer
} from "@angular/core";

@Component({
	selector: "hr-child",
	templateUrl: "./child.component.html",
	styleUrls: ["./child.component.css"]
})
export class ChildComponent implements OnInit {

	@Input() 
	set dataFromParent(value:any) {
		this._dataFromParent = value;
		if(!this._differ && value) { 
			this._differ = this._differs.find(value).create<string,any>();
		}
	};
	get dataFromParent():any {
		return this._dataFromParent;
	}
	private _dataFromParent:any;
	private _differ:KeyValueDiffer<string,any>;

	dataRefChanged: boolean = false;
	dataProChanged: boolean = false;
	count: number = 0;

	constructor(private _differs: KeyValueDiffers) {

	}

	ngOnInit() {}

	ngOnChanges(changes: SimpleChanges): void {
		//Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
		//Add '${implements OnChanges}' to the class.
		if ("dataFromParent" in changes) {
			this.dataRefChanged = true;
			this.count++;
			console.log(changes["dataFromParent"]);
		} else {
			this.dataRefChanged = false;
		}
	}

	ngDoCheck(): void {
		//Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.
		//Add 'implements DoCheck' to the class.
		if(this._differ) { 
			const changes = this._differ.diff(this._dataFromParent);
			if(changes) {
				console.log(changes);
				console.log(this.dataFromParent);
				this.dataProChanged = true;
			} else { 
				this.dataProChanged = false;
			}
		} else { 
			this.dataProChanged = false;
		}
	}
}
