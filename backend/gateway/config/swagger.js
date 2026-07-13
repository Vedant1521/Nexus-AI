import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NexusAI API",
      version: "1.0.0",
      description:
        "Distributed Multi-Agent AI Platform with Microservices Orchestration. All requests go through the API Gateway. Protected routes require a valid `session` HttpOnly cookie (set via Firebase login). Internal endpoints are for service-to-service communication only.",
      contact: {
        name: "NexusAI",
      },
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local development",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication & session management" },
      { name: "Chat", description: "Conversation & message CRUD" },
      { name: "Agent", description: "Multi-agent AI orchestration" },
      { name: "Billing", description: "Razorpay payments & plans" },
      { name: "Internal", description: "Service-to-service endpoints (not for public use)" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "session",
          description: "HttpOnly session cookie set by POST /api/auth/login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "685a1b2c3d4e5f6a7b8c9d0e" },
            firebaseUid: { type: "string", example: "abc123firebase" },
            name: { type: "string", example: "Vedant Gupta" },
            email: { type: "string", example: "vedant@example.com" },
            avatar: { type: "string", example: "https://lh3.googleusercontent.com/..." },
            provider: { type: "string", example: "google.com" },
            plan: { type: "string", enum: ["free", "starter", "pro"], example: "pro" },
            credits: { type: "number", example: 850 },
            totalCredits: { type: "number", example: 1000 },
            planExpiresAt: { type: "string", format: "date-time", example: "2026-08-13T12:00:00Z" },
          },
        },
        Conversation: {
          type: "object",
          properties: {
            _id: { type: "string", example: "685a1b2c3d4e5f6a7b8c9d0e" },
            userId: { type: "string", example: "685a1b2c3d4e5f6a7b8c9d0e" },
            title: { type: "string", example: "Build a Netflix clone" },
            isPinned: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Message: {
          type: "object",
          properties: {
            _id: { type: "string", example: "685a1b2c3d4e5f6a7b8c9d0e" },
            conversationId: { type: "string", example: "685a1b2c3d4e5f6a7b8c9d0e" },
            role: { type: "string", enum: ["user", "assistant"], example: "assistant" },
            content: { type: "string", example: "Here is your Netflix clone code..." },
            images: { type: "array", items: { type: "string" }, example: [] },
            artifacts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number", example: 1 },
                  type: { type: "string", example: "code" },
                  title: { type: "string", example: "Netflix Clone" },
                  files: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", example: "index.html" },
                        content: { type: "string", example: "<!DOCTYPE html>..." },
                      },
                    },
                  },
                  createdAt: { type: "string", example: "2026-07-13T12:00:00.000Z" },
                },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Plan: {
          type: "object",
          properties: {
            id: { type: "string", enum: ["free", "starter", "pro"], example: "starter" },
            name: { type: "string", example: "Starter" },
            amount: { type: "number", example: 199, description: "In INR" },
            credits: { type: "number", example: 500 },
            validity: { type: "number", example: 30, description: "In days" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            orderId: { type: "string", example: "order_Nabc123def" },
            paymentId: { type: "string", example: "pay_Nabc456ghi" },
            amount: { type: "number", example: 199 },
            currency: { type: "string", example: "INR" },
            credits: { type: "number", example: 500 },
            plan: { type: "string", example: "starter" },
            status: { type: "string", enum: ["created", "paid", "failed"], example: "paid" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Not enough credits." },
          },
        },
      },
    },
  },
  apis: ["./config/swagger.routes.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
