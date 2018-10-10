import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

/**
 * 表达式中的上下文变量是由模板变量、指令的上下文（如果有）和组件的成员叠加而成的。
 * 如果你要引用的变量名存在于一个以上的命名空间中，那么模板变量是最优先的，其次是
 * 指令的上下文变量，最后是组件的成员
 * 
 * 上一个例子中就体现了这种命名冲突。组件具有一个名叫 hero 的属性，
 * 而 *ngFor 声明了一个也叫 hero 的模板变量。 
 * 在 {{hero.name}} 表达式中的 hero 实际引用的是模板变量，而不是组件的属性。
 * 
 * 模板表达式不能引用全局命名空间中的任何东西,比如window或document.他们也不能调用console.log或Math.max
 * 它们只能引用表达式上下文中的成员。
 * 
 * JavaScript中那些具有或可能引发副作用的表达式是被禁止的，包括
 * 赋值 =，+=，-=....
 * new运算符
 * ,的链式表达式
 * ++ --
 * 
 * 有些样式绑定中的样式带有单位
 * <button [style.font-size.em]="isSpecial ? 3:1">Big<button>
 * <button [style.font-size.%]="!isSpecial ? 150:50">small<button>
 * 
 * 声明输入与输出属性
 * 
 * @input() hero:Hero;
 * @Output() deleteRequest = new EventEmitter<Hero>()
 * 
 * 另外,还可以在指令元数据的inputs或outputs数组中标记出这些成员.比如这个例子
 * @Component({ 
 *    inputs:['hero'],
 *    outputs:['deleteRequest']
 * })
 */

 /* 带trackBy的*ngFor

 trackByHeroes(index:number,hero:Hero):number { return hero.id; }
 <div *ngFor="let hero of heroes;trackBy:trackByHeroes">
    ({{hero.id}}){{hero.name}}
 </div> */

