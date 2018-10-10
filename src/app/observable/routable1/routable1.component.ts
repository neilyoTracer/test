import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-routablea',
  templateUrl: './routable1.component.html',
  styleUrls: ['./routable1.component.css']
})
export class Routable1Component implements OnInit {

	navStart$:Observable<NavigationStart>;

  constructor(private router:Router) { 
		this.navStart$ = router.events.pipe(
			filter(evt => evt instanceof NavigationStart)
		) as Observable<NavigationStart>
	}

  ngOnInit() {
		this.navStart$.subscribe(evt => console.log('Navigation Started!'));
  }

}
