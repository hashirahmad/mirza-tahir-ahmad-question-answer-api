/** ALL APIs */

/** Category APIs */
require('./api/category/content')('/v1/category/content')
require('./api/category/count')('/v1/category/count')

/** Search APIs */
require('./api/search/suggestions')('/v1/search/suggestions')
require('./api/search')('/v1/search')
