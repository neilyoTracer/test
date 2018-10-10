import { Component, OnInit } from '@angular/core';
import { Hero } from '../../hero';
import { HeroService } from '../../hero.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-hero-parent',
  templateUrl: './hero-parent.component.html',
  styleUrls: ['./hero-parent.component.css']
})
export class HeroParentComponent implements OnInit {
	heroes:Hero[] = [];
	master = 'Master';

  constructor(private heroService:HeroService) { }

  ngOnInit() {
		this.heroService.getHeroes()
			.subscribe(heroes => this.heroes = heroes)
  }

}
