---
title: 理解虚拟DOM的概念
date: 2024-10-10
description: 阅读 《06｜虚拟DOM：聊聊React组件渲染机制》记录
tags:
 - react
 - web
---

## 概念

虚拟DOM(Virtual DOM)，是相对于 HTML DOM(Document Object Model，文档对象模型)更轻量的JS模型。  
1. 在运行时，开发者声明的组件会渲染成为虚拟DOM，虚拟DOM再由React框架渲染成真实的DOM；
2. 虚拟DOM的变动，最终会自动体现在真实DOM上；
3. 真实DOM上的交互，也会由React框架抽象成虚拟DOM上的副作用(Side-effect)，与开发者编写的交互逻辑关联起来。

虚拟DOM，可以有效的减少代码量。更重要的作用是，作为React面向开发者的API与React内部实现对接的桥梁。
> 如果没有虚拟 DOM 这个中间模型，那么 React API 就需要直接对接 DOM API，耦合程度提 高，React 概念和 API 设计也会受制于浏览器，React Native 这样对接多端的愿景也无从实现 了，React 也许就很难称作是 React 了。


## 设计
React的设计哲学为
```
UI = f(state)
```
理论上来说，对于给定的`f()`和状态数据，一定可以重现一模一样的UI；
这也意味着，**只要状态数据有变化，`f()`就需要重新执行，整个UI需要重新渲染**  


_操作真实DOM是比较耗费资源的_ ， 无脑地大量调用 DOM API 绘制页面，页面很容易就卡 了。  

> 《虚拟DOM纯粹是额外开销》 -- Svelte作者 里奇-哈里斯    
> **虚拟DOM的价值在于**，当你构建应用时，无需考虑状态的变化如何体现在UI上，且一般情况下不用担心性能问题。
> 这减少了代码BUg，比起乏味的编码，你可以把更多时间投入到创造性工作上。



## Diffing 算法
优化基本逻辑：
1. 从根元素开始，React将递归对比两棵树的根元素和子元素
2. 对比不同类型的元素，如对比 HTML元素和 React组件元素，React会直接清理旧的元素和它的子树，然后建立新的树。
3. 对比同为 HTML元素，但Tag不同的元素，如从 `<a>`变为 `<div>`， React会直接清理旧的元素和子树，然后建立新的树
4. 对比同为React组件元素，但组件类或组件函数不同的元素，React会卸载旧的元素和子树，然后挂载新的元素树
5. 对比Tag相同的HTML元素，如 `<input type="txt" value="old" />` 和 `<input type="text" value="new" />`，React将会保留该元素，并记录有改变的属性。
6. 对比组件类或组件函数相同的组件元素，React会保留组件实例，更新props，并触发组件的生命周期方法或者Hooks。


## 触发协调的场景
在React API里有哪些是操作组件数据的？
`props`和`state`，之外，还有一个`context`。  
- props 是从组件外面传进来
- state 活跃在组件内部
- content 在组件外面的`Context.Provider`提供数据，组件内部则可以消费 context数据
只要上面这三种数据之一发生了变化，React就会对当前组件触发协调过程，最终按照Diffing结果更改页面。  


![](/static/life_pics/road_to_blue_sea.jpg)

来源：  
[现代React开发实战](https://time.geekbang.org/column/article/562726)