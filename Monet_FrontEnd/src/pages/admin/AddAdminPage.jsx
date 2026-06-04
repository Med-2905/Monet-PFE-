import { useState } from 'react';
import { adminApi } from '../../services/adminApi.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import FormField from '../../components/ui/FormField.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { getErrorMessage, getValidationErrors } from '../../utils/apiErrors.js';

const initialForm = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
};

export default function AddAdminPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setFeedback(null);
    setLoading(true);

    try {
      await adminApi.createAdmin(form);
      setFeedback({ type: 'success', message: 'Admin created successfully.' });
      setForm(initialForm);
    } catch (err) {
      setErrors(getValidationErrors(err));
      setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to create admin.') });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Add Admin" subtitle="Create another administrator account." />

      <form className="card max-w-4xl p-6" onSubmit={handleSubmit}>
        {feedback && (
          <div className="mb-6">
            <Alert type={feedback.type}>{feedback.message}</Alert>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="First name" name="first_name" value={form.first_name} onChange={updateField} error={errors.first_name?.[0]} required />
          <FormField label="Last name" name="last_name" value={form.last_name} onChange={updateField} error={errors.last_name?.[0]} required />
          <FormField label="Username" name="username" value={form.username} onChange={updateField} error={errors.username?.[0]} required />
          <FormField label="Email" type="email" name="email" value={form.email} onChange={updateField} error={errors.email?.[0]} required />
          <FormField label="Password" type="password" name="password" value={form.password} onChange={updateField} error={errors.password?.[0]} required />
          <FormField label="Confirm password" type="password" name="password_confirmation" value={form.password_confirmation} onChange={updateField} error={errors.password_confirmation?.[0]} required />
          <FormField label="Phone" name="phone" value={form.phone} onChange={updateField} error={errors.phone?.[0]} />
        </div>

        <div className="mt-8 flex justify-end">
          <Button type="submit" loading={loading}>Create Admin</Button>
        </div>
      </form>
    </>
  );
}
