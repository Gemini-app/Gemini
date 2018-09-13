/**
 * @since 20180913 19:24
 * @author vivaxy
 */

module.exports = {
  encode: function encode(input) {
    if (typeof window !== 'undefined' && window.btoa) {
      return window.btoa(input);
    }
    if (typeof Buffer !== 'undefined' && Buffer.from) {
      return Buffer.from(input).toString('base64');
    }
  },
  decode: function decode(input) {
    if (typeof window !== 'undefined' && window.atob) {
      return window.atob(input);
    }
    if (typeof Buffer !== 'undefined' && Buffer.from) {
      return Buffer.from(input, 'base64').toString('utf8');
    }
  },
};
