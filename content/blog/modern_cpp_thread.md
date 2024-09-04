---
title: C++11线程库
date: 2021-07-30 09:59:29
description: 现代C++的线程库使用
tags:
  - c++
  - c++11
---

## 引子

c++11后新增了线程库，最主要最熟知的应该就是 std::thread，以及配合以线程同步用的std::mutex和std::conditon_variable。

对于多核环境的高性能并发处理，后端开发最需要熟知的就是线程池。
线程池本质上就是提前建立好多个线程，在需要使用的时候唤醒一个来处理，不需要的时候让其睡眠不占用资源。

以下先介绍标准线程库的一些使用方法，然后再依次实现下线程池。

___

## 使用std::thread库
### 基本使用方式

```c++
void ThreadFunc(){
    //do something
}
std::thread t(ThreadFunc);
```

如果是带参数的线程函数，就可以：

```c++
void ThreadFunc(int count){
    //do something
}
std::thread t(ThreadFunc, 5);
//或者 使用<functional>中提供的 std::bind方法，将参数绑定到对应的线程函数上
std::thread t(std::bind(ThreadFunc, 5));
```
  
### 关于线程的结束

线程启动后，一般需要等到线程函数运行完，线程才能结束

标准库对于线程的结束也有两种方式：

1） 在主线程中调用join方法，主线程就会阻塞等待到线程函数运行完，然后结束

```c++
if(t.joinable())
    t.join()
```

2）调用detach方法，将线程从主线程分离。这种形式，主线程不会被阻塞，也不会知道分离出去的线程什么时候结束。

如果确定主线程肯定比线程函数晚结束，或者线程和主线程的存活时间是一致的，则可以直接在启动线程后，直接detach。

```c++
t.detach();
//简便的写法，声明和detach一起调用
std::thread(ThreadFunc).detach();
```

### std::thread启动线程的其他方式

std::thread启动线程，也可以使用lambda表达式，参考如下：

```c++
std::thread([](){
			for (int i = 0; i < 20; ++i)
			{
				cout << '[' << this_thread::get_id() << "]:" << static_cast<char>('A' + i) << endl;
				this_thread::sleep_for(10ms);
			}}
           );
```


对于将参数为引用的函数来作为线程函数，也有如下两种操作可参考：

1） 使用lambda表达式，如下：

```c++
unordered_map<int, string> myMapSrc{
	{1, "first" },
	{2, "second"},
	{3, "third"},
	{4, "four"},
	{5, "five"}
	};

//捕获列表使用 & 就可以
std::thread([&myMapSrc](){
			for (const auto& item : myMapSrc)
			{
				cout << '[' << this_thread::get_id() << "]:" << item.first << " = " << item.second << endl;
			}}
	).detach();
```

2） 使用std::bind，如下

```c++
void ThreadFunc(unordered_map<int, string>& refRec)
{
	for (const auto& item : refSrc)
	{
		cout << '[' << this_thread::get_id() << "]:" << item.first << " = " << item.second << endl;
	}
}
std::thread(std::bind(ThreadFunc, std::ref(myMapSrc)));
```

由于std::bind总是使用值拷贝的形式传参，哪怕函数声明为引用，std::bind传递的时候也是值传递。所以，标准库提供了std::ref来给std::bind传引用。



### std::async

标准库，在std::thread的基础上，封装了一些方法，有std::promise，std::pacakged_task，以及std::async。

这其中，std::promise以及std::pacakged_task的使用，一般还是要配合std::thread以及std::future来。

这边，比较推荐使用std::async来启动一个线程来执行一个异步任务，简单的示例代码如下：

```c++
std::async(launch::async, ThreadFunc);
//带参数，则
std::async(launch::async, ThreadFunc, param1, param2...);
```

std::async 方法有返回值，类型是 `std::future<T>`

```c++
string ThreadFuncStr(int data)
{
    this_thread::sleep_for(1s);
	cout << "This is ThreadFuncStr\n";
	return to_string(data);
}
std::future<string> result = std::async(launch::async, ThreadFuncStr, 100);
//do some other thing 
string str = result.get();
cout << str <<endl;
```

**说明：**

std::async， 如果第一个参数是launch::async，那就是立即启动线程任务，但是线程启动后，不会阻塞当前线程。

只有在后续调用reuslt.get()的时候，会阻塞，直到线程函数返回需要的结果。

**使用建议：**

