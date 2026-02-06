import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, LogOut, ChevronRight, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
      <div className="min-h-screen bg-white pb-nav lg:pb-0">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 safe-top lg:hidden">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold">Account</h1>
          </div>
        </header>

        {/* Desktop Header */}
        <div className="hidden lg:block px-8 py-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold">Account</h1>
        </div>

        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Sign in to your account</h2>
          <p className="text-gray-500 text-center mb-6">
            Track orders, save addresses, and more
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/login')}>Sign In</Button>
            <Button onClick={() => navigate('/register')} variant="outline">
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-white pb-nav lg:pb-0">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 safe-top lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Account</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold">Account</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <Edit2 className="w-4 h-4" />
            <span className="text-sm font-medium">Edit Profile</span>
          </button>
        )}
      </div>

      <div className="px-4 lg:px-8 py-6 lg:max-w-2xl">
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-4 mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Your phone number"
                type="tel"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Default Address
                </label>
                <textarea
                  value={formData.default_address}
                  onChange={(e) => setFormData({ ...formData, default_address: e.target.value })}
                  placeholder="Your default delivery address"
                  rows={3}
                  className={cn(
                    'w-full bg-gray-100 border border-gray-200 rounded-xl',
                    'px-4 py-3.5 text-base text-black placeholder-gray-400',
                    'outline-none transition-all duration-150',
                    'focus:border-black focus:ring-2 focus:ring-black/10',
                    'resize-none'
                  )}
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
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  isLoading={isSaving}
                  className="flex-1"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{user?.name}</h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                {user?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}

                {user?.default_address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Default Address</p>
                      <p className="font-medium">{user.default_address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl overflow-hidden mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50"
          >
            <span className="font-medium">Order History</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white rounded-xl text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
