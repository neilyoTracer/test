import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-routableb',
  templateUrl: './routable2.component.html',
  styleUrls: ['./routable2.component.css']
})
export class Routable2Component implements OnInit {

  constructor(private activateRoute:ActivatedRoute) { }

  ngOnInit() {
		this.activateRoute.url	
			.subscribe(url => console.log('The URL changed to: ' + url));
  }

}

//响应式表单 (reactive forms)


/* export class MyComponent implements OnInit { 
	nameChangeLog:string[] = [];
	heroForm:FormGroup;

	ngOnInit() { 
		this.logNameChange();
	}

	logNameChange() { 
		const nameControl = this.heroForm.get('name');

		nameControl.valueChanges.forEach(
			(value:string) => this.nameChangeLog.push(value)
		)
	}
} */

//输入提示建议
/* 从输入中监听数据。

移除输入值前后的空白字符，并确认它达到了最小长度。

防抖（这样才能防止连续按键时每次按键都发起 API 请求，而应该等到按键出现停顿时才发起）

如果输入值没有变化，则不要发起请求（比如按某个字符，然后快速按退格）。

如果已发出的 AJAX 请求的结果会因为后续的修改而变得无效，那就取消它。 */

/* import { fromEvent } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

const searchBox = document.getElementById('search-box');

const typeahead = fromEvent(searchBox,'input').pipe(
	map((e:KeyboardEvent) => e.target.value),
	filter(text => text.length > 2),
	debounceTime(10),
	distinctUntilChanged(),
	switchMap(() => ajax('/api/endpoint'))
);

typeahead.subscribe(data => { 
	//Handle the data from the API
}) */

//指数化退避
// 指数化退避是一种失败后重试 API 的技巧，它会在每次连续的失败之后让重试时间逐渐变长，超过最大重试次数之后就会彻底放弃。 
// 如果使用承诺和其它跟踪 AJAX 调用的方法会非常复杂，而使用可观察对象，这非常简单
/* 
import { pipe, range, timer, zip } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { retryWhen, map, mergeMap } from 'rxjs/operators';

function backoff(maxTries,ms) { 
	return pipe(
		retryWhen(attempts => range(1,maxTries)
			.pipe(
				zip(attempts,(i) => i),
				map(i => i*i),
				mergeMap(i => timer(i*ms))
			)
		)
	);
}

ajax('/api/endpoint')
	.pipe(backoff(3,250))
	.subscribe(data => handleData(data));

function handleData() { 

} */