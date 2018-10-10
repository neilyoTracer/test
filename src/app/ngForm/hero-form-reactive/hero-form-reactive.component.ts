import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Hero } from '../hero';
import { forbiddenNameValidator } from '../custom-validators/forbidden-name-validator';
import { identityRevealedValidator } from '../custom-validators/identity-revealed-validator';

@Component({
  selector: 'app-hero-form-reactive',
  templateUrl: './hero-form-reactive.component.html',
  styleUrls: ['./hero-form-reactive.component.css']
})
export class HeroFormReactiveComponent implements OnInit {

  heroForm:FormGroup;
  hero: Hero = new Hero();

  constructor() { }

  ngOnInit():void {
    this.heroForm = new FormGroup({ 
      'name':new FormControl(this.hero.name,[
        Validators.required,
        Validators.minLength(4),
        forbiddenNameValidator(/bob/i)
      ]),
      'alterEgo':new FormControl(this.hero.alterEgo),
      'power':new FormControl(this.hero.power,Validators.required)
    },{validators:identityRevealedValidator})
  }

  get name() { return this.heroForm.get('name')};
  get power() { return this.heroForm.get('power')};

}
