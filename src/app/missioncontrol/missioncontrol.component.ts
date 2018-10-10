import { Component, OnInit } from "@angular/core";
import { MissionService } from "../mission.service";

@Component({
  selector: "app-missioncontrol",
  template: `
    <h2>Mission Control</h2>
    <button (click)="announce()">Announce mission</button>
    <app-astronaut *ngFor="let astronaut of astronauts"
      [astronaut]="astronaut">
    </app-astronaut>

    <h3>Histroy</h3>
    <ul>
      <li *ngFor="let event of history">{{event}}</li>
    </ul>
  `,
  providers: [MissionService]
})
export class MissioncontrolComponent {
  astronauts = ["Lovell", "Swigert", "Haise"];
  history: string[] = [];
  missions = ["Fly to the moon!", "Fly to mars!", "Fly to Vegas!"];
  nextMission = 0;

  constructor(private missionService: MissionService) {
    missionService.missionConfirmed$.subscribe(astronauts => {
      this.history.push(`${astronauts} confirmed the mission`);
    });
  }

  announce() {
    let mission = this.missions[this.nextMission++];
    this.missionService.announceMission(mission);
    this.history.push(`Mission "${mission}" announced`);
    if (this.nextMission >= this.missions.length) {
      this.nextMission = 0;
    }
  }

  ngOnInit() {}
}
