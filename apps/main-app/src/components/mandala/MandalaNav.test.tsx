import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MandalaNav from './MandalaNav';

test('renders mandala and calls onSelect when item clicked', () => {
  const handle = jest.fn();
  render(<MandalaNav onSelect={handle} />);
  const buttons = screen.getAllByRole('button');
  // at least center + 6 radial
  expect(buttons.length).toBeGreaterThanOrEqual(7);
  // click second radial (skip center at index 0)
  fireEvent.click(buttons[1]);
  expect(handle).toHaveBeenCalledTimes(1);
});
