import { Component, OnInit } from "@angular/core";
import { Hero } from "../hero";
import { HeroService } from "src/app/hero.service";
import { Router } from "@angular/router";
import { Observable, Observer } from "rxjs";

@Component({
  selector: "app-heroes",
  templateUrl: "./heroes.component.html",
  styleUrls: ["./heroes.component.css"]
})
export class HeroesComponent implements OnInit {
  heroes: Hero[] = [];

  constructor(private heroService: HeroService, private router: Router) {}

  ngOnInit() {
    this.getHeroes();
  }

  getHeroes(): void {
		this.test();
    this.heroService.getHeroes().subscribe(heroes => (this.heroes = heroes));
	}
	
	test() { 
		let myObserver$ = Observable.create((observer:Observer<any>) => { 
			this.heroService.getHeroes().subscribe(res => { 
				let exsiting = res.find(itm => itm.name === 'Narco');
				
				if(exsiting) { 

					observer.next(null);
				} else { 
					observer.next({error:true,invalidEnName:true});
				}

				observer.complete();
				

			})
		});

		myObserver$.subscribe(res => { 
			console.log(res);
			//xxxForm.get('enName').hasError('invalidEnName')
		})
	}

  makeHero(id: number): void {
    // this.router.navigate(['/detail',id]);
    this.router.navigateByUrl(`/detail/${id}`);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) {
      return;
    }

    this.heroService.addHero({ name } as Hero).subscribe(hero => {
      this.heroes.push(hero);
    });
  }

  delete(hero: Hero, e: Event): void {
    console.log(e);
    e.stopPropagation();
    this.heroes = this.heroes.filter(h => h !== hero);
    this.heroService.deleteHero(hero).subscribe();
  }
}
