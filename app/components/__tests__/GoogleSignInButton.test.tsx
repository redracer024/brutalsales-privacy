import React from 'react';
import { render, screen } from '@testing-library/react-native';
import GoogleSignInButton from '../GoogleSignInButton';

// Mock the imported googleSignIn function
jest.mock('../../utils/supabase', () => ({
  googleSignIn: jest.fn(),
}));

describe('GoogleSignInButton', () => {
  it('renders correctly and shows the "Sign In with Google" text', () => {
    render(<GoogleSignInButton />);

    // Check if the button with the correct text is on the screen
    const buttonText = screen.getByText('Sign In with Google');
    expect(buttonText).toBeTruthy();
  });
}); 