import { Injectable } from "@angular/core";
import { Hero } from "./hero";
import { MessageService } from "./message.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError,map,tap } from 'rxjs/operators';

const httpOptions = { 
  headers:new HttpHeaders({'Content-Type':'application/json'})
}

@Injectable({
  providedIn: "root"
})
export class HeroService {


  private heroesUrl = 'api/heroes';

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  getHeroes(): Observable<Hero[]> {//Observable这个类的成员使用了Hero[]这样一个类型
    return this.http.get<Hero[]>/*注释*/(this.heroesUrl)
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError('getHeroes',[]))
      );
  }

  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    )
  }

  updateHero(hero:Hero):Observable<any> { 
    return this.http.put(this.heroesUrl,hero,httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updatedHero'))
    )
  }

  addHero(hero:Hero):Observable<Hero> { 
    return this.http.post<Hero>(this.heroesUrl,hero,httpOptions).pipe(
      tap((hero:Hero) => this.log(`added hero w/ id=${hero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    )
  }

  deleteHero(hero:Hero | number):Observable<Hero> { 
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url,httpOptions).pipe(
      tap(_ => this.log(`delete hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  searchHeroes(term:string):Observable<Hero[]> { 
    if(!term.trim()) { 
      return of([]);
    }

    return this.http.get<Hero[]>(`${this.heroesUrl}?name=${term}`).pipe(
      tap(_ => this.log(`found heroes matching ${term}`)),
      catchError(this.handleError<Hero[]>('searchHero',[]))
    )
  }

  private log(message: string) {
    this.messageService.add(`HeroService:${message}`);
  }

  private handleError<T> (operation = "operation",result?:T) { 
    return (error:any):Observable<T> => { 
      console.error(error);
      this.log(`${operation} failed:${error.message}`);

      return of(result as T);
    };
  }
}


/* function identity(arg:number):number { 
  return arg;
}

function identity(arg:any):any { 
  return arg;
}

function identity<T>(arg:T):T { 
  return arg;
}

let output = identity<string>("myString");// type of output will be 'string'

// 我们把这个版本的identity函数叫做泛型;
// 这里我们明确的指定了T是string类型，并做为一个参数传给函数，使用了 <> 括起来而不是() 。

// 第二种方法更普遍。利用了类型推论-- 即编译器会根据传入的参数自动地帮助我们确定T的类型：

let output = identity("myString");  // type of output will be 'string'

function loggingIdentity<T>(arg:T):T { 
  console.log(arg.length);
  return arg;
}

// 如果这么做，编译器会报错说我们使用了arg的.length属性，但是没有地方指明arg具有这个属性。 记住，这些类型变量代表的是任意类型，所以使用这个函数的人可能传入的是个数字，而数字是没有.length属性的。
// 现在假设我们想操作T类型的数组而不直接是T。由于我们操作的是数组，所以.length属性是应该存在的。 我们可以像创建其它数组一样创建这个数组：

function loggingIdentity<T>(arg:T[]):T[] { 
  console.log(arg.length);
  return arg;
}

function loggingIdentity<T>(arg:Array<T>):Array<T> { 
  console.log(arg.length);
  return arg;
}

// 泛型函数的类型与非泛型函数的类型没什么不同,只是有一个类型参数在最前面,像函数声明一样:
function identity<T>(arg:T):T { 
  return arg;
}

let myIdentity:<T>(arg:T) => T = identity;

// 我们也可以使用不同的泛型参数名，只要在数量上和使用方式上能对应上就可以。
function identity<T>(arg: T): T {
  return arg;
}

let myIdentity:<U>(arg:U) => U = identity;

// 我们还可以使用带有调用签名的对象字面量来定义泛型函数：
Let myIdentity:{<T>(arg:T):T} = identity;

// 这引导我们去写第一个泛型接口了。 我们把上面例子里的对象字面量拿出来做为一个接口：
interface GenericIdentityFn { //接口可以用来代表具体的类型
  <T>(arg:T):T;
}

function identity<T>(arg:T):T { 
  return arg;
}

let myIdentity:GenericIdentityFn = identity;

// 一个相似的例子，我们可能想把泛型参数当作整个接口的一个参数。 这样我们就能清楚的知道使用的具体是哪个泛型类型（比如： Dictionary < string > 而不只是Dictionary）。 这样接口里的其它成员也能知道这个参数的类型了。

interface GenericIdentityFn<T> { 
  (arg:T):T;
}

function identity<T>(arg:T):T { 
  return arg;
}

let myIdentity:GenericIdentityFn<number> = identity;

// 除了泛型接口，我们还可以创建泛型类
// 泛型类

class GenericNumber<T> { 
  zeroValue:T;
  add:(x:T,y:T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = (x,y) => x + y;

let stringNumeric = new GenericNumber<string>();
stringNumeric.zeroValue = '';
stringNumeric.add = (x,y) => x+y;

alert(stringNumeric.add(stringNumeric.zeroValue,'test'));  

// ** 我们在类那节说过，类有两部分：静态部分和实例部分。 泛型类指的是实例部分的类型，所以类的静态属性不能使用这个泛型类型。


//泛型约束
function loggingIdentity<T>(arg:T):T { 
  console.log(arg.length);
  return arg;
}

interface Lengthwise { 
  length:number;
}

function loggingIdentity<T extends Lengthwise>(arg:T):T { 
  console.log(arg.length);
  return arg;
}

// 现在这个泛型函数被定义了约束，因此它不再是适用于任意类型：
loggingIdentity(3);  // Error, number doesn't have a .length property

loggingIdentity({ length: 10, value: 3 });

// 在泛型约束中使用类型参数
function find<T,U extends Findable<T>>(n:T,s:U) { 
  //....
}

find(giraffe,myAnimal);

function create<T>(c:{new():T;}):T { 
  return new c();
}

class BeeKeeper { 
  hasMask:boolean;
}

class ZooKeeper {
  nametag:string
}

class Animal { 
  numLegs:number;
}

class Bee extends Animal { 
  keeper:BeeKeeper;
}

class Lion extends Animal { 
  keeper:ZooKeeper;
}

function findKeeper<A extends Animal,K>(a:{new():A;prototype:{keeper:K}}):K { 
  return a.prototype.keeper;
}

findKeeper(Lion).nametag; */