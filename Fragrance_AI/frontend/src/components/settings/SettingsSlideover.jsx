import React, { useState, useEffect, useMemo } from 'react';
import { User, Mail, Moon, Sun, Lock, Save } from 'lucide-react';
import { toast } from 'sonner';
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/Dialog';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useUserStore from '../../features/dashboard/state/useUserStore';
import useDashboardLayoutStore from '../../features/dashboard/state/useDashboardLayoutStore';
import clsx from 'clsx';

const SettingsSlideover = ({ open, onClose }) => {
  const { userName, email, avatarUrl, fetchUserProfile } = useUserStore();
  const { theme, toggleTheme } = useDashboardLayoutStore();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'theme', 'password'
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile state
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [authProvider, setAuthProvider] = useState('local');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Load profile data when slideover opens
  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open, fetchUserProfile]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUsername(data.user.username || '');
        setProfileImage(data.user.profileImage || '');
        // Set authProvider - default to 'local' if not provided
        const provider = data.user.authProvider || 'local';
        setAuthProvider(provider);
        console.log('Auth Provider:', provider); // Debug log
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty', {
        style: {
          background: '#000000',
          color: '#fbbf24',
          border: '1px solid rgba(251, 191, 36, 0.3)',
        },
      });
      return;
    }

    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters', {
        style: {
          background: '#000000',
          color: '#fbbf24',
          border: '1px solid rgba(251, 191, 36, 0.3)',
        },
      });
      return;
    }

    setIsSavingUsername(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Username updated successfully', {
          style: {
            background: '#000000',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          },
        });

        if (data.user && data.user.username) {
          setUsername(data.user.username);
        }
        if (data.user && data.user.profileImage) {
          setProfileImage(data.user.profileImage);
        }

        await fetchUserProfile();
        setIsEditingUsername(false);
      } else {
        toast.error(data.message || 'Failed to update username', {
          style: {
            background: '#000000',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          },
        });
      }
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error('Failed to update username. Please try again.', {
        style: {
          background: '#000000',
          color: '#fbbf24',
          border: '1px solid rgba(251, 191, 36, 0.3)',
        },
      });
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required', {
        style: {
          background: '#000000',
          color: '#fbbf24',
          border: '1px solid rgba(251, 191, 36, 0.3)',
        },
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters', {
        style: {
          background: '#000000',
          color: '#fbbf24',
          border: '1px solid rgba(251, 191, 36, 0.3)',
        },
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match', {
        style: {
          background: '#000000',
          color: '#fbbf24',
          border: '1px solid rgba(251, 191, 36, 0.3)',
        },
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password changed successfully', {
          style: {
            background: '#000000',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          },
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.message || 'Failed to change password', {
          style: {
            background: '#000000',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          },
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Please try again.', {
        style: {
          background: '#000000',
          color: '#fbbf24',
          border: '1px solid rgba(251, 191, 36, 0.3)',
        },
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleThemeToggle = () => {
    toggleTheme(); // This already handles localStorage and DOM updates
  };

  // Build tabs array - always include Profile and Theme, conditionally add Password
  const tabs = useMemo(() => {
    const baseTabs = [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'theme', label: 'Theme', icon: theme === 'dark' ? Moon : Sun },
    ];
    
    // Only add Password tab for local (manual) users, not OAuth users
    if (authProvider === 'local') {
      baseTabs.push({ id: 'password', label: 'Password', icon: Lock });
    }
    
    return baseTabs;
  }, [theme, authProvider]);

  // Debug: Log tabs and authProvider when dialog opens
  useEffect(() => {
    if (open) {
      console.log('Settings Dialog - Auth Provider:', authProvider);
      console.log('Settings Dialog - Tabs:', tabs.map(t => t.id));
    }
  }, [open, authProvider]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogClose onClose={onClose} />
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-180px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Profile Information</h3>
                    
                    {/* Profile Image */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-2xl font-semibold text-white overflow-hidden flex-shrink-0">
                        {profileImage || avatarUrl ? (
                          <img
                            src={profileImage || avatarUrl}
                            alt={userName || 'Profile'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{userName ? userName.charAt(0).toUpperCase() : 'G'}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">{username || userName || 'Guest User'}</h4>
                        <p className="text-sm text-muted-foreground">{email}</p>
                      </div>
                    </div>

                    {/* Username Field */}
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                          <User className="w-4 h-4" />
                          Username
                        </label>
                        {isEditingUsername ? (
                          <div className="flex gap-2">
                            <Input
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="Enter username"
                              className="flex-1"
                              disabled={isSavingUsername}
                            />
                            <Button
                              onClick={handleSaveUsername}
                              disabled={isSavingUsername || !username.trim()}
                              size="sm"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setIsEditingUsername(false);
                                loadProfile();
                              }}
                              disabled={isSavingUsername}
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                            <span className="text-foreground font-medium">{username || userName || 'Not set'}</span>
                            <Button
                              variant="ghost"
                              onClick={() => setIsEditingUsername(true)}
                              size="sm"
                              className="text-foreground hover:text-primary"
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Email Field (Read-only) */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg border border-border">
                          <span className="text-foreground/90">{email || 'Not set'}</span>
                          <span className="ml-2 text-xs text-muted-foreground">(Cannot be changed)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Theme Tab */}
              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Appearance</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-foreground font-medium">Theme</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Choose between dark and light mode
                            </p>
                          </div>
                          <button
                            onClick={handleThemeToggle}
                            className={clsx(
                              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                              theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30'
                            )}
                          >
                            <span
                              className={clsx(
                                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                              )}
                            />
                          </button>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                          {theme === 'dark' ? (
                            <>
                              <Moon className="w-4 h-4" />
                              <span>Dark mode</span>
                            </>
                          ) : (
                            <>
                              <Sun className="w-4 h-4" />
                              <span>Light mode</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && authProvider === 'local' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPasswords.current ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min. 8 characters)"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPasswords.new ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPasswords.confirm ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                        className="w-full"
                      >
                        {isChangingPassword ? 'Changing...' : 'Change Password'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsSlideover;

