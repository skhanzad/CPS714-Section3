import { describe, test, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MemberDetailsModal from './MemberDetailsModal';
import { admin_supabase } from './supabaseClient';

// 1. Mock Supabase
vi.mock('./supabaseClient', () => ({
  admin_supabase: {
    from: vi.fn(),
  },
}));

// 2. Mock Lucide Icons
vi.mock('lucide-react', () => ({
  PencilIcon: (props: any) => <button data-testid="edit-icon" {...props}>Edit</button>,
  CheckCircleIcon: () => <div data-testid="success-icon">Success</div>,
}));

describe('MemberDetailsModal Component', () => {
  const mockOnClose = vi.fn();
  const mockRefreshMembers = vi.fn();

  // Helper variables for Supabase mocks
  const mockFrom = admin_supabase.from as Mock;
  const mockUpdate = vi.fn();
  const mockEq = vi.fn();

  // Mock Data
  const mockMember = {
    id: 'user_123',
    full_name: 'John Doe',
    address: '123 Main St',
    contact_number: '555-0123',
    emergency_contact: 'Jane Doe (Wife)',
    memberships: [
      { tier: 'Gold' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase chain
    mockFrom.mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
  });

  afterEach(() => {
    // Cleanup window mocks
    vi.restoreAllMocks();
  });

  test('renders member details correctly', () => {
    render(
      <MemberDetailsModal 
        cls={mockMember} 
        onClose={mockOnClose} 
        refreshMembers={mockRefreshMembers} 
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Membership Tier: Gold')).toBeInTheDocument();
    expect(screen.getByText('Address: 123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Contact Number: 555-0123')).toBeInTheDocument();
  });

  test('opens edit mode when pencil icon is clicked', () => {
    render(
      <MemberDetailsModal 
        cls={mockMember} 
        onClose={mockOnClose} 
        refreshMembers={mockRefreshMembers} 
      />
    );

    // Click the mocked pencil icon
    fireEvent.click(screen.getByTestId('edit-icon'));

    // FIX: Use Regex to match text regardless of case or internal whitespace/newlines
    expect(screen.getByText(/edit tier/i)).toBeInTheDocument();
    
    const input = screen.getByDisplayValue('Gold');
    expect(input).toBeInTheDocument();
  });

  test('updates member tier successfully', async () => {
    mockEq.mockResolvedValue({ error: null });

    render(
      <MemberDetailsModal 
        cls={mockMember} 
        onClose={mockOnClose} 
        refreshMembers={mockRefreshMembers} 
      />
    );

    // 1. Open Editor
    fireEvent.click(screen.getByTestId('edit-icon'));

    // 2. Change Value
    const input = screen.getByDisplayValue('Gold');
    fireEvent.change(input, { target: { value: 'Platinum' } });

    // 3. Save
    fireEvent.click(screen.getByText('Save'));

    // 4. Verify Supabase Call
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('memberships');
      expect(mockUpdate).toHaveBeenCalledWith({ tier: 'Platinum' });
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user_123');
    });

    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    expect(mockRefreshMembers).toHaveBeenCalled();
  });

  test('prevents saving empty values', async () => {
    // FIX: Manually define window.alert instead of spying on undefined
    window.alert = vi.fn();

    render(
      <MemberDetailsModal 
        cls={mockMember} 
        onClose={mockOnClose} 
        refreshMembers={mockRefreshMembers} 
      />
    );

    fireEvent.click(screen.getByTestId('edit-icon'));

    const input = screen.getByDisplayValue('Gold');
    fireEvent.change(input, { target: { value: '   ' } }); // Empty string

    fireEvent.click(screen.getByText('Save'));

    expect(window.alert).toHaveBeenCalledWith('Please enter a non-empty value.');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  test('skips database call if value is unchanged', async () => {
    render(
      <MemberDetailsModal 
        cls={mockMember} 
        onClose={mockOnClose} 
        refreshMembers={mockRefreshMembers} 
      />
    );

    fireEvent.click(screen.getByTestId('edit-icon'));

    // Save without changing value
    fireEvent.click(screen.getByText('Save'));

    expect(mockUpdate).not.toHaveBeenCalled();
    // Use regex here as well for consistency
    expect(screen.queryByText(/edit tier/i)).not.toBeInTheDocument();
  });

  test('handles Supabase errors', async () => {
    // FIX: Mock alert and console.error
    window.alert = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockEq.mockResolvedValue({ error: { message: 'DB Error' } });

    render(
      <MemberDetailsModal 
        cls={mockMember} 
        onClose={mockOnClose} 
        refreshMembers={mockRefreshMembers} 
      />
    );

    fireEvent.click(screen.getByTestId('edit-icon'));
    
    const input = screen.getByDisplayValue('Gold');
    fireEvent.change(input, { target: { value: 'Silver' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('failed to update please try again');
    });

    consoleSpy.mockRestore();
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <MemberDetailsModal 
        cls={mockMember} 
        onClose={mockOnClose} 
        refreshMembers={mockRefreshMembers} 
      />
    );

    fireEvent.click(screen.getByText('Close Window'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    
    fireEvent.click(screen.getByText('x'));
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});