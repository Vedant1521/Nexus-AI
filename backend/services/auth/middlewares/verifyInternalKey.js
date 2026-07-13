/**
 * Middleware: verifyInternalKey
 * 
 * Validates the `x-internal-key` header on internal service-to-service
 * endpoints (/internal/*). Rejects requests that do not carry a valid
 * shared secret, enforcing zero-trust between microservices.
 */
const verifyInternalKey = (req, res, next) => {
  const internalKey = req.headers["x-internal-key"];

  if (!internalKey || internalKey !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Invalid or missing internal service key."
    });
  }

  next();
};

export default verifyInternalKey;
