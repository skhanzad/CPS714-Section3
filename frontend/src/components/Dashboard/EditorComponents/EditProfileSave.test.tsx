import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock submitProfile used by EditProfile
vi.mock('./submitProfile', () => ({ submitProfile: vi.fn() }));
import { submitProfile } from './submitProfile';

import { EditProfile } from './EditProfile';

const baseProfile = {
  id: 'user-1',
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  phone_number: '(123)-456-7890',
  profile_picture_url: '',
  fitness_goals: '',
  membership_subscriptions: [],
};

test('save calls submitProfile and returnProfileData', async () => {
  const mockReturn = vi.fn();
  const mockSuccess = vi.fn();
  const mockError = vi.fn();

  // Make the submitProfile mock return a slightly updated profile
  (submitProfile as any).mockResolvedValue({ ...baseProfile, full_name: 'Jane Updated' });

  render(
    <EditProfile
      profile={baseProfile as any}
      returnProfileData={mockReturn}
      reportSuccessProfile={mockSuccess}
      reportErrorInProfileEdit={mockError}
    />
  );

  // Enter edit mode to reveal the Save button
  await userEvent.click(screen.getByRole('button', { name: /edit/i }));

  // Locate the first-name input by its displayed value and change it
  const firstName = screen.getByDisplayValue('Jane') as HTMLInputElement;
  await userEvent.clear(firstName);
  await userEvent.type(firstName, 'Jane');

  // Click Save and wait for the mock API to be called
  await userEvent.click(screen.getByRole('button', { name: /save/i }));

  await waitFor(() => expect(submitProfile).toHaveBeenCalled());
  expect(mockReturn).toHaveBeenCalled();
});
