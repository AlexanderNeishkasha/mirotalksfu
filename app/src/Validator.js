'use strict';
const path = require('path');
const checkXSS = require('./XSS.js');

/** Match the retained host credential format and its upstream length limit. */
const MAX_PASSWORD_LENGTH = 36;

/** Accept a nonempty host password within the provider's credential size budget. */
function isValidPassword(input) {
    return typeof input === 'string' && input.length > 0 && input.length <= MAX_PASSWORD_LENGTH;
}

/** Validate generic room identifiers; canonical invitation slugs have an additional segment check. */
function isValidRoomName(input) {
    if (!input || typeof input !== 'string') return false;
    const room = checkXSS(input);
    if (!room || ['false', 'undefined', '', null, undefined, 'favicon.ico'].includes(room.trim().toLowerCase())) {
        return false;
    }
    return !hasPathTraversal(room);
}

/** Detect slash/backslash traversal after best-effort decoding and platform path normalization. */
function hasPathTraversal(input) {
    if (!input || typeof input !== 'string') return false;
    let decodedInput = input;
    try {
        decodedInput = decodeURIComponent(input);
        decodedInput = decodeURIComponent(decodedInput);
    } catch {
        // Malformed URI escapes do not prevent checking the original path for traversal.
    }
    const pathTraversalPattern = /(\.\.(\/|\\))+/;
    const excessiveDotsPattern = /(\.{4,}\/+|\.{4,}\\+)/;
    const complexTraversalPattern = /(\.{2,}(\/+|\\+))/;
    if (complexTraversalPattern.test(decodedInput)) return true;
    const normalizedPath = path.normalize(decodedInput);
    return pathTraversalPattern.test(normalizedPath) || excessiveDotsPattern.test(normalizedPath);
}

/** Require a nonempty object before retained socket handlers inspect its fields. */
function isValidData(data) {
    return Boolean(data && typeof data === 'object' && Object.keys(data).length > 0);
}

module.exports = { isValidPassword, isValidRoomName, hasPathTraversal, isValidData };
