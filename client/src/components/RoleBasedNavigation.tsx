import { Link } from 'wouter';
import { useAuth } from '../context/AuthContext';

export default function RoleBasedNavigation() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
      {/* Admin Dashboard Link */}
      {user.role === 'admin' && (
        <Link href="/admin/dashboard">
          <a style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(31, 111, 235, 0.3)'
          }}>
            <span>📊</span>
            Admin Dashboard
          </a>
        </Link>
      )}

      {/* Investor Portfolio Link */}
      {user.role === 'investor' && (
        <Link href="/investor/dashboard">
          <a style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(31, 111, 235, 0.3)'
          }}>
            <span>💼</span>
            My Portfolio
          </a>
        </Link>
      )}

      {/* Properties Link - Available to all authenticated users */}
      <Link href="/properties">
        <a style={{
          padding: '12px 24px',
          background: 'transparent',
          color: '#1F6FEB',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '0.95rem',
          border: '2px solid #1F6FEB',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🏢</span>
          Properties
        </a>
      </Link>

      {/* User Info & Logout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginLeft: '16px',
        padding: '8px 16px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          fontSize: '0.85rem',
          color: '#64748b'
        }}>
          Welcome, <strong style={{ color: '#0A192F' }}>{user.firstName || user.email}</strong>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {user.role === 'admin' ? 'Administrator' : 'Investor'}
          </div>
        </div>
        
        <button
          onClick={() => {
            // Logout functionality will be handled by AuthContext
            const { logout } = useAuth();
            logout();
            window.location.href = '/';
          }}
          style={{
            padding: '6px 12px',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}