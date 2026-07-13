/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with Firebase ID token
 *     description: Verifies the Firebase ID token, creates or finds the user in MongoDB, creates a Redis session, and sets an HttpOnly `session` cookie.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase ID token from client-side OAuth (Google or GitHub)
 *                 example: "eyJhbGciOiJSUzI1NiIs..."
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: session=abc123; HttpOnly; SameSite=Lax; Max-Age=604800
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       401:
 *         description: Invalid or expired Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

/**
 * @openapi
 * /api/auth/logout:
 *   get:
 *     tags: [Auth]
 *     summary: Logout current user
 *     description: Deletes the session from Redis and clears the `session` cookie.
 *     security: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Logged out successfully" }
 */

/**
 * @openapi
 * /api/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     description: Returns the authenticated user from the Redis session cache.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/User"
 *       401:
 *         description: No session or session expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

/**
 * @openapi
 * /api/chat/create-conversation:
 *   post:
 *     tags: [Chat]
 *     summary: Create a new conversation
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Conversation created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Conversation"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

/**
 * @openapi
 * /api/chat/get-conversations:
 *   get:
 *     tags: [Chat]
 *     summary: List all conversations
 *     description: Returns all conversations for the authenticated user, sorted by `isPinned` desc then `updatedAt` desc.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Conversation"
 */

/**
 * @openapi
 * /api/chat/get-messages/{id}:
 *   get:
 *     tags: [Chat]
 *     summary: Get all messages for a conversation
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: List of messages sorted by createdAt ascending
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Message"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

/**
 * @openapi
 * /api/chat/save-message:
 *   post:
 *     tags: [Chat]
 *     summary: Save a message
 *     description: Used internally by the agent service to persist messages. Not typically called by the frontend directly.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversationId, role]
 *             properties:
 *               conversationId: { type: string, example: "685a1b2c3d4e5f6a7b8c9d0e" }
 *               role: { type: string, enum: [user, assistant], example: "assistant" }
 *               content: { type: string, example: "Here is your code..." }
 *               images: { type: array, items: { type: string }, example: [] }
 *               artifacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: number, example: 1 }
 *                     type: { type: string, example: "code" }
 *                     title: { type: string, example: "Netflix Clone" }
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name: { type: string, example: "index.html" }
 *                           content: { type: string, example: "<!DOCTYPE html>..." }
 *                     createdAt: { type: string, example: "2026-07-13T12:00:00.000Z" }
 *     responses:
 *       200:
 *         description: Message saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Message"
 */

/**
 * @openapi
 * /api/chat/update-conversation:
 *   post:
 *     tags: [Chat]
 *     summary: Update conversation title or pin status
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversationId]
 *             properties:
 *               conversationId: { type: string, example: "685a1b2c3d4e5f6a7b8c9d0e" }
 *               title: { type: string, example: "My Netflix Clone Project" }
 *               isPinned: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Updated conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Conversation"
 */

/**
 * @openapi
 * /api/chat/delete-conversation:
 *   post:
 *     tags: [Chat]
 *     summary: Delete a conversation and all its messages
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversationId]
 *             properties:
 *               conversationId: { type: string, example: "685a1b2c3d4e5f6a7b8c9d0e" }
 *     responses:
 *       200:
 *         description: Conversation deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Conversation deleted successfully" }
 *       400:
 *         description: Missing conversationId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

/**
 * @openapi
 * /api/chat/delete-message:
 *   post:
 *     tags: [Chat]
 *     summary: Delete a single message
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [messageId]
 *             properties:
 *               messageId: { type: string, example: "685a1b2c3d4e5f6a7b8c9d0e" }
 *     responses:
 *       200:
 *         description: Message deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Message deleted successfully" }
 *       400:
 *         description: Missing messageId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

/**
 * @openapi
 * /api/agent/chat:
 *   post:
 *     tags: [Agent]
 *     summary: Send a prompt to the agent orchestrator
 *     description: |
 *       Sends a user prompt to the LangGraph StateGraph supervisor which routes to one of 8 specialized agents.
 *       Supports multipart/form-data for file uploads (image or PDF).
 *       The response includes the agent's answer, any generated images, and any code artifacts.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [prompt, conversationId]
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Build a Netflix clone with HTML, CSS, and JavaScript"
 *                 description: The user's message
 *               conversationId:
 *                 type: string
 *                 example: "685a1b2c3d4e5f6a7b8c9d0e"
 *                 description: Active conversation ID
 *               agent:
 *                 type: string
 *                 enum: [auto, chat, coding, pdf, ppt, image, search]
 *                 default: auto
 *                 example: auto
 *                 description: Agent override. "auto" lets the router classify the prompt.
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional file attachment (image or PDF, max 20MB)
 *     responses:
 *       200:
 *         description: Agent response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   example: "Here is your Netflix clone..."
 *                 images:
 *                   type: array
 *                   items: { type: string }
 *                   example: []
 *                 artifacts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: number, example: 1 }
 *                       type: { type: string, example: "code" }
 *                       title: { type: string, example: "Netflix Clone" }
 *                       files:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name: { type: string, example: "index.html" }
 *                             content: { type: string, example: "<!DOCTYPE html>..." }
 *       429:
 *         description: Rate limit exceeded for the selected agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 agent: { type: string, example: "coding" }
 *                 limit: { type: number, example: 5 }
 *                 remainingTime: { type: number, example: 45 }
 *                 retryAfter: { type: string, example: "45s" }
 *                 message: { type: string, example: "You have reached the coding limit (5 requests/minute). Try again in 45s." }
 *       400:
 *         description: Insufficient credits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 title: { type: string, example: "Insufficient Credits" }
 *                 message: { type: string, example: "You don't have enough credits. Please upgrade your plan." }
 */

