// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import ClassDetailsModal from './ClassDetails';
import { admin_supabase } from './supabaseClient';

// --- Mocks ---

// 1. Mock Supabase
vi.mock('./supabaseClient', () => ({
  admin_supabase: {
    from: vi.fn(),
  },
}));

// 2. Mock Lucide Icons
vi.mock('lucide-react', () => ({
  PencilIcon: ({ onClick }: { onClick: () => void }) => (
    <div data-testid="edit-icon" onClick={onClick}>Edit</div>
  ),
  CheckCircleIcon: () => <div data-testid="success-icon">Success</div>,
}));

describe('ClassDetailsModal', () => {
  const mockOnClose = vi.fn();
  const mockRefreshClasses = vi.fn();
  
  let mockClass: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock data
    mockClass = {
      id: '123',
      class_name: 'Yoga Morning',
      class_type: 'BASIC',
      instructor_fname: 'John',
      instructor_lname: 'Doe',
      day: '2025-01-01',
      time: '09:00:00',
      capacity: 20,
      duration: 60,
      total_bookings: 5,
    };

    // Default Window Mocks
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true); 
    
    // Use Real Timers to avoid async locking issues
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders nothing if no class is provided', () => {
    const { container } = render(
      <ClassDetailsModal cls={null} onClose={mockOnClose} refreshClasses={mockRefreshClasses} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('renders class details correctly', () => {
    render(
      <ClassDetailsModal cls={mockClass} onClose={mockOnClose} refreshClasses={mockRefreshClasses} />
    );

    expect(screen.getByText('Yoga Morning')).toBeInTheDocument();
    expect(screen.getByText(/John/)).toBeInTheDocument();
    expect(screen.getByText(/BASIC/)).toBeInTheDocument();
    expect(screen.getByText(/Total Bookings: 5/)).toBeInTheDocument();
  });

  test('opens editor when pencil icon is clicked', () => {
    render(
      <ClassDetailsModal cls={mockClass} onClose={mockOnClose} refreshClasses={mockRefreshClasses} />
    );

    const editButtons = screen.getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit class type')).toBeInTheDocument();
    expect(screen.getByDisplayValue('BASIC')).toBeInTheDocument();
  });

  test('saves changes successfully', async () => {
    // 1. Setup specific mock for Update Chain: from() -> update() -> eq()
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    (admin_supabase.from as unknown as Mock).mockReturnValue({ update: mockUpdate });

    render(
      <ClassDetailsModal cls={mockClass} onClose={mockOnClose} refreshClasses={mockRefreshClasses} />
    );

    // Open Editor
    const editButtons = screen.getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]);

    // Change value
    const input = screen.getByDisplayValue('BASIC');
    fireEvent.change(input, { target: { value: 'PREMIUM' } });

    // Click Save
    fireEvent.click(screen.getByText('Save'));

    // Wait for DB call
    await waitFor(() => {
      expect(mockEq).toHaveBeenCalled();
    });

    // Verify Success UI
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    
    // Wait for the data refresh
    // Note: We DO NOT expect onClose to be called here, because editing usually 
    // keeps the main modal open.
    await waitFor(() => {
      expect(mockRefreshClasses).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test('prevents saving empty values', () => {
    // Setup default mock to prevent crash if it tries to call DB
    (admin_supabase.from as unknown as Mock).mockReturnValue({ update: vi.fn().mockReturnThis() });

    render(
      <ClassDetailsModal cls={mockClass} onClose={mockOnClose} refreshClasses={mockRefreshClasses} />
    );

    const editButtons = screen.getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]);

    const input = screen.getByDisplayValue('BASIC');
    fireEvent.change(input, { target: { value: '' } });

    fireEvent.click(screen.getByText('Save'));

    expect(window.alert).toHaveBeenCalledWith("Value cannot be empty.");
    expect(admin_supabase.from).not.toHaveBeenCalled();
  });

  test('deletes class successfully after confirmation', async () => {
    // 1. Setup specific mock for Delete Chain: from() -> delete() -> eq() -> select()
    const mockSelect = vi.fn().mockResolvedValue({ error: null, count: 1 });
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    (admin_supabase.from as unknown as Mock).mockReturnValue({ delete: mockDelete });

    render(
      <ClassDetailsModal cls={mockClass} onClose={mockOnClose} refreshClasses={mockRefreshClasses} />
    );

    fireEvent.click(screen.getByText('Delete Class'));

    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this class?");

    await waitFor(() => {
      expect(mockSelect).toHaveBeenCalled();
    });

    expect(window.alert).toHaveBeenCalledWith("Class was succesfully deleted");
    
    await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockRefreshClasses).toHaveBeenCalled();
    });
  });

  test('does not delete if user cancels confirmation', async () => {
    (window.confirm as unknown as Mock).mockReturnValue(false);

    render(
      <ClassDetailsModal cls={mockClass} onClose={mockOnClose} refreshClasses={mockRefreshClasses} />
    );

    fireEvent.click(screen.getByText('Delete Class'));

    expect(admin_supabase.from).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});