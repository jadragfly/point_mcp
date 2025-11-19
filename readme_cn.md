# Point MCP

A MCP (Module Control Protocol) server for collecting and managing web page modification reports (a todo list specifically for web development).

## Features

- **WebSocket Report Collection**: Receive web element modification reports from frontend via WebSocket service (port 8971)
- **MCP Protocol Support**: Implement MCP protocol and provide tool calling interfaces
- **Report Management**: Support viewing all reports and clearing reports
- **Debug Mode**: Provide debug logging functionality for development and troubleshooting

## Installation

1. Clone or download this project to your local machine

2. Install dependencies

```bash
npm install ws
```

## Usage

### Starting the Server

```bash
# Start directly
node point_mcp.cjs

# Start with debug mode
MCP_DEBUG=1 node point_mcp.cjs
```

### Frontend Integration

Frontend can connect to the server via WebSocket and send report data:

```javascript
const ws = new WebSocket('ws://localhost:8971');

ws.onopen = () => {
  // Send report data
  ws.send(JSON.stringify({
    selector: '#header',        // Selector
    html: '<div id="header">...</div>',  // HTML content
    description: 'Page header style modification',  // Issue description
    url: 'https://example.com'  // Page URL
  }));
};
```

## MCP API

The server implements the following MCP tools:

### 1. get_reports

Get all collected web page modification reports

**Input Parameters**: None

**Return Result**:
```
📋 Collected X reports:

## Report #1 (timestamp)
- **Page URL**: page URL
- **Selector**: element selector
- **Issue Description**: report description
- **HTML Content**: 
```html
HTML content
```
```

### 2. clear_reports

Clear all collected reports

**Input Parameters**: None

**Return Result**:
```
🗑️ Cleared X reports
```

## WebSocket Protocol

### Connection Address
```
ws://localhost:8971
```

### Data Format
```json
{
  "selector": "CSS selector",
  "html": "HTML content",
  "description": "Issue description",
  "url": "Page URL"
}
```

## Environment Variables

| Variable Name | Type | Default Value | Description |
|--------------|------|--------------|-------------|
| MCP_DEBUG | string | "0" | Set to "1" to enable debug logs |

## Technical Specifications

- **MCP Protocol Version**: 2024-11-05
- **WebSocket Port**: 8971
- **Dependency**: ws (Node.js WebSocket library)

## Development and Debugging

When debug mode is enabled, the server outputs detailed log information, including:
- Connection status
- Received messages
- Report processing
- Protocol interactions

## License

MIT