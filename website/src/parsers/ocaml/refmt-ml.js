import config from '../reason/refmt';

const ID = 'refmt-ml';

export default {
  ...config,
  id: ID,
  parse: function(parser, code) {
    return JSON.parse(parser.parseML(parser.formatML(code)));
  },
  format: function(parser, code) {
    return parser.formatML(code);
  },
};
