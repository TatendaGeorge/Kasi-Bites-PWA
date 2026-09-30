import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button, TextField, Icon, SettingsGroup, SettingsRow } from '@/components/shisa';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    default_address: user?.default_address || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="pb-nav lg:pb-0" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
        <div className="safe-top sh-pad lg:px-8 lg:py-6" style={{ borderBottom: '1px solid var(--line)' }}>
          <h1 style={{ font: '600 28px/34px var(--font-display)', color: 'var(--ink)' }}>Account</h1>
        </div>

        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div
            className="flex items-center justify-center mb-6"
            style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--surface-sunken)' }}
          >
            <Icon name="circle-user" size={48} style={{ color: 'var(--ink-subtle)' }} />
          </div>
          <h2 className="mb-2" style={{ font: '600 22px/28px var(--font-display)', color: 'var(--ink)' }}>
            Sign in to your account
          </h2>
          <p className="text-center mb-6" style={{ color: 'var(--ink-muted)' }}>
            Track orders, save addresses, and more
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/login')}>Sign in</Button>
            <Button onClick={() => navigate('/register')} variant="secondary">
              Create account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-nav lg:pb-0" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <div
        className="safe-top sh-pad lg:px-8 lg:py-6 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <h1 style={{ font: '600 28px/34px var(--font-display)', color: 'var(--ink)' }}>Account</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-2"
            style={{ color: 'var(--ink-muted)', borderRadius: 'var(--radius-pill)' }}
          >
            <span className="text-sm font-bold">Edit</span>
          </button>
        )}
      </div>

      <div className="sh-pad lg:px-8 lg:py-6 lg:max-w-2xl sh-stack">
        <SettingsGroup>
          {isEditing ? (
            <div className="space-y-4">
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
              <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Your phone number"
                type="tel"
              />
              <div>
                <label style={{ display: 'block', font: '700 13px/18px var(--font-body)', color: 'var(--ink-muted)', marginBottom: 8 }}>
                  Default address
                </label>
                <textarea
                  value={formData.default_address}
                  onChange={(e) => setFormData({ ...formData, default_address: e.target.value })}
                  placeholder="Your default delivery address"
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'var(--surface)',
                    border: '1px solid var(--line-strong)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    font: '400 15px/22px var(--font-body)',
                    color: 'var(--ink)',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      phone: user?.phone || '',
                      default_address: user?.default_address || '',
                    });
                  }}
                  variant="secondary"
                  block
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} block>
                  {isSaving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center"
                  style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-soft)' }}
                >
                  <Icon name="circle-user" size={32} style={{ color: 'var(--brand-text)' }} />
                </div>
                <div>
                  <h2 style={{ font: '600 18px/24px var(--font-display)', color: 'var(--ink)' }}>{user?.name}</h2>
                  <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="pt-4 space-y-3" style={{ borderTop: '1px solid var(--line)' }}>
                {user?.phone && (
                  <div className="flex items-center gap-3">
                    <Icon name="phone" size={20} style={{ color: 'var(--ink-subtle)' }} />
                    <div>
                      <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                        Phone
                      </p>
                      <p style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>{user.phone}</p>
                    </div>
                  </div>
                )}

                {user?.default_address && (
                  <div className="flex items-start gap-3">
                    <Icon name="map-pin" size={20} style={{ color: 'var(--ink-subtle)', marginTop: 2 }} />
                    <div>
                      <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                        Default address
                      </p>
                      <p style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>{user.default_address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow icon="receipt-text" title="Order history" onClick={() => navigate('/orders')} />
        </SettingsGroup>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2"
          style={{
            padding: 16,
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            color: 'var(--danger)',
          }}
        >
          <Icon name="arrow-right" size={20} />
          <span style={{ font: '700 15px/20px var(--font-body)' }}>Sign out</span>
        </button>
      </div>
    </div>
  );
}
