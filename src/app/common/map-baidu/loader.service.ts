import { Injectable,Inject } from '@angular/core';

declare const document:any;

export class AbmConfig { 
	/**
	 * APP KEY 必须项
	 * @type {string}
	 */
	apiKey:string;

	/**
	 * 默认:api.map.baidu.com/api
	 * @type {string}
	 */
	apiHostAndPath?:string;

	/**
	 * API异步加载回调函数名
	 * @type {string}
	 */
	apiCallBack?:string;

	/**
	 * API版本号,默认:2.0
	 * @type {string}
	 */
	apiVersion?:string;

	/**
	 * API 请求协议
	 * @type {('http' | 'https' | 'auto')}
	 */
	apiProtocol?:'http' | 'https' | 'auto';

	/**
	 * 默认地图配置项,等同于[MapOptions 对象规范](http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a0b1)
	 * @type {*}
	 */
	mapOptions?:any;

	/**
	 * 默认全景配置项,等同于[PanoramaOptions 对象规范](http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a8b1)
	 */
	panoramaOptions?:any;
}

@Injectable()
export class LoaderService {
	private _scriptLoadingPromise:Promise<void>;
	private _cog:any;
	constructor(@Inject('AbmConfig') public cog:AbmConfig) { 
		this._cog = Object.assign(<AbmConfig>{
			apiProtocol:'auto',
			apiVersion:'3.0',
			apiCallBack:'angularBaiduMapLoader',
			apiHostAndPath:'api.map.baidu.com/api'
		},cog);
	}

	load():Promise<void> { 
		if(this._scriptLoadingPromise) { 
			return this._scriptLoadingPromise;
		}

		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;
		script.defer = true;
		script.src = this._getSrc();

		this._scriptLoadingPromise = new Promise<void>((resolve:Function,reject:Function) => { 
			(<any>window)[this._cog.apiCallBack] = () => { resolve(); };

			script.onerror = (error:Event) => { reject(error); };
		});

		document.body.appendChild(script);
		return this._scriptLoadingPromise;
	}

	private _getSrc():string { 
		let protocol:string;
		switch (this._cog.apiProtocol) { 
			case 'http':
				protocol = 'http:';
				break;
			case 'https':
				protocol = 'https:';
				break;
			default: 
				protocol = '';
				break;
		}
		const queryParams:{[key:string]:string | string[]} = { 
			v:this._cog.apiVersion,
			ak:this._cog.apiKey,
			callback:this._cog.apiCallBack
		};

		const params:string = 
			Object.keys(queryParams)
				.filter((k:string) => queryParams[k] != null)
				.filter((k:string) => { 
					return !Array.isArray(queryParams[k]) || (Array.isArray(queryParams[k]) && queryParams[k].length > 0);
				})
				.map((k:string) => { 
					const i = queryParams[k];
					if(Array.isArray(i)) { return {key:k,value:i.join(',')}; }
					return { key:k,value:i };
				})
				.map((entry:{key:string,value:string}) => `${entry.key}=${entry.value}`)
				.join('&');
		return `${protocol}//${this._cog.apiHostAndPath}?${params}`;
	}
}