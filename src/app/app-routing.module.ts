import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HeroesComponent } from "src/app/heroes/heroes.component";
import { DashboardComponent } from "src/app/dashboard/dashboard.component";
import { HeroDetailComponent } from "src/app/hero-detail/hero-detail.component";
import { CountdownParentComponent } from "./countdown-parent/countdown-parent.component";
import { MissioncontrolComponent } from "./missioncontrol/missioncontrol.component";
import { LoopBackComponent } from "./ngForm/loop-back/loop-back.component";
import { HeroFormComponent } from "./ngForm/hero-form/hero-form.component";
import { ObservableTestComponent } from "./observable/observable-test/observable-test.component";
import { HeroParentComponent } from "./Interaction/hero-parent/hero-parent.component";
import { ApiExampleComponent } from "./webphone/api-example/api-example.component";

const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "heroes", component: HeroesComponent },
  { path: "dashboard", component: DashboardComponent },
  { path: "detail/:id", component: HeroDetailComponent },
  { path: "smalltool", component: CountdownParentComponent },
  { path: "missionControl", component: MissioncontrolComponent },
  { path: "ngformFeature", component: LoopBackComponent },
  { path: "heroForm", component: HeroFormComponent },
  { path: "observable", component: ObservableTestComponent },
  { path: "interaction", component: HeroParentComponent },
  { path: "webphone", component: ApiExampleComponent },
	{ 
		path: "map-app", 
		loadChildren:'./map-app/map-app.module#MapAppModule'
	},{ 
		path: "test", 
		loadChildren:'./test/test.module#TestModule'
	},{
		path:'watch',
		loadChildren:'./watch/watch.module#WatchModule'
	}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
