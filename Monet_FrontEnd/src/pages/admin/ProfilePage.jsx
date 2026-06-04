import { useState } from 'react';
import { adminApi } from '../../services/adminApi.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import FormField from '../../components/ui/FormField.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import useAuth from '../../hooks/useAuth.js';
import { getErrorMessage, getValidationErrors } from '../../utils/apiErrors.js';

const passwordInitial = {
  current_password: '',
  password: '',
  password_confirmation: '',
};

export default function ProfilePage() {
  const { user, updateLocalUser } = useAuth();

  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [password, setPassword] = useState(passwordInitial);

  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const [profileFeedback, setProfileFeedback] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  function updateProfile(event) {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function updatePassword(event) {
    setPassword((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileErrors({});
    setProfileFeedback(null);
    setSavingProfile(true);

    try {
      const { data } = await adminApi.updateMe(profile);
      updateLocalUser(data.user || data.admin || profile);
      setProfileFeedback({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setProfileErrors(getValidationErrors(err));
      setProfileFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to update profile.') });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordErrors({});
    setPasswordFeedback(null);
    setSavingPassword(true);

    try {
      await adminApi.changePassword(password);
      setPassword(passwordInitial);
      setPasswordFeedback({ type: 'success', message: 'Password changed successfully.' });
    } catch (err) {
      setPasswordErrors(getValidationErrors(err));
      setPasswordFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to change password.') });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <>
      <PageHeader title="Profile" subtitle="Update your admin account and password." />

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card p-6" onSubmit={handleProfileSubmit}>
          <h2 className="text-base font-black text-slate-950 dark:text-white">Profile information</h2>

          {profileFeedback && (
            <div className="mt-4">
              <Alert type={profileFeedback.type}>{profileFeedback.message}</Alert>
            </div>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField label="First name" name="first_name" value={profile.first_name} onChange={updateProfile} error={profileErrors.first_name?.[0]} />
            <FormField label="Last name" name="last_name" value={profile.last_name} onChange={updateProfile} error={profileErrors.last_name?.[0]} />
            <FormField label="Username" name="username" value={profile.username} onChange={updateProfile} error={profileErrors.username?.[0]} />
            <FormField label="Email" type="email" name="email" value={profile.email} onChange={updateProfile} error={profileErrors.email?.[0]} />
            <FormField label="Phone" name="phone" value={profile.phone} onChange={updateProfile} error={profileErrors.phone?.[0]} />
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={savingProfile}>Save Profile</Button>
          </div>
        </form>

        <form className="card p-6" onSubmit={handlePasswordSubmit}>
          <h2 className="text-base font-black text-slate-950 dark:text-white">Change password</h2>

          {passwordFeedback && (
            <div className="mt-4">
              <Alert type={passwordFeedback.type}>{passwordFeedback.message}</Alert>
            </div>
          )}

          <div className="mt-5 space-y-4">
            <FormField
              label="Current password"
              type="password"
              name="current_password"
              value={password.current_password}
              onChange={updatePassword}
              error={passwordErrors.current_password?.[0]}
              required
            />
            <FormField
              label="New password"
              type="password"
              name="password"
              value={password.password}
              onChange={updatePassword}
              error={passwordErrors.password?.[0]}
              required
            />
            <FormField
              label="Confirm new password"
              type="password"
              name="password_confirmation"
              value={password.password_confirmation}
              onChange={updatePassword}
              error={passwordErrors.password_confirmation?.[0]}
              required
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={savingPassword}>Change Password</Button>
          </div>
        </form>
      </div>
    </>
  );
}
