import { describe, test, expect, beforeEach, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClassManagement from './ClassManagement';
import { admin_supabase } from './supabaseClient';

// 1. Mock the Supabase client using 'vi'
vi.mock('./supabaseClient', () => ({
  admin_supabase: {
    from: vi.fn(),
  },
}));

// 2. Mock the Child Modal Component
vi.mock('./ClassDetails', () => {
  return {
    default: ({ onClose }: { onClose: () => void }) => (
      <div data-testid="mock-class-modal">
        <h1>Class Details Modal</h1>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ),
  };
});

describe('ClassManagement Component', () => {
  // Setup mock data for Supabase responses
  const mockClasses = [
    {
      id: 1,
      class_name: 'Yoga Basics',
      class_type: 'Wellness',
      instructor_fname: 'Jane',
      instructor_lname: 'Doe',
      day: 'Monday',
      time: '10:00:00',
      duration: 60,
      capacity: 20,
      total_bookings: 5,
    },
    {
      id: 2,
      class_name: 'HIIT',
      class_type: 'Cardio',
      instructor_fname: 'John',
      instructor_lname: null,
      day: 'Tuesday',
      time: '18:30:00',
      duration: 45,
      capacity: 15,
      total_bookings: 15,
    },
  ];

  // Cast the mocked function to a Vitest Mock type
  const mockFrom = admin_supabase.from as Mock;
  const mockSelect = vi.fn();
  const mockOrder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup the Supabase chain: .from().select().order()
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      order: mockOrder,
    });
  });

  test('renders the main toggle button correctly', () => {
    // Mock empty return
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(<ClassManagement refreshFlag={false} />);

    expect(screen.getByText(/Class Management/i)).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  test('fetches data and displays classes when accordion is opened', async () => {
    mockOrder.mockResolvedValue({ data: mockClasses, error: null });

    render(<ClassManagement refreshFlag={false} />);

    const toggleButton = screen.getByText(/Class Management/i);
    fireEvent.click(toggleButton);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Yoga Basics:')).toBeInTheDocument();
    });

    expect(screen.getByText('Instructor: Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Instructor: John')).toBeInTheDocument();
    expect(screen.getByText('Time: 10:00')).toBeInTheDocument();
  });

  test('handles Supabase errors gracefully', async () => {
    // Use vi.spyOn
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockOrder.mockResolvedValue({ data: null, error: { message: 'Network error' } });

    render(<ClassManagement refreshFlag={false} />);

    await waitFor(() => {
        expect(admin_supabase.from).toHaveBeenCalledWith('class');
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      "Issues fetching classes: ", 
      expect.objectContaining({ message: 'Network error' })
    );

    consoleSpy.mockRestore();
  });

  test('opens the ClassDetailsModal when a class item is clicked', async () => {
    mockOrder.mockResolvedValue({ data: mockClasses, error: null });

    render(<ClassManagement refreshFlag={false} />);

    fireEvent.click(screen.getByText(/Class Management/i));

    const classItem = await screen.findByText('Yoga Basics:');
    const classButton = classItem.closest('button');
    fireEvent.click(classButton!);

    expect(screen.getByTestId('mock-class-modal')).toBeInTheDocument();
  });

  test('refetches data when refreshFlag changes', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const { rerender } = render(<ClassManagement refreshFlag={false} />);

    expect(admin_supabase.from).toHaveBeenCalledTimes(1);

    rerender(<ClassManagement refreshFlag={true} />);

    expect(admin_supabase.from).toHaveBeenCalledTimes(2);
  });
});