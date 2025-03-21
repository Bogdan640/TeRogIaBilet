const { TextEncoder, TextDecoder } = require('util');

// Set up TextEncoder/TextDecoder globally
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Make sure Jest has a jsdom environment with the right features
if (typeof window !== 'undefined') {
    // Mock window properties not present in jsdom
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });
}