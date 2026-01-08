# svg

svg: 可缩放的矢量图

1. 该图片使用代码书写而成
2. 缩放不会失真
3. 内容轻量

## 如何使用

svg可以嵌入浏览器,也可以单独使用

xml语言,svg使用该语言定义

可用多种方式添加svg图片 eg:img元素 背景图等

## 书写svg代码

### 矩形 rect

### 圆形 circle

### 椭圆 ellipse

### 线条 line

### 折线 polyline

### 多边形 polygon

### 路径:path

M = moveto
L = lineto
H = horizontal lineto
V = vertical lineto
C = curveto
S = smooth curveto
Q = quadratic Bézier curve
T = smooth quadratic Bézier curveto
A = elliptical Arc

    M起点坐标 A半径1 半径2 顺时针旋转角度 优(1)劣(0)弧 上凸或顺时针(1)下凹或逆时针(0) 终点坐标

Z = closepath