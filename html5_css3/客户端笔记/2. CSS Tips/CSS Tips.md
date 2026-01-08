# CSS Tips

## CSS属性书写顺序

1. 布局定位属性
2. 自身属性
3. 文本属性
4. 其他属性（CSS3）

## 设置图片与父元素大小相同

width: 100%;
height: 100%;

## 精灵图

目的: 为了有效地减少服务器接受和发送请求的次数, 提高页面加载的次数, 主要针对小的背景图片的

实现: 利用background-position属性

## 字体图标

本质是字体

应用场景: 主要用于显示网页中通用、常用的一些小图标。

优点: 

1. 轻量级: 一个字体图标比一系列图片要小, 一旦字体加载了, 图片就会马上渲染出来, 减少了服务器请求

2. 灵活性: 本质其实是文字, 可以很随意的改变颜色、产生阴影、透明效果、旋转等

3. 兼容性: 几乎支持所有浏览器

## CSS三角形

    .box{
        width: 0;
        height: 0;
        border-top: 100px solid transparent;
        border-right: 100px solid transparent;
        border-bottom: 100px solid transparent;
        border-left: 100px solid pink;
    }

    .box{
        width: 0;
        height: 0;
        border: 100px solid transparent;
        border-left-color: pink;
    }

## CSS用户界面样式

- 鼠标样式cursor

    1. default: 默认
    2. pointer: 小手
    3. move: 十字架
    4. text: 杠
    5. not-allowed: 禁止

- 表单

    1. 轮廓线: outline: none;
    2. 防止拖拽文本域: resize: none;

- 贯穿线: text-decoration: line-through dotted red 5px;

## 垂直居中

- 使用vertical-align属性, 只针对于行盒或行块盒有效

- 一般使用middle值来垂直居中对齐

## 解决图片底边空白问题

1. 使用vertical-align属性
2. 把图片转换为块盒
3. font-size: 0;

## 单行溢出文本省略号显示

1. 先强制一行内显示文本: white-space: nowrap;(默认normal自动换行)
2. 超出部分隐藏: overflow: hidden;
3. 省略号代替: text-overflow: ellipsis;

## 多行溢出文本省略号显示

1. overflow: hidden;
2. text-overflow: ellipsis;
3. display: -webkit-box;
4. -webkit-line-clamp: 2;
5. -webkit-box-orient: vertical;

## 布局技巧

### margin负值的运用

- 应用场景: 边框叠加加粗问题

- 解决方法: 设置margin为负值(值为边框的宽度)可叠加边框

- 若要有hover效果, 则

1. 如果盒子没有定位, 则添加相对定位
2. 若有定位, 则添加z-index属性

### 文字环绕

使图片浮动, 文字为标准流

### CSS三角进阶

制作不同形状的三角形

eg: 

![alt text](image.png)

    .box{
            width: 0;
            height: 0;
            border-top: 100px solid transparent;
            border-right: 50px solid color;
            border-bottom: 0 solid color;
            border-left: 0 solid color;
        }   

