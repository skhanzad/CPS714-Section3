import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StaffDashboard } from './StaffDashboard';

// 1. Mock the Child Components
// This isolates the Dashboard logic and prevents errors from deep within children
vi.mock('./MemberManagement', () => ({
  default: () => <div data-testid="mock-member-mgmt">Member Management Component</div>
}));

vi.mock('./ClassManagement', () => ({
  default: ({ refreshFlag }: { refreshFlag: boolean }) => (
    <div data-testid="mock-class-mgmt">
      Class Management Component (Refresh: {refreshFlag.toString()})
    </div>
  )
}));

vi.mock('./ReportsAnalytics', () => ({
  default: () => <div data-testid="mock-reports">Reports Component</div>
}));

vi.mock('./Admins', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="mock-admins-modal">
      <h1>Admins Modal</h1>
      <button onClick={onClose}>Close Admins</button>
    </div>
  )
}));

vi.mock('./AddClass', () => ({
  default: ({ onClose, refreshClasses }: { onClose: () => void, refreshClasses: () => void }) => (
    <div data-testid="mock-add-class-modal">
      <h1>Add Class Modal</h1>
      <button onClick={refreshClasses}>Trigger Refresh</button>
      <button onClick={onClose}>Close Add Class</button>
    </div>
  )
}));

vi.mock('./CreateChallenge', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="mock-challenge-modal">
      <h1>Create Challenge Modal</h1>
      <button onClick={onClose}>Close Challenge</button>
    </div>
  )
}));

// 2. Mock Lucide/React Icons to prevent rendering issues
vi.mock('lucide-react', () => ({
  Plus: () => <span>+</span>,
  Bell: () => <span>Bell</span>,
  UserIcon: () => <span>User</span>,
  PencilIcon: () => <span>Edit</span>,
}));

vi.mock('react-icons/fa', () => ({
  FaDumbbell: () => <span>Dumbbell</span>,
}));

describe('StaffDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the main dashboard layout correctly', () => {
    render(<StaffDashboard />);

    // Check Header
    expect(screen.getByText('Staff Dashboard')).toBeInTheDocument();

    // Check Buttons exist
    expect(screen.getByText('View Admins')).toBeInTheDocument();
    expect(screen.getByText('Add Class')).toBeInTheDocument();
    expect(screen.getByText('Announce')).toBeInTheDocument();
    expect(screen.getByText('Create Challenge')).toBeInTheDocument();

    // Check Static Child Components are rendered
    expect(screen.getByTestId('mock-member-mgmt')).toBeInTheDocument();
    expect(screen.getByTestId('mock-class-mgmt')).toBeInTheDocument();
    expect(screen.getByTestId('mock-reports')).toBeInTheDocument();

    // Check Modals are HIDDEN by default
    expect(screen.queryByTestId('mock-admins-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-add-class-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-challenge-modal')).not.toBeInTheDocument();
  });

  test('opens and closes the "View Admins" modal', () => {
    render(<StaffDashboard />);

    // 1. Click button
    fireEvent.click(screen.getByText('View Admins'));

    // 2. Verify Modal appears
    expect(screen.getByTestId('mock-admins-modal')).toBeInTheDocument();

    // 3. Click Close button inside mock
    fireEvent.click(screen.getByText('Close Admins'));

    // 4. Verify Modal disappears
    expect(screen.queryByTestId('mock-admins-modal')).not.toBeInTheDocument();
  });

  test('opens and closes the "Add Class" modal', () => {
    render(<StaffDashboard />);

    fireEvent.click(screen.getByText('Add Class'));

    expect(screen.getByTestId('mock-add-class-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Add Class'));

    expect(screen.queryByTestId('mock-add-class-modal')).not.toBeInTheDocument();
  });

  test('opens and closes the "Create Challenge" modal', () => {
    render(<StaffDashboard />);

    fireEvent.click(screen.getByText('Create Challenge'));

    expect(screen.getByTestId('mock-challenge-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Challenge'));

    expect(screen.queryByTestId('mock-challenge-modal')).not.toBeInTheDocument();
  });

  test('passes refreshFlag to ClassManagement when triggered', async () => {
    render(<StaffDashboard />);

    // Initial state: verify flag is false (mock renders the string value)
    expect(screen.getByText(/Refresh: false/)).toBeInTheDocument();

    // Open Add Class Modal
    fireEvent.click(screen.getByText('Add Class'));

    // Click the "Trigger Refresh" button inside our mock AddClassModal
    // This calls the `refreshClasses` prop passed from Dashboard
    fireEvent.click(screen.getByText('Trigger Refresh'));

    // Verify flag changed to true
    await waitFor(() => {
      expect(screen.getByText(/Refresh: true/)).toBeInTheDocument();
    });
  });

  test('announce button is clickable but renders no modal (as per current code)', () => {
    render(<StaffDashboard />);
    
    // The code sets state but doesn't conditionally render a component for Announce
    // We just verify it doesn't crash
    const btn = screen.getByText('Announce');
    fireEvent.click(btn);
    
    // Verify we are still on the dashboard
    expect(screen.getByText('Staff Dashboard')).toBeInTheDocument();
  });
});