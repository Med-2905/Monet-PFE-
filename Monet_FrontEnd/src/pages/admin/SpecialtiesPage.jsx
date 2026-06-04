import { useState } from 'react';
import { adminApi } from '../../services/adminApi.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import FormField from '../../components/ui/FormField.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { getErrorMessage, getValidationErrors } from '../../utils/apiErrors.js';

export default function SpecialtiesPage() {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setFeedback(null);
    setLoading(true);

    try {
      await adminApi.createSpecialty({ name });
      setFeedback({ type: 'success', message: 'Specialty created successfully.' });
      setName('');
    } catch (err) {
      setErrors(getValidationErrors(err));
      setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to create specialty.') });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Specialties" subtitle="Add medical specialties used by doctor profiles." />

      <form className="card max-w-xl p-6" onSubmit={handleSubmit}>
        {feedback && (
          <div className="mb-6">
            <Alert type={feedback.type}>{feedback.message}</Alert>
          </div>
        )}

        <FormField
          label="Specialty name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name?.[0]}
          placeholder="Cardiologie"
          required
        />

        <div className="mt-6 flex justify-end">
          <Button type="submit" loading={loading}>Add Specialty</Button>
        </div>
      </form>
    </>
  );
}
