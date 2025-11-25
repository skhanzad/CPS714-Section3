import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AchvFeed } from './DashboardViewComponents/AchvFeed';

/*
    Purpose of test: ensure the achievements feed can show either "Achieved" or "In Progress" items.
    What we do: feed two fake achievements into the component, click the toggle button,
    and confirm the visible list updates accordingly.
*/

// Simple supabase mock returning a small list of achievements
vi.mock('../../lib/supabase', () => {
  const allAchievements = [
    { id: '1', achievement_status: 'achieved', achievements: { description: 'First lift', icon: 'GiMuscleUp' } },
    { id: '2', achievement_status: 'in_progress', achievements: { description: 'Half marathon', icon: 'GiRunningShoe' } },
  ];

  return {
    supabase: {
      from: () => ({
        select: () => ({
          eq: async () => ({ data: allAchievements, error: null }),
        }),
      }),
    },
  };
});

test('toggles between achieved and in progress achievements', async () => {
  render(<AchvFeed userId={'user-1'} />);
  const user = userEvent.setup();

  // Initially show the achieved item and not the in-progress one
  expect(await screen.findByText('First lift')).toBeInTheDocument();
  expect(screen.queryByText('Half marathon')).not.toBeInTheDocument();

  // Click the toggle and confirm the view switches
  const toggleBtn = await screen.findByRole('button', { name: /view in progress/i });
  await user.click(toggleBtn);

  expect(await screen.findByRole('button', { name: /view achieved/i })).toBeInTheDocument();

  // Wait for the in-progress item to appear and the achieved one to disappear
  await waitFor(() => expect(screen.getByText('Half marathon')).toBeInTheDocument());
  expect(screen.queryByText('First lift')).not.toBeInTheDocument();
});
