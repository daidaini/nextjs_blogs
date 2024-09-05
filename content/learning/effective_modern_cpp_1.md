---
title: 《Effective Modern C++》 阅读笔记（一）
date: 2024-09-05
description: 《Effective Modern C++》 的阅读笔记，关于类型推导的部分
---

# 类型推导

## template 类型推导

### 结论
- 在模板类型推断期间，arguments被视为非引用，即，它们的引用性会被忽略。
- 在推导universal引用参数类型时，左值参数会进行特殊处理
- 在推导按值参数的类型时，const and/or volatile 参数被视为non-const 和 non-volatile
- 在模板类型推导过程中，数组或函数名的参数会衰减为指针，除非它们用于初始化引用

### 引用类型的推导
#### 示例1：
> 参数类型是指针或引用的情况时，
```c++
template<typename T> 
void f(T& param);
```
使用：
```c++
int x = 27; 
const int cx = x; 
const int& rx = x;

f(x); //T is int, param's type is int& 
f(cx); // T is const int, param's type is const int& 
f(rx); // T is const int, param's type is const int&
```

示例中的`&` 替换为指针`*` 是一样的效果。
原则：
- 如果表达式(x、cx、rx)的类型是引用，则无视引用的部分
- 然后，通过传参的类型来匹配出对应T的类型

注：  可以关注const在类型推导时的传递性

#### 示例2：
> universal reference的情况：
```c++
template <typename T> 
void f(T&& param); 

int x = 27; 
const int cx = x; 
const int& rx = x;

f(x); //x is lvalue, so T is int&, param's type is alse int& 
f(cx); //cx is lvalue, so T is const int& param's type is also const int& 
f(rx); // rx is lvalue, so T is const int&, param's type is also const int& 
f(27); // 27 is rvalue, so T is int,  param's type is therefore int&&
```

甚于情况 **参数类型既不是引用也不是指针**，那就是**值传递**


## auto 类型推导

### 结论
- auto的类型推导，通常是和template的是一致的。除了一种情况，对于使用大括号的初始化列表，auto可以推导出，但是template不行。
- 如果是一个函数返回值的auto或者lambda参数中的auto，应用的是template的推导而不是auto的推导

**以下示例，区分auto 和template对于类型推导的初始化列表的应用情况**
```c++
auto x = {11,23,9}; //x's type is std::initializer_list<int> 

template<typename T> 
void f(T param); // template with parameter declaration  equivalent to x's declaration 

f({11,23,9}); // error! can't deduce type for T
```



## decltype
### 结论
- decltype 几乎总是产生变量或表达式的类型而无需任何修改
- 对于name以外的 T 类型左值表达式，decltype 始终报告为 T& 类型。
- C++14 支持 decltype(auto)，它与 ​​auto 类似，从其初始化程序推断类型，但它使用 decltype 规则执行类型推断。

`一个示例展示decltype用处`:
```c++
template<typename Container, typename Index> 
decltype(auto) authAndAccess(Container&& c, Index i) { 
	authenticateUser(); 
	return std::forward<Container>(c)[i]; 
}
```
c++14中可以使用auto 返回值，但是c++11中不行，所以需要如此实现：
```c++
template<typename Container, typename Index> 
auto authAndAccess(Container&& c, Index i) 
->decltype(std::forward<Container>(c)[i]) 
{ 
	authenticateUser(); 
	return std::forward<Container>(c)[i]; 
}
```
其中,
```c++
auto funcname(param1, param2) -> returntype
```
这种格式的函数声明也是从c++11开始支持，即追踪返回值类型的写法。 
按理，更加符合人的直观理解，`函数名->参数->返回值`


## 怎么查看推导的类型
### 结论
- 使用 IDE 编辑器、编译器错误消息和 Boost TypeIndex 库通常可以看到推导类型。
- 有些工具的结果可能既无帮助也不准确，因此理解 C++ 的类型推断规则仍然至关重要。

![](/static/blog_pics/effective_modern_cpp.jpg)