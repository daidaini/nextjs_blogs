---
title: 循环引用问题
date: 2024-08-14 10:25:06
description: 循环引用问题的产生和处理
tags:  
 - c++
---

## 引子
考虑一个简单的对象建模：
家长与子女(a Parent has a Child, a Child knows his/her Parent)。  

在Java 里边很好写，不用担心内存泄漏，也不用担心空悬指针，只要正确初始化Child类 和Parent类。  Java 程序员就不用担心出现访问错误。
一个实例 是否有效，只需要判断其是否为null  
实现的结构大致如下：
```java
public class Parent {
	private Child myChild; 
} 

public class Child { 　　
	private Parent myParent; 
}
```


## C++实现的难处和问题
如果要在C++里实现上边的例子，就需要为资源管理费一番脑筋。  
如果使用原始指针作为成员，那么
- Child和Parent由谁释放？
-  如何保证指针的有效性？
- 如何防止出现空悬指针？
这些问题是C++面向对象编程麻烦的问题。
现在借助于智能指针(std::shared_ptr) 可以轻松解决生命周期的问题，不必担心空悬指针。  
但是，使用这个模型，就会引入另一个问题，即**循环引用**的问题。  

使用 shared_ptr 的实现参考：
```c++
class Child;

class Parent { 
private: 
	std::shared_ptr<Child> ChildPtr; 
public: 
	void setChild(std::shared_ptr<Child> child) {
		this->ChildPtr = child; 
	} 
	void doSomething() { 
		if (this->ChildPtr.use_count()) {
		 } 
	} 
	~Parent() { 
	} 
};

class Child { 
private: 
	std::shared_ptr<Parent> ParentPtr; 
public: 
	void setPartent(std::shared_ptr<Parent> parent) { 
		this->ParentPtr = parent; 
	} 
	void doSomething() { 
		if (this->ParentPtr.use_count()) { 
		} 
	} 
	
	~Child() { 
	} 
};

```
上述实现会存在问题：  
这么理解，当Parent实例需要析构时，其成员ChilidPtr需要先完成析构动作，
而析构Child则有需要先将成员变量ParentPtr完成析构。  这样就会一致循环依赖下去，无法真正析构完全。  
这个，就是前面所说的循环引用问题了。 
验证问题的话，可以用如下代码：
```c++
int main() { 
	std::weak_ptr<Parent> wpp; 
	std::weak_ptr<Child> wpc; 
	{ 
		std::shared_ptr<Parent> p(new Parent); 
		std::shared_ptr<Child> c(new Child); 
		p->setChild(c); 
		c->setPartent(p); 
		wpp = p; 
		wpc = c; 
		std::cout << p.use_count() << std::endl; // 2 
		std::cout << c.use_count() << std::endl; // 2 
	} 
	std::cout << wpp.use_count() << std::endl; // 1 
	std::cout << wpc.use_count() << std::endl; // 1 
	return 0; 
}
```
> 从输出的结果可以看到，用来观察最终资源释放情况的两个weak_ptr最后的引用计数输出都为1，表示，资源并没有被完全释放


## 怎么解决问题
对于循环引用问题的 处理，标准库引入了std::weak_ptr。  
结合代码解释下，weak_ptr怎么解决循环引用问题。  

现代码调整为：
```c++
class Child;

class Parent { 
private: 
	std::weak_ptr<Child> ChildPtr; 
public: 
	void setChild(std::shared_ptr<Child> child) {
		this->ChildPtr = child; 
	} 
	void doSomething() { 
		if (this->ChildPtr.lock()) {
		 } 
	} 
	~Parent() { 
	} 
};

class Child { 
private: 
	std::shared_ptr<Parent> ParentPtr; 
public: 
	void setPartent(std::shared_ptr<Parent> parent) { 
		this->ParentPtr = parent; 
	} 
	void doSomething() { 
		if (this->ParentPtr.use_count()) { 
		} 
	} 
	
	~Child() { 
	} 
};
```
工作原理:
- weak_ptr 不会增加引用计数，也相当于不直接管理对象的内存
- 需要访问weak_ptr指向的对象时，可以通过lock()放来创建一个临时的shared_ptr
-  如指向对象已被销毁，则lock方法返回为空

使用 weak_ptr 的注意事项：
1. weak_ptr本身不能直接访问所指向 的对象，需要使用 lock()
2. 使用 weak_ptr时要检查它是否已过期（lock() 和 expired() 方法都行）
3. weak_ptr 只能从shared_ptr对象进行创建

