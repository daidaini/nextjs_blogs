---
title: constexpr 研究
date: 2024-08-14 10:43:32
description: 理解constexpr
tags:
  - c++
  - c++11
---

## c++11之前的编译期常量

编译器要求编译期间就要确定的，除了变量的类型，最频繁出现的就是 sizeof、枚举(enum)。
而使用时，需要用到编译期常量的则是：
1. switch 语句中的case标签
2. 模板(template)的模板参数

### 编译期常量的来源

#### `sizeof`
```c++
int someArr = {5,2,0};
constexpr int a = sizeof(someArr); //可编译

// sizeof(someArr) 编译期计算确定，通过constexpr验证
```

#### 枚举
使用enum定义的成员，都被认为是编译期常量。  
比如：
```c++
enum Color{
	RED, GREEN, BLUE, YELLOW
};

assert(Color::RED == 0);
assert(Color::BLUE == 2);
```

### 编译期常量使用

#### 数组
```c++
char charArray[] = "This is amazing";
int someArr[50];
```
数组的size，需要在编译期就确定，无论是通过常量数字确定，或是通过初始化指定，都是编译期就完成的动作。

#### switch lables
```c++
void comment(int phrase) { 
	switch(phrase) { 
	case 42: std::cout << "You are right!" << std::endl; 
		break; 
	case Color::BLUE: 
		std::cout << "Don't be upset!" << std::endl; 
		break; 
	case 'z': 
		std::cout << "You are the last one!" << std::endl; 
		break; 
	default: 
		std::cout << "This is beyond what I can handle..." << std::endl; 
	} 
}
```
上述代码中，不管是 42、Color::BLUE、'z'，都是在编译期就被计算认为是int类型，才能编译通过。

#### tmplate
template的模板参数，必须使用编译期常量进行指定，如下示例：
```c++
template <long N, char S, Color C>
struct MyObj{
	void Print(){
		printf("%lu, %c, %d\n", N, S, C);
	}
};
```

### 使用编译期常量的好处

#### 更安全的程序
示例： **矩阵相乘**
> 两个矩阵相乘，能够成立的前提是：
> 当且仅当左矩阵的列数等于右矩阵的行数，才能继续。

```c++
class Matrix{ 
public:
	unsigned rowCount; 
	unsigned columnCount; 
}; 
Matrix operaotr* (Matrix const& lhs, Matrix const& rhs)
{ 
	if(lhs.getColumnCount() != rhs.getRowCount()) 
		throw HaveProblem(); 
		// other operation ...
};
```

如果我们在编译期就知道了矩阵的size，那么我们就可以把上边的判断放在模板中完成。
这样，不同size的矩阵就变成了不同类型的变量了。  
矩阵的乘法也相应变得简单了点。
```c++
template <unsigned Rows, unsigned Columns> 
class Matrix{ 
	//.... 
}; 

template <unsigned N, unsigned M, unsigned P> 
Matrix<N,P> operator* (Matrix<N,M> const& lhs, Matrix<M,P> const& rhs) { 
	/*...*/ 
}
```

使用：
```c++
int main(){
	Matrx<1,2> m12 = /*...*/; 
	Matrx<2,3> m23 = /*...*/; 
	auto m13 = m12 * m23; 
	auto mError = m23 * m13;
}
```

使用模板确定的编译期常量，可以在编译期就能解决矩阵无法相乘的问题。

#### 编译优化
除了直接用常数来实例化模板，还有没有其他方法来告诉编译器这个是编译期常量？
其实： 
编译器能根据编译期常量来实现各种不同的优化。
比如，  
如果在一个if判断语句中，其中_一个条件是编译期常量_ ，编译器知道在这个判断句中一定会走某一条路，那么编译器就会 _把这个if语句优化掉_，留下只会走的那一条路。
代码示例：
```c++
if (sizeof(void*) == 4) { 
	std::cout << "This is a 32-bit system!" << std::endl; 
} else { 
	std::cout << "This is a 64-bit system!" << std::endl; 
}
```
在上例中，编译器就会直接利用其中某一个cout语句来替换掉整个if代码块（反正运行代码的机器是32还是64位的又不会变。）

另一个可以优化的地是**空间优化**。  
总体来说，如果我们的对象利用编译期常数来存储数值，那么我们就不用在这个对象中再占用内存存储这些数。

### 编译期计算
当我们通过某些手段去“胁迫”编译器，把运算任务从运行时提前到编译期，这就是编译期计算的原理。  
如：
1. 示例1：
```c++
int const doubleCount = 110; 
unsigned char doubleBuffer[doubleCount * sizeof(double)] = {};
```
由于doubleCount用于数组的声明，因此编译期会认为其是编译期常量
2. 示例2：
```c++
std::string nonsense(char input) { 
	switch(input) { 
	case "some"[(sizeof(void*) == 4) ? 0 : 1]: 
		return "Aachen"; 
	default: 
		return "Wuhan"; 
	} 
}
```
case标签，编译期计算出，否则编译无法通过
4. 示例3:
```c++
std::string nonsense(char input) { 
	auto const index = (sizeof(void*) == 4) ? 0 : 1; 
	auto const someLabel = "some"[index]; 
	switch(input) { 
	case someLabel: 
		return "Aachen"; 
	default: 
		return "Wuhan"; 
	} 
}
```
index用以"some"数组的下标，被认为编译期常量；
someLabel用以switch的case标签，被认为是编译期常量

