import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import NotificationSend from './sendNotifications';
import { supabaseN } from '../../lib/supabaseNot';

// 1. Setup the "Fake" Functions (Mocks)
const mockInsert = vi.fn();
const mockNot = vi.fn();

// This "fake" select function returns an object with a 'not' function inside it
const mockSelect = vi.fn(() => ({
  not: mockNot
}));

// 2. Mock the Supabase Library
vi.mock('../../lib/supabaseNot', () => ({
  supabaseN: {
    from: () => ({
      insert: mockInsert, // When .insert() is called, run our fake function
      select: mockSelect, // When .select() is called, run our fake function
    }),
  },
}));

// Mock the browser's fetch and alert
global.fetch = vi.fn();
window.alert = vi.fn();

describe('NotificationSend Simple Tests', () => {
  // Run this before every single test to clean up previous data
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the correct inputs on the screen', () => {
    render(<NotificationSend onClose={() => {}} />);

    expect(screen.getByText('Send Notification')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('lets the user type into the boxes', () => {
    const { container } = render(<NotificationSend onClose={() => {}} />);

    // Find the inputs using simple HTML tags
    const titleBox = container.querySelector('input');
    const bodyBox = container.querySelector('textarea');

    // Type into them
    if (titleBox) fireEvent.change(titleBox, { target: { value: 'Hello World' } });
    if (bodyBox) fireEvent.change(bodyBox, { target: { value: 'This is a test message' } });

    // Check results
    expect(titleBox).toHaveValue('Hello World');
    expect(bodyBox).toHaveValue('This is a test message');
  });

  it('closes the modal when clicking Cancel', () => {
    const closeFunc = vi.fn();
    render(<NotificationSend onClose={closeFunc} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(closeFunc).toHaveBeenCalled();
  });

  it('sends data to supabase when clicking Send', async () => {
    // 1. Setup: pretend the database works perfectly
    mockInsert.mockResolvedValue({ error: null }); 
    mockNot.mockResolvedValue({ data: [], error: null }); 
    (global.fetch as any).mockResolvedValue({ ok: true });

    const { container } = render(<NotificationSend onClose={() => {}} />);

    // 2. Type in the form
    const titleBox = container.querySelector('input') as HTMLInputElement;
    const bodyBox = container.querySelector('textarea') as HTMLTextAreaElement;

    fireEvent.change(titleBox, { target: { value: 'Party Time' } });
    fireEvent.change(bodyBox, { target: { value: 'Bring snacks' } });

    // 3. Force the form to submit
    // (We find the <form> tag and tell it to submit directly)
    const form = container.querySelector('form');
    if (form) fireEvent.submit(form);

    // 4. Wait for the code to finish running
    await waitFor(() => {
      // Check if supabase insert was called
      expect(mockInsert).toHaveBeenCalled();
      
      // Check if the success alert popped up
      expect(window.alert).toHaveBeenCalledWith('Notification sent');
    });
  });

  it('shows an alert if the database fails', async () => {
    // Setup: pretend the database is broken
    mockInsert.mockResolvedValue({ error: { message: 'Broken Database!' } });

    const { container } = render(<NotificationSend onClose={() => {}} />);

    // Type something (required for form validation)
    const titleBox = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(titleBox, { target: { value: 'Test' } });

    // Force submit
    const form = container.querySelector('form');
    if (form) fireEvent.submit(form);

    // Wait for the alert
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Broken Database!');
    });
  });
});