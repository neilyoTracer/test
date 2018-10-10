import { Component, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Hero } from "src/app/hero";
import { HeroService } from "../hero.service";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { EventEmitter } from "events";

@Component({
  selector: "app-hero-search",
  templateUrl: "./hero-search.component.html",
  styleUrls: ["./hero-search.component.css"]
})
export class HeroSearchComponent implements OnInit {
  // $ 是一个命名惯例，用来表明 heroes$ 是一个 Observable，而不是数组。
  heroes$: Observable<Hero[]>;

  // 创建一个发射器
  private searchTerms = new Subject<string>(); //new 了一个Observable的子类实例,一个发射可观察对象的发射器

  constructor(private heroService: HeroService) {}

  //执行search的时候启动发射
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    // 初始化发射器管道
    this.heroes$ = this.searchTerms.pipe(
      //等待300ms后确定好term的值
      debounceTime(300),
      //忽略在上1次term值change之后300ms内的所有term值变化
      distinctUntilChanged(),
      //发射一个全新的可观察者对象
      switchMap((term: string) => this.heroService.searchHeroes(term))
    );
  }

  /* 借助 switchMap 操作符， 每个有效的击键事件都会触发一次 HttpClient.get() 方法调用。 即使在每个请求之间都有至少 300ms 的间隔，仍然可能会同时存在多个尚未返回的 HTTP 请求。

  switchMap() 会记住原始的请求顺序，只会返回最近一次 HTTP 方法调用的结果。 以前的那些请求都会被取消和舍弃。

  注意，取消前一个 searchHeroes() 可观察对象并不会中止尚未完成的 HTTP 请求。 那些不想要的结果只会在它们抵达应用代码之前被舍弃。 */
}
