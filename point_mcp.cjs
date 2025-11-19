// point_mcp_fixed.cjs
const WebSocket = require('ws');

// 内存存储
const reports = [];
const DEBUG = process.env.MCP_DEBUG === '1';

// WebSocket 服务 - 收集报告
const wss = new WebSocket.Server({ port: 8971 });

logDebug('WebSocket 服务器运行在 ws://localhost:8971');

wss.on('connection', (ws) => {
  logDebug('客户端已连接');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      const report = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        selector: msg.selector,
        html: msg.html,
        description: msg.description,
        url: msg.url || '未知URL'  // 新增：接收前端发送的URL
      };
      
      reports.push(report);
      logDebug(`📝 已收集报告 #${report.id} (总计: ${reports.length})`);
      logDebug(`📍 URL: ${report.url}`);
      logDebug(`🎯 选择器: ${report.selector}`);
      
    } catch (e) {
      logDebug('收到非JSON消息:', data.toString());
    }
  });

  ws.on('close', () => {
    logDebug('客户端断开');
  });
});

// MCP 协议处理 - 直接处理标准输入输出
process.stdin.on('data', (data) => {
  const messages = data.toString().split('\n').filter(Boolean);
  
  for (const rawMsg of messages) {
    try {
      const request = JSON.parse(rawMsg);
      logDebug('收到请求:', request.method);
      
      // 初始化 - MCP版本写在这里
      if (request.method === 'initialize') {
        const response = {
          jsonrpc: "2.0",
          id: request.id,
          result: {
            protocolVersion: "2024-11-05",  // MCP协议版本
            capabilities: { 
              tools: {},
              roots: {}
            },
            serverInfo: { 
              name: "point-mcp", 
              version: "1.0.1"  // 你的MCP服务器版本
            }
          }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
        
        // 发送初始化完成通知
        const initializedMsg = {
          jsonrpc: "2.0",
          method: "notifications/initialized",
          params: {}
        };
        process.stdout.write(JSON.stringify(initializedMsg) + '\n');
        
        logDebug('✅ MCP 协议握手完成');
        logDebug('📋 MCP协议版本: 2024-11-05');
        logDebug('🚀 MCP服务器版本: 1.0.1');
      }
      
      // 工具列表
      if (request.method === 'tools/list') {
        const response = {
          jsonrpc: "2.0",
          id: request.id,
          result: {
            tools: [
              {
                name: "get_reports",
                description: "获取所有收集的网页修改报告",
                inputSchema: { type: "object", properties: {} }
              },
              {
                name: "clear_reports", 
                description: "清空所有报告",
                inputSchema: { type: "object", properties: {} }
              }
            ]
          }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
        logDebug('📋 返回工具列表');
      }
      
      // 工具调用 - 获取报告
      if (request.method === 'tools/call' && request.params.name === 'get_reports') {
        let response;
        if (reports.length === 0) {
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [{
                type: "text",
                text: "📭 暂无收集到的报告"
              }]
            }
          };
        } else {
          const reportText = reports.map((r, index) => 
            `## 报告 #${index + 1} (${new Date(r.timestamp).toLocaleString()})\n` +
            `- **页面URL**: ${r.url}\n` +  // 新增：显示URL
            `- **选择器**: ${r.selector}\n` +
            `- **问题描述**: ${r.description}\n` +
            `- **HTML内容**:\n\`\`\`html\n${r.html}\n\`\`\`\n`
          ).join('\n');
          
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [{
                type: "text", 
                text: `📋 共收集到 ${reports.length} 个报告:\n\n${reportText}`
              }]
            }
          };
        }
        process.stdout.write(JSON.stringify(response) + '\n');
        logDebug('📄 返回报告数据');
      }
      
      // 工具调用 - 清空报告
      if (request.method === 'tools/call' && request.params.name === 'clear_reports') {
        const count = reports.length;
        reports.length = 0;
        const response = {
          jsonrpc: "2.0", 
          id: request.id,
          result: {
            content: [{
              type: "text",
              text: `🗑️ 已清空 ${count} 个报告`
            }]
          }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
        logDebug('🗑️ 清空报告完成');
      }
      
    } catch (e) {
      console.error('❌ 协议解析错误:', e.message);
    }
  }
});

// 保持进程运行
logDebug('🚀 Point MCP 服务器已启动');

// 信号处理
process.on('SIGINT', () => {
  logDebug('收到中断信号，正在关闭服务...');
  wss.close(() => {
    logDebug('WebSocket服务已关闭');
    process.exit(0);
  });
});

// 工具函数：调试日志
function logDebug(...args) {
  if (DEBUG) {
    console.error('[MCP-DEBUG]', ...args);
  }
}