/**
 * @openapi
 * /api/agent/deploy:
 *   post:
 *     tags: [Agent]
 *     summary: Deploy generated code to a live S3 URL
 *     description: Takes a title and array of files, uploads them to AWS S3 under a unique deploy ID, and returns a public URL.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, files]
 *             properties:
 *               title: { type: string, example: "Netflix Clone" }
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string, example: "index.html" }
 *                     content: { type: string, example: "<!DOCTYPE html>..." }
 *     responses:
 *       200:
 *         description: Deployment successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 url: { type: string, example: "https://my-bucket.s3.ap-south-1.amazonaws.com/deploys/site-abc123/index.html" }
 *                 deployId: { type: string, example: "abc123def456" }
 *       400:
 *         description: No files provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

/**
 * @openapi
 * /api/billing/create-order:
 *   post:
 *     tags: [Billing]
 *     summary: Create a Razorpay order
 *     description: Creates a Razorpay order for the selected plan and stores a Payment record with status "created".
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan]
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [starter, pro]
 *                 example: starter
 *                 description: Plan to purchase (free plan has amount 0 and cannot be ordered)
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 order:
 *                   type: object
 *                   properties:
 *                     id: { type: string, example: "order_Nabc123def" }
 *                     amount: { type: number, example: 19900 }
 *                     currency: { type: string, example: "INR" }
 *                 plan:
 *                   $ref: "#/components/schemas/Plan"
 *       400:
 *         description: Invalid plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

/**
 * @openapi
 * /api/billing/verify-payment:
 *   post:
 *     tags: [Billing]
 *     summary: Verify Razorpay payment signature
 *     description: |
 *       Verifies the HMAC-SHA256 signature of `razorpay_order_id|razorpay_payment_id`.
 *       On success, updates the Payment status to "paid" and calls the auth service
 *       to update the user's plan and credits.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature]
 *             properties:
 *               razorpay_order_id: { type: string, example: "order_Nabc123def" }
 *               razorpay_payment_id: { type: string, example: "pay_Nabc456ghi" }
 *               razorpay_signature: { type: string, example: "a1b2c3d4e5f6..." }
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Payment verified successfully" }
 *       400:
 *         description: Payment verification failed (signature mismatch)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Payment record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

/**
 * @openapi
 * /api/auth/internal/update-plan:
 *   patch:
 *     tags: [Internal]
 *     summary: Update user plan and credits (internal)
 *     description: |
 *       Service-to-service endpoint called by the billing service after payment verification.
 *       Adds credits, sets the plan, and updates planExpiresAt to 30 days from now.
 *       Also refreshes the Redis session cache.
 *       **Not intended for public use.**
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, plan, credits]
 *             properties:
 *               userId: { type: string, example: "685a1b2c3d4e5f6a7b8c9d0e" }
 *               plan: { type: string, enum: [free, starter, pro], example: "starter" }
 *               credits: { type: number, example: 500 }
 *     responses:
 *       200:
 *         description: Plan updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

/**
 * @openapi
 * /api/auth/internal/deduct-credits:
 *   patch:
 *     tags: [Internal]
 *     summary: Deduct credits for an agent invocation (internal)
 *     description: |
 *       Service-to-service endpoint called by the agent service before processing a request.
 *       Checks for sufficient credits and deducts the appropriate amount based on the agent type.
 *       Credit costs: chat=1, search=5, pdf_rag=5, coding=10, pdf=10, ppt=10, image=10.
 *       Also updates the Redis session cache with the new balance.
 *       **Not intended for public use.**
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, agent]
 *             properties:
 *               userId: { type: string, example: "685a1b2c3d4e5f6a7b8c9d0e" }
 *               agent: { type: string, enum: [chat, search, coding, pdf, ppt, image, pdf_rag], example: "coding" }
 *     responses:
 *       200:
 *         description: Credits deducted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 credits: { type: number, example: 840 }
 *       400:
 *         description: Insufficient credits
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
