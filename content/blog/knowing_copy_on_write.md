---
title: 理解copy-on-write
date: 2024-07-30
description: copy-on-write的概念以及怎么理解和使用
tags:
  - c++
  - c++11
---


## 概念
copy-on-write 即 写时复制，是C++中一种优化技术，主要用于提高内存使用效率和性能。
- 基本原理： 多个对象共享同一块内存，直到其中一个对象需要修改数据时才进行复制。
- 工作机制：
    - 当创建一个对象的副本时，不立即复制数据。
    - 新对象和原对象共享同一块内存。
    - 只有当其中一个对象尝试修改数据时，才会创建一个真正的副本。
- 优点：
    - 减少不必要的内存分配和复制操作。
    - 提高内存利用率，特别是对于只读操作频繁的场景。
    - 可以提升性能，尤其是处理大型数据结构时。
- 应用场景：
    - 字符串处理（如某些std::string的实现）
    - 容器类（如某些std::vector的实现）
    - 智能指针
- 实现考虑：
    - 需要引用计数机制来跟踪共享数据的对象数量。
    - 需要额外的逻辑来处理写操作时的数据分离。
- 潜在缺点：
    - 实现复杂度增加。
    - 在多线程环境下需要额外的同步机制。
    - 可能导致**不可预测的性能波动**（写操作时的突然复制）。

Copy-on-Write 是一种权衡策略，在某些场景下能显著提升性能，但并不适用于所有情况。


## 示例
```c++
class CustomerData { 
public: 
	CustomerData() { 
		_data = make_shared<Map>(); 
	} 
	~CustomerData() { } 
	
	CustomerData(const CustomerData&) = delete; 
	CustomerData operator=(const CustomerData&) = delete; 
	
	int Query(const string& customer, const string& stock) { 
		MapPtr data = GetData(); 
		//data 一旦拿到，就不需要再锁了 
		//读取数据的时候，只有GetData内部有锁，多线程并发读的性能较好 
		//所谓读的时候引用加1 ，是由shared_ptr内部的引用计数实现。 
		auto dataIt = _data->find(customer); 
	
		if (dataIt == _data->end()) 
			return -1; 
		return FindEntry(dataIt->second, stock); 
	} 
private: 
	using Entry = std::pair<string, int>; 
	using EntryList = std::vector<Entry>; 
	//key = customer value=entries 
	using Map = std::map<string, EntryList>; 
	using MapPtr = shared_ptr<Map>; //更新customer的数据 
	void Update(const string& customer, const EntryList& entries) 
	{ 
		lock_guard<mutex> guard(_lock); 
		if (!_data.unique()) //判断当前shared_ptr的引用计数，以此来判断当前是否有其他线程在读数据 
		{ 
			//有其他线程正在query 
			//拷贝原先数据 到一个新的shared_ptr; 
			MapPtr newData = make_shared<Map>(*_data); 
			std::swap(newData, _data); 
			//new一块数据，然后进行swap，是这个算法技巧的关键所在 
			//_data的引用计数为什么不为1，表示，在其他线程，刚刚GetData结束，但是Query的整个动作还在进行，也就是说，query的线程已经获取了存储数据的指针，但是还没有进行读取。 
			//这个时候，我们进行swap操作，用新的指针替换，不会影响原来的指针指向的内容，那么query的线程获取的数据为原先的_data，而这里swap后，用来更新数据的实际是newData 
			//query的线程，数据获取结束之后，原来的_data，引用计数变为0，则在当前线程自动释放。 
		} 
		//更新数据 
		(*_data)[customer] = entries; 
	} 
	
	static int FindEntry(const EntryList& entries, const string& stock) { 
	auto dst = std::find_if(entries.begin(), entries.end(), 
		[&stock](const Entry& src){ 
			return src.first == stock; 
			}); 
		
		if (dst == entries.end()) 
			return -1; 
			
		return dst->second; 
	} 
		
	MapPtr GetData() { 
		lock_guard<mutex> guard(_lock); 
		return _data; 
	} 
	
	std::mutex _lock; 
	MapPtr _data; 
};
```

该示例，其实并不是严格意义上的copy-on-write，  
它的update操作修改的还是原数据，而不是拷贝数据的方式。

贴一个Claude上生成的示例

```c++
#include <iostream>
#include <cstring>
#include <algorithm>

class CowString {
private:
    struct StringData {
        char* data;
        size_t length;
        int refCount;

        StringData(const char* str) : refCount(1) {
            length = strlen(str);
            data = new char[length + 1];
            strcpy(data, str);
        }

        ~StringData() {
            delete[] data;
        }
    };

    StringData* stringData;

    void detach() {
        if (stringData->refCount > 1) {
            StringData* newData = new StringData(stringData->data);
            stringData->refCount--;
            stringData = newData;
        }
    }

public:
    CowString(const char* str) : stringData(new StringData(str)) {}

    CowString(const CowString& other) : stringData(other.stringData) {
        stringData->refCount++;
    }

    ~CowString() {
        if (--stringData->refCount == 0) {
            delete stringData;
        }
    }

    CowString& operator=(const CowString& other) {
        if (this != &other) {
            if (--stringData->refCount == 0) {
                delete stringData;
            }
            stringData = other.stringData;
            stringData->refCount++;
        }
        return *this;
    }

    char operator[](size_t index) const {
        return stringData->data[index];
    }

    char& operator[](size_t index) {
        detach();
        return stringData->data[index];
    }

    void print() const {
        std::cout << stringData->data << " (refCount: " << stringData->refCount << ")" << std::endl;
    }
};

int main() {
    CowString str1("Hello");
    str1.print();

    CowString str2 = str1;  // 不复制，增加引用计数
    str1.print();
    str2.print();

    str2[0] = 'h';  // 修改触发复制
    str1.print();
    str2.print();

    return 0;
}
```