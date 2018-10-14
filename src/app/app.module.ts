import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { HeroesComponent } from "./heroes/heroes.component";
import { HeroDetailComponent } from "./hero-detail/hero-detail.component";
import { MessagesComponent } from "./messages/messages.component";
import { AppRoutingModule } from ".//app-routing.module";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientInMemoryWebApiModule } from "angular-in-memory-web-api";
import { InMemoryDataService } from "./in-memory-data.service";
import { HeroSearchComponent } from './hero-search/hero-search.component';
import { ChangeTestComponent } from './change-test/change-test.component';
import { CountdownTimerComponent } from './countdown-timer/countdown-timer.component';
import { CountdownParentComponent } from './countdown-parent/countdown-parent.component';
import { MissioncontrolComponent } from './missioncontrol/missioncontrol.component';
import { AstronautComponent } from './astronaut/astronaut.component';
import { AdBannerComponent } from './ad-banner/ad-banner.component';
import { AdDirective } from './ad.directive';
import { HeroJobAdComponent } from './hero-job-ad/hero-job-ad.component';
import { HeroProfileComponent } from './hero-profile/hero-profile.component';
import { LoopBackComponent } from './ngForm/loop-back/loop-back.component';
import { HeroFormComponent } from './ngForm/hero-form/hero-form.component';
import { HeroFormReactiveComponent } from './ngForm/hero-form-reactive/hero-form-reactive.component';
import { ForbiddenNameDirective } from './ngForm/forbidden-name.directive';
import { IdentityRevealedDirective } from './ngForm/identity-revealed.directive';
import { NameEditorComponent } from './ngForm/name-editor/name-editor.component';
import { ProfileEditorComponent } from './ngForm/profile-editor/profile-editor.component';
import { DynamicFormComponent } from './ngForm/dynamic-form/dynamic-form.component';
import { DynamicFormQuestionComponent } from './ngForm/dynamic-form-question/dynamic-form-question.component';
import { ObservableTestComponent } from './observable/observable-test/observable-test.component';
import { RxjsLibComponent } from './observable/rxjs-lib/rxjs-lib.component';
import { ZippyComponent } from './observable/zippy/zippy.component';
import { Routable1Component } from './observable/routable1/routable1.component';
import { Routable2Component } from './observable/routable2/routable2.component';
import { HeroChildComponent } from './Interaction/hero-child/hero-child.component';
import { HeroParentComponent } from './Interaction/hero-parent/hero-parent.component';
import { TrottleTestComponent } from './observable/trottle-test/trottle-test.component';
import { NameChildComponent } from './interaction/name-child/name-child.component';
import { NameParentComponent } from './interaction/name-parent/name-parent.component';
import { VersionChildComponent } from './interaction/version-child/version-child.component';
import { VersionParentComponent } from './interaction/version-parent/version-parent.component';
import { VoterComponent } from './interaction/voter/voter.component';
import { VoteTakerComponent } from './interaction/vote-taker/vote-taker.component';
import { CountdownParentAgComponent } from "./Interaction/countdown-parent/countdown-parent.component";
import { CountdownTimerAgComponent } from "./Interaction/countdown-timer/countdown-timer.component";
import { ApiExampleComponent } from './webphone/api-example/api-example.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';

registerLocaleData(zh);

@NgModule({
  declarations: [
    AppComponent,
    HeroesComponent,
    HeroDetailComponent,
    MessagesComponent,
    DashboardComponent,
    HeroSearchComponent,
    ChangeTestComponent,
    CountdownTimerComponent,
    CountdownParentComponent,
    MissioncontrolComponent,
    AstronautComponent,
    AdBannerComponent,
    AdDirective,
    HeroJobAdComponent,
    HeroProfileComponent,
    LoopBackComponent,
    HeroFormComponent,
    HeroFormReactiveComponent,
    ForbiddenNameDirective,
    IdentityRevealedDirective,
    NameEditorComponent,
    ProfileEditorComponent,
    DynamicFormComponent,
    DynamicFormQuestionComponent,
    ObservableTestComponent,
    RxjsLibComponent,
    ZippyComponent,
    Routable1Component,
    Routable2Component,
    HeroChildComponent,
    HeroParentComponent,
    TrottleTestComponent,
    NameChildComponent,
    NameParentComponent,
    VersionChildComponent,
    VersionParentComponent,
    VoterComponent,
		VoteTakerComponent,
		CountdownParentAgComponent,
		CountdownTimerAgComponent,
		ApiExampleComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
		HttpClientModule,
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
      dataEncapsulation: false
    }),
    BrowserAnimationsModule,
    NgZorroAntdModule
  ],
  providers: [{ provide: NZ_I18N, useValue: zh_CN }],
  bootstrap: [AppComponent],
  entryComponents: [HeroJobAdComponent, HeroProfileComponent]
})
export class AppModule {}
