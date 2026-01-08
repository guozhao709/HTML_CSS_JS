# HTML5新特性

## 新增语义化标签

- < header >: 头部标签
- < nav >: 导航标签
- < article >: 内容标签
- < section >: 定义文档的某个区域
- < aside >: 侧边栏标签
- < footer >: 尾部标签

 这种语义化主要针对于搜索引擎

 ## 新增视音频标签

 - 视频: < video >

  支持三种视频格式: .MP4 .WebM .ogg

 尽量使用MP4

 常见属性:

 1. autoplay = "autoplay", 自动播放
 2. muted = "muted", Chrome/静音播放
 3. controls = "controls", 播放控件
 4. loop = "loop", 循环播放
 5. preload = "auto"/"none", 预先加载视频/不应加载视频, (如果有了autopaly属性, 就忽略该属性)
 6. poster = "imgurl(图片地址)", 加载等待的画面图片

 - 音频: < audio >

 支持三种音频格式: .mp3 .wav .ogg

 常见属性:

 1. autoplay = "autoplay", 自动播放
 2. controls = "controls", 播放控件
 3. loop = "loop", 循环播放

 ## 新增input表单

 type = 

 1. "email"
 2. "url"
 3. "date"
 4. "time"
 5. "month"
 6. "week"
 7. "number"
 8. "tel"(电话)
 9. "search"
 10. "color"(颜色选择表)

 ## 新增表单属性

 1. required = "required", 表示内容不能为空
 2. palceholder, 提示文本
 3. autofocus = "autofocus", 打开页面时自动聚焦
 4. autocomplete = "off/on", 显示搜索过得内容, 必须有name属性
 5. multiple = "mutiple",  提交多个文件
