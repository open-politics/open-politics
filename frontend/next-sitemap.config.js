module.exports = {
    siteUrl: "http://localhost:3000/",
    generateRobotsTxt: true,
    sitemapSize: 7000,
    robotsTxtOptions: {
      policies: [
        {
          userAgent: "*",
          allow: "/",
        },
      ],
    },
  };