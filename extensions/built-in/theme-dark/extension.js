exports.activate = function(context) {
  console.log('Dark theme extension activated');
  
  const applyTheme = function() {
    const theme = {
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      cursor: '#aeafad',
      cursorAccent: '#000000',
      selection: '#264f78',
      black: '#000000',
      red: '#f14c4c',
      green: '#6a9955',
      yellow: '#dcdcaa',
      blue: '#569cd6',
      magenta: '#c586c0',
      cyan: '#4ec9b0',
      white: '#d4d4d4',
      brightBlack: '#666666',
      brightRed: '#f14c4c',
      brightGreen: '#6a9955',
      brightYellow: '#dcdcaa',
      brightBlue: '#569cd6',
      brightMagenta: '#c586c0',
      brightCyan: '#4ec9b0',
      brightWhite: '#ffffff'
    };
    
    if (window && window.xrtl) {
      window.xrtl.applyTheme(theme);
    }
  };
  
  context.subscriptions.push({
    dispose: function() {
      console.log('Dark theme extension deactivated');
    }
  });
  
  applyTheme();
};

exports.deactivate = function() {
  console.log('Dark theme extension deactivated');
};
