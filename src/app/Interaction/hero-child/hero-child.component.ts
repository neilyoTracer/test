import { Component, OnInit, Input } from '@angular/core';
import { Hero } from 'src/app/hero';

@Component({
  selector: 'app-hero-child',
	template: `
		<h3>{{hero.name}} says:</h3>
		<p>I, {{hero.name}}, am at your service, {{masterName}}.</p>
	`
})
export class HeroChildComponent implements OnInit {
	@Input() hero:Hero;
	@Input('master') masterName:string;

  constructor() { }

  ngOnInit() {
  }

}
