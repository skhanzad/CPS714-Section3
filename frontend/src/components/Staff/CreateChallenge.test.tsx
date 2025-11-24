import { describe, test, expect, beforeEach, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateChallengePage from './CreateChallenge';
import { admin_supabase } from './supabaseClient';

// 1. Mock the Supabase client
vi.mock('./supabaseClient', () => ({
  admin_supabase: {
    from: vi.fn(),
  },
}));

describe('CreateChallengePage Component', () => {
  const mockOnClose = vi.fn();
  const mockRefreshClasses = vi.fn();

  // Helper types for mocking
  const mockFrom = admin_supabase.from as Mock;
  const mockInsert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      insert: mockInsert,
    });
  });

  // Helper function to find inputs associated with labels that lack 'htmlFor'
  const getInputByLabelText = (labelText: string) => {
    // Find the label element by text, then get the input (next sibling)
    const label = screen.getByText(labelText);
    return label.nextElementSibling as HTMLElement;
  };

  test('renders all form fields and buttons correctly', () => {
    render(
      <CreateChallengePage 
        onClose={mockOnClose} 
        refreshClasses={mockRefreshClasses} 
      />
    );

    // Check header
    expect(screen.getByText(/Create a New Challenge/i)).toBeInTheDocument();

    // Check inputs using Placeholders (more robust than siblings)
    expect(screen.getByPlaceholderText(/e.g. Most Yoga Classes Taken/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Describe the challenge goals/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Free Month Membership/i)).toBeInTheDocument();

    // Check Date inputs (no placeholders, so we use the helper)
    expect(getInputByLabelText("Start Date")).toBeInTheDocument();
    expect(getInputByLabelText("End Date")).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: "Create Challenge" })).toBeInTheDocument();
  });

  test('validates required fields prevents submission', async () => {
    render(
      <CreateChallengePage 
        onClose={mockOnClose} 
        refreshClasses={mockRefreshClasses} 
      />
    );

    // Click submit without filling anything
    fireEvent.click(screen.getByRole('button', { name: "Create Challenge" }));

    // Expect validation error
    expect(await screen.findByText("Challenge title is required.")).toBeInTheDocument();
    
    // Ensure Supabase was NOT called
    expect(mockInsert).not.toHaveBeenCalled();
  });

  test('validates that End Date cannot be earlier than Start Date', async () => {
    render(
      <CreateChallengePage 
        onClose={mockOnClose} 
        refreshClasses={mockRefreshClasses} 
      />
    );

    // Fill in text fields using Placeholders
    fireEvent.change(screen.getByPlaceholderText(/e.g. Most Yoga Classes Taken/i), { target: { value: 'Test Challenge' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe the challenge goals/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByPlaceholderText(/e.g. Free Month Membership/i), { target: { value: 'Prize' } });

    // Fill in INVALID dates using Helper
    fireEvent.change(getInputByLabelText("Start Date"), { target: { value: '2025-01-10' } });
    fireEvent.change(getInputByLabelText("End Date"), { target: { value: '2025-01-05' } }); // Earlier than start

    // Submit
    fireEvent.click(screen.getByRole('button', { name: "Create Challenge" }));

    // Check specific date error
    expect(await screen.findByText("End date cannot be earlier than start date.")).toBeInTheDocument();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  test('successfully creates a challenge with valid data', async () => {
    mockInsert.mockResolvedValue({ error: null });

    render(
      <CreateChallengePage 
        onClose={mockOnClose} 
        refreshClasses={mockRefreshClasses} 
      />
    );

    // Fill Form
    fireEvent.change(screen.getByPlaceholderText(/e.g. Most Yoga Classes Taken/i), { target: { value: 'Summer Abs' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe the challenge goals/i), { target: { value: 'Do 100 sit-ups' } });
    fireEvent.change(screen.getByPlaceholderText(/e.g. Free Month Membership/i), { target: { value: 'Free Smoothie' } });
    
    // Dates
    fireEvent.change(getInputByLabelText("Start Date"), { target: { value: '2025-06-01' } });
    fireEvent.change(getInputByLabelText("End Date"), { target: { value: '2025-06-30' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: "Create Challenge" }));

    // Wait for Supabase call
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });

    // Verify correct data was sent
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        title: 'Summer Abs',
        description: 'Do 100 sit-ups',
        start_date: '2025-06-01',
        end_date: '2025-06-30',
        reward: 'Free Smoothie',
      }),
    ]);

    expect(screen.getByText("Challenge created successfully!")).toBeInTheDocument();
    expect(mockRefreshClasses).toHaveBeenCalled();
  });

  test('handles Supabase errors gracefully', async () => {
    // Mock error response
    mockInsert.mockResolvedValue({ error: { message: "Database connection failed" } });

    render(
      <CreateChallengePage 
        onClose={mockOnClose} 
        refreshClasses={mockRefreshClasses} 
      />
    );

    // Fill Form (minimal valid data)
    fireEvent.change(screen.getByPlaceholderText(/e.g. Most Yoga Classes Taken/i), { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe the challenge goals/i), { target: { value: 'B' } });
    fireEvent.change(screen.getByPlaceholderText(/e.g. Free Month Membership/i), { target: { value: 'C' } });
    fireEvent.change(getInputByLabelText("Start Date"), { target: { value: '2025-01-01' } });
    fireEvent.change(getInputByLabelText("End Date"), { target: { value: '2025-01-02' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: "Create Challenge" }));

    // Check for error message
    expect(await screen.findByText("Database connection failed")).toBeInTheDocument();
    
    expect(screen.queryByText("Challenge created successfully!")).not.toBeInTheDocument();
  });

  test('calls onClose when "Back to Staff Dashboard" is clicked', () => {
    render(
      <CreateChallengePage 
        onClose={mockOnClose} 
        refreshClasses={mockRefreshClasses} 
      />
    );

    fireEvent.click(screen.getByText(/Back to Staff Dashboard/i));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});