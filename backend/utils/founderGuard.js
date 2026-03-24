// Utility to determine if an email belongs to a "founder" with elevated privileges.
// Founders are configured via environment variable FOUNDERS_EMAILS as a comma-separated list.
// If not configured, defaults to a safe, non-elevating behavior with the current default founder.
module.exports = {
  isFounderEmail: (email) => {
    if (!email) return false;
    const envList = (process.env.FOUNDERS_EMAILS || 'tejas@keystonedatahq.com')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (!envList.length) return false;
    return envList.includes(String(email).toLowerCase());
  }
};
