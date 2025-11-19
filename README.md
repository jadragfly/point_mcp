# Point MCP

一个用于收集和管理网页修改报告的 MCP (Module Control Protocol) 服务器(网页开发专用的todo list)。

## 功能特点

- **WebSocket 报告收集**：通过 WebSocket 服务(8971端口)接收前端发送的网页元素修改报告
- **MCP 协议支持**：实现 MCP 协议，提供工具调用接口
- **报告管理**：支持查看所有报告和清空报告的功能
- **调试模式**：提供调试日志功能，便于开发和问题排查

## 安装

1. 克隆或下载本项目到本地

2. 安装依赖

```bash
npm install ws
```

## 使用方法

### 启动服务器

```bash
# 直接启动
node point_mcp.cjs

# 启用调试模式
MCP_DEBUG=1 node point_mcp.cjs
```

### 前端集成

前端可以通过 WebSocket 连接到服务器，并发送报告数据：

```javascript
const ws = new WebSocket('ws://localhost:8971');

ws.onopen = () => {
  // 发送报告数据
  ws.send(JSON.stringify({
    selector: '#header',        // 选择器
    html: '<div id="header">...</div>',  // HTML内容
    description: '页面头部样式修改',  // 问题描述
    url: 'https://example.com'  // 页面URL
  }));
};
```

## MCP API

服务器实现了以下 MCP 工具：

### 1. get_reports

获取所有收集的网页修改报告

**输入参数**：无

**返回结果**：
```
📋 共收集到 X 个报告:

## 报告 #1 (时间戳)
- **页面URL**: 页面URL
- **选择器**: 元素选择器
- **问题描述**: 报告描述
- **HTML内容**: 
```html
HTML内容
```
```

### 2. clear_reports

清空所有收集的报告

**输入参数**：无

**返回结果**：
```
🗑️ 已清空 X 个报告
```

## WebSocket 协议

### 连接地址
```
ws://localhost:8971
```

### 发送数据格式
```json
{
  "selector": "CSS选择器",
  "html": "HTML内容",
  "description": "问题描述",
  "url": "页面URL"
}
```

## 环境变量

| 变量名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| MCP_DEBUG | string | "0" | 设置为 "1" 启用调试日志 |

## 技术规格

- **MCP 协议版本**: 2024-11-05
- **WebSocket 端口**: 8971
- **依赖**: ws (Node.js WebSocket库)

## 开发与调试

启用调试模式后，服务器会输出详细的日志信息，包括：
- 连接状态
- 收到的消息
- 报告处理
- 协议交互

## 许可证

MIT