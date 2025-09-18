import React from 'react';
import { render, screen } from '@testing-library/react';
import Sanctuaire from './Sanctuaire';

test('renders sanctuaire and mandala', () => {
  render(<Sanctuaire />);
  expect(screen.getByText(/Mandala du Sanctuaire/i)).toBeInTheDocument();
});
