import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { BaseDashboardView } from './BaseDashboardView';

/*
  
    Purpose of test: clicking "View Schedule" should scroll the page down to the calendar.
    How we check: in tests we replace the browser scroll function with a mock, click the button,
    and confirm the mock was called.
*/

test('View Schedule button scrolls to calendar', async () => {
  // happy-dom may not define scrollIntoView; provide a mock implementation
  (HTMLElement.prototype as any).scrollIntoView = vi.fn();

  render(<BaseDashboardView subscription={null as any} userId={'user-1'} sendToProfile={() => {}} />);

  const viewSchedule = await screen.findByRole('button', { name: /view schedule/i });
  await userEvent.click(viewSchedule);

  expect((HTMLElement.prototype as any).scrollIntoView).toHaveBeenCalled();
});
