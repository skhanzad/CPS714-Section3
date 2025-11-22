import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { BaseDashboardView } from './BaseDashboardView';

test('View Schedule button scrolls to calendar', async () => {
  // happy-dom may not define scrollIntoView; add a mock implementation first
  (HTMLElement.prototype as any).scrollIntoView = vi.fn();

  render(<BaseDashboardView subscription={null as any} userId={'user-1'} sendToProfile={() => {}} />);

  const viewSchedule = await screen.findByRole('button', { name: /view schedule/i });
  await userEvent.click(viewSchedule);

  expect((HTMLElement.prototype as any).scrollIntoView).toHaveBeenCalled();
});
