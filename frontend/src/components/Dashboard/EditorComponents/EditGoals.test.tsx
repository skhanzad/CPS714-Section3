import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock submitProfile used by EditGoals
vi.mock('./submitProfile', () => ({ submitProfile: vi.fn() }));
import { submitProfile } from './submitProfile';

import { EditGoals } from './EditGoals';

const baseProfile = {
  id: 'user-1',
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  phone_number: '(123)-456-7890',
  profile_picture_url: '',
  fitness_goals: 'Lose 5 lbs',
  membership_subscriptions: [],
};

test('edit goals enables textarea and save calls submitProfile', async () => {
  const mockReturn = vi.fn();
  const mockSuccess = vi.fn();
  const mockError = vi.fn();

  (submitProfile as any).mockResolvedValue({ ...baseProfile, fitness_goals: 'Gain muscle' });

  render(
    <EditGoals
      profile={baseProfile as any}
      returnProfileData={mockReturn}
      reportSuccessGoals={mockSuccess}
      reportErrorInGoalsEdit={mockError}
    />
  );

  // Click edit
  await userEvent.click(screen.getByRole('button', { name: /edit/i }));

  // Textarea should be enabled
  const textarea = screen.getByPlaceholderText(/what are your fitness goals/i) as HTMLTextAreaElement;
  expect(textarea).not.toBeDisabled();

  // Change goals — use fireEvent.change to avoid selection API issues in happy-dom
  fireEvent.change(textarea, { target: { value: 'Gain muscle' } });

  // Save
  await userEvent.click(screen.getByRole('button', { name: /save/i }));

  await waitFor(() => expect(submitProfile).toHaveBeenCalled());
  expect(mockReturn).toHaveBeenCalled();
});
