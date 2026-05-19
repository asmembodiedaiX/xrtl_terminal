import React, { useState } from 'react';

interface SSHConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SSHConfig) => void;
  config?: SSHConfig | null;
}

interface SSHConfig {
  id?: string;
  name: string;
  host: string;
  user: string;
  port: number;
  password?: string;
  privateKey?: string;
  authMethod: 'password' | 'privateKey' | 'agent' | 'none';
  colorTag: string;
  environment: string;
  remarks: string;
  mfaEnabled: boolean;
}

const colorTags = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#e91e63', '#607d8b'];

const SSHConfigDialog: React.FC<SSHConfigDialogProps> = ({ isOpen, onClose, onSave, config }) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'tunnel' | 'proxy' | 'env' | 'advanced'>('standard');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; host?: string }>({});

  const [formData, setFormData] = useState<SSHConfig>({
    name: config?.name || '',
    host: config?.host || '',
    user: config?.user || 'root',
    port: config?.port || 22,
    password: config?.password || '',
    authMethod: config?.authMethod || 'password',
    colorTag: config?.colorTag || colorTags[0],
    environment: config?.environment || '无',
    remarks: config?.remarks || '',
    mfaEnabled: config?.mfaEnabled || false
  });

  const handleInputChange = (field: keyof SSHConfig, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'name' || field === 'host') {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateAndSave = () => {
    const newErrors: { name?: string; host?: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'name is a required field';
    }
    if (!formData.host.trim()) {
      newErrors.host = 'host is a required field';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={dialogOverlayStyle}>
      <div style={dialogStyle}>
        <div style={dialogHeaderStyle}>
          <span style={titleStyle}>SSH配置编辑</span>
          <button onClick={onClose} style={closeButtonStyle as any}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="#858585" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={tabBarStyle}>
          {[
            { key: 'standard' as const, label: '标准' },
            { key: 'tunnel' as const, label: '隧道' },
            { key: 'proxy' as const, label: '代理' },
            { key: 'env' as const, label: '环境变量' },
            { key: 'advanced' as const, label: '高级' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...tabButtonStyle,
                backgroundColor: activeTab === tab.key ? '#3c3c3c' : 'transparent',
                color: activeTab === tab.key ? '#ffffff' : '#858585'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={contentStyle}>
          <div style={formGridStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>颜色标签</label>
              <div style={colorTagsContainerStyle}>
                {colorTags.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleInputChange('colorTag', color)}
                    style={{
                      ...colorTagButtonStyle,
                      backgroundColor: color,
                      borderColor: formData.colorTag === color ? '#007acc' : 'transparent'
                    }}
                  />
                ))}
                <button style={colorTagButtonStyle}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 2v8M2 6h8" stroke="#6e6e76" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                <button style={colorTagButtonStyle}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2L10 10M10 2L2 10" stroke="#6e6e76" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>环境</label>
              <select
                value={formData.environment}
                onChange={(e) => handleInputChange('environment', e.target.value)}
                style={selectStyle as any}
              >
                <option value="无">无</option>
                <option value="开发">开发</option>
                <option value="测试">测试</option>
                <option value="生产">生产</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: errors.name ? '#e74c3c' : '#3c3c3c'
                } as any}
                placeholder="输入连接名称"
              />
              {errors.name && <span style={errorStyle}>{errors.name}</span>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Host</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: errors.host ? '#e74c3c' : '#3c3c3c'
                } as any}
                placeholder="输入主机地址"
              />
              {errors.host && <span style={errorStyle}>{errors.host}</span>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>User</label>
              <input
                type="text"
                value={formData.user}
                onChange={(e) => handleInputChange('user', e.target.value)}
                style={inputStyle as any}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>端口</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 22)}
                style={inputStyle as any}
              />
            </div>

            <div style={formGroupStyle}>
              <div style={authButtonsContainerStyle}>
                <button
                  onClick={() => handleInputChange('authMethod', 'password')}
                  style={{
                    ...authButtonStyle,
                    backgroundColor: formData.authMethod === 'password' ? '#007acc' : '#3c3c3c'
                  }}
                >
                  密码
                </button>
                <button
                  onClick={() => handleInputChange('authMethod', 'privateKey')}
                  style={{
                    ...authButtonStyle,
                    backgroundColor: formData.authMethod === 'privateKey' ? '#007acc' : '#3c3c3c'
                  }}
                >
                  私钥
                </button>
                <button
                  onClick={() => handleInputChange('mfaEnabled', !formData.mfaEnabled)}
                  style={{
                    ...authButtonStyle,
                    backgroundColor: formData.mfaEnabled ? '#007acc' : '#3c3c3c'
                  }}
                >
                  MFA/2FA
                </button>
              </div>

              <div style={authSubButtonsContainerStyle}>
                <button style={authSubButtonStyle as any}>预设账号密码</button>
                <button style={authSubButtonStyle as any}>跳板机私钥</button>
              </div>

              <div style={authSubButtonsContainerStyle}>
                <button
                  onClick={() => handleInputChange('authMethod', 'agent')}
                  style={{
                    ...authSubButtonStyle as any,
                    backgroundColor: formData.authMethod === 'agent' ? '#007acc' : '#3c3c3c'
                  }}
                >
                  SSH Agent
                </button>
                <button
                  onClick={() => handleInputChange('authMethod', 'none')}
                  style={{
                    ...authSubButtonStyle as any,
                    backgroundColor: formData.authMethod === 'none' ? '#007acc' : '#3c3c3c'
                  }}
                >
                  不验证
                </button>
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>密码</label>
              <div style={passwordInputContainerStyle}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  style={passwordInputStyle as any}
                  placeholder="输入密码"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={passwordToggleButtonStyle as any}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    {showPassword ? (
                      <path d="M14 14L8 8M8 8L2 2M8 8V14M8 8V2" stroke="#858585" strokeWidth="1.5"/>
                    ) : (
                      <path d="M14 14L8 8M8 8L2 2M8 8V14M8 8V2M14 2L8 8M8 8L2 14" stroke="#858585" strokeWidth="1.5"/>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div style={formGroupStyleFull}>
              <label style={labelStyle}>备注</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                style={textareaStyle as any}
                placeholder="添加备注..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div style={dialogFooterStyle}>
          <button style={footerButtonStyle as any}>测试连接</button>
          <button onClick={validateAndSave} style={{ ...footerButtonStyle as any, color: '#007acc' }}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

const dialogOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
};

const dialogStyle: React.CSSProperties = {
  width: 600,
  backgroundColor: '#1e1e1e',
  borderRadius: 8,
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const dialogHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
  borderBottom: '1px solid #3c3c3c',
  backgroundColor: '#252526'
};

const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#cccccc'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
  borderRadius: 4,
  transition: 'background-color 0.15s',
  ':hover': {
    backgroundColor: '#3c3c3c'
  }
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  padding: '12px 16px',
  borderBottom: '1px solid #3c3c3c',
  backgroundColor: '#1e1e1e'
};

