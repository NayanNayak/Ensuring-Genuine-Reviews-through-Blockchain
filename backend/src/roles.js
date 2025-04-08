import AccessControl from 'accesscontrol';
const ac = new AccessControl();

exports.roles = (function () {
  ac.grant('user')
    .readAny('product')
    .createAny('review')
    .readAny('review')
    .readOwn('delivery');

  ac.grant('admin')
    .extend('user')
    .createAny('product')
    .deleteAny('review')
    .updateAny('order')
    .createAny('delivery');

  return ac;
})();
