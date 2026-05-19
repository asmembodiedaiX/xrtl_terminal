import { create } from 'zustand';

export interface TerminalSession {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting';
  type: 'local' | 'ssh';
  sshConfig?: SSHConfig;
}

export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

interface TerminalStore {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  addSession: (session: Omit<TerminalSession, 'id'>) => void;
  removeSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  updateSessionStatus: (id: string, status: TerminalSession['status']) => void;
  updateSessionName: (id: string, name: string) => void;
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  sessions: [],
  activeSessionId: null,

  addSession: (session) => set((state) => {
    const newSession: TerminalSession = {
      ...session,
      id: `session-${Date.now()}`
    };
    return {
      sessions: [...state.sessions, newSession],
      activeSessionId: newSession.id
    };
  }),

  removeSession: (id) => set((state) => {
    const newSessions = state.sessions.filter(s => s.id !== id);
    let newActiveId = state.activeSessionId;
    if (state.activeSessionId === id) {
      newActiveId = newSessions.length > 0 ? newSessions[0].id : null;
    }
    return {
      sessions: newSessions,
      activeSessionId: newActiveId
    };
  }),

  setActiveSession: (id) => set({ activeSessionId: id }),

  updateSessionStatus: (id, status) => set((state) => ({
    sessions: state.sessions.map(s =>
      s.id === id ? { ...s, status } : s
    )
  })),

  updateSessionName: (id, name) => set((state) => ({
    sessions: state.sessions.map(s =>
      s.id === id ? { ...s, name } : s
    )
  }))
}));

export const TerminalProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};
