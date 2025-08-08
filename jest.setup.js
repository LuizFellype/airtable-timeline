import '@testing-library/jest-dom'

// Mock performance.now for performance tests
global.performance = global.performance || {
  now: () => Date.now()
}
