import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Notifications from './notifications';
import { supabaseN } from '../../lib/supabaseNot';

// 1. Mock the Supabase Library: Tell the test to use our fake Supabase client
vi.mock('../../lib/supabaseNot', () => ({
  supabaseN: {
    from: vi.fn(), // We will mock this specific function
  },
}));

describe('Notifications Component Simple Tests', () => {
  // 2. Setup all the functions we need to spy on
  const mockSelect = vi.fn();
  const mockOr = vi.fn();
  const mockOrder = vi.fn();
  const mockLimit = vi.fn(); // This is the final function that returns the result

  beforeEach(() => {
    vi.clearAllMocks();

    // 3. Build the Supabase chain, telling each mock function what to return next:
    // .select() returns the object containing .or()
    mockSelect.mockReturnValue({ or: mockOr });
    
    // .or() returns the object containing .order()
    mockOr.mockReturnValue({ order: mockOrder });
    
    // .order() returns the object containing .limit()
    mockOrder.mockReturnValue({ limit: mockLimit });

    // .from() returns the object containing .select()
    (supabaseN.from as any).mockReturnValue({
      select: mockSelect,
    });
  });

  it('renders loading state initially', () => {
    // Mock a promise that never resolves immediately so loading state stays on
    mockLimit.mockReturnValue(new Promise(() => {}));

    render(<Notifications />);
    expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
  });

  it('renders notifications successfully', async () => {
    // Create the fake data we expect to see on the screen
    const mockData = [
      {
        id: 1,
        title: 'Maintenance Update',
        body: 'Servers will be down.',
        created_at: '2023-10-01T10:00:00Z',
        author: 'Admin',
      },
      {
        id: 2,
        title: 'Welcome',
        body: 'Thanks for joining.',
        created_at: '2023-10-02T12:00:00Z',
        author: 'Staff',
      },
    ];

    // Tell the last function in the chain to return the success data
    mockLimit.mockResolvedValue({ data: mockData, error: null });

    render(<Notifications />);

    // Wait until the first notification title appears
    await waitFor(() => {
      expect(screen.getByText('Maintenance Update')).toBeInTheDocument();
    });

    // Check that all parts of the data are on the screen
    expect(screen.getByText('Servers will be down.')).toBeInTheDocument();
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Posted by Admin')).toBeInTheDocument();
  });

  it('renders "No notifications" when list is empty', async () => {
    // Mock an empty list return
    mockLimit.mockResolvedValue({ data: [], error: null });

    render(<Notifications />);

    // Wait for the "No notifications" message to appear
    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully by showing empty list', async () => {
    // Spy on console.error so we can make sure the error was logged
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock the database to return an error
    mockLimit.mockResolvedValue({ data: null, error: { message: 'Network Error' } });

    render(<Notifications />);

    // Wait for the fallback message
    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });

    // Verify the error was logged and clean up the spy
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load notifications', expect.anything());
    consoleSpy.mockRestore();
  });
});