#### 使用模板进行编译期计算
实例化模板的参数必须为编译期常数  
---换言之，编译器会在编译期计算 作为实例化模板参数的常量表达式。
```c++
template <unsiged N> 
struct Fibonacci; 

template<> 
struct Fibonacci<0>{ 
	static unsigned const value = 0; 
}; 

template<> 
struct Fibonacci<1>{ 
	static unsigned const value = 1; 
}; 

template<unsigned N> 
struct Fibonacci{ 
	static unsigned const value = Fibonacci<N-1>::value + Fibonacci<N-2>::value; 
};
```
这是一个斐波那契数列计算的示例，  
通过template，将计算过程全都转移到了编译期。


## Constexpr
C++11后，引入了constexpr，
以及使用constexpr标识的编译期函数( _constexpr function_)

### constexpr function
那斐波那契数列计算的代码可以简化为如下：
```c++
constexpr unsigned fibonacci(unsigned i){ 
	return (i <= 1u) ? i : (fibonacci(i-1) + fibonacci(i-2)); 
}
```

如果带有**constexpr**的函数的参数被编译期检测为编译期常量，那么这个函数就可以自动地在编译期运行。  

```c++
int main(int argc, char** argv){ 
	char int_values(fibonacci(6)) = {}; // 正确，数组大小在编译期被强制计算 
	cout << sizeof(int_values) <<endl; 
	
	//cout << fibonacci(argc) <<endl; 
	cout << sizeof(std::array(char, fibonacci(argc))) <<endl; //ERROR，模板参数要求在编译期确定fibonacci的值，但是argc是运行时参数 
}
```

### literal type
使用 constexpr 标识的常量，我们称为字面量(literal type)。  
> Literal types are the types of constexpr variables and they can be constructed, manipulated, and returned from constexpr functions

另外，需要注意的是，使用 constexpr修饰的**构造函数的类**，也都是literal type。
因为拥有此类构造函数的类的对象可以被constexpr 函数初始化。
```c++
class Point{ 
	int x; 
	int y; 
public: 
	constexpr Point(int ix, int iy):x(ix),y(iy){} 
	constexpr int getX() const {
		return x;
	} 
	constexpr int getY() const {
		return y;
	} 
};
```
使用:
```c++
constexpr Point p{1,2}; 
constexpr int py = p.getY(); 
double darry[py]{};
```


### tips
声明为constexpr的函数，也有一些限制：
- 函数体内不能有try块，以及任何static 和局部线程变量。
- 函数中只能调用其他 constexpr 函数
- 函数内，不能有任何运行时才会有的行为，比如抛出异常、使用new或delete操作符等

此外，  
如果我们给一个函数加上一个constexpr关键字，不是说我们就把这个函数绑死在编译期上了。**这个函数，是能够在运行期被复用的**。
并且，如果一旦调用被认为是运行期的，那么这个函数的返回值也不再是编译期常量了，它只被当做一个正常的函数来对待。

也要注意，既然是编译期计算，那么所有运行期的检查，都不能在编译期完成。 

### c++17中的constexpr

#### constexpr lambda
对一个lambda而言，只要被捕获的变量是字面量类型(literal type)，那么，整个lambda 也将表现为 字面量类型。
举例：
```c++
//显式声明为constexpr类型 
template <typename T> 
constexpr auto addTo(T i){ 
	return [i](auto j){return i + j;} 
} 

//使用
constexpr auto add5 = addTo(5); 

template<unsigned N> 
class SomeClass{}; 

int foo(){ 
	//在编译期常量中使用 
	SomeClass<add5<22>> someClass27; 
}
```

当一个lambda函数 在 constexpr上下文中被使用，并且它满足了 constexpr的条件，  
那么无论它有没有被显式地声明为constexpr， 它仍然是 constexpr的。
参考：
```c++
auto answer = [](int n){ 
	return n +32; 
}; 
//在一个constexpr的环境中被使用 
constexpr int rsp = answer(10);
```

当一个 lambda 表达式被显式或隐式地声明为constexpr， 它可以被转换成一个constexpr 的函数指针。
```c++
auto Increment = [](int n){ 
	return n + 1; 
}; 

//转为函数指针
constexpr int(*int)(int) = Increment;
```


#### constexpr if
传统的 if-else 语句是在 执行期进行条件判断与选择的，因而在泛型编程中，无法使用。  
c++17 引入 constexpr if 可以在编译期进行条件判断。
当然，这个判断的条件也是需要编译期可以计算出来的。 
```c++
template<typename T> 
auto to_string(T t){ 
	if constexpr(std::is_integral<T>){
		return std::to_string(t); 
	}else{ 
		return t; 
	} 
}
```
