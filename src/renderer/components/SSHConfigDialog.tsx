import React, { useState, useEffect } from 'react';
import { sshService } from '../../services/sshService';

interface SSHConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SSHConfig) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
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

const SSHConfigDialog: React.FC<SSHConfigDialogProps> = ({ isOpen, onClose, onSave, onShowToast, config }) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'tunnel' | 'proxy' | 'env' | 'advanced'>('standard');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; host?: string }>({});
  const [testing, setTesting] = useState(false);

  const [formData, setFormData] = useState<SSHConfig>({
    id: config?.id || '',
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

  // 当 config 变化或对话框打开时，更新表单数据
  useEffect(() => {
    if (isOpen && config) {
      setFormData({
        id: config.id || '',
        name: config.name || '',
        host: config.host || '',
        user: config.user || 'root',
        port: config.port || 22,
        password: config.password || '',
        authMethod: config.authMethod || 'password',
        colorTag: config.colorTag || colorTags[0],
        environment: config.environment || '无',
        remarks: config.remarks || '',
        mfaEnabled: config.mfaEnabled || false
      });
      setErrors({});
    } else if (isOpen && !config) {
      // 新建时重置表单
      setFormData({
        id: '',
        name: '',
        host: '',
        user: 'root',
        port: 22,
        password: '',
        authMethod: 'password',
        colorTag: colorTags[0],
        environment: '无',
        remarks: '',
        mfaEnabled: false
      });
      setErrors({});
    }
  }, [isOpen, config]);

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

  const handleTestConnection = async () => {
    if (!formData.host.trim()) {
      setErrors({ host: 'host is a required field' });
      onShowToast('请填写主机地址', 'warning');
      return;
    }

    setTesting(true);
    onShowToast('正在测试连接...', 'info');

    try {
      const result = await sshService.testConnection({
        host: formData.host,
        port: formData.port,
        username: formData.user,
        password: formData.password
      });

      if (result.success) {
        onShowToast('连接成功！', 'success');
      } else {
        onShowToast(result.message, 'error');
      }
    } catch (error: any) {
      onShowToast(`测试连接失败: ${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={dialogOverlayStyle}>
      <div style={dialogStyle}>
        <div style={dialogHeaderStyle}>
          <span style={titleStyle}>SSH配置编辑</span>
          <button onClick={onClose} style={closeButtonStyle as any}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
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
                backgroundColor: activeTab === tab.key ? 'var(--bg-tertiary)' : 'transparent',
                color: activeTab === tab.key ? 'var(--accent-color)' : 'var(--text-secondary)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={contentStyle as any}>
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
                      borderColor: formData.colorTag === color ? 'var(--accent-color)' : 'transparent'
                    }}
                  />
                ))}
                <button style={colorTagButtonStyle}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 2v8M2 6h8" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                <button style={colorTagButtonStyle}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2L10 10M10 2L2 10" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
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
                  borderColor: errors.name ? 'var(--danger-color)' : 'var(--border-color)'
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
                  borderColor: errors.host ? 'var(--danger-color)' : 'var(--border-color)'
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
                    backgroundColor: formData.authMethod === 'password' ? 'var(--accent-color)' : 'var(--bg-tertiary)'
                  }}
                >
                  密码
                </button>
                <button
                  onClick={() => handleInputChange('authMethod', 'privateKey')}
                  style={{
                    ...authButtonStyle,
                    backgroundColor: formData.authMethod === 'privateKey' ? 'var(--accent-color)' : 'var(--bg-tertiary)'
                  }}
                >
                  私钥
                </button>
                <button
                  onClick={() => handleInputChange('mfaEnabled', !formData.mfaEnabled)}
                  style={{
                    ...authButtonStyle,
                    backgroundColor: formData.mfaEnabled ? 'var(--accent-color)' : 'var(--bg-tertiary)'
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
                    backgroundColor: formData.authMethod === 'agent' ? 'var(--accent-color)' : 'var(--bg-tertiary)'
                  }}
                >
                  SSH Agent
                </button>
                <button
                  onClick={() => handleInputChange('authMethod', 'none')}
                  style={{
                    ...authSubButtonStyle as any,
                    backgroundColor: formData.authMethod === 'none' ? 'var(--accent-color)' : 'var(--bg-tertiary)'
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
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                      <path d="M2.05 12C3.42 7.94 7.22 5 12 5c4.78 0 8.58 2.94 9.95 7-1.37 4.06-5.17 7-9.95 7-4.78 0-8.58-2.94-9.95-7Z"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0 1 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 0 1-4.132 5.411m0 0L21 21"/>
                    </svg>
                  )}
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
          <button
            onClick={handleTestConnection}
            disabled={testing}
            style={{
              ...footerButtonStyle as any,
              opacity: testing ? 0.6 : 1,
              cursor: testing ? 'wait' : 'pointer'
            }}
          >
            {testing ? '测试中...' : '测试连接'}
          </button>
          <button onClick={validateAndSave} style={{ ...footerButtonStyle as any, color: 'var(--accent-color)' }}>
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
  backgroundColor: 'var(--bg-primary)',
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
  borderBottom: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-secondary)'
};

const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--text-primary)'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
  borderRadius: 4,
  transition: 'background-color 0.15s',
  ':hover': {
    backgroundColor: 'var(--bg-tertiary)'
  }
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  padding: '12px 16px',
  borderBottom: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-primary)'
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

const contentStyle = {
  padding: 16,
  maxHeight: 400,
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  scrollbarColor: 'var(--border-color) var(--bg-tertiary)',
  '::-webkit-scrollbar': {
    width: 8,
    height: 8
  },
  '::-webkit-scrollbar-track': {
    background: 'var(--bg-tertiary)',
    borderRadius: 4
  },
  '::-webkit-scrollbar-thumb': {
    background: 'var(--border-color)',
    borderRadius: 4,
    '&:hover': {
      background: 'var(--text-secondary)'
    }
  }
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
  color: 'var(--text-secondary)'
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
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  fontSize: 13,
  cursor: 'pointer',
  outline: 'none',
  ':focus': {
    borderColor: 'var(--accent-color)'
  }
};

const inputStyle = {
  padding: '8px 12px',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  fontSize: 13,
  outline: 'none',
  transition: 'border-color 0.15s',
  ':focus': {
    borderColor: 'var(--accent-color)'
  }
};

const errorStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--danger-color)'
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
  backgroundColor: 'var(--bg-tertiary)',
  border: 'none',
  borderRadius: 3,
  color: 'var(--text-primary)',
  fontSize: 11,
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  ':hover': {
    backgroundColor: 'var(--border-color)'
  }
};

const passwordInputContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center'
};

const passwordInputStyle = {
  flex: 1,
  padding: '8px 12px',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  fontSize: 13,
  outline: 'none',
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  transition: 'border-color 0.15s',
  ':focus': {
    borderColor: 'var(--accent-color)'
  }
};

const passwordToggleButtonStyle = {
  padding: '8px 12px',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  borderLeft: 'none',
  borderRadius: 4,
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  ':hover': {
    backgroundColor: 'var(--border-color)'
  }
};

const textareaStyle = {
  padding: '8px 12px',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  fontSize: 13,
  outline: 'none',
  resize: 'vertical',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
  ':focus': {
    borderColor: 'var(--accent-color)'
  }
};

const dialogFooterStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderTop: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-secondary)'
};

const footerButtonStyle = {
  padding: '6px 16px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: 4,
  color: 'var(--text-secondary)',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-tertiary)'
  }
};

export default SSHConfigDialog;
export type { SSHConfig };
