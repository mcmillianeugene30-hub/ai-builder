const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
};

const sentryConfig = {
  silent: true,
};

module.exports = withSentryConfig(nextConfig, sentryConfig);
