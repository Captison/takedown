
// patch `escape()` for older browsers (from MDN)
RegExp.escape ||= str => str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
