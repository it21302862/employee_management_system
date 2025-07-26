export function auth(req, res, next) {
  // Inject a fake user
  req.user = {
    id: 'admin123',
    role: 'admin',
  };
  next();
}

export function authorize(...roles) {
  return (req, res, next) => {
    next();
  };
}