const tabButtonStyle: React.CSSProperties = {
  padding: '4px 12px',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 500,
  transition: 'all 0.15s'
};

const contentStyle: React.CSSProperties = {
  padding: 16,
  maxHeight: 400,
  overflowY: 'auto'
};

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8
};

const formGroupStyleFull: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  gridColumn: 'span 2'
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#858585'
};

const colorTagsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6
};

const colorTagButtonStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 4,
  border: '2px solid transparent',
  cursor: 'pointer',
  transition: 'border-color 0.15s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const selectStyle = {
  padding: '8px 12px',
  backgroundColor: '#2d2d2d',
  border: '1px solid #3c3c3c',
  borderRadius: 4,
  color: '#cccccc',
  fontSize: 13,
  cursor: 'pointer',
  outline: 'none',
  ':focus': {
    borderColor: '#007acc'
  }
};

const inputStyle = {
  padding: '8px 12px',
  backgroundColor: '#2d2d2d',
  border: '1px solid #3c3c3c',
  borderRadius: 4,
  color: '#cccccc',
  fontSize: 13,
  outline: 'none',
  transition: 'border-color 0.15s',
  ':focus': {
    borderColor: '#007acc'
  }
};

const errorStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#e74c3c'
};

const authButtonsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6
};

const authButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '6px 12px',
  border: 'none',
  borderRadius: 4,
  color: '#ffffff',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background-color 0.15s'
};

const authSubButtonsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  marginTop: 6
};

const authSubButtonStyle = {
  flex: 1,
  padding: '4px 8px',
  backgroundColor: '#3c3c3c',
  border: 'none',
  borderRadius: 3,
  color: '#cccccc',
  fontSize: 11,
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  ':hover': {
    backgroundColor: '#4a4a4f'
  }
};

const passwordInputContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center'
};

const passwordInputStyle = {
  flex: 1,
  padding: '8px 12px',
  backgroundColor: '#2d2d2d',
  border: '1px solid #3c3c3c',
  borderRadius: 4,
  color: '#cccccc',
  fontSize: 13,
  outline: 'none',
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  transition: 'border-color 0.15s',
  ':focus': {
    borderColor: '#007acc'
  }
};

const passwordToggleButtonStyle = {
  padding: '8px 12px',
  backgroundColor: '#2d2d2d',
  border: '1px solid #3c3c3c',
  borderLeft: 'none',
  borderRadius: 4,
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  ':hover': {
    backgroundColor: '#3c3c3c'
  }
};

const textareaStyle = {
  padding: '8px 12px',
  backgroundColor: '#2d2d2d',
  border: '1px solid #3c3c3c',
  borderRadius: 4,
  color: '#cccccc',
  fontSize: 13,
  outline: 'none',
  resize: 'vertical',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
  ':focus': {
    borderColor: '#007acc'
  }
};

const dialogFooterStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderTop: '1px solid #3c3c3c',
  backgroundColor: '#252526'
};

const footerButtonStyle = {
  padding: '6px 16px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: 4,
  color: '#858585',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    color: '#cccccc',
    backgroundColor: '#3c3c3c'
  }
};

export default SSHConfigDialog;
export type { SSHConfig };
