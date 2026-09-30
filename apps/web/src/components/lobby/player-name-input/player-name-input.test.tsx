import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { MAX_NAME_LENGTH } from '~/types/entities';
import { PlayerNameInput } from './index';

const noop = () => {};

describe('PlayerNameInput', () => {
  describe('character count', () => {
    test('is hidden for names of 8 characters or fewer', () => {
      render(<PlayerNameInput name='Adalaide' onNameChange={noop} />);

      expect(
        screen.queryByText(`8/${MAX_NAME_LENGTH}`),
      ).not.toBeInTheDocument();
    });

    test('shows how many characters of the maximum have been used for names longer than 8 characters', () => {
      render(<PlayerNameInput name='Adalaides' onNameChange={noop} />);

      expect(screen.getByText(`9/${MAX_NAME_LENGTH}`)).toBeInTheDocument();
    });
  });

  test('marks the name as invalid when it is empty', () => {
    render(<PlayerNameInput name='' onNameChange={noop} />);

    expect(screen.getByRole('textbox', { name: 'Your name' })).toBeInvalid();
  });

  test('prompts for a name when it is empty', () => {
    render(<PlayerNameInput name='' onNameChange={noop} />);

    expect(screen.getByPlaceholderText('Name required')).toBeInTheDocument();
  });

  test('marks the name as valid when one has been entered', () => {
    render(<PlayerNameInput name='Ada' onNameChange={noop} />);

    expect(screen.getByRole('textbox', { name: 'Your name' })).toBeValid();
  });

  test('limits the name to the maximum length', () => {
    render(<PlayerNameInput name='Ada' onNameChange={noop} />);

    expect(screen.getByRole('textbox', { name: 'Your name' })).toHaveAttribute(
      'maxLength',
      String(MAX_NAME_LENGTH),
    );
  });

  test('calls the name change handler when the name is edited', () => {
    const handleNameChange = vi.fn();
    render(<PlayerNameInput name='Ada' onNameChange={handleNameChange} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Your name' }), {
      target: { value: 'Grace' },
    });

    expect(handleNameChange).toHaveBeenCalledOnce();
    expect(handleNameChange).toHaveBeenCalledWith('Grace');
  });
});
