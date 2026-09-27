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
      {
        source: "/api/admin/students",
        destination: "/api/users?endpoint=/api/admin/students",
      },
      { source: "/api/config", destination: "/api/users?endpoint=/api/config" },
      {
        source: "/api/admin/config",
        destination: "/api/users?endpoint=/api/admin/config",
      },
      {
        source: "/api/feedback",
        destination: "/api/users?endpoint=/api/feedback",
      },
      {
        source: "/api/admin/feedbacks",
        destination: "/api/users?endpoint=/api/admin/feedbacks",
      },
      {
        source: "/api/admin/login",
        destination: "/api/users?endpoint=/api/admin/login",
      },
    ];
  },
};
export default nextConfig;
