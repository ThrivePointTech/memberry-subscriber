import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: ["local-subscriber.getmemberry.com"],
	output: "standalone",
};

export default nextConfig;
