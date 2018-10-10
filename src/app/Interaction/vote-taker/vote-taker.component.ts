import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vote-taker',
  templateUrl: './vote-taker.component.html',
  styleUrls: ['./vote-taker.component.css']
})
export class VoteTakerComponent implements OnInit {
	agreed = 0;
	disagreed = 0;
	voters = ['Mr. IQ','Ms. Universe','Bombasto'];

  constructor() { }

  ngOnInit() {
	}
	
	onVoted(agreed:boolean) { 
		agreed?this.agreed++:this.disagreed++;
	}

}
