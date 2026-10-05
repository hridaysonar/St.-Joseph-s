const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/routine",
        destination: "/api/users?endpoint=/api/routine",
      },
      {
        source: "/api/student-ai",
        destination: "/api/users?endpoint=/api/student-ai",
      },
      {
        source: "/api/students/sync",
        destination: "/api/users?endpoint=/api/students/sync",
      },
      { source: "/api/config", destination: "/api/users?endpoint=/api/config" },
      {
        source: "/api/feedback",
        destination: "/api/users?endpoint=/api/feedback",
      },
    ];
  },
};
export default nextConfig;
