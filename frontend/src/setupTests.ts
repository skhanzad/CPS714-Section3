import '@testing-library/jest-dom';

// Minimal FileReader mock for tests that exercise image uploads
class MockFileReader {
  onloadend: ((e?: any) => void) | null = null;
  readAsDataURL() {
    if (this.onloadend) this.onloadend({ target: { result: 'data:image/png;base64,TEST' } });
  }
}

(global as any).FileReader = MockFileReader as any;
