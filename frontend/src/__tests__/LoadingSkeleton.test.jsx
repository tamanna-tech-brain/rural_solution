import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CardSkeleton, PageSkeleton } from '../components/LoadingSkeleton';

describe('LoadingSkeleton components', () => {
  it('renders CardSkeleton without crashing', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toHaveClass('card');
  });

  it('renders PageSkeleton without crashing', () => {
    const { container } = render(<PageSkeleton />);
    expect(container.firstChild).toHaveClass('animate-fade-in');
  });
});
