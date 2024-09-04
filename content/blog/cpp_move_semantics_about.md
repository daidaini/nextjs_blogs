---
title: 理解CPP的移动语义
date: 2023-01-31
description: C11中引入的移动语义，对其进行试验和理解
tags:
  - c++
  - c++11
---

## 什么是移动语义
移动语义是从C++11标准开始支持的，那什么是移动语义呢？

先引用下《Effective Modern C++》中关于移动语义的说明
> Move semantics makes it possible for compilers to replace expensive copying operations with less expensive moves. In the same way that copy constructors and copy assignment operators give you control over what it means to copy objects, move constructors and move assignment operators offer control over the semantics of moving. Move semantics also enables the creation of move-only types, such as std::unique_ptr, std::future, and std::thread.

提取下关键信息就是：移动语义让编译器在需要拷贝对象时可以使用一种代价更低的移动的方式来执行。拷贝对象是通过拷贝构造和拷贝赋值，移动对象是通过移动构造和移动赋值。此外，移动语义还可以处理只能移动的对象的构造。

以下为个人理解：  
移动语义的直接作用对象是函数的参数，发生移动的最直接的场景就是对自定义类型的参数进行传递的时候。
当参数是作为右值形式进行传递时，会调用该类型的移动构造函数(或移动赋值)以构造临时对象，举例说明。  
```c++
class A{
public:
  A() = default;
  A(A&& rhs) noexcept {
			cout << "using move construct.\n";
	}
	A& operator=(A&& rhs) noexcept {
		cout << "using move assign.\n";
		return *this;
	}
};

void func(A param)
{
	cout << "using func.\n";
  A a1;
	a1 = std::move(param);  //调用移动赋值
}
void test()
{
	A a;
	// func(a); //error. 
	func(std::move(a)); //通过移动构造构建临时对象
}
```
输出如下：
```
using move construct.
using func...
using move assign.
```
例子解释：
- A(A&& rhs) 这是移动构造函数的声明方式
- A& operator=(A&& rhs) 这是移动赋值函数的声明方式
- `std::move(param)` 使用`std::move`可以将参数强制转换为右值形式。
- func函数是使用值传递的方式，因此传参时会构造临时对象，由于参数转为了右值类型，因此会调用移动构造方法(打印了using move construct)
- 不能直接使用func(a)，因为在显示声明了移动构造函数后，编译器就不会自动生成拷贝构造函数了

可见，虽然上述例子是最简单的使用移动语义的场景，但依然会不可避免的涉及到几个概念的理解：
1. **左值和右值怎么区分**
2. **移动构造函数以及移动赋值函数**
3. **`std::move`强转右值，`std::forward`完美转发**

我们可能还会考虑一个问题，**函数传参除了值传递，还有引用传递，引用传递有单引用也有双引用，除了引用传递，此外还有使用指针传递，这些传递方式在移动语义的表现上都有什么区别呢？**

___

## 移动拷贝和移动赋值
对于移动拷贝函数和移动赋值函数，其实上边的例子已经有简单的说明，其形式就是：
```c++
A(A&& rhs)
A& operator=(A&& rhs)
```
移动和拷贝的最大区别在于实现，拷贝要么就是深拷贝要么就是浅拷贝，而移动就真的就是移动掉了，不存在拷贝。它们的开销代价也因此而来。
举一个例子说明：

写一个MyString类，为简单阐述，只实现了拷贝赋值和移动赋值
```c++
class MyString final
{
public:
	MyString() {
		data_ = new char[1024];
	}

	~MyString() {
		if (data_ != nullptr)
		{
			delete data_;
			data_ = nullptr;
		}
	}

  MyString& operator=(const MyString& rhs){
		if (rhs.data_ == nullptr || data_ == nullptr)
			return *this;

		cout << "copy assigning..\n";
		::memcpy(this->data_, rhs.data_, 1024);
		return *this;
  }
  
  MyString& operator=(MyString&& rhs) noexcept {
		if (rhs.data_ == nullptr || data_ == nullptr)
			return *this;

		cout << "move assigning..\n";
		data_ = rhs.data_;
		rhs.data_ = nullptr;
		return *this;
  }

  bool Empty() const{
		return data_ == nullptr;
  }

private:
  char* data_ = nullptr;
};
```
这个类，目的是在拷贝赋值时是深拷贝，在移动赋值时仅仅是移动，通过测试函数进行验证

```c++
void Test()
{
  MyString s1;
  MyString s2;
  s1 = s2;
  assert(!s2.Empty());
  s1 = std::move(s2); 
  assert(s2.Empty());
}
```
输出结果
```
copy assigning..
move assigning..
```

___

