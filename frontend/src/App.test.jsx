import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import { describe, expect, test } from 'vitest';
import App from './App.jsx';

describe('React shell', () => {
  test('renders the platform name and core navigation', () => {
    render(<App />);

    const navigation = screen.getByRole('navigation', { name: '主导航' });

    expect(screen.getByRole('heading', { name: '海河六域' })).toBeInTheDocument();
    expect(within(navigation).getByRole('link', { name: /数据大屏/ })).toHaveAttribute(
      'href',
      '/pages/dashboard.html',
    );
    expect(within(navigation).getByRole('link', { name: /流域时空推演沙盘/ })).toHaveAttribute(
      'href',
      '/pages/sandbox.html',
    );
    expect(within(navigation).getByRole('link', { name: /智能问答/ })).toHaveAttribute(
      'href',
      '/pages/chat.html',
    );
  });
});
