import { Component, OnInit, OnDestroy, Input, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { AdDirective } from '../ad.directive';
import { AdItem } from '../ad-item';
import { AdComponent } from 'src/app/ad.component';

@Component({
  selector: 'app-ad-banner',
  template: `
    <div class="ad-banner">
      <h3>Advertisements</h3>
      <ng-template ad-host></ng-template>
    </div>
  `
})
export class AdBannerComponent implements OnInit,OnDestroy {

  @Input() ads:AdItem[];
  currentAdIndex = -1;
  @ViewChild(AdDirective) adHost:AdDirective;
  interval:any;

  constructor(private componentFactoryResolver:ComponentFactoryResolver) { }

  loadComponent() { 
    this.currentAdIndex = (this.currentAdIndex+1)%this.ads.length;
    let adItem = this.ads[this.currentAdIndex];

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(adItem.component);
    let viewContainerRef = this.adHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<AdComponent>componentRef.instance).data = adItem.data;
  }

  getAds() { 
    this.interval = setInterval(() => { 
      this.loadComponent();
    },3000);
  }

  ngOnInit() {
    this.loadComponent();
    this.getAds();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    clearInterval(this.interval);
  }
  

}

/**
 * 通常，Angular 编译器会为模板中所引用的每个组件都生成一个 
 * ComponentFactory 类。 
 * 但是，对于动态加载的组件，模板中不会出现对它们的选择器的引用。

要想确保编译器照常生成工厂类，
就要把这些动态加载的组件添加到 NgModule 的 entryComponents 数组中：
 */
