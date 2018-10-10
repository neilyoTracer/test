import { Component, OnInit } from '@angular/core';
import { AdItem } from './ad-item';
import { AdService } from './ad.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Tour of Heroes';

  ads:AdItem[];
  constructor(private adService:AdService) { }

  ngOnInit() { 
    this.ads = this.adService.getAds();
  }
}

// 类
/* class Greeter { 
  greeting:string;
  constructor(message:string) { 
    this.greeting = message;
  }
  greet() { 
    return "Hello, " + this.greeting;
  }
}

let greeter = new Greeter("world");

class Animal { 
  move(distanceInMeters:number = 0) { 
    console.log(`Animal moved ${distanceInMeters}m.`);
  }
}

class Dog extends Animal { 
  bark() { 
    console.log('Woof! Woof!');
  }
}

const dog = new Dog();
dog.bark();
dog.move(10);
dog.bark(); */


/* 这个例子展示了最基本的继承：类从基类中继承了属性和方法。 
这里， Dog是一个 派生类，它派生自 Animal 基类，通过 extends关键字。 
派生类通常被称作 子类，基类通常被称作 超类。 */

/* class Animal { 
  name:string;
  constructor(theName:string) { 
    this.name = theName;
  }
  move(distanceInMeters:number = 0) { 
    console.log(`${this.name} move ${distanceInMeters}m.`);
  }
}

class Snake extends Animal { 
  constructor(name:string) { super(name); }
  move(distanceInMeters = 5) { 
    console.log("Slithering...");
    super.move(distanceInMeters);
  }
}

class Horse extends Animal { 
  constructor(name: string) { super(name); }
  move(distanceInMeters = 45) {
    console.log("Galloping...");
    super.move(distanceInMeters);
  }
}

let sam = new Snake("Sammy the Python");
let tom:Animal = new Horse("Tommy the Palomino");

sam.move();
tom.move(34); */
// Slithering...
// Sammy the Python moved 5m.
//   Galloping...
// Tommy the Palomino moved 34m.

/**
 * TypeScript使用的是结构性类型系统。 当我们比较两种不同的类型时，
 * 并不在乎它们从何处而来，如果所有成员的类型都是兼容的，
 * 我们就认为它们的类型是兼容的。
 * 然而，当我们比较带有 private或 protected成员的类型的时候，
 * 情况就不同了。 如果其中一个类型里包含一个 private成员，
 * 那么只有当另外一个类型中也存在这样一个 private成员， 
 * 并且它们都是来自同一处声明时，我们才认为这两个类型是兼容的。 
 * 对于 protected成员也使用这个规则。
 */

/* class Animal {
  private name: string;
  constructor(theName: string) { this.name = theName; }
}

class Employee {
  private name: string;
  constructor(theName: string) { this.name = theName; }
}

class Rhino extends Animal { 
  constructor() { super("Rhino"); }
}

let animal = new Animal('Goat');
let rhino = new Rhino();
let employee = new Employee('Goat');

animal = rhino;

animal = employee;//这个报错只会typescript类型错误,不会影响程序执行,因为最终的js可以这样赋值

console.log(animal);

//protected
// protected修饰符与 private修饰符的行为很相似，但有一点不同， 
// protected成员在派生类中仍然可以访问。例如：

class Person { 
  protected name:string;
  constructor(name:string) { this.name = name; }
}

class Employee extends Person { 
  private department:string;

  constructor(name:string,department:string) { 
    super(name)
    this.department = department;
  }

  public getElevatorPitch() { 
    return `Hello,my name is ${this.name} and I work in ${this.department}.`;
  }
}

let howard = new Employee('Howard',"Sales");
console.log(howard.getElevatorPitch());
console.log(howard.name);

// 构造函数也可以被标记成 protected。 这意味着这个类不能在包含它的类外被实例化，但是能被继承
class Person { 
  protected name:string;
  protected constructor(theName:string) { this.name = theName; }
}

class Employee extends Person { 
  private department:string;

  constructor(name:string,department:string) { 
    super(name);
    this.department = department;
  }

  public getElevatorPitch() { 
    return `Hello,my name is ${this.name} and I work in ${this.department}.`;
  }
}

let howard = new Employee("Howard", "Sales");
let john = new Person("John"); // 错误: 'Person' 的构造函数是被保护的.

class Octopus { 
  readonly name:string;
  readonly numberOfLegs:name = 8;
  constructor(theName:string) { 
    this.name = theName;
  }
}

let dad = new Octopus("Man with the 8 strong legs");
dad.name = "Man with the 3-piece suit"; // 错误! name 是只读的.

//参数属性

class Animal { 
  constructor(private name:string) {}
  move(distanceInMeters:number) { 
    console.log(`${this.name} moved ${distanceInMeters}m.`);
  }
}

//参数属性通过给构造函数添加一个访问限定符来声明.

//存取器
class Employee { 
  fullName:string;
}

let employee = new Employee();
employee.fullName = "Bob Smith";
if(employee.fullName) { 
  console.log(employee.fullName);
}


//通过getter/setter函数来访问或设置类的私有成员
let passcode = "secret passcode";

class Employee { 
  private _fullName:string;

  get fullName():string { 
    return this._fullName;
  }

  set fullName(newName:string) { 
    if(passcode && passcode == 'secret passcode') { 
      this._fullName = newName;
    } else { 
      console.log("Error: Unauthorized update of employee!");
    }
  }

}

let employee = new Employee();
employee.fullName = "Bob Smith";
if (employee.fullName) {
  alert(employee.fullName);
}

//静态属性
class Grid { 
  static origin = {x:0,y:0};
  calculateDistanceFromOrigin(point:{x:number;y:number}) { 
    let xDist = (point.x - Grid.origin.x);
    let yDist = (point.y - Grid.origin.y);
    return Math.sqrt(xDist * xDist + yDist*yDist)/this.scale;
  }

  constructor(public scale:number) { }
}

//抽象类
// 抽象类中的抽象方法不包含具体实现并且必须在派生类中实现;
abstract class Department {
  constructor(public name:string) { 

  }

  printName():void { 
    console.log('Department name: ' + this.name);
  }

  abstract printMeeting():void;//必须在派生类中实现
}

class AccountingDepartment extends Department { 
  constructor() { 
    super('Accounting and Auditing');// 在派生类的构造函数中必须调用super()
  }

  printMeeting():void { 
    console.log("The Accounting Department meets each Monday at 10am.");
  }

  generateReport():void { 
    console.log("Generating accounting reports...");
  }
}

let department: Department; // 允许创建一个对抽象类型的引用
department = new Department(); // 错误: 不能创建一个抽象类的实例
department = new AccountingDepartment(); // 允许对一个抽象子类进行实例化和赋值
department.printName();
department.printMeeting();
department.generateReport();  */// 错误: 方法在声明的抽象类中不存在

/**
 * 接口（Interfaces）：不同类之间公有的属性或方法，可以抽象成一个接口。
 * 接口可以被类实现（implements）。一个类只能继承自另一个类，但是可以实现多个接口
 */