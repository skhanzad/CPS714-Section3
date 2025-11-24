import { describe, test, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MemberManagement from './MemberManagement';
import { admin_supabase } from './supabaseClient';

// 1. Mock Supabase
vi.mock('./supabaseClient', () => ({
  admin_supabase: {
    from: vi.fn(),
  },
}));

// 2. Mock the Child Modal Component
vi.mock('./MemberDetailsModal', () => ({
  default: ({ cls, onClose }: { cls: any; onClose: () => void }) => (
    <div data-testid="mock-member-modal">
      <h1>Details for {cls.full_name}</h1>
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}));

describe('MemberManagement Component', () => {
  // Helpers for mocking Supabase chains
  const mockFrom = admin_supabase.from as Mock;
  const mockOrder = vi.fn();
  const mockSelectMemberships = vi.fn();

  // Mock Data
  const mockProfiles = [
    { id: 'user_1', full_name: 'Alice Smith', created_at: '2023-01-01T10:00:00' },
    { id: 'user_2', full_name: 'Bob Jones', created_at: '2023-02-15T12:00:00' },
  ];

  const mockMemberships = [
    { user_id: 'user_1', tier: 'Gold' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // --- FIX 1: Mock window.alert globally ---
    // This prevents "alert is not a function" errors if a fetch fails
    window.alert = vi.fn();

    // Setup complex mock for .from() to handle different tables
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            order: mockOrder,
          }),
        };
      }
      if (table === 'memberships') {
        return {
          select: mockSelectMemberships,
        };
      }
      return { select: vi.fn() };
    });

    // --- FIX 2: Set default return values ---
    // This prevents "Cannot destructure property 'data' of undefined" 
    // when the component mounts and tries to fetch immediately.
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockSelectMemberships.mockResolvedValue({ data: [], error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders the main toggle button closed by default', () => {
    render(<MemberManagement />);

    expect(screen.getByText('Member Management')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.queryByText(/Alice Smith/)).not.toBeInTheDocument();
  });

  test('fetches and merges data correctly when opened', async () => {
    // Override defaults with specific test data
    mockOrder.mockResolvedValue({ data: mockProfiles, error: null });
    mockSelectMemberships.mockResolvedValue({ data: mockMemberships, error: null });

    render(<MemberManagement />);

    // Open Accordion
    const toggleBtn = screen.getByText('Member Management');
    fireEvent.click(toggleBtn);

    // Verify Loading/Fetch calls
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockFrom).toHaveBeenCalledWith('memberships');
    });

    // Verify Data Display
    expect(screen.getByText(/Name: Alice Smith/)).toBeInTheDocument();
    expect(screen.getByText(/Tier: Gold/)).toBeInTheDocument();
    
    expect(screen.getByText(/Name: Bob Jones/)).toBeInTheDocument();
    expect(screen.getByText(/Tier: No subscription/)).toBeInTheDocument();
  });

  test('handles profile fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Fail the profiles fetch
    mockOrder.mockResolvedValue({ data: null, error: { message: 'Profile Error' } });

    render(<MemberManagement />);

    // We don't need to click to trigger the fetch (it happens on mount), 
    // but the error alert is async, so we wait for it.
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to load members. Please try again.');
    });

    consoleSpy.mockRestore();
  });

  test('handles membership fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Profiles succeed, Memberships fail
    mockOrder.mockResolvedValue({ data: mockProfiles, error: null });
    mockSelectMemberships.mockResolvedValue({ data: null, error: { message: 'Membership Error' } });

    render(<MemberManagement />);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to load members. Please try again.');
    });

    consoleSpy.mockRestore();
  });

  test('opens MemberDetailsModal when a member is clicked', async () => {
    mockOrder.mockResolvedValue({ data: mockProfiles, error: null });
    mockSelectMemberships.mockResolvedValue({ data: mockMemberships, error: null });

    render(<MemberManagement />);

    fireEvent.click(screen.getByText('Member Management'));

    const aliceButton = await screen.findByText(/Alice Smith/);
    const memberButton = aliceButton.closest('button');
    fireEvent.click(memberButton!);

    expect(screen.getByTestId('mock-member-modal')).toBeInTheDocument();
    expect(screen.getByText('Details for Alice Smith')).toBeInTheDocument();
  });

  test('closes modal when close callback is triggered', async () => {
    mockOrder.mockResolvedValue({ data: mockProfiles, error: null });
    mockSelectMemberships.mockResolvedValue({ data: mockMemberships, error: null });

    render(<MemberManagement />);
    fireEvent.click(screen.getByText('Member Management'));

    const aliceButton = await screen.findByText(/Alice Smith/);
    fireEvent.click(aliceButton.closest('button')!);

    fireEvent.click(screen.getByText('Close Modal'));

    expect(screen.queryByTestId('mock-member-modal')).not.toBeInTheDocument();
  });
});