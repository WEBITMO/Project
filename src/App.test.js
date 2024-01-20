import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import App from './App';
import SpeechToTextPage from "./components/AudioPage";

// eslint-disable-next  -line no-undef
it('handles model selection', async () => {
  global.fetch = jest.fn().mockImplementationOnce(() =>
    Promise.resolve({
      json: () => Promise.resolve(['Model1', 'Model2']),
    })
  );

  render(<SpeechToTextPage />);
  await waitFor(() => screen.getByRole('listitem'));

  global.fetch = jest.fn().mockImplementationOnce(() =>
    Promise.resolve({ status: 200 })
  );

  fireEvent.click(screen.getAllByRole('listitem')[0]);
  await waitFor(() => {
    expect(screen.getByText('Model1')).toBeInTheDocument();
  });
});
it('handles audio file change', async () => {
  render(<SpeechToTextPage />);
  const fileInput = screen.getByLabelText(/upload audio/i);
  const testFile = new File(['audio'], 'test-audio.mp3', { type: 'audio/mp3' });

  fireEvent.change(fileInput, { target: { files: [testFile] } });
  await waitFor(() => {
    expect(fileInput.files[0]).toBe(testFile);
    expect(fileInput.files.item(0)).toBe(testFile);
    expect(fileInput.files).toHaveLength(1);
  });
});
it('handles audio prediction', async () => {
  global.fetch = jest.fn().mockImplementationOnce(() =>
    Promise.resolve({
      json: () => Promise.resolve(['Model1']),
    })
  );

  render(<SpeechToTextPage />);
  await waitFor(() => screen.getByRole('listitem'));

  fireEvent.click(screen.getAllByRole('listitem')[0]);

  const fileInput = screen.getByLabelText(/upload audio/i);
  const testFile = new File(['audio'], 'test-audio.mp3', { type: 'audio/mp3' });
  fireEvent.change(fileInput, { target: { files: [testFile] } });

  global.fetch = jest.fn().mockImplementationOnce(() =>
    Promise.resolve({
      json: () => Promise.resolve({ prediction: 'Test Prediction' }),
    })
  );

  fireEvent.click(screen.getByText(/Predict/i));
  await waitFor(() => {
    expect(screen.getByText('Test Prediction')).toBeInTheDocument();
  });
});
