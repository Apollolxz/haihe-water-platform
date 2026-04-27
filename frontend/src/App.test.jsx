import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import App from './App.jsx';

describe('React legacy home shell', () => {
  test('renders the legacy business homepage through React', () => {
    render(<App />);

    expect(screen.getAllByRole('heading', { name: '海河六域' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /数据大屏/ })[0]).toHaveAttribute('href', '/pages/dashboard.html');
    expect(screen.getAllByRole('link', { name: /流域时空推演沙盘/ })[0]).toHaveAttribute(
      'href',
      '/pages/sandbox.html',
    );
    expect(screen.getAllByRole('link', { name: /智能问答/ })[0]).toHaveAttribute('href', '/pages/chat.html');
  });
});
