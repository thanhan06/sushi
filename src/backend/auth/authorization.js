module.exports = (roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.vai_tro)) {
      next();
    } else {
      res.status(403).send("Unauthorized");
    }
  };
}