import "dotenv/config";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./src/app.js";
import { verifySupabaseConnection, supabase } from "./src/db/supabase.js";
import { appGraph } from "./src/agents/graph.js";
import { HumanMessage } from "@langchain/core/messages";

const PORT = process.env.PORT || 5000;

verifySupabaseConnection();

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on("agent:message", async (data: { message: string }) => {
    try {
      console.log(`[Socket.io] Received query: "${data.message}"`);

      socket.emit("agent:typing", { status: true });

      const initialState = {
        messages: [new HumanMessage(data.message)],
        nextRoute: "supervisor",
      };

      const stream = await appGraph.stream(initialState, {
        recursionLimit: 10,
      });

      let finalState: any = null;
      for await (const state of stream) {
        console.log("[Socket.io] Graph Node emitted state transition");
        finalState = state;
      }

      const nodeKeys = Object.keys(finalState);
      const lastNode = nodeKeys[0];
      const outputMessages = finalState[lastNode].messages;
      const finalAIResponse = outputMessages[outputMessages.length - 1].content;

      supabase
        .from("interactions")
        .insert([
          {
            id: Math.random().toString(36).substring(7),
            user_id: socket.id,
            intent: lastNode,
            content: data.message,
          },
        ])
        .then(({ error }) => {
          if (error) {
            console.warn(
              "[Supabase] Sync Error (Expected if using placeholder keys):",
              error.message,
            );
          } else {
            console.log("[Supabase] Interaction synced to cloud successfully.");
          }
        });

      socket.emit("agent:response", {
        reply: finalAIResponse,
        route: lastNode,
      });
    } catch (error) {
      console.error("[Socket.io] Graph execution failed:", error);
      socket.emit("agent:error", {
        error: "Internal swarm execution failure.",
      });
    } finally {
      socket.emit("agent:typing", { status: false });
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(
    `[Server] Cloud-connected backend running on http://localhost:${PORT}`,
  );
});
