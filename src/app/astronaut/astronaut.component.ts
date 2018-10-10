import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { MissionService } from '../mission.service';

@Component({
  selector: 'app-astronaut',
  template: `
    <p>
      {{astronaut}}: <strong>{{mission}}</strong>
      <button
        (click)="confirm()"
        [disabled]="!announced || confirmed">
        Confirm  
      </button>
    </p>
  `
})
export class AstronautComponent implements OnDestroy {

  @Input() astronaut:string;
  mission = '<no mission announced>';
  confirmed = false;
  announced = false;

  subscription:Subscription;

  constructor(private missionService:MissionService) { 
    this.subscription = missionService.missionAnnounced$.subscribe(
      mission => { 
        this.mission = mission;
        this.announced = true;
        this.confirmed = false;
      }
    );
  }

  confirm() { 
    this.confirmed = true;
    this.missionService.confirmMission(this.astronaut);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscription.unsubscribe();
  }

}
