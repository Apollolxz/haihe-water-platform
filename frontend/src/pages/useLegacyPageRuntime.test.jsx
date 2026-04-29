import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useLegacyPageRuntime } from './useLegacyPageRuntime.js';

function RuntimeHarness({ page, initInteractions }) {
  useLegacyPageRuntime(page, initInteractions);
  return <div>runtime</div>;
}

describe('useLegacyPageRuntime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('does not reinitialize when only the init callback identity changes', async () => {
    const page = { title: 'chat.html', scripts: [] };
    const firstInit = vi.fn();
    const secondInit = vi.fn();
    const { rerender } = render(<RuntimeHarness page={page} initInteractions={firstInit} />);

    await waitFor(() => expect(firstInit).toHaveBeenCalledTimes(1));

    rerender(<RuntimeHarness page={page} initInteractions={secondInit} />);

    expect(secondInit).not.toHaveBeenCalled();
  });

  test('cleans up old page interactions when the page entry changes', async () => {
    const firstCleanup = vi.fn();
    const secondCleanup = vi.fn();
    const firstInit = vi.fn(() => firstCleanup);
    const secondInit = vi.fn(() => secondCleanup);
    const firstPage = { title: 'login.html', scripts: [] };
    const secondPage = { title: 'register.html', scripts: [] };
    const { rerender, unmount } = render(<RuntimeHarness page={firstPage} initInteractions={firstInit} />);

    await waitFor(() => expect(firstInit).toHaveBeenCalledTimes(1));

    rerender(<RuntimeHarness page={secondPage} initInteractions={secondInit} />);

    expect(firstCleanup).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(secondInit).toHaveBeenCalledTimes(1));

    unmount();

    expect(secondCleanup).toHaveBeenCalledTimes(1);
  });
});
