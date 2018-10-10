import { Component, OnInit, ViewChild } from "@angular/core";
import { Hero } from "../hero";
import { NgForm } from "@angular/forms";
import { QuestionService } from "../service/question.service";


@Component({
  selector: "app-hero-form",
  templateUrl: "./hero-form.component.html",
  styleUrls: ["./hero-form.component.css"],
  providers:[QuestionService]
})
export class HeroFormComponent implements OnInit {

  @ViewChild(NgForm) form;
  powers = ["Really Smart", "Super Flexible", "Super Hot", "Weather changer"];

  model = new Hero(18, "Dr IQ", this.powers[0], "Chuck Overstreet");

  questions:any[];
  submitted = false;
  constructor(private service:QuestionService) {
    this.questions = service.getQuestions();
  }
  onSubmit() {
    this.submitted = true;
  }

  ngOnInit() {

  }

  get diagnostic() {
    return JSON.stringify(this.model);
  }

  newHero() { 
    this.model = new Hero(42,'','');
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

      console.log(this.form);
  }
}
