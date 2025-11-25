// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ViewAdmins from './Admins';

// --- Mocks ---

// Mock Lucide React icons to prevent rendering issues
vi.mock('lucide-react', () => ({
  SparkleIcon: () => <div data-testid="sparkle-icon">Icon</div>,
}));

describe('ViewAdmins Component', () => {
  
  test('renders the header and admin names correctly', () => {
    const mockOnClose = vi.fn();
    render(<ViewAdmins onClose={mockOnClose} />);

    // 1. Check for the main Title
    expect(screen.getByText('FitHub Administrators')).toBeInTheDocument();

    // 2. Check that specific admin names from your static list are visible
    expect(screen.getByText('Reyhan Emik')).toBeInTheDocument();
    expect(screen.getByText('Rana Hamood')).toBeInTheDocument();
    expect(screen.getByText('Jasmine Jawanda')).toBeInTheDocument();
    
    // 3. Check that the icons are rendered (There should be 5 admins in your list)
    const icons = screen.getAllByTestId('sparkle-icon');
    expect(icons).toHaveLength(5);
  });

  test('calls onClose when the Close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<ViewAdmins onClose={mockOnClose} />);

    // Find the button by its text
    const closeButton = screen.getByText('Close');
    
    // Simulate a click
    fireEvent.click(closeButton);

    // Verify the prop function was executed
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});