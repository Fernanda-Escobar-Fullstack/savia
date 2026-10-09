require('@testing-library/jest-dom')

const {
  TextDecoder,
  TextEncoder,
} = require('util')

Object.assign(globalThis, {
  TextDecoder,
  TextEncoder,
})