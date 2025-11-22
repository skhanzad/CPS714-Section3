import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EditProfile } from './EditProfile';

const fakeProfile = {
  id: 'user-1',
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  phone_number: '(123)-456-7890',
  profile_picture_url: '',
  fitness_goals: '',
  membership_subscriptions: [],
};

test('edit enables fields and shows upload button', async () => {
  const mockReturn = vi.fn();
  const mockSuccess = vi.fn();
  const mockError = vi.fn();

  render(
    <EditProfile
      profile={fakeProfile as any}
      returnProfileData={mockReturn}
      reportSuccessProfile={mockSuccess}
      reportErrorInProfileEdit={mockError}
    />
  );

  // Click the Edit button
  const editBtn = screen.getByRole('button', { name: /edit/i });
  await userEvent.click(editBtn);

  // Inputs should be enabled - select by current value since labels are not linked
  const firstName = screen.getByDisplayValue('Jane') as HTMLInputElement;
  expect(firstName).not.toBeDisabled();

  // Upload Photo label should be visible
  expect(screen.getByText(/upload photo/i)).toBeInTheDocument();
});
