'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface ClientType {
  id: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
  activo: boolean;
}

interface ClientContextType {
  clients: ClientType[];
  selectedClientId: string | null;
  selectedClient: ClientType | null;
  setSelectedClientId: (id: string | null) => void;
  refreshClients: () => Promise<void>;
  loading: boolean;
}

const ClientContext = createContext<ClientContextType>({
  clients: [],
  selectedClientId: null,
  selectedClient: null,
  setSelectedClientId: () => {},
  refreshClients: async () => {},
  loading: true,
});

export function ClientProvider({ children }: { children: ReactNode }) {
  const { status } = useSession() || {};
  const [clients, setClients] = useState<ClientType[]>([]);
  const [selectedClientId, setSelectedClientIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data ?? []);
      }
    } catch (e) {
      console.error('Error fetching clients', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      refreshClients();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, refreshClients]);

  // Persist selection in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedClientId');
      if (saved) setSelectedClientIdState(saved);
    }
  }, []);

  const setSelectedClientId = useCallback((id: string | null) => {
    setSelectedClientIdState(id);
    if (typeof window !== 'undefined') {
      if (id) localStorage.setItem('selectedClientId', id);
      else localStorage.removeItem('selectedClientId');
    }
  }, []);

  const selectedClient = clients.find(c => c.id === selectedClientId) ?? null;

  return (
    <ClientContext.Provider value={{ clients, selectedClientId, selectedClient, setSelectedClientId, refreshClients, loading }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  return useContext(ClientContext);
}
