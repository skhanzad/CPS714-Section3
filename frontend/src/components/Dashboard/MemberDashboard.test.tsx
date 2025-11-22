import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock supabase used by MemberDashboard and child components
vi.mock('../../lib/supabase', () => {
  const fakeProfile = {
    id: 'user-1',
    full_name: 'Jane Doe',
    email: 'jane@example.com',
    profile_picture_url: '',
    membership_subscriptions: [],
  };

  // Generic chainable response builder which is awaitable
  const chainable = (result: any) => {
    const obj: any = {
      select: () => obj,
      eq: () => obj,
      gte: () => obj,
      lte: () => obj,
      order: () => obj,
      single: async () => result,
      then: (cb: any) => {
        cb(result);
        return Promise.resolve(result);
      },
    };
    return obj;
  };

  return {
    supabase: {
      from: (table: string) => {
        if (table === 'profiles') {
          return chainable({ data: fakeProfile, error: null });
        }
        // For other tables return an empty data set
        return chainable({ data: [], error: null });
      },
    },
  };
});

import { MemberDashboard } from './MemberDashboard';

test('clicking Profile button shows ProfileEditor', async () => {
  render(<MemberDashboard />);

  // Wait for the Profile button to appear and click it
  const profileBtn = await screen.findByRole('button', { name: /profile/i });
  await userEvent.click(profileBtn);

  // ProfileEditor displays 'Personal Information'
  expect(await screen.findByText(/personal information/i)).toBeInTheDocument();
});

test('clicking Dashboard button shows dashboard view', async () => {
  render(<MemberDashboard />);

  const dashboardBtn = await screen.findByRole('button', { name: /dashboard/i });
  await userEvent.click(dashboardBtn);

  // BaseDashboardView contains the calendar element
  expect(await screen.findByText(/gym achievements feed/i)).toBeInTheDocument();
});
