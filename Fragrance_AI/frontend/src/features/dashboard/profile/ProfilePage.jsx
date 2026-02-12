import React, { useState, useEffect } from 'react';
import { User, Mail, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import useUserStore from '../state/useUserStore';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ProfilePage = () => {
  const { userName, email, avatarUrl, fetchUserProfile } = useUserStore();
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch current profile data
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // Fetch fresh data from API
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success && data.user) {
          // Use username from DB directly
          setUsername(data.user.username || '');
          // Set profile image
          setProfileImage(data.user.profileImage || '');
          // Also update the store
          await fetchUserProfile();
        } else {
          // Fallback to localStorage
          const storedUser = localStorage.getItem('fragrance_user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setUsername(user.username || '');
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to localStorage
        const storedUser = localStorage.getItem('fragrance_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUsername(user.username || '');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [fetchUserProfile]);

  const handleSave = async () => {
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

    setIsSaving(true);

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

        // Update local state with new username from response
        if (data.user && data.user.username) {
          setUsername(data.user.username);
        }

        // Update profile image if provided
        if (data.user && data.user.profileImage) {
          setProfileImage(data.user.profileImage);
        }

        // Refresh profile data to update store and sidebar (this will update userName in sidebar)
        await fetchUserProfile();
        
        setIsEditing(false);
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
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original username
    const storedUser = localStorage.getItem('fragrance_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username || userName || '');
    } else {
      setUsername(userName || '');
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-slate-400">Manage your account information</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-6">
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
              <h2 className="text-xl font-semibold text-white">{username || userName || 'Guest User'}</h2>
              <p className="text-slate-400 text-sm">{email}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <User className="w-4 h-4" />
                Username
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="flex-1"
                    disabled={isSaving}
                  />
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !username.trim()}
                    className="px-4"
                  >
                    {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save</>}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-white">{username || userName || 'Not set'}</span>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="text-sm"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-slate-400">{email || 'Not set'}</span>
                <span className="ml-2 text-xs text-slate-500">(Cannot be changed)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

