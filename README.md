# BNU-Timetable-Getter
一键爬取北师大的课表，我的爬虫练习小程序

## 使用方法
### 安装依赖
```bash
npm i
```

### （可选）预设账号密码
在 `env.js` 文件中设置你的账号密码

**也可以不设置，直接在命令行中根据提示输入账号密码**

```javascript
export const env = {
  USER_NAME: '203511061000', // '' 内换成你的学号
  PASSWORD: 'password', // '' 内换成你的数字京师密码
  DISPLAY_NAME: 'filename' // '' 内换成你想要保存的文件名
}
```

### 运行
```bash
npm start
```

### 查看结果
在 `download` 文件夹下有一个 `xxx.png` 文件，是你的课表图片

还有一个 `xxx.html` 文件，是你的课表完整信息