## 左值右值
### 概念
左值右值的概念可以总结概括为：
- 左值指表达式结束后依然存在的持久对象，可以取到地址，比如具名变量或者对象实例
- 右值是表达式结束后就不再存在的临时对象，不可以取到地址，没有名字

所以区分是左值还是右值，一个最有用的步骤即使看能否取到它的地址，如果可以就是左值，不可以则通常是一个右值。
此外，概念上来说，右值通常就是从方法中返回的临时对象（非绝对），而左值对应的就是实际可以指向的对象，不管是通过指针还是引用的形式。

右值还可以细分为纯右值(pure rvalue)和将亡值(expiring value)。
- 纯右值：
  - 非引用返回的临时变量 
  - 运算表达式产生的临时变量
  - 原始字面量
  - lambda表达式
- 将亡值：可以理解为将要被销毁，但是可以被移动的值
    
```c++
void func(std::vector<int>& vec)
{
  //此处expiring就是一个将亡值
  //因为std::string 对象可以移动，因此最后会调用移动赋值函数将expiring的值移动到str中
  std::vector<int> expiring{1, 2, 3, 4};
  vec = std::move(expiring);
}
```

### 右值引用
使用符号&& 表示右值引用。
```c++
int a = 100;
int &&r1 = std::move(a);
//int &&r1 = a; //error! 
```
但是使用带&&的类型表示的变量，不一定就是右值，按照左值的定义，只要具名的能取到地址的变量就是左值，所以即使你使用&&来声明，该是左值的还是左值。
```c++
void func(int&& param) {
	//int&& r1 = param; //error! param是左值!
	int&& r1 = std::move(param);
}
```

此外，有一种特殊情况，`《Effective Modern C++》`中将其称为 **universal references(通用引用)**，
看几个示例:
```c++
void func(std::vector<int>&& param); //右值引用

std::vector<int>&& vec1 = std::vector<int>{}; //右值引用

auto&& vec2 = vec1;   //非右值引用

template<typename T>
void func(std::vector<T>&& param);  //右值引用，不是T&&的形式，不是universal reference

template<typename T>
void func(T&& param)    //非右值引用
```
首先，universal reference必须是 T&& 的形式，且必须存在类型推导。  
以上两个非右值引用的场景是最典型的两个universal references的场景。  

至于universal reference怎么判断是左值引用还是右值引用，需要进一步看它的构造者(即实际的传参)，如下示例： 
```c++
template<typename T>
void func(T&& param); //param是一个 universal reference

std::vector<int> vec;
func(vec);    //传参是左值，所以T&&对应的是左值引用 std::vector<int>&

func(std::move(vec)); //传参是右值，所以param的类型是 std::vector<int>&&
```

___
## 应用
先明确，对于性能而言，纯C指针的性能肯定是没话说的，即使移动语义可以减少一些消耗，但还是不能完全达到C指针直接操作内存的效率。  
但也需要明确，C指针的不安全性，是很多复杂问题的根源，标准库引入了各种智能指针，其实就是在提供方法尽量避免使用裸C指针。  
移动语义的引入，在我看来是想在安全性和性能之间找到一种尽可能的平衡。

区分了左值右值，也知道了移动构造和移动赋值的作用，那移动语义我们平时怎么去应用呢？  
其实，现在的标准库中，基本上所有的容器都已经了支持移动语义，再配合现代编译器普遍支持的RVO机制，我们可以更简洁明确的编写代码，而不用使用指针或者左值引用来既表示出参，又表示入参。

### 一个简单的队列的示例
```c++
template<typename T>
class DemoQueue
{
public:
	void Insert(T&& task)
	{
		tasks_.push(std::move(task));	
		//T&& task 模板展开后就不再需要自动推导，所以不是universal reference
	}

	T Get()
	{
		T t = std::move(tasks_.front()); //front()返回的是左值引用，由于该元素后续会被移除(pop)，属于将亡值
		tasks_.pop();
		return t;  //RVO 返回时不会再拷贝临时对象
	}

private:
	std::queue<T> tasks_;
};
```
```c++
void Test()
{
	TaskQueue<std::string> q1;
	q1.Insert("first"s);
	q1.Insert("second"s);	
	q1.Insert("third"s);

	assert(q1.Get() == "first");
	assert(q1.Get() == "second");
}
```

### 完美转发和通用引用
```c++
template<typename T>
void PrintMerge(T&& a, T&& b)
{
	cout << std::forward<T>(a) + std::forward<T>(b) << endl;
}
void Test()
{
	int a = 10, b = 20;
	PrintMerge(a, b);		//这里传参为左值
	std::string s1{ "one " };
	std::string s2{ "two " };
	PrintMerge(std::move(s1), std::move(s2));	//这里传参为右值
}
```
概括言之，`std::forward`完美转发的作用，就是把参数的实际类型左值还是右值引用继续传递下去。




