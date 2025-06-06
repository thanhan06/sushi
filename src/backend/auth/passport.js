
const dotenv = require('dotenv');
dotenv.config();

const passport = require('passport');

const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt')
const accessService = require('../services/access.service');
const profileService = require('../services/profile.service');

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_PUBLIC_KEY,
      algorithms: ['RS256'],
    },
    async (jwt_payload, done) => {
      try {
        const { ma_tk } = jwt_payload.sub;
        const userAccount = await accessService.getAccountById(ma_tk);
        if (userAccount.vai_tro === 'nv') {
          userAccount.profile = await profileService.getEmployeeProfile(null, ma_tk);
        }
        else if (userAccount.vai_tro === 'kh') {
          userAccount.profile = await profileService.getCustomerProfile(ma_tk);
        }
        return done(null, userAccount);
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);

// module.exports =  async function verifyTokenIfExists(req, res, next) {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     next();
//     return;
//   }

//   const { sub } = JWT.verifyToken(token);
//   const user = await customerService.getAccountById(sub.ma_tk);
//   req.user = user;
//   next();
// }

module.exports = async function isAuthenticated(req, res, next) {
  return passport.authenticate('jwt', { session: false })(req, res, next);
}
