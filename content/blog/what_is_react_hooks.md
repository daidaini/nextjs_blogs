---
title: 理解React中的Hooks
date: 2024-09-29
description: 学习React，怎么理解和使用Hooks，常用的 `useState`、`useEffect`等
tags:
  - react
  - javascript
---


## Hooks是什么？
React Hooks允许你在函数组件中使用 state和其他React特性，而无需编写class。
简单说，Hooks 就是一些函数，可以让你在函数组件中 "钩入" React 的 state 和生命周期等特性。

### 为什么使用Hooks
- **更简洁的代码:** 函数组件比类组件更简洁，更容易阅读和维护。
- **更好的代码复用:** 自定义 Hooks 可以封装一些常用的逻辑，提高代码复用性。
- **更细粒度的状态管理:** 可以更灵活地管理组件的状态。

### 常用Hooks
- **useState:** 在函数组件中添加 state。
- **useEffect:** 执行副作用操作，如数据获取、订阅、手动 DOM 操作等。
- **useContext:** 从 Context 中读取值。
- **useReducer:** 用于管理复杂的状态逻辑。
- **useRef:** 获取 DOM 元素的引用，或者保存一个不变的 ref。
- **useMemo:** 缓存计算结果，避免重复计算。
- **useCallback:** 缓存回调函数，避免不必要的重新渲染。

### Hooks的工作原理
- **Hooks 只是函数:** Hooks 本质上就是 JavaScript 函数，它们在函数组件中被调用。
- **Hooks 执行顺序:** 在同一个函数组件中，Hooks 必须按照相同的顺序调用。
- **Hooks 依赖于调用顺序:** Hooks 的行为依赖于它们在组件中的调用顺序。

### Hooks的优势
- **更易于理解:** 函数组件的逻辑通常更简单，更容易理解。
- **更好的测试性:** 函数组件更容易进行单元测试。
- **更灵活的状态管理:** 可以根据需要选择不同的状态管理方式。

### 使用Hooks的注意事项
- **只能在函数组件中使用:** Hooks 不能在类组件中使用。
- **必须在顶层调用:** Hooks 必须在函数组件的顶层调用，不能在循环、条件判断或嵌套函数中调用。
- **避免在循环中调用 useState:** 在循环中调用 useState 会导致创建多个 state，这通常不是期望的行为。



## useState
### useState 的作用
`useState` 是 React Hooks 中最基础的一个，它的主要作用是**在函数组件中添加状态**。简单来说，就是让一个原本静态的函数组件拥有了动态变化的能力。

### 什么时候使用 useState
- **组件内部需要保存数据并随时间变化时**：
    - 比如用户输入、表单数据、组件的显示状态等。
    - 当用户在表单中输入内容时，我们需要将输入的值保存起来，以便后续提交或显示。
- **组件需要响应用户交互时**：
    - 当用户点击按钮、切换开关等操作时，组件的状态需要更新，以反映用户的操作。
- **组件需要保存一些临时数据时**：
    - 比如一个计数器组件，需要记录点击次数

### 使用场景示例
#### 简单计数器
```javascript
import {useState} from 'react';
function Counter() {
	const [count, setCount] = useState(0);

	return (
		<div>
			<p> You clicked {count} times</p>
			<button onClick={ () => setCount(count + 1)}>
				Click me
			</button>
		</div>
	);
}
```
- `useState` 返回一个数组，第一个元素是当前的状态值（`count`），第二个元素是一个函数（`setCount`），用于更新状态。
- 点击按钮时，调用 `setCount` 函数，将 `count` 的值加 1，从而更新组件的显示。


#### 创建一个表单
```javascript
import {useState} from 'react';
function MyForm() {
  const [username, setUsername] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Username:', username);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={username} 
        onChange={(e) => setUsername(e.target.value)} />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
```

- `username` 状态用来保存用户输入的用户名。
- 当用户在输入框中输入内容时，`onChange` 事件触发，调用 `setUsername` 函数更新 `username` 的值。

#### 总结
`useState` 是 React Hooks 中非常基础且常用的一个 Hook，它为函数组件带来了状态管理的能力。只要组件内部需要保存数据并随时间变化，都可以考虑使用 `useState`。

**何时使用 useState 的一个简单判断标准是：**
**如果数据是需要在组件内部维护的，并且随着时间的推移或者用户交互而变化，那么就需要使用 useState。**


## useEffect
useEffect主要用于在函数组件中执行副作用操作。 
所谓副作用，就是指组件除了渲染 UI 之外，还会对外部系统产生影响，比如：
- **数据获取：** 发送网络请求获取数据。
- **订阅：** 订阅外部事件（如窗口大小变化、定时器）。
- **直接DOM操作：** 虽然不推荐，但在某些场景下可能需要。
- **手动触发重渲染：** 在某些特殊情况下，可能需要手动触发组件的重新渲染。

### 示例：
```javascript
import { useEffect, useState } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```
**useEffect 接收两个参数：**
- **第一个参数：** 一个函数，在这个函数中执行副作用操作。
- **第二个参数：** 一个数组，用来指定 useEffect 应该在哪些状态或 props 发生变化时重新执行。如果为空数组 `[]`，则只在组件挂载时执行一次。

### useEffect 的执行时机
- **组件挂载时：** useEffect 会在组件首次渲染后执行。
- **组件更新时：** 如果 useEffect 的第二个参数是一个数组，且数组中的某个值发生了变化，useEffect 就会重新执行。
- **组件卸载前：** 如果 useEffect 的函数返回了一个清理函数，那么在组件卸载前，这个清理函数会被执行

### useEffect 的常见使用场景
- **数据获取：** 在组件挂载时发送网络请求获取数据，并将数据更新到组件的状态中。
- **订阅：** 订阅外部事件，比如窗口大小变化、滚动事件等。
- **定时器：** 设置定时器，定时执行某些操作。
- **手动DOM操作：** 虽然不推荐，但在某些特殊场景下可能需要。

### useEffect 的注意事项
- **避免在 useEffect 中执行同步操作：** 因为这可能会导致性能问题。
- **合理使用依赖数组：** 依赖数组中的值发生变化时，useEffect 才会重新执行。如果依赖数组过大，可能会导致性能问题。
- **清理副作用：** 如果 useEffect 执行了某些副作用操作，一定要记得在清理函数中清理这些副作用。

### 示例二
```javascript
import { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Alice');

  useEffect(() => {
    console.log('useEffect: component mounted');
    // 组件挂载时执行，只执行一次

    return () => {
      console.log('useEffect: component unmounted');
      // 组件卸载前执行
    };
  }, []);

  useEffect(() => {
    console.log('useEffect: count changed');
    // count 发生变化时执行
  }, [count]);

  useEffect(() => {
    console.log('useEffect: name changed');
    // name 发生变化时执行
  }, [name]);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
      <p>Your name is: {name}</p>
      <button onClick={() => setName('Bob')}>Change name</button>
    </div>
  );
}
```


## 其他
### useContext
从Context中读取值。  
**使用场景：**
- 在多个组件之间共享数据时，避免层层传递 props。

### useReducer
用于管理复杂的状态逻辑。  
**使用场景：**
- 状态更新逻辑比较复杂时，使用 reducer 可以更好地组织状态。


### useRef
获取DOM元素的引用，或者保存一个不变的ref
使用场景:
- 直接操作DOM元素
- 保存函数组件内部的变量，使其在重新渲染时保持不变

### useMemo
缓存计算结果，避免重复计算

### useCallback
缓存回调函数，避免不必要的重新渲染
