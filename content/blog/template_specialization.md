---
title: C++中的模板特化
date: 2024-08-15
description: 类模板、函数模板的特化，怎么理解和使用
tags:
  - c++
  - c++11
---

![](/static/weekly/issue-72-cover.jpg)

在C++模板编程中，**特化**、**偏特化**和**全特化**是用来为特定类型或类型组合提供专门实现的技术。它们主要用于**类模板**和**函数模板**，用于在模板的通用性和特定性之间找到平衡。

## 函数模板

```c++
// 模板函数
template <typename T1, typename T2>
void fun(T1 a, T2 b)
{
    cout << "模板函数\n";
}
 
// 全特化
template <>
void fun(int, char)
{
	cout << "全特化\n";
}

// 这不是偏特化，实际只是函数重载？
template <typename T2>
void fun(char a, T2 b)
{
	cout << "重载: " << a << " -- " << b << endl;
}

// 使用
int main(int argc, char *argv[])
{
    TestTemplate::fun(1, 2);
    TestTemplate::fun(1, '2');
    TestTemplate::fun('1', 2);
    return 0;
}
```
输出：
```shell
模板函数
全特化
重载: 1 -- 2
```

## 类模板
```c++
template <typename T1, typename T2>
class Test
{
public:
	Test(T1 i, T2 j) : a(i), b(j)
    {
        cout << "模板类" << endl;
    }
private:
	T1 a;
	T2 b;
};

template <>
class Test<int, char>
{
public:
	Test(int i, char j) : a(i), b(j)
    {
        cout << "全特化" << endl;
    }

private:
	int a;
	char b;
};

template <typename T2>
class Test<char, T2>
{
public:
	Test(char i, T2 j) : a(i), b(j)
	{
		cout << "偏特化\n";
	}
private:
	char a;
	T2 b;
};
```

```c++
void TestTemplate()
{
    Test<double, double> t1(0.1, 0.2);
    Test<int, char> t2(1, 'A');
    Test<char, bool> t3('A', true);
}
```
输出：
```shell
模板类
全特化
偏特化
```