推荐std::async，是因为它将thread的概念隐藏到了底层，方法本身就成为了，我就是异步去执行一个任务。

所以，如果我们一旦碰到需要读写文件或者网络请求这种涉及IO，耗时不确定可能会阻塞当前运行线程的时候，都可以调用async，来启动一个异步任务完成这部分的业务处理。  

**另外：**

如果想使用std::thread的形式，也需要获取线程函数执行后的返回值，可以使用packaged_task，简单举例：

```c++
int main(){
    std::packaged_task<string(int)> task(ThreadFuncStr);	
    std::future<string> async_result = task.get_future();	
    std::thread(std::move(task), 100).detach();	
    cout << async_result.get() << endl;  	
    return 0;
}
```

感觉用起来，不如std::async方便，感兴趣的可以自行研究(报考std::promise 也是，它们都有各自的应用场景)。  

___

## 线程池

有执行一个异步任务来获取结果的需求，肯定也有不定时执行多个异步任务的需求。

最典型的就是，服务端处理多个不同用户的业务逻辑的场景：

1）每个用户的业务处理，一般都需要在自己独立的线程中运行；

2）线程处理完一个用户的业务逻辑，还可以处理另一个用户的业务逻辑。

这种情况，就比较适合用线程池了。


下边就是用C++11标准库实现的线程池的代码：

```c++
class FixedThreadPool
{
public:
	using FuncTaskType = std::function<void()>;

	FixedThreadPool(size_t threadCount) :
		m_ResData(make_shared<ResInfo>())
	{
		for (size_t i = 0; i < threadCount; ++i)
		{
			std::thread(std::bind(&FixedThreadPool::ThreadFunc, this)).detach();
		}
	}

	~FixedThreadPool()
	{
		if (m_ResData != nullptr)
		{
			std::lock_guard<std::mutex> guard(m_ResData->Mtx);
			m_ResData->IsShutdown = true;
		}
		m_ResData->Cv.notify_all();
	}

	void Execute(FuncTaskType&& task)
	{
		lock_guard<mutex> guard(m_ResData->Mtx);
		m_ResData->Tasks.emplace(std::forward<FuncTaskType>(task));
		m_ResData->Cv.notify_one();
	}

private:
	void ThreadFunc()
	{
		unique_lock<mutex> lk(m_ResData->Mtx);
		do
		{
			if (!m_ResData->Tasks.empty())
			{
				auto currentTask = std::move(m_ResData->Tasks.front());
				m_ResData->Tasks.pop();
				lk.unlock();
				currentTask();
				lk.lock();
			}
			else if (m_ResData->IsShutdown)
			{
				break;
			}
			else
			{
				m_ResData->Cv.wait(lk);
			}
		} while (true);
	}

	struct ResInfo
	{
		mutex Mtx;
		condition_variable Cv;
		bool IsShutdown = false;
		//线程函数任务队列
		queue<FuncTaskType> Tasks;
	};

	std::shared_ptr<ResInfo> m_ResData;
};
```

**简单解释：**

- ResInfo 是需要的一些信息，包含线程同步用互斥量和条件变量，线程池的开关，以及存储线程任务的队列

- ResInfo 使用 shared_ptr 是因为 每个线程都会进行一份拷贝

- 存储队列，使用queue，满足先进先出

- 线程任务，统一使用 函数模板 `std::function<void()>` ，这样，后续再配合std::bind，就可以执行所有带参数和不带参数的线程函数

- 构造的时候，直接启动对应数量的线程，每个线程的运行都封装在ThreadFunc

- ThreadFunc 使用unique_lock 一是需要配合条件变量进行wait，

  二是，在将线程任务从队列中取出来之后，就不需要再锁了，可以unlock。

  对于线程池内部的mutex，它用来保护的数据，其实就是线程任务队列，所以将线程任务从队列中取出来之后，这个锁的任务就达成了。

  执行完线程任务，再锁住，是该线程在循环，执行完上一个任务，就会去队列中取下一个任务。

- Execute方法，顾名思义，就是用来执行任务的。右值引用作为参数进行传递时，会转换成左值，需配合完美转发std::forward使用

- 最后，析构函数，主要是确保开关置为true，启动的线程函数可以正常运行结束。




**参考:**

[C++11 (三) - std::function、std::bind、std::ref](https://blog.csdn.net/chenwh_cn/article/details/116492680)

[C++11 std::thread detach()与join()用法总结](https://blog.csdn.net/weixin_44862644/article/details/115765250)

