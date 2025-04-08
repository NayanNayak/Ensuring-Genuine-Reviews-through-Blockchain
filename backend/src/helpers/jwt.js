import JWT from "jsonwebtoken";
import Boom from "boom";
import redis from "../clients/redis";

const signAccessToken = (data) => {
	return new Promise((resolve, reject) => {
		const payload = { ...data };
		const options = {
			expiresIn: "10d",
			issuer: "ecommerce.app",
		};

		JWT.sign(payload, process.env.JWT_SECRET, options, (err, token) => {
			if (err) {
				console.error("JWT Signing Error:", err);
				return reject(Boom.internal("Could not generate access token"));
			}
			resolve(token);
		});
	});
};

const verifyAccessToken = (req, res, next) => {
	const authorizationToken = req.headers["authorization"];
	if (!authorizationToken) {
		return next(Boom.unauthorized("Access Token is required"));
	}

	// Ensure the token is in correct format: "Bearer <token>"
	const token = authorizationToken.split(" ")[1];
	if (!token) {
		return next(Boom.unauthorized("Invalid token format"));
	}

	JWT.verify(token, process.env.JWT_SECRET, (err, payload) => {
		if (err) {
			const message =
				err.name === "JsonWebTokenError"
					? "Unauthorized"
					: err.name === "TokenExpiredError"
					? "Token expired"
					: err.message;
			return next(Boom.unauthorized(message));
		}

		req.payload = payload;
		next();
	});
};

const signRefreshToken = (user_id) => {
	return new Promise((resolve, reject) => {
		const payload = { user_id };
		const options = {
			expiresIn: "180d",
			issuer: "ecommerce.app",
		};

		JWT.sign(payload, process.env.JWT_REFRESH_SECRET, options, async (err, token) => {
			if (err) {
				console.error("JWT Refresh Token Signing Error:", err);
				return reject(Boom.internal("Could not generate refresh token"));
			}

			try {
				await redis.set(user_id, token, "EX", 180 * 24 * 60 * 60);
				resolve(token);
			} catch (redisError) {
				console.error("Redis Error:", redisError);
				reject(Boom.internal("Failed to store refresh token"));
			}
		});
	});
};

const verifyRefreshToken = (refresh_token) => {
	return new Promise(async (resolve, reject) => {
		JWT.verify(refresh_token, process.env.JWT_REFRESH_SECRET, async (err, payload) => {
			if (err) {
				const message =
					err.name === "JsonWebTokenError"
						? "Unauthorized"
						: err.name === "TokenExpiredError"
						? "Refresh token expired"
						: err.message;
				return reject(Boom.unauthorized(message));
			}

			const { user_id } = payload;

			try {
				const user_token = await redis.get(user_id);
				if (!user_token || refresh_token !== user_token) {
					return reject(Boom.unauthorized("Invalid refresh token"));
				}

				resolve(user_id);
			} catch (redisError) {
				console.error("Redis Error:", redisError);
				reject(Boom.internal("Failed to verify refresh token"));
			}
		});
	});
};

export { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken };
