import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import SpiritualPath from './SpiritualPath';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SpiritualPath', () => {
  it('shows loading and then renders timeline and CTA', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { id: 'user1', name: 'Test' } });

    render(<SpiritualPath level={2} completed={1} total={4} />);

    // loading bars should appear
    expect(screen.getByText(/charg/i) || screen.getByText(/loading/i));

    // wait for axios to resolve and CTA to appear
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    // timeline circles: completed = 1, level = 2 -> first circle filled, second active
    const circles = screen.getAllByTestId('sp-circle');
    expect(circles.length).toBe(4);
  });
});
