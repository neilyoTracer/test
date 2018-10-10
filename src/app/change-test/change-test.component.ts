import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck } from '@angular/core';

@Component({
  selector: "app-change-test",
  templateUrl: "./change-test.component.html",
  styleUrls: ["./change-test.component.css"]
})
export class ChangeTestComponent implements OnInit, OnChanges,DoCheck {
  @Input()
  changeTest: string;

  doCheckTest: { value: number} = { value: 1 };

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    console.log(changes);
    //changes:
  }

  ngDoCheck() { 
    console.log('doCheckTest变化了!');
  }

  incTest():void { 
    this.doCheckTest.value++;
  };
}
