import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EditProfile } from './EditProfile';

/*
    Purpose of tests: verify that when the user clicks "Edit" on their profile, the form becomes editable
    and the upload-photo control appears.
    What we check: after clicking Edit, a visible name input is enabled and the "Upload Photo"
    label is shown (using mock data).
*/

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

  // User action: click the Edit button to enable editing
  const editBtn = screen.getByRole('button', { name: /edit/i });
  await userEvent.click(editBtn);

  // Check: the First Name input renders with the initial value and is enabled
  const firstName = screen.getByDisplayValue('Jane') as HTMLInputElement;
  expect(firstName).not.toBeDisabled();

  // Check: the Upload Photo control is visible to let the user pick a new picture
  expect(screen.getByText(/upload photo/i)).toBeInTheDocument();
});
