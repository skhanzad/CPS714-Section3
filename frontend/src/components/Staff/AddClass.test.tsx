// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import AddClassModal from './AddClass';

// --- Mocks ---

// 1. Mock the Supabase client
vi.mock('./supabaseClient', () => ({
  admin_supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn(),
  },
}));

// 2. Mock Lucide React icons
vi.mock('lucide-react', () => ({
  CheckCircleIcon: () => <div data-testid="success-icon">Success</div>,
}));

describe('AddClassModal', () => {
  const mockOnClose = vi.fn();
  const mockRefreshClasses = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Manually mock alert since JSDOM doesn't implement it
    window.alert = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('renders all form fields correctly', () => {
    render(<AddClassModal onClose={mockOnClose} refreshClasses={mockRefreshClasses} />);

    expect(screen.getByText('Schedule New Class')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ex: Boxing and Kickboxing')).toBeInTheDocument();
    expect(screen.getByText('Instructor First Name')).toBeInTheDocument();
    expect(screen.getByText('Start Time (9 AM - 9 PM)')).toBeInTheDocument();
  });

  test('validates "Class" input field (rejects invalid characters)', () => {
    render(<AddClassModal onClose={mockOnClose} refreshClasses={mockRefreshClasses} />);
    
    const classInput = screen.getByPlaceholderText('ex: Boxing and Kickboxing');

    // Try to type a special character
    fireEvent.change(classInput, { target: { value: 'Boxing@' } });

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Input for the 'Class' field is invalid"));
    expect(classInput).toHaveValue('');
  });

  test('validates Instructor Name input (rejects numbers)', () => {
    render(<AddClassModal onClose={mockOnClose} refreshClasses={mockRefreshClasses} />);
    
    const nameInput = screen.getByPlaceholderText('ex: Nico');

    fireEvent.change(nameInput, { target: { value: 'Nico123' } });

    expect(window.alert).toHaveBeenCalledWith("Only enter string characters");
    expect(nameInput).toHaveValue('');
  });
});