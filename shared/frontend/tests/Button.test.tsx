import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../src/Button';

describe('<Button />', () => {
  it('renders label and fires onClick', () => {
    const onClick = vi.fn();
    render(<Button label="Test" onClick={onClick} />);
    const btn = screen.getByRole('button', { name: /test/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
}); 