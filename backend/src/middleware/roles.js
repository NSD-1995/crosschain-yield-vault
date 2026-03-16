module.exports = function roles(allowedRoles) {
  return function (req, res, next) {
    console.log("allowedRoles", allowedRoles);
    console.log("req.user", req.user);

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};
