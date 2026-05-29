import { Terminal } from '@xterm/xterm';

// 高亮配置 - 颜色定义
export const HIGHLIGHT_COLORS = {
  ip: { color: '#4fc3f7', bgColor: 'rgba(79, 195, 247, 0.15)' },
  time: { color: '#81c784', bgColor: 'rgba(129, 199, 132, 0.15)' },
  date: { color: '#ffb74d', bgColor: 'rgba(255, 183, 77, 0.15)' },
  url: { color: '#ce93d8', bgColor: 'rgba(206, 147, 216, 0.15)' },
  path: { color: '#ffab91', bgColor: 'rgba(255, 171, 145, 0.15)' },
  error: { color: '#ef5350', bgColor: 'rgba(239, 83, 80, 0.15)', bold: true },
  success: { color: '#66bb6a', bgColor: 'rgba(102, 187, 106, 0.15)', bold: true }
};

export class TerminalHighlighter {
  private terminal: Terminal;
  private isEnabled: boolean = true;
  private styleElement: HTMLStyleElement | null = null;

  constructor(terminal: Terminal) {
    this.terminal = terminal;
    this.injectStyles();
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // 注入基础高亮样式
  injectStyles() {
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'xrtl-terminal-highlight-styles';
    this.styleElement.textContent = `
      /* 链接高亮增强 */
      .xterm-link {
        color: ${HIGHLIGHT_COLORS.url.color} !important;
        text-decoration: underline !important;
        cursor: pointer !important;
      }
      
      .xterm-link:hover {
        background-color: ${HIGHLIGHT_COLORS.url.bgColor} !important;
      }
      
      /* 光标和选择增强 */
      .xterm .xterm-cursor {
        background-color: #ff5722 !important;
      }
      
      .xterm .xterm-selection {
        background-color: rgba(33, 150, 243, 0.3) !important;
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  // 获取高亮的正则表达式
  static getHighlightPatterns() {
    return [
      {
        name: 'IPv4',
        pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
        ...HIGHLIGHT_COLORS.ip
      },
      {
        name: 'Time',
        pattern: /\b(?:[01]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?\b/g,
        ...HIGHLIGHT_COLORS.time
      },
      {
        name: 'Date',
        pattern: /\b(?:\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\b/g,
        ...HIGHLIGHT_COLORS.date
      },
      {
        name: 'URL',
        pattern: /\b(?:https?|ftp):\/\/[^\s]+/g,
        ...HIGHLIGHT_COLORS.url
      },
      {
        name: 'Path',
        pattern: /\b(?:\/[\w\.-]+)+\b/g,
        ...HIGHLIGHT_COLORS.path
      },
      {
        name: 'Error',
        pattern: /\b(?:ERROR|error|WARNING|warning|FAILED|failed|CRITICAL|critical)\b/g,
        ...HIGHLIGHT_COLORS.error
      },
      {
        name: 'Success',
        pattern: /\b(?:SUCCESS|success|OK|ok|DONE|done|COMPLETE|complete)\b/g,
        ...HIGHLIGHT_COLORS.success
      }
    ];
  }

  // 分析文本并返回匹配结果（供其他组件使用）
  analyzeText(text: string) {
    if (!this.isEnabled) return [];

    const patterns = TerminalHighlighter.getHighlightPatterns();
    const matches: Array<{
      name: string;
      text: string;
      start: number;
      end: number;
      color: string;
      bgColor: string;
      bold?: boolean;
    }> = [];

    for (const pattern of patterns) {
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          name: pattern.name,
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          color: pattern.color,
          bgColor: pattern.bgColor,
          bold: 'bold' in pattern ? pattern.bold : undefined
        });
      }
    }

    return matches.sort((a, b) => a.start - b.start);
  }

  dispose() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }
}

export default TerminalHighlighter;
