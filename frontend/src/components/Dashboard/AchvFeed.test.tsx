import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AchvFeed } from './DashboardViewComponents/AchvFeed';

// Mock supabase used by AchvFeed
vi.mock('../../lib/supabase', () => {
  const allAchievements = [
    { id: '1', achievement_status: 'achieved', achievements: { description: 'First lift', icon: 'GiMuscleUp' } },
    { id: '2', achievement_status: 'in_progress', achievements: { description: 'Half marathon', icon: 'GiRunningShoe' } },
  ];

  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: allAchievements, error: null })),
        })),
      })),
    },
  };
});

test('toggles between achieved and in progress achievements', async () => {
  render(<AchvFeed userId={'user-1'} />);
  const user = userEvent.setup();

  // Initially, achieved achievements should be visible
  expect(await screen.findByText('First lift')).toBeInTheDocument();
  expect(screen.queryByText('Half marathon')).not.toBeInTheDocument();

  // Button initially shows 'View In Progress' (since default is 'achieved')
  const toggleBtn = await screen.findByRole('button', { name: /view in progress/i });
  expect(toggleBtn).toBeInTheDocument();

  // Click to toggle
  await user.click(toggleBtn);

  // Now button text should be 'View Achieved'
  expect(await screen.findByRole('button', { name: /view achieved/i })).toBeInTheDocument();

  // After toggling, in-progress achievements should be visible
  await waitFor(() => {
    expect(screen.getByText('Half marathon')).toBeInTheDocument();
  });
  expect(screen.queryByText('First lift')).not.toBeInTheDocument();
});
