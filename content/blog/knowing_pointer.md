---
title: C指针的理解
date: 2023-01-31
description: 自己对C和c++的指针进行理解和阐释
tags:
  - c++
  - c
---

简单的指针的声明一般有如下形式
```c
int* ptr = new int;
int data = 100;
int* iptr = &data;
```

以下尝试使用c++的思想来理解下c指针的相关内容。  
int* 这种可以理解为是整型指针类型，那么iptr就是整型指针类型的变量，iptr本身是左值，能取到地址，因此二级指针也就存在意义:
```c
int** iiptr = &iptr;
```
指针类型的变量是用来存储地址数据的，因此一般是整型的，什么长度的整型跟机器是32位还是64位关联。指针变量的值对应的地址则是用来表示存储的数据的。

```c
*ptr = 101;
printf("%d\n", **iiptr);
**iiptr = 111;
printf("%d\n", *iptr);
assert(*iptr == **iiptr);
assert(&iptr == iiptr);
```
所以：
- 一级指针的值是地址，就是表示存储数据的的变量的地址
- 二级指针的值也是地址，就是表示一级指针的这个变量的地址

那同样的思路，对于**指针数组**，可以写如下代码
```c
char* cptr = new char[256];
strcpy(cptr, "abcdefg");
char** ccptr = &cptr;
assert(*cptr, 'a');
printf("%c, %c, %c\n", **ccptr, *cptr + 1, **ccptr + 2);
```

接着是对**函数指针**的理解。  
函数指针一般以这种方式声明：
```c
typedef int (*funcptr)(int, int);
```
如果有以下满足函数指针声明类型的函数
```c
int Add(int a, int b){
    return a + b;
}
int Sub(int a, int b){
    return a -b;
}
```
简单的使用函数指针来表示函数如下：
```c
funcptr somefunc = Add;
printf("%p\n", somefunc);
printf("%d\n", somefunc(20, 10));
somefunc = Sub;
printf("%p\n", somefunc);
printf("%d\n", somefunc(20, 10));
```
这里的函数指针类型变量somefunc的值就是要表示的函数的地址。
既然somefunc是表示值的变量，即使它是指针，它也可以取到地址，那就可以使用二级指针来表示这个指针类型变量的地址。
```c
decltype(&somefunc) ptr_somefunc = &somefunc;
printf("%p\n", ptr_somefunc);
printf("%d\n", (*ptr_somefunc)(30, 10));
*ptr_somefunc = Add;
printf("%p\n", ptr_somefunc);
printf("%d\n", (*ptr_somefunc)(30, 10));
```
这里使用decltype只是为了简化代码，省略一个二级函数指针的定义，否则需要：
```c
typedef int (**pfuncptr)(int, int);
pfuncptr ptr_somefunc = &somefunc;
```
此外，可以确认两次打印二级函数指针的地址是一样的，因为它表示的是ptr_somefunc变量的地址。



