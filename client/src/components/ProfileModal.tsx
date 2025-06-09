import React, { useState, useEffect } from 'react';
import { ResponsiveUserProfile } from './ResponsiveUserProfile';

interface ProfileModalProps {}

const ProfileModal: React.FC<ProfileModalProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const handleShowProfile = (event: CustomEvent) => {
      setProfileData(event.detail);
      setIsOpen(true);
    };

    window.addEventListener('showUserProfile', handleShowProfile as EventListener);
    return () => {
      window.removeEventListener('showUserProfile', handleShowProfile as EventListener);
    };
  }, []);

  const handleLogout = async () => {
    console.log('Logout triggered from profile modal');
    try {
      const { logoutUser } = await import('../lib/userStorage');
      await logoutUser();
      
      // Trigger the custom event for other components
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      // Close modal and reload page
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload on error
      window.location.reload();
    }
  };

  const handleUpdateProfile = (updates: any) => {
    console.log('Profile updated:', updates);
    // Could integrate with gameState updates here if needed
  };

  if (!isOpen || !profileData) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full max-h-[90vh] overflow-auto">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 border border-green-400 text-green-400 flex items-center justify-center hover:bg-green-400 hover:text-black transition-colors"
        >
          ×
        </button>
        <ResponsiveUserProfile
          user={profileData.user}
          gameState={profileData.gameState}
          onUpdateProfile={handleUpdateProfile}
          onLogout={handleLogout}
          terminalSettings={{
            primaryColor: '#00ff41',
            backgroundColor: '#000000',
            textColor: '#00ff41'
          }}
        />
      </div>
    </div>
  );
};

export default ProfileModal; 